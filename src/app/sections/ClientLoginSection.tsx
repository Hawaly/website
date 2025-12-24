import { memo } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '../components/Icons';

function ClientLoginSection() {
  return (
    <section id="client-login" className="relative overflow-hidden px-3 py-10 sm:px-4 sm:py-16 md:px-6">
      {/* Background gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent -z-10" />
      
      <div className="relative mx-auto max-w-4xl">
        <div className="rounded-2xl sm:rounded-[var(--radius-xl)] border-2 border-white/50 bg-gradient-to-br from-white/70 via-white/60 to-white/50 p-6 sm:p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
              <svg className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            {/* Heading */}
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-[1.375rem] sm:text-2xl md:text-3xl font-bold text-gray-900">
                Déjà client ?
              </h2>
              <p className="text-[0.9375rem] sm:text-lg md:text-xl text-gray-700 font-medium">
                Log toi à l&apos;espace client alors ! 🚀
              </p>
            </div>
            
            {/* Description */}
            <p className="text-[0.875rem] sm:text-base text-gray-600 max-w-2xl mx-auto px-3 sm:px-0 leading-relaxed">
              Accède à ton tableau de bord personnalisé, suis l&apos;avancement de tes projets, télécharge tes vidéos et consulte tes statistiques de performance.
            </p>
            
            {/* CTA Button */}
            <div className="pt-2 sm:pt-4">
              <Link 
                href="/client-login"
                className="inline-flex items-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 sm:px-8 py-3.5 sm:py-4 text-[0.9375rem] sm:text-base font-bold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="whitespace-nowrap">Accéder à l&apos;espace client</span>
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            
            {/* Additional info */}
            <div className="pt-3 sm:pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[0.75rem] sm:text-sm text-gray-500 px-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Accès sécurisé</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span>Statistiques en temps réel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ClientLoginSection);

