'use client';

import { useEffect, useRef, useState } from 'react';

interface VimeoPlayer {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

interface VimeoPlayerConstructor {
  new (iframe: HTMLIFrameElement): VimeoPlayer;
}

interface WindowWithVimeo extends Window {
  Vimeo?: {
    Player: VimeoPlayerConstructor;
  };
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  size?: 'default' | 'large';
}

export default function VideoPlayer({ videoId, title, size = 'default' }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Load Vimeo Player API
    const loadVimeoAPI = () => {
      if (typeof window !== 'undefined' && !(window as WindowWithVimeo).Vimeo) {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };
    loadVimeoAPI();

    // Cleanup
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    const win = window as WindowWithVimeo;
    if (iframeRef.current && win.Vimeo) {
      const player = new win.Vimeo.Player(iframeRef.current);
      
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
        setShowControls(true);
        resetHideControlsTimer();
      }
    }
  };

  const handleMuteToggle = () => {
    const win = window as WindowWithVimeo;
    if (iframeRef.current && win.Vimeo) {
      const player = new win.Vimeo.Player(iframeRef.current);
      
      if (isMuted) {
        player.setVolume(1);
        setIsMuted(false);
      } else {
        player.setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    }
  };

  const resetHideControlsTimer = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    if (isPlaying) {
      setShowControls(true);
      resetHideControlsTimer();
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-[var(--radius-lg)] group/video bg-gradient-to-br from-gray-900 to-gray-950"
      style={{ padding: size === 'large' ? '56.25% 0 0 0' : '177.78% 0 0 0' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradient overlay pour améliorer le contraste */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10 transition-opacity duration-150 ${
          isPlaying && !showControls ? 'opacity-0' : 'opacity-100'
        }`} 
      />
      
      {/* Bouton play central - visible uniquement quand la vidéo est en pause */}
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer group/play"
          aria-label="Play video"
        >
          <div className="relative">
            {/* Glow effect animé */}
            <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-3xl animate-pulse-subtle scale-150" />
            {/* Play button */}
            <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border-3 border-white/60 transition-all duration-150 group-hover/play:scale-110 group-hover/play:shadow-[0_0_50px_rgba(255,107,53,0.5)]">
              <svg className="w-7 h-7 md:w-9 md:h-9 text-[var(--orange-600)] ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </button>
      )}
      
      {/* Contrôles personnalisés en bas */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-150 ${
          showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-md px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Bouton Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 hover:scale-110"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Bouton Mute/Unmute */}
            <button
              onClick={handleMuteToggle}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 hover:scale-110"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM3 9v6h4l5 5V4L7 9H3z" opacity="0.3"/>
                </svg>
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bouton Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200 hover:scale-110"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Vimeo iframe sans contrôles */}
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${videoId}?background=0&autoplay=0&loop=0&byline=0&title=0&portrait=0&controls=0&muted=0`}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        title={title}
        className="absolute inset-0 h-full w-full rounded-[var(--radius-lg)]"
        allowFullScreen
      />
    </div>
  );
}
