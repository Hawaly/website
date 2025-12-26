import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Récupérer la session depuis le cookie
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Récupérer les infos complètes de l'utilisateur avec jointure
    const { data: userData, error } = await supabase
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
        ),
        client:client_id (
          id,
          name,
          company_name
        )
      `)
      .eq('id', parseInt(session.userId))
      .eq('is_active', true)
      .single();

    if (error || !userData) {
      console.error('❌ Erreur récupération user:', error);
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Type pour les données
    type RoleData = { id?: number; code?: string; name?: string; redirect_path?: string } | null;
    type ClientData = { id?: number; name?: string; company_name?: string } | null;
    const role = userData.role as RoleData;
    const client = userData.client as ClientData;

    // 🔍 DEBUG: Voir ce qui est retourné
    console.log('✅ User data récupéré:', {
      id: userData.id,
      email: userData.email,
      client_id: userData.client_id,
      role_id: role?.id,
      role_code: role?.code
    });

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        role_code: role?.code,
        role_name: role?.name,
        role_id: role?.id,
        client_id: userData.client_id,
        client_name: client?.name || client?.company_name,
      },
    });
  } catch (error) {
    console.error('Erreur session:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
