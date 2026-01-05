import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // 1. Get user's auth_user_id
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('app_user')
      .select('auth_user_id, email')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.auth_user_id) {
      return NextResponse.json(
        { error: 'User is not linked to Supabase Auth' },
        { status: 400 }
      );
    }

    // 2. Update password via Supabase Auth Admin API
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.auth_user_id,
      { password }
    );

    if (authError) {
      console.error('Error resetting password:', authError);
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/users/[id]/reset-password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
