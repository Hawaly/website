import { memo } from 'react';
import { METHOD_STEPS } from '../data/constants';
import { SparkleIcon } from '../components/Icons';

function MethodSection() {
  return (
    <section className="relative overflow-hidden px-3 py-12 sm:px-4 sm:py-20 md:px-6 md:py-24 section-premium">
      {/* Ultra premium animated background - Simplifié sur mobile */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--orange-alpha-5)_0%,_transparent_50%)]" />
      </div>
      
      {/* Floating orbs - Réduits sur mobile */}
      <div aria-hidden className="pointer-events-none absolute left-[10%] top-[15%] h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] rounded-full bg-gradient-radial from-orange-400/25 via-orange-300/12 to-transparent blur-3xl animate-float-slow -z-10" />
      <div aria-hidden className="pointer-events-none absolute right-[15%] top-[40%] h-[200px] w-[200px] sm:h-[350px] sm:w-[350px] rounded-full bg-gradient-radial from-orange-500/20 via-orange-400/10 to-transparent blur-3xl animate-float-slow -z-10" style={{ animationDelay: '2s', animationDuration: '8s' }} />
      
      <div className="relative mx-auto max-w-6xl">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12 sm:mb-20 md:mb-24 scroll-reveal-blur px-2 sm:px-0">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-white px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--accent)] shadow-lg backdrop-blur-xl mb-5 sm:mb-6 hover:scale-105 transition-transform duration-300" data-animate-child>
            <SparkleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
            <span>Notre méthode</span>
          </div>
          <h2 className="text-[1.5rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto" data-animate-child>
            La méthode pour avoir des <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[var(--orange-600)] via-[var(--orange-500)] to-[var(--orange-600)] bg-clip-text text-transparent animate-gradient">résultats</span>
              <span className="absolute -bottom-1.5 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full" />
            </span> (et enfin exploser vos performances ⭐)
          </h2>
        </div>

        {/* Enhanced Timeline */}
        <div className="relative">
          {/* Animated vertical line with progressive reveal */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden md:block parallax-element animated-timeline">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/30 via-orange-500/60 to-orange-500/30 rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 via-orange-400/40 to-orange-500/20 blur-sm animate-pulse" />
          </div>
          
          {/* Steps with advanced animations */}
          <div className="space-y-10 sm:space-y-16 md:space-y-24">
            {METHOD_STEPS.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 ${step.side === 'left' ? 'scroll-reveal-left' : 'scroll-reveal-right'} ${step.side === 'right' ? 'md:flex-row-reverse' : ''}`}
                style={{ 
                  transitionDelay: `${index * 120}ms`
                }}
              >
                {/* Ultra premium Card */}
                <div className={`flex-1 ${step.side === 'left' ? 'md:pr-12' : 'md:pl-12'} w-full px-1 sm:px-0`} data-animate-child>
                  <div className="group relative perspective-1000 parallax-element">
                    {/* Multi-layer glow effect - Désactivé sur mobile */}
                    <div className="hidden sm:block absolute -inset-2 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-700 animate-pulse-slow" />
                    <div className="hidden sm:block absolute -inset-1 bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
                    
                    {/* Main card with 3D effect */}
                    <div className="relative rounded-2xl border-2 border-white/60 bg-gradient-to-br from-white/98 via-white/95 to-orange-50/90 p-5 sm:p-7 md:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:duration-700 hover:-translate-y-1 sm:hover:-translate-y-4 hover:scale-[1.01] sm:hover:scale-[1.04] hover:shadow-[0_20px_50px_rgba(253,89,4,0.25)] sm:hover:shadow-[0_35px_80px_rgba(253,89,4,0.35)] overflow-hidden">
                      {/* Animated gradient overlay with shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-orange-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className={`flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 ${step.side === 'left' ? 'md:justify-end' : ''}`} data-animate-child>
                          {/* Animated emoji with bounce */}
                          <div className="relative scroll-reveal-elastic">
                            <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl group-hover:bg-orange-500/40 transition-all duration-500" />
                            <span className="relative text-3xl sm:text-4xl md:text-5xl transition-transform duration-500 group-hover:scale-110 sm:group-hover:scale-125 group-hover:rotate-12 inline-block">{step.emoji}</span>
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-orange-500 transition-all duration-500">{step.title}</h3>
                            <div className="h-0.5 w-0 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full group-hover:w-full transition-all duration-500 mt-0.5 sm:mt-1" />
                          </div>
                        </div>
                        <p className={`text-[0.875rem] sm:text-base leading-relaxed text-gray-700 group-hover:text-gray-900 transition-colors duration-300 ${step.side === 'left' ? 'md:text-right' : ''}`} data-animate-child>
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Decorative corner accent */}
                      <div className={`absolute ${step.side === 'left' ? 'top-0 left-0' : 'top-0 right-0'} w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                  </div>
                </div>

                {/* Ultra premium Number circle - Optimisé mobile */}
                <div className="relative z-20 flex-shrink-0 group/circle scroll-reveal-scale" data-animate-child style={{ transitionDelay: `${index * 150 + 200}ms` }}>
                  {/* Multiple pulsing rings - Désactivés sur mobile */}
                  <div className="hidden sm:block absolute inset-0 rounded-full bg-orange-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="hidden sm:block absolute -inset-1 rounded-full bg-orange-400/15 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                  
                  {/* Rotating glow layer - Réduit sur mobile */}
                  <div className="hidden sm:block absolute -inset-3 rounded-full opacity-50 group-hover/circle:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 rounded-full blur-lg animate-spin-slow" />
                  </div>
                  
                  {/* Main circle with premium effects */}
                  <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-3 sm:border-4 border-white bg-gradient-to-br from-[var(--orange-600)] via-[var(--orange-500)] to-[var(--orange-600)] text-3xl sm:text-4xl font-black text-white shadow-2xl shadow-orange-500/60 transition-all duration-300 sm:duration-700 hover:scale-110 sm:hover:scale-[1.35] hover:rotate-45 sm:hover:rotate-[360deg] cursor-pointer group-hover/circle:border-orange-200">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/0 via-orange-300/20 to-orange-400/0 animate-spin-slow" />
                    
                    <span className="relative z-10 transition-all duration-700 group-hover/circle:scale-110">{step.number}</span>
                    
                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/50 via-white/20 to-transparent opacity-70" />
                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/30 blur-sm" />
                    
                    {/* Sparkle on hover */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover/circle:opacity-100 transition-opacity duration-300 animate-pulse" />
                  </div>
                  
                  {/* Progress indicator dots */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-orange-500/40 group-hover/circle:bg-orange-500 transition-all duration-300"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom CTA accent */}
        <div className="mt-12 sm:mt-20 text-center scroll-reveal-spiral px-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-gradient-to-r from-white to-orange-50 px-5 sm:px-6 py-3 text-[0.8125rem] sm:text-sm font-semibold text-gray-700 shadow-lg backdrop-blur-xl hover:scale-105 sm:hover:scale-110 hover:shadow-2xl transition-all duration-300 sm:duration-500">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

