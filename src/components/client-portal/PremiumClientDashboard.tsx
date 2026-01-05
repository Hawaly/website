"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, FileText, Briefcase, LogOut, User as UserIcon, Mail, Phone,
    Building2, TrendingUp, Download, Eye, CheckCircle, Clock, Loader2,
    Activity, Award, Zap, DollarSign, MessageSquare, Bell, Globe, Sparkles,
    PieChart, Calendar as CalendarIcon, ArrowUpRight, ChevronRight, X,
    AlertCircle, ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { NotificationPanel, Notification } from './NotificationPanel';
import { MessagingPanel } from './MessagingPanel';
import type { SocialMediaStrategy, Invoice, Mandat } from '@/types/database';

// Interfaces
interface User {
    id: number;
    email: string;
    role_code: string;
    role_name: string;
    role_id: number;
    client_id?: number;
    client_name?: string;
}

interface ClientData {
    strategies: SocialMediaStrategy[];
    invoices: Invoice[];
    mandats: Mandat[];
    clientInfo?: any;
}

interface ActivityItem {
    id: string;
    type: 'strategy' | 'invoice' | 'mandat';
    action: string;
    date: string;
    description: string;
}

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

export function PremiumClientDashboard({ user }: { user: User }) {
    const [data, setData] = useState<ClientData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'strategies' | 'invoices' | 'mandats' | 'documents' | 'profile'>('overview');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessaging, setShowMessaging] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedStrategy, setSelectedStrategy] = useState<SocialMediaStrategy | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [selectedMandat, setSelectedMandat] = useState<Mandat | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ phone: '', email: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const { logout } = useAuth();

    // Load client data
    useEffect(() => {
        if (user.client_id) {
            loadClientData();
        }
    }, [user.client_id]);

    const loadClientData = async () => {
        if (!user.client_id) return;
        setIsLoading(true);
        try {
            const [strategiesRes, invoicesRes, mandatsRes, clientRes] = await Promise.all([
                supabase.from('social_media_strategy').select('*').eq('client_id', user.client_id).order('created_at', { ascending: false }),
                supabase.from('invoice').select('*').eq('client_id', user.client_id).order('issue_date', { ascending: false }),
                supabase.from('mandat').select('*').eq('client_id', user.client_id).order('created_at', { ascending: false }),
                supabase.from('client').select('*').eq('id', user.client_id).single()
            ]);
            setData({
                strategies: strategiesRes.data || [],
                invoices: invoicesRes.data || [],
                mandats: mandatsRes.data || [],
                clientInfo: clientRes.data
            });
        } catch (error) {
            // Error loading data - silent fail with empty state
        } finally {
            setIsLoading(false);
        }
    };

    // Generate notifications based on actual data
    const generateNotifications = useCallback(() => {
        if (!data) return;
        const notifs: Notification[] = [];
        
        // Recent invoices (last 30 days)
        data.invoices.slice(0, 3).forEach((inv, i) => {
            const daysDiff = Math.floor((Date.now() - new Date(inv.issue_date).getTime()) / 86400000);
            if (daysDiff <= 30) {
                notifs.push({
                    id: `inv-${inv.id}`,
                    type: 'invoice',
                    title: inv.status === 'payee' ? 'Facture payée' : 'Nouvelle facture',
                    message: `Facture ${inv.invoice_number} - ${inv.total_ttc?.toLocaleString('fr-CH')} CHF`,
                    date: inv.issue_date,
                    read: inv.status === 'payee'
                });
            }
        });

        // Recent strategies
        data.strategies.slice(0, 2).forEach((strat) => {
            const daysDiff = Math.floor((Date.now() - new Date(strat.created_at).getTime()) / 86400000);
            if (daysDiff <= 60) {
                notifs.push({
                    id: `strat-${strat.id}`,
                    type: 'strategy',
                    title: 'Stratégie disponible',
                    message: `Stratégie v${strat.version} - ${strat.status === 'actif' ? 'Active' : 'En attente'}`,
                    date: strat.created_at,
                    read: strat.status !== 'actif'
                });
            }
        });

        // Active mandats
        data.mandats.filter(m => m.status === 'en_cours').slice(0, 2).forEach((mandat) => {
            notifs.push({
                id: `mandat-${mandat.id}`,
                type: 'mandat',
                title: 'Mandat en cours',
                message: mandat.title,
                date: mandat.created_at,
                read: true
            });
        });

        // Welcome notification
        if (data.clientInfo?.created_at) {
            notifs.push({
                id: 'welcome',
                type: 'success',
                title: 'Bienvenue !',
                message: 'Bienvenue dans votre espace client urstory.ch',
                date: data.clientInfo.created_at,
                read: true
            });
        }

        // Sort by date (newest first)
        notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(notifs);
    }, [data]);

    // Generate notifications when data changes
    useEffect(() => {
        if (data) {
            generateNotifications();
        }
    }, [data, generateNotifications]);

    // Download PDF
    const handleDownloadPdf = async (invoice: Invoice) => {
        setDownloadingPdf(invoice.id);
        try {
            // Generate PDF if not exists
            if (!invoice.pdf_path) {
                const response = await fetch('/api/invoices/generate-pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invoice_id: invoice.id })
                });
                if (!response.ok) throw new Error('PDF generation failed');
            }
            // Download the PDF
            const pdfPath = invoice.pdf_path || `/invoices/${invoice.invoice_number}.pdf`;
            window.open(pdfPath, '_blank');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Erreur lors du téléchargement du PDF');
        } finally {
            setDownloadingPdf(null);
        }
    };

    // Notification handlers
    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleClearNotifications = () => {
        setNotifications([]);
    };

    // Profile edit handlers
    const handleEditProfile = () => {
        setProfileForm({
            phone: data?.clientInfo?.phone || '',
            email: data?.clientInfo?.email || user.email || ''
        });
        setIsEditingProfile(true);
    };

    const handleSaveProfile = async () => {
        if (!user.client_id) return;
        setSavingProfile(true);
        try {
            const { error } = await supabase
                .from('client')
                .update({ phone: profileForm.phone, email: profileForm.email })
                .eq('id', user.client_id);
            if (!error) {
                await loadClientData();
                setIsEditingProfile(false);
            }
        } finally {
            setSavingProfile(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-orange-500/30 rounded-full animate-pulse" />
                        <Loader2 className="w-12 h-12 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                    </div>
                    <p className="text-white/80 mt-6 font-semibold">Chargement de votre espace...</p>
                </motion.div>
            </div>
        );
    }

    if (!data) return null;

    // Stats calculations
    const stats = {
        strategies: { total: data.strategies.length, active: data.strategies.filter(s => s.status === 'actif').length },
        mandats: { total: data.mandats.length, enCours: data.mandats.filter(m => m.status === 'en_cours').length },
        invoices: {
            total: data.invoices.length,
            montantTotal: data.invoices.reduce((sum, inv) => sum + (inv.total_ttc || 0), 0),
            montantPaye: data.invoices.filter(inv => inv.status === 'payee').reduce((sum, inv) => sum + (inv.total_ttc || 0), 0),
            payees: data.invoices.filter(inv => inv.status === 'payee').length,
            enAttente: data.invoices.filter(inv => inv.status === 'envoyee').length
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const uniquePlatforms = [...new Set(data.strategies.flatMap(s => s.plateformes || []).filter(Boolean))] as string[];

    // Activity timeline
    const activityTimeline: ActivityItem[] = [
        ...data.strategies.slice(0, 2).map(s => ({ id: `s-${s.id}`, type: 'strategy' as const, action: 'Stratégie créée', date: s.created_at, description: `Stratégie v${s.version}` })),
        ...data.invoices.slice(0, 2).map(i => ({ id: `i-${i.id}`, type: 'invoice' as const, action: i.status === 'payee' ? 'Facture payée' : 'Facture émise', date: i.issue_date, description: `${i.invoice_number} - ${i.total_ttc} CHF` })),
        ...data.mandats.slice(0, 2).map(m => ({ id: `m-${m.id}`, type: 'mandat' as const, action: 'Mandat démarré', date: m.created_at, description: m.title }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    // Upcoming deadlines from invoices and mandats
    const upcomingDeadlines = [
        ...data.invoices.filter(inv => inv.status === 'envoyee' && inv.due_date).map(inv => ({
            id: `inv-${inv.id}`, type: 'invoice' as const, title: `Facture ${inv.invoice_number}`,
            date: inv.due_date!, description: `${inv.total_ttc?.toLocaleString('fr-CH')} CHF à payer`
        })),
        ...data.mandats.filter(m => m.status === 'en_cours' && m.end_date).map(m => ({
            id: `mand-${m.id}`, type: 'mandat' as const, title: m.title,
            date: m.end_date!, description: 'Fin de mandat prévue'
        }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

    // Payment progress
    const paymentProgress = stats.invoices.montantTotal > 0 
        ? Math.round((stats.invoices.montantPaye / stats.invoices.montantTotal) * 100) 
        : 0;

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
        { id: 'strategies', label: 'Stratégies', icon: Target },
        { id: 'mandats', label: 'Mandats', icon: Briefcase },
        { id: 'invoices', label: 'Factures', icon: FileText },
        { id: 'documents', label: 'Documents', icon: ExternalLink },
        { id: 'profile', label: 'Profil', icon: UserIcon }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
            {/* Notification Panel */}
            <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearNotifications}
            />

            {/* Messaging Panel */}
            <MessagingPanel
                isOpen={showMessaging}
                onClose={() => setShowMessaging(false)}
                userEmail={user.email}
                clientName={user.client_name || ''}
            />

            {/* Strategy Detail Modal */}
            <AnimatePresence>
                {selectedStrategy && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStrategy(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-4 md:inset-10 lg:inset-20 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Stratégie Social Media v{selectedStrategy.version}</h2>
                                    <p className="text-white/80 mt-1">Créée le {new Date(selectedStrategy.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button onClick={() => setSelectedStrategy(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {selectedStrategy.contexte_general && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-orange-500" />Contexte Général</h3>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedStrategy.contexte_general}</p>
                                    </div>
                                )}
                                {(selectedStrategy.objectifs_business || selectedStrategy.objectifs_reseaux) && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" />Objectifs</h3>
                                        <div className="space-y-3">
                                            {selectedStrategy.objectifs_business && (
                                                <div className="bg-green-50 p-4 rounded-xl">
                                                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Objectifs Business</p>
                                                    <p className="text-gray-700">{selectedStrategy.objectifs_business}</p>
                                                </div>
                                            )}
                                            {selectedStrategy.objectifs_reseaux && (
                                                <div className="bg-blue-50 p-4 rounded-xl">
                                                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Objectifs Réseaux</p>
                                                    <p className="text-gray-700">{selectedStrategy.objectifs_reseaux}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {selectedStrategy.plateformes && selectedStrategy.plateformes.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" />Plateformes</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStrategy.plateformes.map((p, i) => (
                                                <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold">{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedStrategy.ton_voix && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-500" />Ton & Voix</h3>
                                        <p className="text-gray-700 bg-purple-50 p-4 rounded-xl">{selectedStrategy.ton_voix}</p>
                                    </div>
                                )}
                                {selectedStrategy.frequence_calendrier && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-indigo-500" />Fréquence de Publication</h3>
                                        <p className="text-gray-700 bg-indigo-50 p-4 rounded-xl">{selectedStrategy.frequence_calendrier}</p>
                                    </div>
                                )}
                                {selectedStrategy.valeurs_messages && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" />Valeurs & Messages Clés</h3>
                                        <p className="text-gray-700 bg-yellow-50 p-4 rounded-xl">{selectedStrategy.valeurs_messages}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Invoice Detail Modal */}
            <AnimatePresence>
                {selectedInvoice && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoice(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-4 md:inset-20 lg:inset-x-40 lg:inset-y-20 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-w-2xl mx-auto">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Facture {selectedInvoice.invoice_number}</h2>
                                    <p className="text-white/80 mt-1">Émise le {new Date(selectedInvoice.issue_date).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Statut</p>
                                        <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 text-sm font-bold rounded-full ${selectedInvoice.status === 'payee' ? 'bg-green-100 text-green-700' : selectedInvoice.status === 'envoyee' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {selectedInvoice.status === 'payee' && <CheckCircle className="w-4 h-4" />}
                                            {selectedInvoice.status === 'envoyee' && <Clock className="w-4 h-4" />}
                                            {selectedInvoice.status === 'payee' ? 'Payée' : selectedInvoice.status === 'envoyee' ? 'En attente' : selectedInvoice.status}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Échéance</p>
                                        <p className="text-gray-900 font-semibold mt-1">{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div><p className="text-xs text-gray-500 uppercase">Montant HT</p><p className="text-xl font-bold text-gray-900">{selectedInvoice.total_ht?.toLocaleString('fr-CH')} CHF</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase">TVA</p><p className="text-xl font-bold text-gray-900">{selectedInvoice.total_tva?.toLocaleString('fr-CH')} CHF</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase">Total TTC</p><p className="text-2xl font-bold text-purple-600">{selectedInvoice.total_ttc?.toLocaleString('fr-CH')} CHF</p></div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { handleDownloadPdf(selectedInvoice); setSelectedInvoice(null); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                                        <Download className="w-5 h-5" />Télécharger le PDF
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Mandat Detail Modal */}
            <AnimatePresence>
                {selectedMandat && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMandat(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-4 md:inset-20 lg:inset-x-40 lg:inset-y-20 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-w-2xl mx-auto">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedMandat.title}</h2>
                                    <p className="text-white/80 mt-1">Créé le {new Date(selectedMandat.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button onClick={() => setSelectedMandat(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${selectedMandat.status === 'en_cours' ? 'bg-blue-100 text-blue-700' : selectedMandat.status === 'termine' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {selectedMandat.status === 'en_cours' ? '🔄 En cours' : selectedMandat.status === 'termine' ? '✅ Terminé' : selectedMandat.status}
                                    </span>
                                </div>
                                {selectedMandat.description && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedMandat.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedMandat.start_date && (
                                        <div className="bg-blue-50 p-4 rounded-xl">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Date de début</p>
                                            <p className="text-gray-900 font-semibold mt-1">{new Date(selectedMandat.start_date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    )}
                                    {selectedMandat.end_date && (
                                        <div className="bg-blue-50 p-4 rounded-xl">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Date de fin</p>
                                            <p className="text-gray-900 font-semibold mt-1">{new Date(selectedMandat.end_date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    )}
                                </div>
                                {selectedMandat.mandat_type && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Type de Mandat</p>
                                        <p className="text-xl font-bold text-indigo-600 mt-1">{selectedMandat.mandat_type}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Sparkles className="w-7 h-7 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">Espace Client</h1>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{user.client_name || user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Message Button */}
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowMessaging(true)} className="relative p-3 hover:bg-blue-50 rounded-xl transition-colors group">
                                <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            </motion.button>

                            {/* Notification Button */}
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotifications(true)} className="relative p-3 hover:bg-orange-50 rounded-xl transition-colors group">
                                <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                                {unreadCount > 0 && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center shadow-lg">
                                        {unreadCount}
                                    </motion.span>
                                )}
                            </motion.button>

                            {/* Logout */}
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={logout} className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all ml-2">
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:inline">Déconnexion</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                        {tabs.map(tab => (
                            <motion.button key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                                    }`}>
                                <tab.icon className="w-4 h-4" />
                                <span className="text-sm">{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" {...fadeInUp} className="space-y-6">
                            {/* Welcome Banner */}
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                                <div className="relative z-10">
                                    <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-4xl font-bold mb-2">
                                        Bonjour, {user.client_name?.split(' ')[0] || 'Client'} ! 👋
                                    </motion.h2>
                                    <p className="text-white/90 text-lg mb-6">Voici un aperçu de votre activité</p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl">
                                            <div className="text-xs text-white/80">Client depuis</div>
                                            <div className="font-bold">{data.clientInfo?.created_at ? new Date(data.clientInfo.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'N/A'}</div>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl">
                                            <div className="text-xs text-white/80">Statut</div>
                                            <div className="font-bold capitalize flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />{data.clientInfo?.status || 'Actif'}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Cards */}
                            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { label: 'Stratégies', value: stats.strategies.total, sub: `${stats.strategies.active} actives`, icon: Target, gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/20' },
                                    { label: 'Mandats', value: stats.mandats.total, sub: `${stats.mandats.enCours} en cours`, icon: Briefcase, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
                                    { label: 'Factures', value: stats.invoices.total, sub: `${stats.invoices.payees} payées`, icon: FileText, gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
                                    { label: 'Montant Total', value: `${stats.invoices.montantTotal.toLocaleString('fr-CH')}`, sub: 'CHF TTC', icon: DollarSign, gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' }
                                ].map((stat, i) => (
                                    <motion.div key={i} variants={fadeInUp} whileHover={{ scale: 1.02, y: -5 }} className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-xl ${stat.shadow} cursor-pointer group`}>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><stat.icon className="w-6 h-6" /></div>
                                                <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="text-4xl font-bold mb-1">{stat.value}</div>
                                            <div className="text-sm font-medium">{stat.label}</div>
                                            <div className="text-xs text-white/80 mt-1">{stat.sub}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Activity & Quick Actions */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Activity Timeline */}
                                <Card className="p-6 lg:col-span-2 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-orange-500" />Activité Récente
                                    </h3>
                                    <div className="space-y-4">
                                        {activityTimeline.length > 0 ? activityTimeline.map((activity, i) => (
                                            <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4 group">
                                                <div className={`p-2.5 rounded-xl flex-shrink-0 ${activity.type === 'strategy' ? 'bg-orange-100 text-orange-600' :
                                                    activity.type === 'invoice' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {activity.type === 'strategy' && <Target className="w-5 h-5" />}
                                                    {activity.type === 'invoice' && <FileText className="w-5 h-5" />}
                                                    {activity.type === 'mandat' && <Briefcase className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1 bg-gray-50 p-4 rounded-xl group-hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="text-center py-8 text-gray-500">Aucune activité récente</div>
                                        )}
                                    </div>
                                </Card>

                                {/* Quick Actions */}
                                <Card className="p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-500" />Actions Rapides
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Voir mes stratégies', icon: Target, onClick: () => setActiveTab('strategies'), gradient: 'from-orange-500 to-red-500' },
                                            { label: 'Télécharger factures', icon: Download, onClick: () => setActiveTab('invoices'), gradient: 'from-purple-500 to-pink-500' },
                                            { label: 'Contacter l\'équipe', icon: MessageSquare, onClick: () => setShowMessaging(true), gradient: 'from-blue-500 to-indigo-500' }
                                        ].map((action, i) => (
                                            <motion.button key={i} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={action.onClick}
                                                className={`w-full flex items-center justify-between gap-3 p-4 bg-gradient-to-r ${action.gradient} text-white rounded-xl hover:shadow-lg transition-all group`}>
                                                <div className="flex items-center gap-3">
                                                    <action.icon className="w-5 h-5" />
                                                    <span className="font-semibold text-sm">{action.label}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </motion.button>
                                        ))}
                                    </div>

                                    {/* Platforms */}
                                    {uniquePlatforms.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                                <Globe className="w-4 h-4" />Vos Plateformes
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {uniquePlatforms.map((p, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm">{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>

                            {/* Upcoming Deadlines & Payment Progress */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Upcoming Deadlines */}
                                <Card className="p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-red-500" />Prochaines Échéances
                                    </h3>
                                    {upcomingDeadlines.length > 0 ? (
                                        <div className="space-y-3">
                                            {upcomingDeadlines.map((deadline, i) => {
                                                const daysLeft = Math.ceil((new Date(deadline.date).getTime() - Date.now()) / 86400000);
                                                const isUrgent = daysLeft <= 7;
                                                return (
                                                    <motion.div key={deadline.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                        className={`flex items-center gap-4 p-3 rounded-xl ${isUrgent ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                                                        <div className={`p-2 rounded-lg ${deadline.type === 'invoice' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {deadline.type === 'invoice' ? <FileText className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">{deadline.title}</p>
                                                            <p className="text-xs text-gray-500">{deadline.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-gray-700'}`}>
                                                                {daysLeft <= 0 ? 'Passé' : `${daysLeft}j`}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{new Date(deadline.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <p>Aucune échéance à venir</p>
                                        </div>
                                    )}
                                </Card>

                                {/* Payment Progress */}
                                <Card className="p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-emerald-500" />Suivi Facturation
                                    </h3>
                                    <div className="space-y-6">
                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Paiements reçus</span>
                                                <span className="font-bold text-emerald-600">{paymentProgress}%</span>
                                            </div>
                                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${paymentProgress}%` }} transition={{ duration: 1, delay: 0.3 }}
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-emerald-50 p-4 rounded-xl">
                                                <p className="text-xs text-gray-500 uppercase font-bold">Payé</p>
                                                <p className="text-xl font-bold text-emerald-600">{stats.invoices.montantPaye.toLocaleString('fr-CH')} CHF</p>
                                                <p className="text-xs text-gray-500">{stats.invoices.payees} factures</p>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-xl">
                                                <p className="text-xs text-gray-500 uppercase font-bold">En attente</p>
                                                <p className="text-xl font-bold text-orange-600">{(stats.invoices.montantTotal - stats.invoices.montantPaye).toLocaleString('fr-CH')} CHF</p>
                                                <p className="text-xs text-gray-500">{stats.invoices.enAttente} factures</p>
                                            </div>
                                        </div>

                                        {/* Mandats Progress */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">Mandats actifs</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stats.mandats.total > 0 ? (stats.mandats.enCours / stats.mandats.total) * 100 : 0}%` }}
                                                        transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                                                </div>
                                                <span className="text-sm font-bold text-blue-600">{stats.mandats.enCours}/{stats.mandats.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {/* INVOICES TAB */}
                    {activeTab === 'invoices' && (
                        <motion.div key="invoices" {...fadeInUp}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos Factures</h2>
                                <p className="text-gray-600">Consultez et téléchargez vos factures en PDF</p>
                            </div>

                            {data.invoices.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune facture</h3>
                                    <p className="text-gray-600">Vos factures apparaîtront ici</p>
                                </Card>
                            ) : (
                                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <tr>
                                                    {['Facture', 'Date', 'Montant TTC', 'Statut', 'Actions'].map(h => (
                                                        <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {data.invoices.map((invoice, i) => (
                                                    <motion.tr key={invoice.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-orange-50/50 transition-colors group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                                                    <FileText className="w-5 h-5 text-purple-600" />
                                                                </div>
                                                                <span className="font-bold text-gray-900">{invoice.invoice_number}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-bold text-gray-900">{invoice.total_ttc?.toLocaleString('fr-CH')} CHF</div>
                                                            <div className="text-xs text-gray-500">HT: {invoice.total_ht?.toLocaleString('fr-CH')} CHF</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${invoice.status === 'payee' ? 'bg-green-100 text-green-700' :
                                                                invoice.status === 'envoyee' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {invoice.status === 'payee' && <CheckCircle className="w-3.5 h-3.5" />}
                                                                {invoice.status === 'envoyee' && <Clock className="w-3.5 h-3.5" />}
                                                                {invoice.status === 'payee' ? 'Payée' : invoice.status === 'envoyee' ? 'En attente' : invoice.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDownloadPdf(invoice)} disabled={downloadingPdf === invoice.id}
                                                                    className="p-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50" title="Télécharger PDF">
                                                                    {downloadingPdf === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                                </motion.button>
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedInvoice(invoice)} className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Voir">
                                                                    <Eye className="w-4 h-4" />
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    )}

                    {/* STRATEGIES TAB */}
                    {activeTab === 'strategies' && (
                        <motion.div key="strategies" {...fadeInUp}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos Stratégies Social Media</h2>
                                <p className="text-gray-600">Consultez toutes vos stratégies de communication</p>
                            </div>

                            {data.strategies.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune stratégie</h3>
                                    <p className="text-gray-600">Vos stratégies apparaîtront ici</p>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {data.strategies.map((strategy, i) => (
                                        <motion.div key={strategy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
                                            <Card className="p-6 h-full hover:shadow-xl transition-all border-2 border-transparent hover:border-orange-200 group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Stratégie v{strategy.version}</h3>
                                                        <p className="text-sm text-gray-600 line-clamp-2">{strategy.contexte_general || 'Stratégie social media complète'}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ml-3 ${strategy.status === 'actif' ? 'bg-green-100 text-green-700' :
                                                        strategy.status === 'brouillon' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>{strategy.status}</span>
                                                </div>

                                                {strategy.plateformes && strategy.plateformes.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Plateformes</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {strategy.plateformes.map((p, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{p}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                                                    <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{new Date(strategy.created_at).toLocaleDateString('fr-FR')}</span>
                                                </div>

                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedStrategy(strategy)}
                                                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                                                    <Eye className="w-4 h-4" />Voir les détails
                                                </motion.button>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* MANDATS TAB */}
                    {activeTab === 'mandats' && (
                        <motion.div key="mandats" {...fadeInUp}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos Mandats</h2>
                                <p className="text-gray-600">Suivez l'avancement de vos projets</p>
                            </div>

                            {data.mandats.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun mandat</h3>
                                    <p className="text-gray-600">Vos mandats apparaîtront ici</p>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {data.mandats.map((mandat, i) => (
                                        <motion.div key={mandat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
                                            <Card className="p-6 h-full hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-200 group">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                                        <Briefcase className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${mandat.status === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                                                        mandat.status === 'termine' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {mandat.status === 'en_cours' ? 'En cours' : mandat.status === 'termine' ? 'Terminé' : mandat.status}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{mandat.title}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{mandat.description || 'Aucune description'}</p>

                                                {/* Progress bar for active mandats */}
                                                {mandat.status === 'en_cours' && mandat.start_date && mandat.end_date && (
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-gray-500">Progression</span>
                                                            <span className="font-bold text-blue-600">
                                                                {Math.min(100, Math.max(0, Math.round(
                                                                    ((Date.now() - new Date(mandat.start_date).getTime()) / 
                                                                    (new Date(mandat.end_date).getTime() - new Date(mandat.start_date).getTime())) * 100
                                                                )))}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, Math.round(
                                                                ((Date.now() - new Date(mandat.start_date).getTime()) / 
                                                                (new Date(mandat.end_date).getTime() - new Date(mandat.start_date).getTime())) * 100
                                                            )))}%` }} transition={{ duration: 1 }}
                                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="w-3.5 h-3.5" />
                                                        {new Date(mandat.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    {mandat.end_date && (
                                                        <span className="flex items-center gap-1 text-blue-600">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Fin: {new Date(mandat.end_date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    )}
                                                </div>

                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedMandat(mandat)}
                                                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                                                    <Eye className="w-4 h-4" />Voir les détails
                                                </motion.button>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* DOCUMENTS TAB */}
                    {activeTab === 'documents' && (
                        <motion.div key="documents" {...fadeInUp}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents & Livrables</h2>
                                <p className="text-gray-600">Accédez à tous vos documents et livrables</p>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Contrats */}
                                <Card className="p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />Contrats
                                    </h3>
                                    <div className="space-y-3">
                                        {data.mandats.length > 0 ? data.mandats.map((mandat, i) => (
                                            <motion.div key={mandat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">Contrat - {mandat.title}</p>
                                                    <p className="text-xs text-gray-500">Signé le {new Date(mandat.created_at).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </motion.button>
                                            </motion.div>
                                        )) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>Aucun contrat disponible</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Stratégies PDF */}
                                <Card className="p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-orange-600" />Stratégies
                                    </h3>
                                    <div className="space-y-3">
                                        {data.strategies.length > 0 ? data.strategies.map((strat, i) => (
                                            <motion.div key={strat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                                <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                                                    <Target className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">Stratégie v{strat.version}</p>
                                                    <p className="text-xs text-gray-500">{new Date(strat.created_at).toLocaleDateString('fr-FR')} • {strat.status}</p>
                                                </div>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedStrategy(strat)}
                                                    className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </motion.button>
                                            </motion.div>
                                        )) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>Aucune stratégie disponible</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Factures */}
                                <Card className="p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-purple-600" />Factures
                                    </h3>
                                    <div className="space-y-3">
                                        {data.invoices.length > 0 ? data.invoices.slice(0, 5).map((inv, i) => (
                                            <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                                    <FileText className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{inv.invoice_number}</p>
                                                    <p className="text-xs text-gray-500">{inv.total_ttc?.toLocaleString('fr-CH')} CHF • {inv.status === 'payee' ? '✓ Payée' : 'En attente'}</p>
                                                </div>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDownloadPdf(inv)} disabled={downloadingPdf === inv.id}
                                                    className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50">
                                                    {downloadingPdf === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                </motion.button>
                                            </motion.div>
                                        )) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>Aucune facture disponible</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Resources & Links */}
                                <Card className="p-6 hover:shadow-xl transition-shadow bg-gradient-to-br from-indigo-50 to-purple-50">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <ExternalLink className="w-5 h-5 text-indigo-600" />Ressources Utiles
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Guide Social Media', icon: Globe, href: '#', color: 'from-blue-500 to-indigo-500' },
                                            { label: 'Calendrier Éditorial', icon: CalendarIcon, href: '#', color: 'from-purple-500 to-pink-500' },
                                            { label: 'Bonnes Pratiques', icon: CheckCircle, href: '#', color: 'from-emerald-500 to-teal-500' }
                                        ].map((resource, i) => (
                                            <motion.a key={i} href={resource.href} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}
                                                className={`flex items-center gap-4 p-4 bg-gradient-to-r ${resource.color} text-white rounded-xl hover:shadow-lg transition-all group`}>
                                                <resource.icon className="w-5 h-5" />
                                                <span className="font-semibold flex-1">{resource.label}</span>
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </motion.a>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <motion.div key="profile" {...fadeInUp}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Mon Profil</h2>
                                <p className="text-gray-600">Informations de votre compte</p>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-3">
                                <Card className="p-6 lg:col-span-2 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-gray-600" />Informations Client
                                        </h3>
                                        {!isEditingProfile && (
                                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEditProfile}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                Modifier
                                            </motion.button>
                                        )}
                                    </div>
                                    {isEditingProfile ? (
                                        <div className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Nom</label>
                                                    <div className="mt-1 text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg">{data.clientInfo?.name || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Entreprise</label>
                                                    <div className="mt-1 text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg">{data.clientInfo?.company_name || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                                        className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Téléphone</label>
                                                    <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                                        className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors" />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveProfile} disabled={savingProfile}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                                                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    Enregistrer
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsEditingProfile(false)}
                                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                                                    Annuler
                                                </motion.button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            {[
                                                { label: 'Nom', value: data.clientInfo?.name },
                                                { label: 'Email', value: data.clientInfo?.email || user.email },
                                                { label: 'Téléphone', value: data.clientInfo?.phone },
                                                { label: 'Entreprise', value: data.clientInfo?.company_name }
                                            ].map((field, i) => (
                                                <div key={i}>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">{field.label}</label>
                                                    <div className="mt-1 text-gray-900 font-semibold">{field.value || 'N/A'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>

                                <Card className="p-6 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-yellow-500" />Statut
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Statut Compte</label>
                                            <div className="mt-1">
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full capitalize">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    {data.clientInfo?.status || 'Actif'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Membre depuis</label>
                                            <div className="mt-1 text-gray-900 font-semibold">
                                                {data.clientInfo?.created_at ? new Date(data.clientInfo.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Contact Card */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <Card className="p-6 mt-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-xl transition-shadow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-orange-600" />Besoin d'Aide ?
                                    </h3>
                                    <p className="text-gray-700 mb-6">Notre équipe est à votre disposition pour répondre à toutes vos questions</p>
                                    <div className="flex flex-wrap gap-4">
                                        <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="mailto:contact@urstory.ch"
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                                            <Mail className="w-4 h-4" />contact@urstory.ch
                                        </motion.a>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowMessaging(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                                            <MessageSquare className="w-4 h-4" />Chat en direct
                                        </motion.button>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Floating Chat Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMessaging(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center z-20 hover:shadow-blue-500/60 transition-shadow"
            >
                <MessageSquare className="w-6 h-6" />
            </motion.button>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} urstory.ch - Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}
