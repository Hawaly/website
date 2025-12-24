import { memo } from 'react';
import { KPI_CARDS } from '../data/constants';
import { SparkleIcon } from '../components/Icons';

function ResultsSection() {
  return (
    <section id="results" className="relative overflow-hidden px-3 py-12 sm:px-4 sm:py-20 md:px-6 md:py-24 section-premium scroll-mt-20 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Section gradient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--orange-alpha-5)] to-transparent -z-10" />
      
      {/* Accent circles - Réduits sur mobile */}
      <div aria-hidden className="pointer-events-none absolute -left-20 top-40 h-[150px] w-[150px] sm:h-[250px] sm:w-[250px] md:h-[300px] md:w-[300px] rounded-full bg-orange-500/5 blur-3xl -z-10" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-20 h-[120px] w-[120px] sm:h-[200px] sm:w-[200px] md:h-[250px] md:w-[250px] rounded-full bg-orange-500/5 blur-3xl -z-10" />
      
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:gap-8 lg:flex-row lg:items-end px-2 sm:px-0">
          <div className="flex-1 space-y-3 sm:space-y-4">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-3 sm:px-4 py-1.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
              <SparkleIcon className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
              <span>Ce que nos vidéos apportent</span>
            </span>
            <h2 className="text-[1.5rem] leading-tight sm:text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-gray-900">
              Des vidéos qui <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">génèrent des résultats concrets</span> pour votre entreprise.
            </h2>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-10 md:mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 px-1 sm:px-0">
          {KPI_CARDS.map((kpi, index) => (
            <div
              key={kpi.title}
              className="group relative flex h-full flex-col justify-between rounded-2xl sm:rounded-[var(--radius-xl)] border-2 border-white/40 bg-white/40 px-5 sm:px-5 md:px-6 py-7 sm:py-7 md:py-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] hover:border-orange-500/40 hover:bg-white/50 hover:shadow-[0_25px_60px_rgba(253,89,4,0.15)]"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative space-y-3 sm:space-y-4 z-10">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 -z-10 bg-gradient-subtle rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <span className="inline-flex w-max rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[0.625rem] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[var(--accent)] shadow-sm backdrop-blur-sm group-hover:border-[var(--orange-500)] group-hover:bg-white transition-all duration-300">
                  KPI
                </span>
                <p className="text-[1.5rem] leading-tight sm:text-3xl md:text-3xl font-semibold bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">{kpi.title}</p>
                <p className="text-[0.8125rem] sm:text-sm text-black/70 leading-relaxed">{kpi.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ResultsSection);

