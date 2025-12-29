"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { EditorialPost, EditorialCalendar, SocialMediaStrategy } from '@/types/database';
import Link from 'next/link';

interface ClientEditorialCalendarProps {
  clientId: number;
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Instagram: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
  Facebook: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  LinkedIn: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
  TikTok: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  'Twitter/X': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
  YouTube: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  scheduled: 'Programmé',
  published: 'Publié',
  cancelled: 'Annulé',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function ClientEditorialCalendar({ clientId }: ClientEditorialCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<EditorialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<EditorialPost | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    loadClientPosts();
  }, [clientId, currentMonth, currentYear]);

  const loadClientPosts = async () => {
    setIsLoading(true);
    try {
      const { data: strategies, error: stratError } = await supabase
        .from('social_media_strategy')
        .select('id')
        .eq('client_id', clientId);

      if (stratError) throw stratError;
      if (!strategies || strategies.length === 0) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      const strategyIds = strategies.map(s => s.id);

      const { data: calendars, error: calError } = await supabase
        .from('editorial_calendar')
        .select('id')
        .in('strategy_id', strategyIds);

      if (calError) throw calError;
      if (!calendars || calendars.length === 0) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      const calendarIds = calendars.map(c => c.id);

      const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;

      const { data: postsData, error: postsError } = await supabase
        .from('editorial_post')
        .select('*')
        .in('calendar_id', calendarIds)
        .gte('publication_date', startDate)
        .lte('publication_date', endDate)
        .order('publication_date', { ascending: true });

      if (postsError) throw postsError;

      setPosts(postsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  const getPostsForDate = (dateStr: string) => {
    return posts.filter(post => post.publication_date === dateStr);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 border border-gray-200" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayPosts = getPostsForDate(dateStr);
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString();

      days.push(
        <div
          key={day}
          className={`min-h-[100px] border border-gray-200 p-2 bg-white hover:bg-gray-50 transition-colors ${
            isToday ? 'ring-2 ring-brand-orange' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-bold ${isToday ? 'text-brand-orange' : 'text-gray-700'}`}>
              {day}
            </span>
            {dayPosts.length > 0 && (
              <span className="text-xs bg-brand-orange text-white px-1.5 py-0.5 rounded-full font-bold">
                {dayPosts.length}
              </span>
            )}
          </div>

          <div className="space-y-1">
            {dayPosts.map((post) => {
              const colors = PLATFORM_COLORS[post.platform] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' };
              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`w-full ${colors.bg} p-1.5 rounded text-xs hover:shadow-md transition-shadow border ${colors.border}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`${colors.text} font-semibold truncate text-[10px]`}>
                        {post.platform}
                      </p>
                      <p className="text-gray-700 truncate text-[11px] font-medium">
                        {post.title}
                      </p>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded ${STATUS_COLORS[post.status]}`}>
                        {STATUS_LABELS[post.status]}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  const stats = {
    total: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
    platforms: [...new Set(posts.map(p => p.platform))],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-elegant border-2 border-gray-100">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {stats.total} post{stats.total !== 1 ? 's' : ''} ce mois
          </p>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-elegant border-2 border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {DAYS.map(day => (
            <div key={day} className="p-2 text-center">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                {day}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl shadow-elegant border-2 border-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600 font-medium">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700">{stats.draft}</div>
          <div className="text-xs text-gray-600 font-medium">Brouillons</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          <div className="text-xs text-gray-600 font-medium">Programmés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-xs text-gray-600 font-medium">Publiés</div>
        </div>
      </div>

      {stats.platforms.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-elegant border-2 border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-3">Plateformes actives :</p>
          <div className="flex flex-wrap gap-2">
            {stats.platforms.map(platform => {
              const colors = PLATFORM_COLORS[platform] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' };
              const count = posts.filter(p => p.platform === platform).length;
              return (
                <div key={platform} className={`${colors.bg} ${colors.text} px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${colors.border} flex items-center gap-2`}>
                  <span>{platform}</span>
                  <span className="bg-white/80 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

interface PostDetailModalProps {
  post: EditorialPost;
  onClose: () => void;
}

function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const colors = PLATFORM_COLORS[post.platform] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' };
  
  const formattedDate = new Date(post.publication_date + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-brand-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className={`${colors.bg} border-b-4 ${colors.border} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm font-bold mb-2 border-2 ${colors.border}`}>
                {post.platform}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{post.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{formattedDate}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200/50 rounded-lg transition-colors ml-4"
            >
              <span className="text-2xl text-gray-600">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <span className={`inline-block px-3 py-1.5 text-sm font-bold rounded-full ${STATUS_COLORS[post.status]}`}>
              {STATUS_LABELS[post.status]}
            </span>
          </div>

          {post.content_type && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type de contenu</label>
              <p className="text-gray-900 font-medium">{post.content_type}</p>
            </div>
          )}

          {post.description && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
              <p className="text-gray-900 whitespace-pre-wrap">{post.description}</p>
            </div>
          )}

          {post.caption && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Caption</label>
              <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
            </div>
          )}

          {post.hashtags && post.hashtags.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hashtags</label>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.scheduled_time && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Heure programmée</label>
              <p className="text-gray-900 font-medium">{post.scheduled_time}</p>
            </div>
          )}

          {post.status === 'published' && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-gray-900">Métriques</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Likes</div>
                  <div className="text-xl font-bold text-gray-900">{post.likes || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Commentaires</div>
                  <div className="text-xl font-bold text-gray-900">{post.comments || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Partages</div>
                  <div className="text-xl font-bold text-gray-900">{post.shares || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Vues</div>
                  <div className="text-xl font-bold text-gray-900">{post.views || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Portée</div>
                  <div className="text-xl font-bold text-gray-900">{post.reach || 0}</div>
                </div>
                {post.engagement_rate && (
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Engagement</div>
                    <div className="text-xl font-bold text-green-600">{post.engagement_rate.toFixed(2)}%</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {post.notes && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
              <p className="text-gray-900 text-sm whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">{post.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
