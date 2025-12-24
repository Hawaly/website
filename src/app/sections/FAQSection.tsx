import { memo } from 'react';
import { FAQ_ITEMS } from '../data/constants';
import CalendlyButton from '../components/CalendlyButton';
import { ArrowRightIcon, SparkleIcon } from '../components/Icons';

function FAQSection() {
  return (
    <section id="faq" className="relative overflow-hidden px-3 py-12 sm:px-4 sm:py-20 md:px-6 md:py-24 section-premium scroll-mt-20 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Section gradient divider */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-32 md:h-40 bg-gradient-to-b from-white to-transparent -z-10" />
      
      {/* Accent circles - Réduits sur mobile */}
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px] rounded-full bg-orange-500/5 blur-3xl animate-pulse-subtle -z-10" />
      
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3 sm:space-y-4 px-2 md:px-0">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-3 sm:px-4 py-1.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
              <SparkleIcon className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
              <span>FAQ</span>
            </span>
            <h2 className="text-[1.5rem] leading-tight sm:text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-gray-900">
              Vos questions sur la <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">production</span> et la <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">performance</span>.
            </h2>
            
            <p className="text-[0.875rem] sm:text-base text-gray-600 mt-3 sm:mt-4 leading-relaxed">
              Nous sommes transparents sur notre processus et nos résultats. Voici les questions les plus fréquentes.
            </p>
          </div>
          
          <div className="flex-1 mt-5 md:mt-0 px-1 sm:px-0">
            <div className="divide-y divide-gray-200/40 rounded-2xl sm:rounded-[var(--radius-xl)] border-2 border-white/40 bg-white/35 shadow-2xl backdrop-blur-2xl overflow-hidden">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={item.question} className="group" open={idx === 0}>
                  <summary className="flex w-full cursor-pointer items-center justify-between gap-2 sm:gap-4 px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left text-[0.875rem] sm:text-base font-semibold text-gray-900 transition-all duration-300 hover:bg-[var(--orange-alpha-5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 group-hover:text-[var(--accent)] list-none">
                    <span className="transition-colors duration-300 leading-snug">{item.question}</span>
                    <span aria-hidden="true" className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-white/40 bg-white/70 text-lg sm:text-lg font-bold text-gray-900 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 group-hover:border-[var(--orange-alpha-30)] group-hover:text-[var(--accent)] flex-shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-[0.8125rem] sm:text-sm leading-relaxed text-gray-700">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-white/60 border border-white/50 backdrop-blur-sm">
                      {item.answer}
                    </div>
                  </div>
                </details>
              ))}
            </div>
            
            <div className="mt-6 sm:mt-8 text-center">
              <CalendlyButton className="inline-flex items-center gap-2 text-[0.8125rem] sm:text-sm font-medium text-[var(--accent)] hover:underline">
                <span>Une autre question ?</span>
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </CalendlyButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(FAQSection);

