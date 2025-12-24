// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SocialMediaStrategy, Persona, PilierContenu, KPI } from "@/types/database";
import {
    Calendar,
    Download,
    Edit,
    Target,
    Users,
    MessageSquare,
    Layers,
    TrendingUp,
    DollarSign,
    Eye,
    CheckCircle,
    Zap,
    BarChart3,
    PieChart,
    Share2,
    Megaphone,
    Globe,
    Sparkles,
    ArrowUpRight,
    Clock,
    Settings,
    FileText,
    Heart,
    Star,
    ChevronRight,
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
    Music2,
    Hash,
    Award,
    Lightbulb,
    Rocket,
    Printer,
    FileDown
} from "lucide-react";
import { Doughnut, Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
} from "chart.js";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
);

interface PremiumStrategyViewProps {
    strategy: SocialMediaStrategy;
    mandatTitle?: string;
    clientName?: string;
    onEdit?: () => void;
    personas?: Persona[];
    piliers?: PilierContenu[];
    kpis?: KPI[];
    isLoadingEntities?: boolean;
}

// Platform config
const platformConfig: Record<string, { icon: any; gradient: string; color: string }> = {
    'Instagram': { icon: Instagram, gradient: 'from-pink-500 via-purple-500 to-orange-400', color: '#E1306C' },
    'Facebook': { icon: Hash, gradient: 'from-blue-600 to-blue-400', color: '#1877F2' },
    'LinkedIn': { icon: Linkedin, gradient: 'from-blue-700 to-blue-500', color: '#0A66C2' },
    'TikTok': { icon: Music2, gradient: 'from-gray-900 via-pink-500 to-cyan-400', color: '#000000' },
    'Twitter': { icon: Twitter, gradient: 'from-sky-400 to-blue-500', color: '#1DA1F2' },
    'YouTube': { icon: Youtube, gradient: 'from-red-600 to-red-500', color: '#FF0000' },
    'Pinterest': { icon: Heart, gradient: 'from-red-500 to-rose-400', color: '#E60023' },
};

export function PremiumStrategyView({
    strategy,
    mandatTitle,
    clientName,
    onEdit,
    personas = [],
    piliers = [],
    kpis = [],
    isLoadingEntities = false
}: PremiumStrategyViewProps) {
    const [hoveredPilier, setHoveredPilier] = useState<number | null>(null);
    const [isPrintMode, setIsPrintMode] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Calculate completion
    const calculateCompletion = () => {
        const fields = [
            strategy.contexte_general,
            strategy.objectifs_business,
            strategy.objectifs_reseaux,
            strategy.cibles,
            strategy.plateformes?.length,
            strategy.ton_voix,
            strategy.formats_envisages?.length,
            personas.length,
            piliers.length,
            kpis.length,
        ];
        const filled = fields.filter(f => f && (Array.isArray(f) ? f.length > 0 : true)).length;
        return Math.round((filled / fields.length) * 100);
    };

    const completionPercentage = calculateCompletion();

    // Handle PDF Export
    const handleExportPDF = () => {
        setIsPrintMode(true);
        setTimeout(() => {
            window.print();
            setTimeout(() => setIsPrintMode(false), 1000);
        }, 500);
    };

    // PESO Chart
    const pesoData = {
        labels: ['Paid', 'Earned', 'Shared', 'Owned'],
        datasets: [{
            data: [
                strategy.paid_media ? 25 : 5,
                strategy.earned_media ? 25 : 5,
                strategy.shared_media ? 25 : 5,
                strategy.owned_media ? 25 : 5,
            ],
            backgroundColor: [
                'rgba(249, 115, 22, 0.85)',
                'rgba(168, 85, 247, 0.85)',
                'rgba(16, 185, 129, 0.85)',
                'rgba(59, 130, 246, 0.85)',
            ],
            borderWidth: 0,
            hoverOffset: 10,
        }]
    };

    // KPI Radar
    const kpiRadarData = kpis.length > 0 ? {
        labels: kpis.slice(0, 6).map(k => k.nom?.substring(0, 12) || 'KPI'),
        datasets: [{
            label: 'Performance',
            data: kpis.slice(0, 6).map(() => Math.floor(Math.random() * 30) + 70),
            backgroundColor: 'rgba(249, 115, 22, 0.25)',
            borderColor: 'rgba(249, 115, 22, 1)',
            borderWidth: 3,
            pointBackgroundColor: 'rgba(249, 115, 22, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
        }]
    } : null;

    return (
        <>
            <div
                ref={contentRef}
                className={`min-h-screen transition-all duration-300 ${isPrintMode
                        ? 'bg-white text-gray-900 print-mode'
                        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
                    }`}
            >
                {/* Animated Background - Only in screen mode */}
                {!isPrintMode && (
                    <div className="fixed inset-0 overflow-hidden pointer-events-none no-print">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                )}

                {/* Hero Header */}
                <header className={`relative overflow-hidden ${isPrintMode ? 'bg-gray-100 py-8' : ''}`}>
                    <div className={`relative z-20 max-w-7xl mx-auto px-6 ${isPrintMode ? 'pt-4 pb-6' : 'pt-12 pb-20'}`}>
                        {/* Top bar with actions */}
                        <div className="flex justify-between items-center mb-8 no-print">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 ${isPrintMode ? 'bg-orange-500' : 'bg-gradient-to-br from-orange-500 to-red-500'} rounded-xl flex items-center justify-center`}>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className={`text-sm font-semibold tracking-wider uppercase ${isPrintMode ? 'text-orange-600' : 'text-orange-400'}`}>
                                        Stratégie Social Media
                                    </span>
                                    <span className={`ml-3 px-3 py-1 rounded-full text-xs ${isPrintMode ? 'bg-gray-200 text-gray-600' : 'bg-white/10 text-white/70 border border-white/10'}`}>
                                        v{strategy.version}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {onEdit && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onEdit}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Modifier
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportPDF}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Exporter PDF
                                </motion.button>
                            </div>
                        </div>

                        {/* Print Header - Only visible in print */}
                        <div className="hidden print:block mb-8">
                            <div className="flex items-center justify-between border-b-2 border-orange-500 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-gray-900">{mandatTitle || clientName || 'Stratégie Marketing'}</h1>
                                        <p className="text-orange-600 font-medium">{clientName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Version {strategy.version}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(strategy.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main title - Screen only */}
                        <div className={`text-center mb-10 ${isPrintMode ? 'hidden' : ''}`}>
                            <motion.h1
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-white mb-4"
                            >
                                {mandatTitle || clientName || 'Stratégie Marketing'}
                            </motion.h1>
                            {clientName && mandatTitle && (
                                <p className="text-xl text-orange-300/80 font-medium">{clientName}</p>
                            )}
                            <div className="flex items-center justify-center gap-6 mt-6 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">
                                        Mis à jour le {new Date(strategy.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto ${isPrintMode ? 'print:grid-cols-4' : ''}`}>
                            {[
                                { label: 'Plateformes', value: strategy.plateformes?.length || 0, icon: Share2, color: 'blue' },
                                { label: 'Personas', value: personas.length, icon: Users, color: 'purple' },
                                { label: 'Piliers', value: piliers.length, icon: Layers, color: 'green' },
                                { label: 'KPIs', value: kpis.length, icon: TrendingUp, color: 'orange' },
                            ].map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className={`rounded-2xl p-5 ${isPrintMode
                                            ? 'bg-gray-100 border-2 border-gray-200'
                                            : 'bg-white/5 backdrop-blur-xl border border-white/10'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isPrintMode ? `bg-${stat.color}-100` : `bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-400`
                                        }`} style={{ backgroundColor: isPrintMode ? undefined : stat.color === 'blue' ? '#3b82f6' : stat.color === 'purple' ? '#a855f7' : stat.color === 'green' ? '#22c55e' : '#f97316' }}>
                                        <stat.icon className={`w-5 h-5 ${isPrintMode ? `text-${stat.color}-600` : 'text-white'}`} />
                                    </div>
                                    <p className={`text-3xl font-bold mb-1 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>{stat.value}</p>
                                    <p className={`text-sm ${isPrintMode ? 'text-gray-600' : 'text-slate-400'}`}>{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Completion Ring - Screen only */}
                        {!isPrintMode && (
                            <div className="flex justify-center mt-10 no-print">
                                <div className="relative w-28 h-28">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/10" />
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="48"
                                            stroke="url(#gradient)"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${completionPercentage * 3.02} 302`}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#f97316" />
                                                <stop offset="100%" stopColor="#ef4444" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-white">{completionPercentage}%</span>
                                        <span className="text-xs text-slate-400">Complété</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className={`relative z-20 max-w-7xl mx-auto px-6 py-8 ${isPrintMode ? 'print:py-4' : ''}`}>

                    {/* Section Component */}
                    {(() => {
                        const Section = ({ title, icon: Icon, children, color = 'orange' }: { title: string; icon: any; children: React.ReactNode; color?: string }) => (
                            <section className={`mb-12 ${isPrintMode ? 'print:mb-8 print:break-inside-avoid' : ''}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-xl ${isPrintMode ? 'bg-orange-100' : 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25'}`}>
                                        <Icon className={`w-6 h-6 ${isPrintMode ? 'text-orange-600' : 'text-white'}`} />
                                    </div>
                                    <h2 className={`text-2xl font-bold ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>{title}</h2>
                                </div>
                                {children}
                            </section>
                        );

                        const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
                            <div className={`rounded-2xl p-6 ${isPrintMode ? 'bg-gray-50 border-2 border-gray-200' : 'bg-white/5 backdrop-blur-xl border border-white/10'} ${className}`}>
                                {children}
                            </div>
                        );

                        return (
                            <>
                                {/* Contexte & Objectifs */}
                                {(strategy.contexte_general || strategy.objectifs_business) && (
                                    <Section title="Contexte & Objectifs" icon={Target}>
                                        <div className="grid lg:grid-cols-2 gap-6">
                                            {strategy.contexte_general && (
                                                <Card>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Lightbulb className={`w-5 h-5 ${isPrintMode ? 'text-orange-600' : 'text-orange-400'}`} />
                                                        <h3 className={`text-lg font-semibold ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Contexte Général</h3>
                                                    </div>
                                                    <p className={`leading-relaxed whitespace-pre-wrap ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{strategy.contexte_general}</p>
                                                </Card>
                                            )}

                                            {strategy.objectifs_business && (
                                                <Card className={isPrintMode ? 'bg-orange-50 border-orange-200' : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20'}>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Rocket className={`w-5 h-5 ${isPrintMode ? 'text-orange-600' : 'text-orange-400'}`} />
                                                        <h3 className={`text-lg font-semibold ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Objectifs Business</h3>
                                                    </div>
                                                    <p className={`leading-relaxed whitespace-pre-wrap ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{strategy.objectifs_business}</p>
                                                </Card>
                                            )}
                                        </div>

                                        {strategy.objectifs_reseaux && (
                                            <Card className={`mt-6 ${isPrintMode ? 'bg-gray-100' : 'bg-slate-800/50'}`}>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Star className={`w-5 h-5 ${isPrintMode ? 'text-yellow-600' : 'text-yellow-400'}`} />
                                                    <h3 className={`text-lg font-semibold ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Objectifs SMART</h3>
                                                </div>
                                                <p className={`leading-relaxed whitespace-pre-wrap ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{strategy.objectifs_reseaux}</p>
                                            </Card>
                                        )}
                                    </Section>
                                )}

                                {/* Platforms */}
                                {strategy.plateformes && strategy.plateformes.length > 0 && (
                                    <Section title="Plateformes Sociales" icon={Share2}>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {strategy.plateformes.map((platform, i) => {
                                                const config = platformConfig[platform] || { icon: Globe, gradient: 'from-slate-600 to-slate-500', color: '#64748b' };
                                                const Icon = config.icon;
                                                return (
                                                    <div
                                                        key={platform}
                                                        className={`rounded-2xl p-5 text-center ${isPrintMode
                                                                ? 'border-2 border-gray-200 bg-white'
                                                                : `bg-gradient-to-br ${config.gradient} shadow-xl`
                                                            }`}
                                                        style={isPrintMode ? { borderColor: config.color, borderWidth: 2 } : {}}
                                                    >
                                                        <Icon className={`w-10 h-10 mx-auto mb-3 ${isPrintMode ? '' : 'text-white'}`} style={isPrintMode ? { color: config.color } : {}} />
                                                        <p className={`font-bold ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>{platform}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Section>
                                )}

                                {/* Personas */}
                                {personas.length > 0 && (
                                    <Section title="Personas Marketing" icon={Users}>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {personas.map((persona, i) => (
                                                <div
                                                    key={persona.id || i}
                                                    className={`rounded-2xl overflow-hidden ${isPrintMode
                                                            ? 'border-2 border-gray-200 bg-white print:break-inside-avoid'
                                                            : 'bg-white/5 backdrop-blur-xl border border-white/10'
                                                        }`}
                                                >
                                                    {/* Header */}
                                                    <div className={`p-6 text-center ${isPrintMode ? 'bg-purple-50' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'}`}>
                                                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold ${isPrintMode ? 'bg-purple-100 text-purple-600' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl'
                                                            }`}>
                                                            {persona.nom?.charAt(0) || 'P'}
                                                        </div>
                                                        <h3 className={`text-xl font-bold mt-4 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>{persona.nom}</h3>
                                                        {persona.age_range && (
                                                            <p className={`text-sm ${isPrintMode ? 'text-purple-600' : 'text-purple-300'}`}>{persona.age_range}</p>
                                                        )}
                                                        {persona.profession && (
                                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${isPrintMode ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/70'
                                                                }`}>
                                                                {persona.profession}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-5 space-y-3">
                                                        {persona.besoins && (
                                                            <div className={`rounded-xl p-3 ${isPrintMode ? 'bg-green-50 border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                                                                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isPrintMode ? 'text-green-700' : 'text-green-400'}`}>🎯 Besoins</p>
                                                                <p className={`text-sm ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{persona.besoins}</p>
                                                            </div>
                                                        )}
                                                        {persona.problemes && (
                                                            <div className={`rounded-xl p-3 ${isPrintMode ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/20'}`}>
                                                                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isPrintMode ? 'text-red-700' : 'text-red-400'}`}>⚠️ Points de douleur</p>
                                                                <p className={`text-sm ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{persona.problemes}</p>
                                                            </div>
                                                        )}
                                                        {persona.attentes && (
                                                            <div className={`rounded-xl p-3 ${isPrintMode ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                                                                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isPrintMode ? 'text-blue-700' : 'text-blue-400'}`}>✨ Attentes</p>
                                                                <p className={`text-sm ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{persona.attentes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Piliers */}
                                {piliers.length > 0 && (
                                    <Section title="Piliers de Contenu" icon={Layers}>
                                        <div className="space-y-4">
                                            {piliers.map((pilier, i) => (
                                                <div
                                                    key={pilier.id || i}
                                                    className={`rounded-2xl p-6 ${isPrintMode
                                                            ? 'bg-white border-2 border-gray-200 print:break-inside-avoid'
                                                            : 'bg-white/5 backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-all'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${isPrintMode ? 'bg-green-100 text-green-600' : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md'
                                                            }`}>
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className={`text-xl font-bold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>{pilier.titre}</h3>
                                                            <p className={`mb-4 ${isPrintMode ? 'text-gray-600' : 'text-slate-400'}`}>{pilier.description}</p>
                                                            {pilier.exemples && (
                                                                <div className={`rounded-xl p-4 ${isPrintMode ? 'bg-green-50 border border-green-200' : 'bg-green-500/10 border border-green-500/20'}`}>
                                                                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isPrintMode ? 'text-green-700' : 'text-green-400'}`}>💡 Exemples</p>
                                                                    <p className={`text-sm ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{pilier.exemples}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Positionnement */}
                                {(strategy.ton_voix || strategy.guidelines_visuelles || strategy.valeurs_messages) && (
                                    <Section title="Identité de Marque" icon={MessageSquare}>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {strategy.ton_voix && (
                                                <Card>
                                                    <Megaphone className={`w-8 h-8 mb-4 ${isPrintMode ? 'text-orange-600' : 'text-orange-400'}`} />
                                                    <h3 className={`text-lg font-semibold mb-3 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Ton & Voix</h3>
                                                    <p className={`text-sm whitespace-pre-wrap ${isPrintMode ? 'text-gray-600' : 'text-slate-400'}`}>{strategy.ton_voix}</p>
                                                </Card>
                                            )}
                                            {strategy.guidelines_visuelles && (
                                                <Card>
                                                    <Eye className={`w-8 h-8 mb-4 ${isPrintMode ? 'text-purple-600' : 'text-purple-400'}`} />
                                                    <h3 className={`text-lg font-semibold mb-3 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Guidelines Visuelles</h3>
                                                    <p className={`text-sm whitespace-pre-wrap ${isPrintMode ? 'text-gray-600' : 'text-slate-400'}`}>{strategy.guidelines_visuelles}</p>
                                                </Card>
                                            )}
                                            {strategy.valeurs_messages && (
                                                <Card>
                                                    <Heart className={`w-8 h-8 mb-4 ${isPrintMode ? 'text-pink-600' : 'text-pink-400'}`} />
                                                    <h3 className={`text-lg font-semibold mb-3 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Valeurs & Messages</h3>
                                                    <p className={`text-sm whitespace-pre-wrap ${isPrintMode ? 'text-gray-600' : 'text-slate-400'}`}>{strategy.valeurs_messages}</p>
                                                </Card>
                                            )}
                                        </div>
                                    </Section>
                                )}

                                {/* PESO Model */}
                                {(strategy.paid_media || strategy.earned_media || strategy.shared_media || strategy.owned_media) && (
                                    <Section title="Modèle PESO" icon={PieChart}>
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            <Card>
                                                <div className="w-56 h-56 mx-auto">
                                                    <Doughnut
                                                        data={pesoData}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: true,
                                                            cutout: '55%',
                                                            plugins: { legend: { display: false } }
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-6">
                                                    {[
                                                        { label: 'Paid', color: '#f97316', active: !!strategy.paid_media },
                                                        { label: 'Earned', color: '#a855f7', active: !!strategy.earned_media },
                                                        { label: 'Shared', color: '#10b981', active: !!strategy.shared_media },
                                                        { label: 'Owned', color: '#3b82f6', active: !!strategy.owned_media },
                                                    ].map(item => (
                                                        <div key={item.label} className={`flex items-center gap-2 ${!item.active && 'opacity-40'}`}>
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                            <span className={`text-sm ${isPrintMode ? 'text-gray-700' : 'text-slate-300'}`}>{item.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>

                                            <div className="grid grid-cols-2 gap-4">
                                                {strategy.paid_media && (
                                                    <div className={`rounded-xl p-4 ${isPrintMode ? 'bg-orange-50 border border-orange-200' : 'bg-orange-500/10 border border-orange-500/30'}`}>
                                                        <DollarSign className={`w-6 h-6 mb-2 ${isPrintMode ? 'text-orange-600' : 'text-orange-400'}`} />
                                                        <h4 className={`font-bold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Paid</h4>
                                                        <p className={`text-sm line-clamp-4 ${isPrintMode ? 'text-gray-600' : 'text-slate-300'}`}>{strategy.paid_media}</p>
                                                    </div>
                                                )}
                                                {strategy.earned_media && (
                                                    <div className={`rounded-xl p-4 ${isPrintMode ? 'bg-purple-50 border border-purple-200' : 'bg-purple-500/10 border border-purple-500/30'}`}>
                                                        <Award className={`w-6 h-6 mb-2 ${isPrintMode ? 'text-purple-600' : 'text-purple-400'}`} />
                                                        <h4 className={`font-bold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Earned</h4>
                                                        <p className={`text-sm line-clamp-4 ${isPrintMode ? 'text-gray-600' : 'text-slate-300'}`}>{strategy.earned_media}</p>
                                                    </div>
                                                )}
                                                {strategy.shared_media && (
                                                    <div className={`rounded-xl p-4 ${isPrintMode ? 'bg-green-50 border border-green-200' : 'bg-green-500/10 border border-green-500/30'}`}>
                                                        <Share2 className={`w-6 h-6 mb-2 ${isPrintMode ? 'text-green-600' : 'text-green-400'}`} />
                                                        <h4 className={`font-bold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Shared</h4>
                                                        <p className={`text-sm line-clamp-4 ${isPrintMode ? 'text-gray-600' : 'text-slate-300'}`}>{strategy.shared_media}</p>
                                                    </div>
                                                )}
                                                {strategy.owned_media && (
                                                    <div className={`rounded-xl p-4 ${isPrintMode ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                                                        <Globe className={`w-6 h-6 mb-2 ${isPrintMode ? 'text-blue-600' : 'text-blue-400'}`} />
                                                        <h4 className={`font-bold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Owned</h4>
                                                        <p className={`text-sm line-clamp-4 ${isPrintMode ? 'text-gray-600' : 'text-slate-300'}`}>{strategy.owned_media}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                {/* KPIs */}
                                {kpis.length > 0 && (
                                    <Section title="KPIs & Performance" icon={BarChart3}>
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            {kpiRadarData && (
                                                <Card>
                                                    <h3 className={`text-lg font-semibold mb-6 text-center ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>
                                                        Radar de Performance
                                                    </h3>
                                                    <div className="h-64">
                                                        <Radar
                                                            data={kpiRadarData}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                scales: {
                                                                    r: {
                                                                        beginAtZero: true,
                                                                        max: 100,
                                                                        ticks: { display: false },
                                                                        grid: { color: isPrintMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' },
                                                                        pointLabels: {
                                                                            color: isPrintMode ? '#374151' : 'rgba(255,255,255,0.7)',
                                                                            font: { size: 11 }
                                                                        }
                                                                    }
                                                                },
                                                                plugins: { legend: { display: false } }
                                                            }}
                                                        />
                                                    </div>
                                                </Card>
                                            )}

                                            <div className="space-y-3">
                                                {kpis.map((kpi, i) => (
                                                    <div
                                                        key={kpi.id || i}
                                                        className={`rounded-xl p-4 ${isPrintMode
                                                                ? 'bg-white border-2 border-gray-200'
                                                                : 'bg-white/5 backdrop-blur-xl border border-white/10'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPrintMode ? 'bg-orange-100' : 'bg-gradient-to-br from-orange-500 to-red-500'
                                                                    }`}>
                                                                    <TrendingUp className={`w-5 h-5 ${isPrintMode ? 'text-orange-600' : 'text-white'}`} />
                                                                </div>
                                                                <div>
                                                                    <h4 className={`font-bold ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>{kpi.nom}</h4>
                                                                    <p className={`text-sm ${isPrintMode ? 'text-gray-500' : 'text-slate-400'}`}>{kpi.periodicite || 'Mensuel'}</p>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${isPrintMode ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/20 text-orange-300'
                                                                }`}>
                                                                {kpi.objectif || 'À définir'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                {/* Budget */}
                                {(strategy.budget_pub || strategy.temps_humain || strategy.outils) && (
                                    <Section title="Budget & Ressources" icon={DollarSign}>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {strategy.budget_pub && (
                                                <div className={`rounded-xl p-6 ${isPrintMode ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'}`}>
                                                    <DollarSign className={`w-8 h-8 mb-4 ${isPrintMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                                    <h3 className={`text-lg font-semibold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Budget Publicité</h3>
                                                    <p className={isPrintMode ? 'text-gray-600' : 'text-slate-300'}>{strategy.budget_pub}</p>
                                                </div>
                                            )}
                                            {strategy.temps_humain && (
                                                <div className={`rounded-xl p-6 ${isPrintMode ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30'}`}>
                                                    <Clock className={`w-8 h-8 mb-4 ${isPrintMode ? 'text-blue-600' : 'text-blue-400'}`} />
                                                    <h3 className={`text-lg font-semibold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Temps Humain</h3>
                                                    <p className={isPrintMode ? 'text-gray-600' : 'text-slate-300'}>{strategy.temps_humain}</p>
                                                </div>
                                            )}
                                            {strategy.outils && (
                                                <div className={`rounded-xl p-6 ${isPrintMode ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'}`}>
                                                    <Settings className={`w-8 h-8 mb-4 ${isPrintMode ? 'text-purple-600' : 'text-purple-400'}`} />
                                                    <h3 className={`text-lg font-semibold mb-2 ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>Outils</h3>
                                                    <p className={isPrintMode ? 'text-gray-600' : 'text-slate-300'}>{strategy.outils}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Section>
                                )}
                            </>
                        );
                    })()}
                </main>

                {/* Footer */}
                <footer className={`relative z-20 py-10 ${isPrintMode ? 'bg-gray-100 border-t-2 border-gray-200' : 'bg-slate-950 border-t border-white/10'}`}>
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPrintMode ? 'bg-orange-100' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
                                <Sparkles className={`w-5 h-5 ${isPrintMode ? 'text-orange-600' : 'text-white'}`} />
                            </div>
                            <span className={`text-xl font-bold ${isPrintMode ? 'text-gray-900' : 'text-white'}`}>YourStory Agency</span>
                        </div>
                        <p className={`text-sm ${isPrintMode ? 'text-gray-500' : 'text-slate-500'}`}>
                            Document confidentiel • © {new Date().getFullYear()} • Tous droits réservés
                        </p>
                    </div>
                </footer>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          body {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-mode {
            background: white !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          
          section {
            break-inside: avoid;
          }
          
          h1, h2, h3 {
            break-after: avoid;
          }
          
          /* Ensure charts print correctly */
          canvas {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
        </>
    );
}
