"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export function SimpleClientLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Utiliser directement la fonction login du contexte
      const response = await login(email, password);

      if (!response.success) {
        setError(response.error || 'Identifiants incorrects');
        setIsLoading(false);
      }
      // Si succès, la redirection est gérée automatiquement par login()
    } catch (err) {
      console.error('Erreur login:', err);
      setError('Une erreur est survenue lors de la connexion');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-orange via-brand-orange-light to-yellow-400 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Logo / Titre */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-brand-orange/10 rounded-2xl mb-4">
              <svg className="w-12 h-12 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Client</h1>
            <p className="text-gray-600">Accédez à votre tableau de bord</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                  placeholder="votre@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien vers login admin */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Vous êtes administrateur ?{' '}
              <a href="/login" className="text-brand-orange font-semibold hover:underline">
                Connexion administrateur
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/90 text-sm">
            © {new Date().getFullYear()} Your Story - Espace Client Sécurisé
          </p>
        </div>
      </div>
    </div>
  );
}
