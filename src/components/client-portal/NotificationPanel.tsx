"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    FileText,
    Target,
    Briefcase,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2
} from 'lucide-react';

export interface Notification {
    id: string;
    type: 'invoice' | 'strategy' | 'mandat' | 'info' | 'success' | 'warning';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
}

export function NotificationPanel({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onClearAll
}: NotificationPanelProps) {
    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'invoice': return <FileText className="w-5 h-5" />;
            case 'strategy': return <Target className="w-5 h-5" />;
            case 'mandat': return <Briefcase className="w-5 h-5" />;
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'warning': return <AlertCircle className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getIconColor = (type: Notification['type']) => {
        switch (type) {
            case 'invoice': return 'bg-purple-100 text-purple-600';
            case 'strategy': return 'bg-orange-100 text-orange-600';
            case 'mandat': return 'bg-blue-100 text-blue-600';
            case 'success': return 'bg-green-100 text-green-600';
            case 'warning': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 300, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-4 top-20 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5" />
                                    <h3 className="font-bold text-lg">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                                            {unreadCount} nouvelles
                                        </span>
                                    )}
                                </div>
                                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-end">
                                <button
                                    onClick={onClearAll}
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Tout effacer
                                </button>
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[60vh]">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Aucune notification</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => onMarkAsRead(notif.id)}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-orange-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`p-2 rounded-xl flex-shrink-0 ${getIconColor(notif.type)}`}>
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`text-sm font-semibold text-gray-900 ${!notif.read ? 'font-bold' : ''}`}>
                                                            {notif.title}
                                                        </h4>
                                                        {!notif.read && (
                                                            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(notif.date).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
