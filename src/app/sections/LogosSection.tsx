import { memo } from 'react';
import { CLIENT_LOGOS } from '../data/constants';
import ClientLogosCarousel from '../components/ClientLogosCarousel';

function LogosSection() {
  return (
    <section id="portfolio" className="relative overflow-x-hidden px-4 py-12 sm:px-5 sm:py-16 md:px-6 md:py-20 section scroll-mt-16 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Décor de fond avec orbes - simplifié sur mobile */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] md:h-[600px] md:w-[600px] bg-gradient-radial from-[var(--orange-alpha-10)] to-transparent blur-2xl sm:blur-3xl" />
      </div>
      
      <div className="mx-auto max-w-6xl">
        {/* Header de la section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Ils nous font <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">confiance</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium max-w-2xl mx-auto px-2">
            Des entreprises locales qui nous font confiance pour leur storytelling vidéo
          </p>
        </div>
        
        {/* Conteneur pour accommoder le scale au hover */}
        <div className="overflow-visible animate-fade-up" style={{ animationDelay: '200ms' }}>
          <ClientLogosCarousel logos={CLIENT_LOGOS} />
        </div>
      </div>
    </section>
  );
}

export default memo(LogosSection);

