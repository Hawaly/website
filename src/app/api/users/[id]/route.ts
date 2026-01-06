import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 SÉCURITÉ: Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const { email, role_id, client_id, is_active } = body;

    if (!email || !role_id) {
      return NextResponse.json(
        { error: 'Email and role_id are required' },
        { status: 400 }
      );
    }

    // 1. Get current user data
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('app_user')
      .select('auth_user_id, email')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 2. Update auth user email if changed and auth_user_id exists
    if (currentUser.auth_user_id && email !== currentUser.email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        currentUser.auth_user_id,
        { email }
      );

      if (authError) {
        console.error('Error updating auth user email:', authError);
        return NextResponse.json(
          { error: 'Failed to update user email' },
          { status: 400 }
        );
      }
    }

    // 3. Update app_user record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('app_user')
      .update({
        email,
        role_id: parseInt(role_id),
        client_id: client_id ? parseInt(client_id) : null,
        is_active: is_active !== false,
      })
      .eq('id', userId)
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
      console.error('Error updating app_user:', userError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: userData 
    });

  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 SÉCURITÉ: Vérifier que l'utilisateur est admin
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const userId = parseInt(id);

    // 1. Get user's auth_user_id
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('app_user')
      .select('auth_user_id')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 2. Delete from app_user
    const { error: deleteError } = await supabaseAdmin
      .from('app_user')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting app_user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // 3. Delete from Supabase Auth if auth_user_id exists
    if (user.auth_user_id) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        user.auth_user_id
      );

      if (authError) {
        console.error('Error deleting auth user:', authError);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
