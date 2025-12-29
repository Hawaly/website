import { memo } from 'react';
import { KPI_CARDS } from '../data/constants';
import { SparkleIcon } from '../components/Icons';

function ResultsSection() {
  return (
    <section id="results" className="relative overflow-hidden px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24 section-premium scroll-mt-16 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Section gradient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--orange-alpha-5)] to-transparent -z-10" />
      
      {/* Accent circles - Réduits sur mobile */}
      <div aria-hidden className="pointer-events-none absolute -left-20 top-40 h-[100px] w-[100px] sm:h-[250px] sm:w-[250px] md:h-[300px] md:w-[300px] rounded-full bg-orange-500/5 blur-2xl sm:blur-3xl -z-10" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-20 h-[80px] w-[80px] sm:h-[200px] sm:w-[200px] md:h-[250px] md:w-[250px] rounded-full bg-orange-500/5 blur-2xl sm:blur-3xl -z-10" />
      
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:gap-8 lg:flex-row lg:items-end px-1 sm:px-0">
          <div className="flex-1 space-y-4 sm:space-y-4">
            <span className="inline-flex items-center gap-2 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-4 sm:px-4 py-2 sm:py-2 text-xs sm:text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
              <SparkleIcon className="h-4 w-4 sm:h-4 sm:w-4" />
              <span>Ce que nos vidéos apportent</span>
            </span>
            <h2 className="text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-gray-900">
              Des vidéos qui <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">génèrent des résultats concrets</span> pour votre entreprise.
            </h2>
          </div>
        </div>
        
        {/* KPI Cards - optimisées pour mobile */}
        <div className="mt-10 sm:mt-12 md:mt-14 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 px-0 sm:px-0">
          {KPI_CARDS.map((kpi, index) => (
            <div
              key={kpi.title}
              className="group relative flex h-full flex-col justify-between rounded-2xl border-2 border-white/50 bg-white/50 px-5 sm:px-6 md:px-6 py-6 sm:py-7 md:py-8 shadow-xl sm:shadow-2xl backdrop-blur-xl sm:backdrop-blur-2xl transition-all duration-200 sm:duration-300 active:scale-[0.98] sm:hover:-translate-y-2 sm:hover:scale-[1.02] sm:hover:border-orange-500/40 sm:hover:bg-white/60 sm:hover:shadow-[0_25px_60px_rgba(253,89,4,0.15)]"
            >
              <div className="relative space-y-4 sm:space-y-4 z-10">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 -z-10 bg-gradient-subtle rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <span className="inline-flex w-max rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-3 sm:px-3 py-1.5 sm:py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[var(--accent)] shadow-sm backdrop-blur-sm">
                  KPI
                </span>
                <p className="text-[1.625rem] leading-tight sm:text-3xl md:text-3xl font-bold bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">{kpi.title}</p>
                <p className="text-sm sm:text-sm text-gray-600 leading-relaxed font-medium">{kpi.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ResultsSection);

