'use client';

import Link from "next/link";
import Image from "next/image";
import CalendlyButton from './CalendlyButton';

const NAV_LINKS = [
  { href: '#hero', label: 'Accueil' },
  { href: '#offers', label: 'Nos offres' },
  { href: '#testimonials-full', label: 'Avis clients' },
  { href: '#faq', label: 'FAQ' },
  { href: '#client-login', label: 'Espace client' },
];

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h12m0 0-4-4m4 4-4 4" />
    </svg>
  );
}

export default function PremiumFooter() {
  return (
    <footer className="relative px-4 py-8 sm:py-10 md:px-6 overflow-hidden bg-gradient-to-b from-orange-500/5 via-orange-500/3 to-transparent">
      {/* Subtle background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--orange-alpha-10)_0%,_transparent_70%)]" />
      
      <div className="relative mx-auto max-w-6xl">
        {/* Logo centré */}
        <div className="text-center mb-5 sm:mb-5">
          <Link href="#hero" className="inline-block group">
            <Image 
              src="/images/logos/urstoryBlack.png" 
              alt="YourStory Logo" 
              width={160} 
              height={45}
              className="h-9 sm:h-10 w-auto mx-auto transition-all duration-200 active:scale-95 sm:group-hover:scale-105"
              priority={false}
            />
          </Link>
        </div>
        
        {/* Navigation horizontale centrée - optimisée pour mobile */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-5 md:gap-6 mb-5 sm:mb-5" aria-label="Footer Navigation">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="text-sm sm:text-sm font-medium text-gray-600 active:text-orange-500 sm:hover:text-orange-500 transition-colors duration-200 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        {/* Nous contacter + Social icons - meilleur espacement mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-6">
          <span className="text-sm sm:text-sm font-semibold text-gray-700">Nous contacter</span>
          
          <div className="flex items-center gap-3 sm:gap-3">
            <a 
              href="https://www.instagram.com/urstory.ch/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-11 w-11 sm:h-11 sm:w-11 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-xl text-gray-600 transition-all duration-200 active:scale-95 active:bg-orange-500/10 sm:hover:border-orange-500/50 sm:hover:bg-orange-500/10 sm:hover:text-orange-500 sm:hover:scale-105"
              aria-label="Instagram"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.tiktok.com/@urstory.ch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-11 w-11 sm:h-11 sm:w-11 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-xl text-gray-600 transition-all duration-200 active:scale-95 active:bg-orange-500/10 sm:hover:border-orange-500/50 sm:hover:bg-orange-500/10 sm:hover:text-orange-500 sm:hover:scale-105"
              aria-label="TikTok"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-5 sm:mb-5" />
        
        {/* Bottom: Copyright + Legal Links + CTA - meilleur layout mobile */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
          {/* Copyright */}
          <p className="text-sm sm:text-sm text-gray-500 text-center lg:text-left order-2 lg:order-1 font-medium">
            © {new Date().getFullYear()} YourStory. Tous droits réservés.
          </p>
          
          {/* Legal Links - meilleur espacement et touch targets */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-5 md:gap-6 text-sm sm:text-sm text-gray-500 order-3 lg:order-2">
            <a href="/cgv" className="active:text-orange-500 sm:hover:text-orange-500 transition-colors duration-200 py-1 font-medium">
              CGV
            </a>
            <a href="/mentions-legales" className="active:text-orange-500 sm:hover:text-orange-500 transition-colors duration-200 py-1 font-medium">
              Mentions légales
            </a>
            <a href="/politique-confidentialite" className="active:text-orange-500 sm:hover:text-orange-500 transition-colors duration-200 py-1 font-medium">
              Confidentialité
            </a>
          </div>
          
          {/* CTA Button - meilleure taille touch */}
          <div className="order-1 lg:order-3">
            <CalendlyButton className="inline-flex items-center gap-2 sm:gap-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-6 sm:px-6 py-3 sm:py-3 text-sm sm:text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl sm:hover:shadow-orange-500/30 min-h-[48px]">
              <span className="whitespace-nowrap">Prendre un rendez-vous</span>
              <ArrowRightIcon className="h-4 w-4 sm:h-4 sm:w-4" />
            </CalendlyButton>
          </div>
        </div>
      </div>
    </footer>
  );
}
