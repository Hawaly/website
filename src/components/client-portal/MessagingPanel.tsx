"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Send,
    Loader2,
    CheckCircle,
    User
} from 'lucide-react';

interface Message {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: string;
}

interface MessagingPanelProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    clientName: string;
}

export function MessagingPanel({
    isOpen,
    onClose,
    userEmail,
    clientName
}: MessagingPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'agent',
            text: `Bonjour ${clientName?.split(' ')[0] || 'Client'} ! 👋 Comment puis-je vous aider aujourd'hui ?`,
            timestamp: new Date().toISOString()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: newMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        setIsSending(true);

        // Simulate sending (in production, this would be an API call)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const agentResponse: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            text: "Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais. Vous recevrez une notification dès qu'une réponse sera disponible.",
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, agentResponse]);
        setIsSending(false);
        setShowSuccess(true);

        setTimeout(() => setShowSuccess(false), 3000);
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

                    {/* Chat Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-4 bottom-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Support YourStory</h3>
                                        <p className="text-xs text-white/80 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            En ligne
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] ${msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-md'
                                            : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                                        } px-4 py-3`}>
                                        {msg.sender === 'agent' && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-[10px] text-white font-bold">YS</span>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500">YourStory</span>
                                            </div>
                                        )}
                                        <p className="text-sm">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                                            }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Success Toast */}
                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-20 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-semibold">Message envoyé !</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                                    disabled={isSending}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim() || isSending}
                                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Connecté en tant que {userEmail}
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
