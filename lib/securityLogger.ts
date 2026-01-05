import { supabaseAdmin } from './supabaseAdmin';

export interface SecurityLogParams {
  userId?: number;
  authUserId?: string;
  eventType: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'password_change' | 'account_locked' | 'account_unlocked' | 'role_changed' | 'permission_changed';
  eventStatus?: 'success' | 'failure' | 'warning' | 'info';
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  locationInfo?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SecurityNotificationParams {
  userId: number;
  securityLogId: number;
  notificationType: 'suspicious_login' | 'new_device' | 'new_location' | 'multiple_failed_attempts' | 'account_locked' | 'unusual_activity';
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'critical';
}

export async function logSecurityEvent(params: SecurityLogParams): Promise<number | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc('log_security_event', {
      p_user_id: params.userId || null,
      p_auth_user_id: params.authUserId || null,
      p_event_type: params.eventType,
      p_event_status: params.eventStatus || 'success',
      p_email: params.email || null,
      p_ip_address: params.ipAddress || null,
      p_user_agent: params.userAgent || null,
      p_device_info: params.deviceInfo || {},
      p_location_info: params.locationInfo || {},
      p_metadata: params.metadata || {},
    });

    if (error) {
      console.error('Error logging security event:', error);
      return null;
    }

    return data as number;
  } catch (error) {
    console.error('Exception logging security event:', error);
    return null;
  }
}

export async function createSecurityNotification(params: SecurityNotificationParams): Promise<number | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc('create_security_notification', {
      p_user_id: params.userId,
      p_security_log_id: params.securityLogId,
      p_notification_type: params.notificationType,
      p_title: params.title,
      p_message: params.message,
      p_severity: params.severity || 'info',
    });

    if (error) {
      console.error('Error creating security notification:', error);
      return null;
    }

    return data as number;
  } catch (error) {
    console.error('Exception creating security notification:', error);
    return null;
  }
}

export async function detectSuspiciousLogin(
  userId: number,
  ipAddress: string,
  deviceInfo: Record<string, any>
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc('detect_suspicious_login', {
      p_user_id: userId,
      p_ip_address: ipAddress,
      p_device_info: deviceInfo,
    });

    if (error) {
      console.error('Error detecting suspicious login:', error);
      return false;
    }

    return data as boolean;
  } catch (error) {
    console.error('Exception detecting suspicious login:', error);
    return false;
  }
}

export function extractDeviceInfo(userAgent: string): Record<string, any> {
  const deviceInfo: Record<string, any> = {
    userAgent,
    browser: 'Unknown',
    os: 'Unknown',
    device: 'Desktop',
  };

  if (!userAgent) return deviceInfo;

  if (userAgent.includes('Chrome')) deviceInfo.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) deviceInfo.browser = 'Firefox';
  else if (userAgent.includes('Safari')) deviceInfo.browser = 'Safari';
  else if (userAgent.includes('Edge')) deviceInfo.browser = 'Edge';

  if (userAgent.includes('Windows')) deviceInfo.os = 'Windows';
  else if (userAgent.includes('Mac')) deviceInfo.os = 'macOS';
  else if (userAgent.includes('Linux')) deviceInfo.os = 'Linux';
  else if (userAgent.includes('Android')) deviceInfo.os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) deviceInfo.os = 'iOS';

  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    deviceInfo.device = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceInfo.device = 'Tablet';
  }

  return deviceInfo;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return '127.0.0.1';
}
