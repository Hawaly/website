import { memo } from 'react';
import CalendlyButton from '../components/CalendlyButton';
import { ArrowRightIcon, SparkleIcon } from '../components/Icons';

function FinalCTASection() {
  return (
    <section id="final-cta" className="relative overflow-hidden px-3 py-12 sm:px-4 sm:py-20 md:px-6 md:py-24 section-premium">
      {/* Final CTA gradient halo */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] md:h-[600px] md:w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--orange-alpha-15)_0%,_transparent_70%)] blur-3xl animate-pulse-subtle -z-10" />
      <div className="relative mx-auto max-w-5xl px-3 sm:px-4 text-center md:px-6">
        <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-3 sm:px-4 py-1.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
          <SparkleIcon className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
          <span>Prêt à écrire la suite ?</span>
        </span>
        <h2 className="mt-5 sm:mt-6 text-[1.5rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">
          Vos histoires méritent un <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">format qui performe</span>.
        </h2>
        <p className="mt-4 sm:mt-6 text-[0.9375rem] sm:text-base md:text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto px-2 sm:px-0">
          Réservons un appel découverte : nous répondons sous 24h avec un plan d&apos;action et des idées de narration sur-mesure.
        </p>
        <div className="mt-7 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row sm:gap-6 px-2">
          <CalendlyButton className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-7 sm:px-8 py-3.5 sm:py-4 text-[0.9375rem] sm:text-base font-semibold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 w-full sm:w-auto max-w-sm">
            <span>Réserver un appel</span>
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </CalendlyButton>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 sm:px-5 py-2.5 sm:py-2.5 text-[0.8125rem] sm:text-sm font-medium text-gray-700 shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="whitespace-nowrap">Réponse sous 24h • Sans engagement</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default memo(FinalCTASection);

