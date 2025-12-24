import { memo } from 'react';
import { CLIENT_LOGOS } from '../data/constants';
import ClientLogosCarousel from '../components/ClientLogosCarousel';

function LogosSection() {
  return (
    <section id="portfolio" className="relative overflow-x-hidden px-3 py-10 sm:px-4 sm:py-16 md:px-6 md:py-20 section scroll-mt-20 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Décor de fond avec orbes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] sm:h-[500px] sm:w-[500px] md:h-[600px] md:w-[600px] bg-gradient-radial from-[var(--orange-alpha-10)] to-transparent blur-3xl animate-pulse-subtle" />
      </div>
      
      <div className="mx-auto max-w-4xl text-center animate-fade-up" style={{ animationDelay: '700ms' }}>
        {/* Client Logos Section - Carousel avec boutons */}
        <div>
          <p className="text-[0.8125rem] sm:text-sm text-gray-600 mb-6 sm:mb-8 font-medium px-2">
            Ils nous font confiance
          </p>
          
          {/* Conteneur pour accommoder le scale au hover */}
          <div className="overflow-visible">
            <ClientLogosCarousel logos={CLIENT_LOGOS} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(LogosSection);

