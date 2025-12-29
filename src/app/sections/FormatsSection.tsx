'use client';

import { memo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { FORMAT_CARDS, ADDITIONAL_VIDEOS, FORMATS } from '../data/constants';
import VideoPlayer from '../components/VideoPlayer';
import { SparkleIcon, ArrowRightIcon } from '../components/Icons';

function SocialBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass-base inline-block cursor-pointer rounded-full px-4 py-2 text-[var(--accent)] glass-hover-accent">
      {children}
    </span>
  );
}

function FormatsSection() {
  const allVideos = [...FORMAT_CARDS, ...ADDITIONAL_VIDEOS];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);

  // Mettre à jour l'état des boutons lors du scroll
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
  }, []);

  const goToPrev = () => {
    if (!scrollContainerRef.current || !canGoPrev) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.children[0]?.clientWidth || 0;
    const gap = parseInt(getComputedStyle(container).gap) || 0;
    
    container.scrollBy({
      left: -(itemWidth + gap),
      behavior: 'smooth',
    });
  };

  const goToNext = () => {
    if (!scrollContainerRef.current || !canGoNext) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.children[0]?.clientWidth || 0;
    const gap = parseInt(getComputedStyle(container).gap) || 0;
    
    container.scrollBy({
      left: itemWidth + gap,
      behavior: 'smooth',
    });
  };

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.children[0]?.clientWidth || 0;
    const gap = parseInt(getComputedStyle(container).gap) || 0;
    
    container.scrollTo({
      left: (itemWidth + gap) * index,
      behavior: 'smooth',
    });
  };

  return (
    <section id="cases" className="relative overflow-hidden px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24 section scroll-mt-16 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Section gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--orange-alpha-5)] to-transparent -z-10" />
      <div className="relative mx-auto max-w-4xl text-center px-1 sm:px-2 md:px-0">
        <h2 className="text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-gray-900">
          L&apos;accompagnement vidéo le plus puissant de <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">2025</span> 🏅
        </h2>
        <p className="mt-5 sm:mt-6 text-base sm:text-base md:text-lg leading-[1.7] text-gray-600 px-1 font-medium">
          Le point commun entre toutes ces vidéos&nbsp;? Elles ont explosé les performances de nos clients, en publicité ou en organique.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-3 text-xs sm:text-xs font-bold uppercase tracking-wide">
          <SocialBadge>Instagram</SocialBadge>
          <SocialBadge>TikTok</SocialBadge>
        </div>
        <div className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3 text-xs sm:text-xs px-1">
          {FORMATS.slice(1).map((format) => (
            <span key={format.id} className="inline-flex items-center gap-2 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/70 px-3.5 sm:px-4 py-2 sm:py-2 font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
              <SparkleIcon className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
              {format.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* Vidéos Vimeo - Défilement horizontal sur mobile avec boutons, grid sur tablet+ */}
      <div className="mt-12 sm:mt-16">
        {/* Conteneur avec overflow pour mobile, grid pour tablet+ */}
        <div className="md:mx-auto md:max-w-5xl">
          {/* Mobile: Carousel avec boutons de navigation */}
          <div className="relative md:hidden">
            {/* Bouton précédent */}
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              aria-label="Vidéo précédente"
              className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70 bg-white/95 backdrop-blur-md shadow-lg transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Conteneur de défilement */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto px-4 pb-4 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {allVideos.map((card, index) => (
                <div
                  key={card.title}
                  className="flex-shrink-0 w-[82vw] max-w-[300px] snap-center first:ml-4 last:mr-4"
                >
                  <div className="group h-full overflow-hidden rounded-2xl border-2 border-white/50 bg-white/70 shadow-xl backdrop-blur-xl transition-all duration-200 active:scale-[0.99]">
                    <div className="p-4 space-y-4">
                      <VideoPlayer videoId={card.videoId} title={card.videoTitle} size="default" />
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight">{card.title}</h3>
                          <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] px-2.5 py-1 text-[11px] font-bold text-white flex-shrink-0 mt-0.5">
                            {index < 3 ? 'Premium' : 'Standard'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton suivant */}
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              aria-label="Vidéo suivante"
              className={`absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70 bg-white/95 backdrop-blur-md shadow-lg transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicateurs de pagination */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {allVideos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Aller à la vidéo ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-200 active:scale-90 ${
                    index === currentIndex
                      ? 'w-7 bg-gradient-to-r from-orange-500 to-orange-600'
                      : 'w-2.5 bg-gray-300 active:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Compteur */}
            <div className="mt-3 text-center">
              <span className="text-sm font-semibold text-gray-500">
                {currentIndex + 1} / {allVideos.length} vidéos
              </span>
            </div>
          </div>

          {/* Tablet & Desktop: Grid responsive */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {allVideos.map((card, index) => (
              <div
                key={card.title}
                className="group overflow-hidden rounded-[var(--radius-xl)] border border-white/30 bg-white/60 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-[var(--orange-alpha-30)] hover:bg-white/70 hover:shadow-2xl hover:shadow-[var(--orange-alpha-15)]"
              >
                <div className="p-4 space-y-4">
                  <VideoPlayer videoId={card.videoId} title={card.videoTitle} size="default" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900">{card.title}</h3>
                      <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] px-2.5 py-0.5 text-xs font-medium text-white flex-shrink-0">
                        {index < 3 ? 'Premium' : 'Standard'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA - Voir les études de cas */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link 
            href="/portfolio" 
            className="inline-flex items-center gap-2.5 rounded-full border-2 border-orange-500/30 bg-gradient-to-r from-white to-orange-50 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-base font-semibold text-gray-800 shadow-lg backdrop-blur-xl transition-all duration-200 active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-xl sm:hover:border-orange-500/50"
          >
            <span>Voir les études de cas</span>
            <ArrowRightIcon className="h-5 w-5 text-orange-500" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default memo(FormatsSection);

