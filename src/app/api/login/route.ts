import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabaseClient';
import { createSession } from '@/lib/auth';
import { logSecurityEvent, detectSuspiciousLogin, createSecurityNotification, extractDeviceInfo, getClientIp } from '@/lib/securityLogger';

export async function POST(request: NextRequest) {
  try {
    // Récupération des données du formulaire
    const body = await request.json();
    const { username, password } = body;

    // Validation des champs
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Email et password sont requis' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur avec son rôle
    // Utilise la vue user_with_details pour obtenir toutes les infos
    const { data: users, error: dbError } = await supabase
      .from('user_with_details')
      .select('user_id, email, role_id, role_code, role_name, redirect_path, client_id, client_name, is_active')
      .eq('email', username)
      .eq('is_active', true)
      .limit(1);
    
    // Si la vue n'existe pas, utiliser une jointure manuelle
    if (dbError && dbError.message.includes('does not exist')) {
      const { data: usersJoin, error: joinError } = await supabase
        .from('app_user')
        .select(`
          id,
          email,
          password_hash,
          is_active,
          client_id,
          role:role_id (
            id,
            code,
            name,
            redirect_path
          )
        `)
        .eq('email', username)
        .eq('is_active', true)
        .limit(1);
      
      if (joinError) {
        console.error('Erreur Supabase (jointure):', joinError);
        return NextResponse.json(
          { error: 'Erreur lors de la connexion à la base de données' },
          { status: 500 }
        );
      }
      
      // Adapter les données pour correspondre au format attendu
      if (usersJoin && usersJoin.length > 0) {
        const userData = usersJoin[0];
        // Type pour les données de rôle
        type RoleData = { id?: number; code?: string; name?: string; redirect_path?: string };
        const role = userData.role as RoleData | null;
        
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
        
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Identifiants incorrects' },
            { status: 401 }
          );
        }
        
        // Créer la session avec le JWT
        await createSession({
          userId: String(userData.id),
          username: userData.email,
          role: role?.code || 'client',
          roleId: role?.id || 2,
        });

        // Log security event
        const ipAddress = getClientIp(request);
        const userAgent = request.headers.get('user-agent') || '';
        const deviceInfo = extractDeviceInfo(userAgent);

        const logId = await logSecurityEvent({
          userId: userData.id,
          eventType: 'login',
          eventStatus: 'success',
          email: userData.email,
          ipAddress,
          userAgent,
          deviceInfo,
          metadata: {
            role_code: role?.code,
            client_id: userData.client_id,
          },
        });

        // Detect suspicious activity
        if (logId) {
          const isSuspicious = await detectSuspiciousLogin(userData.id, ipAddress, deviceInfo);
          if (isSuspicious) {
            await createSecurityNotification({
              userId: userData.id,
              securityLogId: logId,
              notificationType: 'new_location',
              title: 'Connexion depuis un nouvel emplacement',
              message: `Une connexion a été détectée depuis une nouvelle adresse IP: ${ipAddress}`,
              severity: 'warning',
            });
          }
        }
        
        return NextResponse.json({
          success: true,
          user: {
            id: userData.id,
            email: userData.email,
            role_code: role?.code,
            role_name: role?.name,
            role_id: role?.id,
            client_id: userData.client_id,
          },
          redirect_path: role?.redirect_path || '/dashboard'
        });
      }
    }

    // Gestion des erreurs de base de données
    if (dbError) {
      console.error('Erreur Supabase:', dbError);
      return NextResponse.json(
        { error: 'Erreur lors de la connexion à la base de données' },
        { status: 500 }
      );
    }

    // Vérification si l'utilisateur existe
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Récupérer le password_hash depuis app_user (la vue ne le contient pas)
    const { data: authData, error: authError } = await supabase
      .from('app_user')
      .select('password_hash')
      .eq('id', user.user_id)
      .single();

    if (authError || !authData) {
      console.error('Erreur récupération password_hash:', authError);
      return NextResponse.json(
        { error: 'Erreur d\'authentification' },
        { status: 500 }
      );
    }

    // Comparaison du mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, authData.password_hash);

    if (!isPasswordValid) {
      // Log failed login attempt
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || '';
      await logSecurityEvent({
        userId: user.user_id,
        eventType: 'login_failed',
        eventStatus: 'failure',
        email: user.email,
        ipAddress,
        userAgent,
        deviceInfo: extractDeviceInfo(userAgent),
        metadata: { reason: 'Invalid password' },
      });

      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Création de la session avec le rôle et role_id
    await createSession({
      userId: String(user.user_id), // Utiliser user_id de la vue
      username: user.email,
      role: user.role_code, // Ajouter le rôle dans la session
      roleId: user.role_id, // Ajouter le role_id pour vérification (1 = admin)
      clientId: user.client_id, // Ajouter client_id pour isolation tenant
    });

    // Log security event
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    const deviceInfo = extractDeviceInfo(userAgent);

    const logId = await logSecurityEvent({
      userId: user.user_id,
      eventType: 'login',
      eventStatus: 'success',
      email: user.email,
      ipAddress,
      userAgent,
      deviceInfo,
      metadata: {
        role_code: user.role_code,
        client_id: user.client_id,
      },
    });

    // Detect suspicious activity
    if (logId) {
      const isSuspicious = await detectSuspiciousLogin(user.user_id, ipAddress, deviceInfo);
      if (isSuspicious) {
        await createSecurityNotification({
          userId: user.user_id,
          securityLogId: logId,
          notificationType: 'new_location',
          title: 'Connexion depuis un nouvel emplacement',
          message: `Une connexion a été détectée depuis une nouvelle adresse IP: ${ipAddress}`,
          severity: 'warning',
        });
      }
    }

    // Réponse de succès avec redirection
    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        email: user.email,
        role_code: user.role_code,
        role_name: user.role_name,
        role_id: user.role_id, // Ajouter role_id
        client_id: user.client_id,
        client_name: user.client_name,
      },
      redirect_path: user.redirect_path, // Chemin de redirection selon le rôle
    });

  } catch (error) {
    console.error('Erreur lors du login:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}


