import { memo } from 'react';
import { FAQ_ITEMS } from '../data/constants';
import CalendlyButton from '../components/CalendlyButton';
import { ArrowRightIcon, SparkleIcon } from '../components/Icons';

function FAQSection() {
  return (
    <section id="faq" className="relative overflow-hidden px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24 section-premium scroll-mt-16 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Section gradient divider */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-32 md:h-40 bg-gradient-to-b from-white to-transparent -z-10" />
      
      {/* Accent circles - Plus petits sur mobile */}
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-[120px] w-[120px] sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px] rounded-full bg-orange-500/5 blur-2xl sm:blur-3xl -z-10" />
      
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-4 sm:space-y-4 px-0 md:px-0">
            <span className="inline-flex items-center gap-2 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-4 sm:px-4 py-2 sm:py-2 text-xs sm:text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
              <SparkleIcon className="h-4 w-4 sm:h-4 sm:w-4" />
              <span>FAQ</span>
            </span>
            <h2 className="text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-gray-900">
              Vos questions sur la <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">production</span> et la <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">performance</span>.
            </h2>
            
            <p className="text-base sm:text-base text-gray-600 mt-4 sm:mt-4 leading-relaxed font-medium">
              Nous sommes transparents sur notre processus et nos résultats. Voici les questions les plus fréquentes.
            </p>
          </div>
          
          <div className="flex-1 mt-4 md:mt-0 px-0 sm:px-0">
            {/* Accordéon optimisé pour mobile */}
            <div className="divide-y divide-gray-200/40 rounded-2xl border-2 border-white/50 bg-white/45 shadow-xl sm:shadow-2xl backdrop-blur-xl sm:backdrop-blur-2xl overflow-hidden">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={item.question} className="group" open={idx === 0}>
                  <summary className="flex w-full cursor-pointer items-center justify-between gap-4 sm:gap-4 px-5 sm:px-6 md:px-6 py-5 sm:py-5 text-left text-sm sm:text-base font-semibold text-gray-900 transition-all duration-200 active:bg-[var(--orange-alpha-5)] sm:hover:bg-[var(--orange-alpha-5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 list-none min-h-[60px]">
                    <span className="transition-colors duration-200 leading-snug pr-2">{item.question}</span>
                    <span aria-hidden="true" className="inline-flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/80 text-lg sm:text-lg font-bold text-gray-700 shadow-md backdrop-blur-md transition-all duration-200 flex-shrink-0 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-5 sm:px-6 md:px-6 pb-5 sm:pb-6 md:pb-6 text-sm sm:text-sm leading-relaxed text-gray-600">
                    <div className="p-4 sm:p-4 rounded-xl bg-white/70 border border-white/60 backdrop-blur-sm">
                      {item.answer}
                    </div>
                  </div>
                </details>
              ))}
            </div>
            
            {/* CTA optimisé pour mobile */}
            <div className="mt-8 sm:mt-8 text-center">
              <CalendlyButton className="inline-flex items-center gap-2.5 text-sm sm:text-sm font-semibold text-[var(--accent)] py-3 px-4 rounded-full active:bg-orange-50 sm:hover:bg-orange-50 transition-colors duration-200">
                <span>Une autre question ?</span>
                <ArrowRightIcon className="h-5 w-5 sm:h-5 sm:w-5" />
              </CalendlyButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(FAQSection);

