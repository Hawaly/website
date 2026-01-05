import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const supabase = await createClient();

    // Récupérer la session Supabase Auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Récupérer les infos complètes de l'utilisateur avec jointure
    const { data: userData, error } = await supabaseAdmin
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
      .eq('auth_user_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (error || !userData) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Type pour les données
    type RoleData = { id?: number; code?: string; name?: string; redirect_path?: string } | null;
    type ClientData = { id?: number; name?: string; company_name?: string } | null;
    const role = userData.role as RoleData;
    const client = userData.client as ClientData;

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        role_code: role?.code,
        role_name: role?.name,
        role_id: role?.id,
        client_id: userData.client_id,
        client_name: client?.name || client?.company_name,
        auth_user_id: session.user.id,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
