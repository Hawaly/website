'use client';

import { useState, useRef, useEffect, memo } from 'react';

interface Testimonial {
  readonly quote: string;
  readonly name: string;
}

interface TestimonialsCarouselProps {
  testimonials: ReadonlyArray<Testimonial>;
}

// Composant optimisé pour les étoiles
const StarRating = memo(function StarRating() {
  return (
    <div className="flex gap-0.5 sm:gap-1" aria-label="5 étoiles sur 5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 fill-current"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
});

function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mettre à jour l'état des boutons et l'index actuel lors du scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateButtons = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanGoPrev(scrollLeft > 10);
      setCanGoNext(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculer l'index actuel
      const itemWidth = container.children[0]?.clientWidth || 0;
      const gap = parseInt(getComputedStyle(container).gap) || 0;
      const itemWithGap = itemWidth + gap;
      const newIndex = Math.round(scrollLeft / itemWithGap);
      setCurrentIndex(newIndex);
    };

    updateButtons();
    container.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [testimonials.length]);

  const goToPrev = () => {
    if (!scrollContainerRef.current || !canGoPrev) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.children[0]?.clientWidth || 0;
    const gap = parseInt(getComputedStyle(container).gap) || 0;
    const scrollAmount = (itemWidth + gap) * 1;
    
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  };

  const goToNext = () => {
    if (!scrollContainerRef.current || !canGoNext) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.children[0]?.clientWidth || 0;
    const gap = parseInt(getComputedStyle(container).gap) || 0;
    const scrollAmount = (itemWidth + gap) * 1;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.children[0]?.clientWidth || 0;
    const gap = parseInt(getComputedStyle(container).gap) || 0;
    const scrollAmount = (itemWidth + gap) * index;
    
    container.scrollTo({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative overflow-visible">
      {/* Masques de dégradé optimisés pour effet fade */}
      <div className="absolute left-0 top-6 bottom-6 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-6 bottom-6 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
      
      {/* Conteneur principal */}
      <div className="relative px-10 sm:px-14 md:px-16 overflow-visible">
        {/* Bouton précédent optimisé */}
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          aria-label="Témoignage précédent"
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-200 hover:scale-105 hover:bg-white hover:border-orange-500/50 hover:shadow-orange-500/20 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100 group active:scale-95`}
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 transition-colors duration-200 group-hover:text-orange-600 group-disabled:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Conteneur de défilement optimisé */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-6 -my-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group relative flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[45vw] lg:w-[32vw] max-w-md snap-start"
            >
              {/* Card optimisée */}
              <div className="h-full flex flex-col rounded-2xl border-2 border-white/60 bg-gradient-to-br from-white/70 via-white/60 to-orange-50/20 px-5 sm:px-6 py-6 sm:py-7 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10">
                {/* Header avec étoiles */}
                <div className="flex items-start justify-between mb-4 sm:mb-5">
                  <StarRating />
                  <svg 
                    className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500/20 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M9.58 17c-1.6 0-2.905-1.3-2.905-2.9 0-1.6 1.3-2.9 2.905-2.9.43 0 .845.1 1.225.27-.54-1.17-1.685-2-3.03-2.07v-2.2c2.905.14 5.18 2.47 5.18 5.36 0 2.47-2.01 4.44-4.5 4.44zm8.5 0c-1.6 0-2.905-1.3-2.905-2.9 0-1.6 1.305-2.9 2.905-2.9.435 0 .845.1 1.23.27-.54-1.17-1.69-2-3.035-2.07v-2.2c2.905.14 5.18 2.47 5.18 5.36 0 2.47-2.01 4.44-4.5 4.44z" />
                  </svg>
                </div>
                
                {/* Quote text optimisé pour la lisibilité */}
                <blockquote className="flex-1 mb-5 sm:mb-6">
                  <p className="text-sm sm:text-base leading-relaxed text-gray-800 font-medium">
                    {testimonial.quote}
                  </p>
                </blockquote>
                
                {/* Author avec design amélioré */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                  <div className="flex-shrink-0 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 text-lg sm:text-xl font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                      {testimonial.name.split(',')[0]}
                    </p>
                    {testimonial.name.includes('@') && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {testimonial.name.split('@')[1]?.trim()}
                      </p>
                    )}
                  </div>
                  {/* Badge vérifié */}
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Vérifié">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton suivant optimisé */}
        <button
          onClick={goToNext}
          disabled={!canGoNext}
          aria-label="Témoignage suivant"
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-200 hover:scale-105 hover:bg-white hover:border-orange-500/50 hover:shadow-orange-500/20 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100 group active:scale-95`}
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 transition-colors duration-200 group-hover:text-orange-600 group-disabled:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicateurs de pagination optimisés */}
      <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1.5 sm:gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Aller au témoignage ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
            className={`h-2 rounded-full transition-all duration-300 hover:opacity-100 ${
              index === currentIndex
                ? 'w-8 sm:w-10 bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm shadow-orange-500/40 opacity-100'
                : 'w-2 bg-gray-300 opacity-50 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Compteur de témoignages */}
      <div className="mt-4 text-center">
        <span className="text-xs sm:text-sm font-medium text-gray-600">
          {currentIndex + 1} / {testimonials.length} témoignages
        </span>
      </div>
    </div>
  );
}

export default memo(TestimonialsCarousel);
