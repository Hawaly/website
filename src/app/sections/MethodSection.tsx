import { memo } from 'react';
import { METHOD_STEPS } from '../data/constants';
import { SparkleIcon } from '../components/Icons';

function MethodSection() {
  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24 section-premium">
      {/* Ultra premium animated background - Simplifié sur mobile */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--orange-alpha-5)_0%,_transparent_50%)]" />
      </div>
      
      {/* Floating orbs - Plus petits sur mobile */}
      <div aria-hidden className="pointer-events-none absolute left-[5%] top-[15%] h-[150px] w-[150px] sm:h-[400px] sm:w-[400px] rounded-full bg-gradient-radial from-orange-400/20 via-orange-300/10 to-transparent blur-2xl sm:blur-3xl -z-10" />
      <div aria-hidden className="pointer-events-none absolute right-[5%] top-[40%] h-[120px] w-[120px] sm:h-[350px] sm:w-[350px] rounded-full bg-gradient-radial from-orange-500/15 via-orange-400/8 to-transparent blur-2xl sm:blur-3xl -z-10" />
      
      <div className="relative mx-auto max-w-6xl">
        {/* Header with enhanced styling - optimisé mobile */}
        <div className="text-center mb-10 sm:mb-20 md:mb-24 px-1 sm:px-0">
          <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-white px-5 py-2.5 text-xs sm:text-xs font-bold uppercase tracking-wider text-[var(--accent)] shadow-lg backdrop-blur-xl mb-6 sm:mb-6">
            <SparkleIcon className="h-4 w-4 sm:h-4 sm:w-4" />
            <span>Notre méthode</span>
          </div>
          <h2 className="text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto">
            La méthode pour avoir des <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[var(--orange-600)] via-[var(--orange-500)] to-[var(--orange-600)] bg-clip-text text-transparent">résultats</span>
              <span className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full" />
            </span> (et enfin exploser vos performances ⭐)
          </h2>
        </div>

        {/* Enhanced Timeline - Optimisé pour mobile */}
        <div className="relative">
          {/* Animated vertical line with progressive reveal - desktop only */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/30 via-orange-500/60 to-orange-500/30 rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 via-orange-400/40 to-orange-500/20 blur-sm" />
          </div>
          
          {/* Steps - layout mobile simplifié */}
          <div className="space-y-6 sm:space-y-16 md:space-y-24">
            {METHOD_STEPS.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex flex-col md:flex-row items-center gap-5 sm:gap-8 ${step.side === 'right' ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Mobile: Number en haut, Card en dessous */}
                {/* Desktop: Layout alterné gauche/droite */}
                
                {/* Number circle - Plus petit et centré sur mobile */}
                <div className="relative z-20 flex-shrink-0 order-first md:order-none">
                  {/* Glow effect - desktop only */}
                  <div className="hidden sm:block absolute -inset-2 rounded-full opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 rounded-full blur-lg" />
                  </div>
                  
                  {/* Main circle - taille adaptée mobile */}
                  <div className="relative flex h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full border-3 sm:border-4 border-white bg-gradient-to-br from-[var(--orange-600)] via-[var(--orange-500)] to-[var(--orange-600)] text-xl sm:text-3xl md:text-4xl font-black text-white shadow-xl sm:shadow-2xl shadow-orange-500/40 sm:shadow-orange-500/60 transition-all duration-200 sm:duration-300 active:scale-95 sm:hover:scale-110">
                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/50 via-white/20 to-transparent opacity-70" />
                    <span className="relative z-10">{step.number}</span>
                  </div>
                </div>

                {/* Card - Full width sur mobile */}
                <div className={`flex-1 ${step.side === 'left' ? 'md:pr-12' : 'md:pl-12'} w-full`}>
                  <div className="group relative">
                    {/* Main card - optimisé mobile */}
                    <div className="relative rounded-2xl border-2 border-white/60 bg-gradient-to-br from-white/95 via-white/90 to-orange-50/80 p-5 sm:p-6 md:p-8 shadow-lg sm:shadow-2xl backdrop-blur-xl sm:backdrop-blur-2xl transition-all duration-200 sm:duration-300 active:scale-[0.99] sm:hover:-translate-y-2 sm:hover:scale-[1.02] sm:hover:shadow-[0_25px_60px_rgba(253,89,4,0.25)] overflow-hidden">
                      {/* Content */}
                      <div className="relative z-10">
                        <div className={`flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 ${step.side === 'left' ? 'md:justify-end' : ''}`}>
                          {/* Emoji - taille adaptée */}
                          <span className="text-2xl sm:text-4xl md:text-5xl">{step.emoji}</span>
                          <div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{step.title}</h3>
                          </div>
                        </div>
                        <p className={`text-sm sm:text-base leading-relaxed text-gray-600 font-medium ${step.side === 'left' ? 'md:text-right' : ''}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacer - desktop only */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom CTA accent */}
        <div className="mt-10 sm:mt-20 text-center px-2">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-orange-500/30 bg-gradient-to-r from-white to-orange-50 px-5 sm:px-6 py-3 sm:py-3 text-sm sm:text-sm font-semibold text-gray-700 shadow-lg backdrop-blur-xl active:scale-95 sm:hover:scale-105 transition-all duration-200 sm:duration-300">
            <svg className="h-5 w-5 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>9 étapes claires pour des résultats garantis</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(MethodSection);

