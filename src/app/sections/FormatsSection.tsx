import { memo } from 'react';
import { FORMAT_CARDS, ADDITIONAL_VIDEOS, FORMATS } from '../data/constants';
import VideoPlayer from '../components/VideoPlayer';
import { SparkleIcon } from '../components/Icons';

function SocialBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass-base inline-block cursor-pointer rounded-full px-4 py-2 text-[var(--accent)] glass-hover-accent">
      {children}
    </span>
  );
}

function FormatsSection() {
  const allVideos = [...FORMAT_CARDS, ...ADDITIONAL_VIDEOS];

  return (
    <section id="cases" className="relative overflow-hidden px-3 py-12 sm:px-4 sm:py-20 md:px-6 md:py-24 section scroll-mt-20 sm:scroll-mt-28 md:scroll-mt-32">
      {/* Section gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--orange-alpha-5)] to-transparent -z-10" />
      <div className="relative mx-auto max-w-4xl text-center px-3 sm:px-2 md:px-0">
        <h2 className="text-[1.5rem] leading-tight sm:text-3xl md:text-4xl lg:text-[2.5rem] font-semibold text-gray-900 px-2">
          L&apos;accompagnement vidéo le plus puissant de <span className="bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] bg-clip-text text-transparent">2025</span> 🏅
        </h2>
        <p className="mt-4 sm:mt-6 text-[0.875rem] sm:text-base md:text-lg leading-relaxed text-gray-700 px-2">
          Le point commun entre toutes ces vidéos&nbsp;? Elles ont explosé les performances de nos clients, en publicité ou en organique.
        </p>
        <div className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold uppercase tracking-wide">
          <SocialBadge>Instagram</SocialBadge>
          <SocialBadge>TikTok</SocialBadge>
        </div>
        <div className="mt-4 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs px-2">
          {FORMATS.slice(1).map((format) => (
            <span key={format.id} className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--orange-alpha-30)] bg-white/70 px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md">
              <SparkleIcon className="h-3 w-3 sm:h-3 sm:w-3" />
              {format.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* Vidéos Vimeo - Défilement horizontal sur mobile, grid sur tablet+ */}
      <div className="mt-10 sm:mt-16">
        {/* Conteneur avec overflow pour mobile, grid pour tablet+ */}
        <div className="md:mx-auto md:max-w-5xl">
          {/* Mobile: Scroll horizontal avec snap optimisé */}
          <div className="flex gap-3 overflow-x-auto px-3 pb-4 snap-x snap-mandatory scrollbar-hide md:hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
            {allVideos.map((card, index) => (
              <div
                key={card.title}
                className="flex-shrink-0 w-[90vw] max-w-sm snap-center"
              >
                <div className="group h-full overflow-hidden rounded-2xl sm:rounded-[var(--radius-xl)] border border-white/30 bg-white/60 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-[var(--orange-alpha-30)] hover:bg-white/70 hover:shadow-2xl hover:shadow-[var(--orange-alpha-15)]">
                  <div className="p-4 sm:p-4 space-y-3 sm:space-y-4">
                    <VideoPlayer videoId={card.videoId} title={card.videoTitle} size="default" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[0.9375rem] sm:text-lg font-semibold text-gray-900 line-clamp-2">{card.title}</h3>
                        <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-500)] px-2 sm:px-2.5 py-0.5 text-[0.6875rem] sm:text-xs font-medium text-white flex-shrink-0">
                          {index < 3 ? 'Premium' : 'Standard'}
                        </span>
                      </div>
                      <p className="text-[0.8125rem] sm:text-sm text-gray-700 line-clamp-3 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
      </div>
    </section>
  );
}

export default memo(FormatsSection);

