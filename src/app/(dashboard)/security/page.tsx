"use client";

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Users, Eye, Filter, Calendar, Globe, Monitor, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Bell, Search } from 'lucide-react';

interface SecurityLog {
  id: number;
  user_id: number;
  auth_user_id: string;
  event_type: string;
  event_status: string;
  email: string;
  ip_address: string;
  user_agent: string;
  device_info: Record<string, any>;
  location_info: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  user_email: string;
  role_name: string;
  role_code: string;
  client_name: string;
  time_category: string;
}

interface SecurityStats {
  totalLogins: number;
  failedLogins: number;
  totalEvents: number;
  uniqueUsers: number;
  suspiciousActivity: number;
  successRate: string;
  eventTimeline: Array<{ date: string; logins: number; failures: number }>;
}

interface SecurityNotification {
  id: number;
  user_id: number;
  security_log_id: number;
  notification_type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'notifications'>('overview');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    fetchSecurityData();
  }, [filterEventType, dateRange]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/security?limit=100${filterEventType !== 'all' ? `&eventType=${filterEventType}` : ''}`),
        fetch(`/api/security/stats?days=${dateRange}`)
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    searchTerm === '' ||
    log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip_address?.includes(searchTerm) ||
    log.event_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventIcon = (eventType: string, status: string) => {
    if (status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'failure') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Activity className="w-5 h-5 text-blue-500" />;
  };

  const getEventBadgeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'login': 'bg-green-100 text-green-800',
      'logout': 'bg-gray-100 text-gray-800',
      'login_failed': 'bg-red-100 text-red-800',
      'password_reset': 'bg-blue-100 text-blue-800',
      'password_change': 'bg-purple-100 text-purple-800',
      'account_locked': 'bg-red-100 text-red-800',
      'account_unlocked': 'bg-green-100 text-green-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sécurité & Audit</h1>
            <p className="text-gray-600">Surveillance des événements de sécurité et activités suspectes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Vue d'ensemble
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" />
              Journaux de sécurité
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </div>
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {stats.successRate}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalLogins}</h3>
              <p className="text-sm text-gray-600">Connexions réussies</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                {stats.failedLogins > 0 && (
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    Alert
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.failedLogins}</h3>
              <p className="text-sm text-gray-600">Tentatives échouées</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.uniqueUsers}</h3>
              <p className="text-sm text-gray-600">Utilisateurs actifs</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                {stats.suspiciousActivity > 0 && (
                  <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    {stats.suspiciousActivity}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.suspiciousActivity}</h3>
              <p className="text-sm text-gray-600">Activités suspectes</p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Activité de connexion</h2>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                <option value="7">7 derniers jours</option>
                <option value="14">14 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
              </select>
            </div>
            <div className="space-y-3">
              {stats.eventTimeline.slice(-10).map((event, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                  <div className="flex-1 flex gap-2">
                    <div
                      className="bg-green-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${(event.logins / Math.max(...stats.eventTimeline.map(e => e.logins))) * 100}%`, minWidth: event.logins > 0 ? '40px' : '0' }}
                    >
                      {event.logins > 0 && event.logins}
                    </div>
                    <div
                      className="bg-red-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${(event.failures / Math.max(...stats.eventTimeline.map(e => e.failures))) * 100}%`, minWidth: event.failures > 0 ? '40px' : '0' }}
                    >
                      {event.failures > 0 && event.failures}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Connexions réussies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Tentatives échouées</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activité récente</h2>
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>{getEventIcon(log.event_type, log.event_status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{log.email || log.user_email || 'Unknown'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventBadgeColor(log.event_type)}`}>
                        {log.event_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {log.ip_address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="w-4 h-4" />
                        {log.device_info?.browser || 'Unknown'} / {log.device_info?.os || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(log.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par email, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                <option value="all">Tous les événements</option>
                <option value="login">Connexions</option>
                <option value="login_failed">Échecs de connexion</option>
                <option value="logout">Déconnexions</option>
                <option value="password_reset">Réinitialisation de mot de passe</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Événement</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Aucun événement trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getEventIcon(log.event_type, log.event_status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(log.event_type)}`}>
                              {log.event_type.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{log.email || log.user_email || 'Unknown'}</span>
                            {log.role_name && (
                              <span className="text-xs text-gray-500">{log.role_name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 font-mono">{log.ip_address}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm text-gray-700">
                            <span>{log.device_info?.browser || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">{log.device_info?.os || 'Unknown'} / {log.device_info?.device || 'Desktop'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications de sécurité</h2>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune notification de sécurité</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <span className="text-xs text-gray-500 mt-2 inline-block">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notification.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      notification.severity === 'warning' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {notification.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
