import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRole } from '@/lib/authz';

export async function GET(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ: Logs sensibles - Admin uniquement
    const session = await requireRole(request, [1]);
    if (session instanceof NextResponse) return session;

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const eventType = searchParams.get('eventType');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin
      .from('security_dashboard_view')
      .select('*', { count: 'exact' });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (userId) {
      query = query.eq('user_id', parseInt(userId));
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching security logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch security logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Exception fetching security logs:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching security logs' },
      { status: 500 }
    );
  }
}
