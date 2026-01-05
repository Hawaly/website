import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logSecurityEvent, detectSuspiciousLogin, createSecurityNotification, extractDeviceInfo, getClientIp } from '@/lib/securityLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et password sont requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Authentifier avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Log failed login attempt
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || '';
      await logSecurityEvent({
        eventType: 'login_failed',
        eventStatus: 'failure',
        email,
        ipAddress,
        userAgent,
        deviceInfo: extractDeviceInfo(userAgent),
        metadata: { error: authError?.message || 'Invalid credentials' },
      });

      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // 2. Récupérer les infos utilisateur depuis app_user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('app_user')
      .select(`
        id,
        email,
        is_active,
        client_id,
        role:role_id (
          id,
          code,
          name,
          redirect_path
        )
      `)
      .eq('auth_user_id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur récupération user:', userError);
      
      // Déconnecter l'utilisateur Supabase si pas de données app_user
      await supabase.auth.signOut();
      
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou inactif' },
        { status: 401 }
      );
    }

    // Type pour les données de rôle
    type RoleData = { id?: number; code?: string; name?: string; redirect_path?: string } | null;
    const role = userData.role as RoleData;

    // 3. Log security event
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    const deviceInfo = extractDeviceInfo(userAgent);

    const logId = await logSecurityEvent({
      userId: userData.id,
      authUserId: authData.user.id,
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

    // 4. Detect suspicious activity
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

    // 5. Réponse de succès
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role_code: role?.code,
        role_name: role?.name,
        role_id: role?.id,
        client_id: userData.client_id,
        auth_user_id: authData.user.id,
      },
      redirect_path: role?.redirect_path || '/dashboard',
    });

  } catch (error) {
    console.error('Erreur lors du login:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
