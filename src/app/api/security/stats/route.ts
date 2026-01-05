import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: loginData, error: loginError } = await supabaseAdmin
      .from('security_logs')
      .select('event_type, event_status, created_at')
      .gte('created_at', startDate.toISOString());

    if (loginError) {
      console.error('Error fetching security stats:', loginError);
      return NextResponse.json(
        { error: 'Failed to fetch security statistics' },
        { status: 500 }
      );
    }

    const totalLogins = loginData?.filter(log => log.event_type === 'login' && log.event_status === 'success').length || 0;
    const failedLogins = loginData?.filter(log => log.event_type === 'login_failed').length || 0;
    const totalEvents = loginData?.length || 0;

    const { data: uniqueUsersData, error: uniqueUsersError } = await supabaseAdmin
      .from('security_logs')
      .select('user_id')
      .eq('event_type', 'login')
      .eq('event_status', 'success')
      .gte('created_at', startDate.toISOString());

    if (uniqueUsersError) {
      console.error('Error fetching unique users:', uniqueUsersError);
    }

    const uniqueUsers = new Set(uniqueUsersData?.map(log => log.user_id).filter(Boolean)).size;

    const { data: suspiciousData, error: suspiciousError } = await supabaseAdmin
      .from('security_notifications')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .in('notification_type', ['suspicious_login', 'multiple_failed_attempts', 'unusual_activity']);

    if (suspiciousError) {
      console.error('Error fetching suspicious activity:', suspiciousError);
    }

    const suspiciousActivity = suspiciousData?.length || 0;

    const eventsByDay: Record<string, { date: string; logins: number; failures: number }> = {};
    loginData?.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!eventsByDay[date]) {
        eventsByDay[date] = { date, logins: 0, failures: 0 };
      }
      if (log.event_type === 'login' && log.event_status === 'success') {
        eventsByDay[date].logins++;
      } else if (log.event_type === 'login_failed') {
        eventsByDay[date].failures++;
      }
    });

    const eventTimeline = Object.values(eventsByDay).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      stats: {
        totalLogins,
        failedLogins,
        totalEvents,
        uniqueUsers,
        suspiciousActivity,
        successRate: totalLogins > 0 ? ((totalLogins / (totalLogins + failedLogins)) * 100).toFixed(2) : '0',
        eventTimeline,
      },
    });
  } catch (error) {
    console.error('Exception fetching security stats:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching security statistics' },
      { status: 500 }
    );
  }
}
