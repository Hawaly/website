import { memo } from 'react';
import { SparkleIcon } from '../components/Icons';

function VideoSection() {
  return (
    <section className="px-3 py-10 sm:px-4 sm:py-12 md:px-6 md:py-14 animate-fade-up" style={{ animationDelay: '500ms' }}>
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl sm:rounded-[var(--radius-xl)] border-2 border-white/40 bg-gradient-to-br from-white/40 via-orange-50/30 to-white/40 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-orange-500/40 hover:shadow-[0_20px_60px_rgba(253,89,4,0.15)]">
        {/* Placeholder vidéo en attente */}
        <div className="relative aspect-video flex flex-col items-center justify-center p-6 sm:p-12 md:p-16">
          {/* Effet de fond animé */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-orange-500/10 via-orange-400/5 to-transparent blur-3xl animate-pulse-subtle" />
          </div>
          
          {/* Contenu */}
          <div className="relative z-10 text-center space-y-4 sm:space-y-6">
            {/* Icône vidéo */}
            <div className="mx-auto flex h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-500/30 animate-pulse-subtle">
              <svg 
                className="h-7 w-7 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white ml-1" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            
            {/* Texte */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 px-2">
                Vidéo en préparation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4 sm:px-2">
                Notre showreel arrive bientôt. En attendant, découvrez nos réalisations ci-dessous.
              </p>
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-white/80 px-4 py-2 text-xs sm:text-sm font-medium text-orange-600 backdrop-blur-md shadow-sm">
              <SparkleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Bientôt disponible</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 sm:mt-4 text-center text-[0.8125rem] sm:text-sm text-gray-600 px-4 sm:px-0 animate-fade-up" style={{ animationDelay: '600ms' }}>Nous avons déjà fait exploser <span className="font-semibold text-[var(--accent)]">+20 entreprises</span>.</p>
    </section>
  );
}

export default memo(VideoSection);

