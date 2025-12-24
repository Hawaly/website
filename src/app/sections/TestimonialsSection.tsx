import { memo } from 'react';
import { TESTIMONIALS } from '../data/constants';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import { SparkleIcon } from '../components/Icons';

function TestimonialsSection() {
  return (
    <section id="testimonials-full" className="relative overflow-x-hidden px-3 py-12 sm:px-4 sm:py-20 md:px-6 md:py-24 section-premium scroll-mt-20 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Section gradient background - optimisé */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--orange-alpha-5)] to-transparent -z-10" />
      
      {/* Accent circle optimisé - un seul au lieu de plusieurs */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] md:h-[600px] md:w-[600px] rounded-full bg-gradient-radial from-orange-500/8 via-orange-400/4 to-transparent blur-3xl -z-10" />
      
      <div className="relative mx-auto max-w-7xl">
        {/* Header optimisé avec meilleure hiérarchie */}
        <div className="space-y-3 sm:space-y-5 text-center px-3 sm:px-2 md:px-0 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/80 px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
            <SparkleIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
            <span>Avis clients vérifiés</span>
          </div>
          
          <h2 className="text-[1.5rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            Nos clients en parlent{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">
                mieux que nous
              </span>
              <svg className="absolute -bottom-1.5 sm:-bottom-2 left-0 right-0 h-2.5 sm:h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,7 Q25,3 50,7 T100,7" fill="none" stroke="currentColor" strokeWidth="3" className="text-orange-500/40" />
              </svg>
            </span>
          </h2>
          
          <p className="text-[0.875rem] sm:text-base text-gray-600 leading-relaxed">
            +20 entreprises nous font confiance. Découvrez leurs témoignages authentiques.
          </p>

          {/* Stats rapides */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-1 sm:pt-2">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-orange-500 fill-current -ml-0.5 first:ml-0" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[0.9375rem] sm:text-base font-bold text-gray-900">5.0</span>
            </div>
            <div className="h-3.5 w-px bg-gray-300" />
            <div className="text-[0.75rem] sm:text-sm text-gray-600 font-medium">
              100% clients satisfaits
            </div>
          </div>
        </div>
        
        {/* Carousel avec plus d'espace et padding pour hover */}
        <div className="mt-10 sm:mt-14 md:mt-16 overflow-visible">
          <TestimonialsCarousel testimonials={TESTIMONIALS} />
        </div>
        
        {/* Trust badge en bas */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center px-2">
          <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-green-500/30 bg-green-50/50 px-4 sm:px-6 py-2.5 sm:py-2.5 backdrop-blur-sm">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[0.75rem] sm:text-sm font-semibold text-green-900">
              Témoignages vérifiés et authentiques
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(TestimonialsSection);
