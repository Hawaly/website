import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('app_user')
      .select(`
        id,
        email,
        is_active,
        client_id,
        auth_user_id,
        role:role_id (
          id,
          code,
          name
        ),
        client:client_id (
          id,
          name
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role_id, client_id, is_active } = body;

    if (!email || !password || !role_id) {
      return NextResponse.json(
        { error: 'Email, password, and role_id are required' },
        { status: 400 }
      );
    }

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('Error creating Supabase auth user:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create auth user' },
        { status: 400 }
      );
    }

    // 2. Create app_user record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('app_user')
      .insert({
        email,
        auth_user_id: authData.user.id,
        role_id: parseInt(role_id),
        client_id: client_id ? parseInt(client_id) : null,
        is_active: is_active !== false,
      })
      .select(`
        id,
        email,
        is_active,
        client_id,
        auth_user_id,
        role:role_id (
          id,
          code,
          name
        ),
        client:client_id (
          id,
          name
        )
      `)
      .single();

    if (userError) {
      console.error('Error creating app_user:', userError);
      
      // Rollback: delete auth user if app_user creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: userData 
    });

  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
