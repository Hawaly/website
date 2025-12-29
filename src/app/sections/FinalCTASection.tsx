import { memo } from 'react';
import CalendlyButton from '../components/CalendlyButton';
import { ArrowRightIcon, SparkleIcon } from '../components/Icons';

function FinalCTASection() {
  return (
    <section id="final-cta" className="relative overflow-hidden px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24 section-premium">
      {/* Final CTA gradient halo - réduit sur mobile */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[250px] w-[250px] sm:h-[500px] sm:w-[500px] md:h-[600px] md:w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--orange-alpha-15)_0%,_transparent_70%)] blur-2xl sm:blur-3xl -z-10" />
      <div className="relative mx-auto max-w-5xl px-1 sm:px-4 text-center md:px-6">
        <span className="inline-flex items-center gap-2 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-4 sm:px-4 py-2 sm:py-2 text-xs sm:text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
          <SparkleIcon className="h-4 w-4 sm:h-4 sm:w-4" />
          <span>Prêt à écrire la suite ?</span>
        </span>
        <h2 className="mt-6 sm:mt-6 text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
          Vos histoires méritent un <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">format qui performe</span>.
        </h2>
        <p className="mt-5 sm:mt-6 text-base sm:text-base md:text-lg leading-[1.7] text-gray-600 max-w-3xl mx-auto px-1 sm:px-0 font-medium">
          Réservons un appel découverte : nous répondons sous 24h avec un plan d&apos;action et des idées de narration sur-mesure.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 sm:gap-4 sm:flex-row sm:gap-6 px-1">
          <CalendlyButton className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-8 sm:px-8 py-4 sm:py-4 text-base sm:text-base font-semibold text-white shadow-xl shadow-orange-500/25 sm:shadow-orange-500/30 transition-all duration-200 active:scale-[0.98] sm:hover:scale-[1.02] sm:hover:shadow-2xl sm:hover:shadow-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 w-full sm:w-auto max-w-[340px] min-h-[56px]">
            <span>Réserver un appel</span>
            <ArrowRightIcon className="h-5 w-5 sm:h-5 sm:w-5" />
          </CalendlyButton>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/50 bg-white/70 px-5 sm:px-5 py-3 sm:py-3 text-sm sm:text-sm font-medium text-gray-700 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="whitespace-nowrap">Réponse sous 24h • Sans engagement</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default memo(FinalCTASection);

