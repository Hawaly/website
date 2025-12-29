import { memo } from 'react';
import { GUARANTEES } from '../data/constants';
import CalendlyButton from '../components/CalendlyButton';
import { ArrowRightIcon } from '../components/Icons';

function HeroSection() {
  return (
    <section id="hero" className="relative px-4 pt-8 pb-12 sm:px-5 sm:pt-16 sm:pb-16 md:px-6 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24 section scroll-mt-16 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Hero gradient halo - simplifié sur mobile */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] md:h-[600px] md:w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_var(--orange-alpha-15)_0%,_transparent_70%)] blur-2xl sm:blur-3xl" />
      <div aria-hidden className="hidden md:block pointer-events-none absolute right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_var(--orange-alpha-10)_0%,_transparent_70%)] blur-3xl animate-float-slow" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        {/* Badge - taille lisible sur mobile */}
        <div className="glass-badge inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 mx-auto">
          <span className="glass-base rounded-full px-2 sm:px-2.5 py-1 sm:py-1 text-xs font-bold uppercase tracking-wide text-[var(--accent)] shadow-sm flex-shrink-0">CH</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-700 leading-tight">Agence suisse experte en vidéos verticales</span>
        </div>
        
        {/* Titre principal */}
        <h1 className="mt-6 sm:mt-6 text-[1.875rem] leading-[1.15] sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold tracking-tight text-gray-900 animate-fade-up px-1 sm:px-0" style={{ animationDelay: '100ms' }}>
          <span className="block bg-gradient-to-r from-[var(--orange-600)] via-[var(--orange-500)] to-[var(--orange-400)] bg-clip-text text-transparent drop-shadow-sm">Votre histoire mérite d&apos;être vue</span>
          <span className="block mt-3 sm:mt-2 text-[1.625rem] sm:text-3xl md:text-4xl lg:text-5xl leading-[1.2]">Nous en faisons des vidéos qui explosent vos ventes</span>
        </h1>
        
        {/* Sous-titre */}
        <p className="mx-auto mt-5 sm:mt-6 max-w-2xl text-base sm:text-base md:text-lg leading-[1.7] text-gray-600 px-2 sm:px-0 animate-fade-up font-medium" style={{ animationDelay: '200ms' }}>
          100% de clients satisfaits, +20 entreprises locales accompagnées et des vidéos qui apportent vraiment des résultats.
        </p>
        
        {/* CTA */}
        <div className="relative mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 px-2 sm:px-0 animate-fade-up" style={{ animationDelay: '300ms' }}>
          {/* CTA glow effect - Réduit sur mobile */}
          <div aria-hidden className="hidden sm:block pointer-events-none absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--orange-alpha-20)] blur-2xl animate-pulse-subtle" />
          
          <CalendlyButton className="btn-primary text-base sm:text-base px-7 py-4 sm:px-8 sm:py-4 w-full sm:w-auto max-w-[340px] min-h-[56px] shadow-xl shadow-orange-500/25">
            <span className="whitespace-nowrap font-semibold">Je veux faire exploser ma marque</span>
            <ArrowRightIcon className="h-5 w-5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </CalendlyButton>
        </div>
        
        {/* Badges de garantie - horizontaux, une seule ligne chacun */}
        <div className="mt-5 sm:mt-6 flex flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-2 sm:px-0 animate-fade-up" style={{ animationDelay: '400ms' }}>
          {GUARANTEES.map((guarantee) => (
            <span
              key={guarantee}
              className="glass-badge px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] text-gray-600 font-semibold whitespace-nowrap"
            >
              {guarantee}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSection);

