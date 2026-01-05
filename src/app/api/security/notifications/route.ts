import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('security_notifications')
      .select('*')
      .eq('user_id', parseInt(userId));

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching security notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch security notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
    });
  } catch (error) {
    console.error('Exception fetching security notifications:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching security notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('security_notifications')
      .update({
        is_read: isRead,
        read_at: isRead ? new Date().toISOString() : null,
      })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('Error updating notification:', error);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data?.[0] || null,
    });
  } catch (error) {
    console.error('Exception updating notification:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating notification' },
      { status: 500 }
    );
  }
}
