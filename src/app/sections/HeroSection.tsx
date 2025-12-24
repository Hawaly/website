import { memo } from 'react';
import { GUARANTEES } from '../data/constants';
import CalendlyButton from '../components/CalendlyButton';
import { ArrowRightIcon } from '../components/Icons';

function HeroSection() {
  return (
    <section id="hero" className="relative px-3 pt-6 pb-10 sm:px-4 sm:pt-16 sm:pb-16 md:px-6 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24 section scroll-mt-20 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Hero gradient halo - simplifié sur mobile */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[300px] md:h-[600px] md:w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_var(--orange-alpha-15)_0%,_transparent_70%)] blur-3xl md:animate-pulse-subtle" />
      <div aria-hidden className="hidden md:block pointer-events-none absolute right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_var(--orange-alpha-10)_0%,_transparent_70%)] blur-3xl animate-float-slow" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="glass-badge inline-flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 max-w-[95%] mx-auto">
          <span className="glass-base rounded-full px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[10px] font-bold uppercase tracking-wide text-[var(--accent)] shadow-sm flex-shrink-0">CH</span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.25em] text-gray-700 line-clamp-1">Agence suisse experte en vidéos verticales</span>
        </div>
        
        <h1 className="mt-5 sm:mt-5 text-[1.625rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold tracking-tight text-gray-900 animate-fade-up px-3 sm:px-0" style={{ animationDelay: '100ms' }}>
          <span className="block bg-gradient-to-r from-[var(--orange-600)] via-[var(--orange-500)] to-[var(--orange-400)] bg-clip-text text-transparent drop-shadow-sm">Votre histoire mérite d&apos;être vue</span>
          <span className="block mt-2.5 sm:mt-2">Nous en faisons des vidéos qui explosent vos ventes</span>
        </h1>
        
        <p className="mx-auto mt-5 sm:mt-5 max-w-2xl text-[0.9375rem] sm:text-sm md:text-base leading-[1.6] text-gray-700 px-4 sm:px-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
          100% de clients satisfaits, +20 entreprises locales accompagnées et des vidéos qui apportent vraiment des résultats.
        </p>
        
        <div className="relative mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 px-3 sm:px-0 animate-fade-up" style={{ animationDelay: '300ms' }}>
          {/* CTA glow effect - Réduit sur mobile */}
          <div aria-hidden className="hidden sm:block pointer-events-none absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--orange-alpha-20)] blur-2xl animate-pulse-subtle" />
          
          <CalendlyButton className="btn-primary text-[0.9375rem] sm:text-base px-6 py-3.5 sm:px-8 sm:py-3.5 w-full sm:w-auto max-w-sm min-h-[48px]">
            <span className="whitespace-nowrap">Je veux faire exploser ma marque</span>
            <ArrowRightIcon className="h-4 w-4 sm:h-4 sm:w-4 transition-transform duration-300 hover:translate-x-1" />
          </CalendlyButton>
        </div>
        
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 px-3 sm:px-0 animate-fade-up" style={{ animationDelay: '400ms' }}>
          {GUARANTEES.map((guarantee) => (
            <span
              key={guarantee}
              className="glass-badge px-2.5 sm:px-3 py-1.5 sm:py-1.5 text-[0.625rem] sm:text-[10px] uppercase tracking-[0.08em] sm:tracking-[0.15em] text-gray-700"
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

