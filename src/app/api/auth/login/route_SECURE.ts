import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logSecurityEvent, detectSuspiciousLogin, createSecurityNotification, extractDeviceInfo, getClientIp } from '@/lib/securityLogger';
import { loginSchema, detectSQLInjection } from '@/lib/validators/authValidator';
import { checkRateLimit, getRateLimitIdentifier, loginRateLimiter } from '@/lib/rateLimiter';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  try {
    // 1. Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, loginRateLimiter);
    
    if (!rateLimitResult.success) {
      await logSecurityEvent({
        eventType: 'login_failed',
        eventStatus: 'failure',
        ipAddress,
        userAgent,
        deviceInfo: extractDeviceInfo(userAgent),
        metadata: { 
          error: 'Rate limit exceeded',
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset
        },
      });
      
      return NextResponse.json(
        { 
          error: 'Trop de tentatives. Veuillez réessayer plus tard.',
          retryAfter: rateLimitResult.reset.toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // 2. Parse et valider le body
    const body = await request.json();
    
    // 3. Validation stricte avec Zod
    let validatedData: z.infer<typeof loginSchema>;
    try {
      validatedData = loginSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        await logSecurityEvent({
          eventType: 'login_failed',
          eventStatus: 'failure',
          email: body.email || 'unknown',
          ipAddress,
          userAgent,
          deviceInfo: extractDeviceInfo(userAgent),
          metadata: { 
            error: 'Validation failed',
            validationErrors: error.issues
          },
        });
        
        return NextResponse.json(
          { error: 'Données invalides', details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    const { email, password } = validatedData;

    // 4. Détection d'injection SQL
    if (detectSQLInjection(email) || detectSQLInjection(password)) {
      // Log l'attaque
      await logSecurityEvent({
        eventType: 'login_failed',
        eventStatus: 'failure',
        email,
        ipAddress,
        userAgent,
        deviceInfo: extractDeviceInfo(userAgent),
        metadata: { 
          error: 'SQL injection attempt detected',
          severity: 'critical'
        },
      });

      // Bloquer l'IP pour 24h
      // TODO: Implémenter le blocage IP dans une table blacklist
      
      return NextResponse.json(
        { error: 'Requête invalide' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // 5. Authentifier avec Supabase Auth (utilise des prepared statements)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Log failed login attempt
      await logSecurityEvent({
        eventType: 'login_failed',
        eventStatus: 'failure',
        email,
        ipAddress,
        userAgent,
        deviceInfo: extractDeviceInfo(userAgent),
        metadata: { 
          error: authError?.message || 'Invalid credentials',
          attemptedEmail: email
        },
      });

      // Vérifier si le compte doit être bloqué après plusieurs échecs
      // TODO: Implémenter le comptage des échecs et le blocage temporaire

      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // 6. Récupérer les infos utilisateur depuis auth.users
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(authData.user.id);

    if (userError || !userData || !userData.user) {
      console.error('❌ Erreur récupération user:', userError);
      
      // Déconnecter l'utilisateur Supabase
      await supabase.auth.signOut();
      
      await logSecurityEvent({
        eventType: 'login_failed',
        eventStatus: 'failure',
        email,
        authUserId: authData.user.id,
        ipAddress,
        userAgent,
        deviceInfo: extractDeviceInfo(userAgent),
        metadata: { 
          error: 'User not found in auth.users',
          authUserId: authData.user.id
        },
      });
      
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou inactif' },
        { status: 401 }
      );
    }

    // Extraire les métadonnées utilisateur
    const user = userData.user;
    const userMetadata = user.user_metadata || {};
    const mustResetPassword = userMetadata.must_reset_password === true;
    const userRole = userMetadata.role || 'client';
    const clientId = userMetadata.client_id || null;

    // 7. Vérifier si l'utilisateur doit réinitialiser son mot de passe
    if (mustResetPassword) {
      return NextResponse.json({
        success: false,
        mustResetPassword: true,
        message: 'Vous devez réinitialiser votre mot de passe pour des raisons de sécurité',
        resetToken: authData.session?.access_token
      });
    }

    // Construire les données de rôle depuis les métadonnées
    const roleData = {
      code: userRole,
      name: userRole === 'admin' ? 'Administrateur' : userRole === 'client' ? 'Client' : 'Staff',
      redirect_path: userRole === 'admin' ? '/dashboard' : userRole === 'client' ? '/client-portal' : '/dashboard'
    };

    // 8. Log security event pour connexion réussie
    const deviceInfo = extractDeviceInfo(userAgent);

    const logId = await logSecurityEvent({
      userId: userMetadata.app_user_id || null,
      authUserId: user.id,
      eventType: 'login',
      eventStatus: 'success',
      email: user.email || email,
      ipAddress,
      userAgent,
      deviceInfo,
      metadata: {
        role_code: userRole,
        client_id: clientId,
        sessionId: authData.session?.access_token
      },
    });

    // 9. Détecter les activités suspectes
    if (logId && userMetadata.app_user_id) {
      const isSuspicious = await detectSuspiciousLogin(userMetadata.app_user_id, ipAddress, deviceInfo);
      if (isSuspicious) {
        await createSecurityNotification({
          userId: userMetadata.app_user_id || 0,
          securityLogId: logId,
          notificationType: 'new_location',
          title: 'Connexion depuis un nouvel emplacement',
          message: `Une connexion a été détectée depuis une nouvelle adresse IP: ${ipAddress}`,
          severity: 'warning',
        });

        // Optionnel: Envoyer un email d'alerte
        // TODO: Implémenter l'envoi d'email
      }
    }

    // 10. Réponse de succès avec headers de sécurité
    const response = NextResponse.json({
      success: true,
      user: {
        id: userMetadata.app_user_id || user.id,
        email: user.email || email,
        role_code: userRole,
        role_name: roleData.name,
        role_id: userMetadata.role_id,
        client_id: clientId,
        auth_user_id: user.id,
      },
      redirect_path: roleData.redirect_path,
    });

    // Ajouter des headers de sécurité
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;

  } catch (error) {
    console.error('Erreur lors du login:', error);
    
    // Log l'erreur système
    await logSecurityEvent({
      eventType: 'login_failed',
      eventStatus: 'failure',
      ipAddress,
      userAgent,
      deviceInfo: extractDeviceInfo(userAgent),
      metadata: { 
        error: 'System error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      },
    });
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
