// app/page.tsx - SERVER COMPONENT optimisé avec dynamic imports
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { NAV_LINKS } from './data/constants';
import CalendlyButton from './components/CalendlyButton';
import PremiumFooter from './components/PremiumFooter';
import MobileMenu from './components/MobileMenu';
import { ArrowRightIcon } from './components/Icons';

// Composant de chargement optimisé
function SectionFallback() {
  return (
    <div className="relative overflow-hidden px-4 py-16 md:px-6 section">
      <div className="mx-auto max-w-6xl flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Dynamic imports pour optimiser le bundle avec Next.js
const HeroSection = dynamic(() => import('./sections/HeroSection'), {
  loading: () => <SectionFallback />
});
const VideoSection = dynamic(() => import('./sections/VideoSection'), {
  loading: () => <SectionFallback />
});
const LogosSection = dynamic(() => import('./sections/LogosSection'), {
  loading: () => <SectionFallback />
});
const FormatsSection = dynamic(() => import('./sections/FormatsSection'), {
  loading: () => <SectionFallback />
});
const ResultsSection = dynamic(() => import('./sections/ResultsSection'), {
  loading: () => <SectionFallback />
});
const MethodSection = dynamic(() => import('./sections/MethodSection'), {
  loading: () => <SectionFallback />
});
const MethodSectionClient = dynamic(() => import('./components/MethodSectionClient'), {
  loading: () => <SectionFallback />
});
const OffersSection = dynamic(() => import('./sections/OffersSection'), {
  loading: () => <SectionFallback />
});
const TestimonialsSection = dynamic(() => import('./sections/TestimonialsSection'), {
  loading: () => <SectionFallback />
});
const FAQSection = dynamic(() => import('./sections/FAQSection'), {
  loading: () => <SectionFallback />
});
const ClientLoginSection = dynamic(() => import('./sections/ClientLoginSection'), {
  loading: () => <SectionFallback />
});
const FinalCTASection = dynamic(() => import('./sections/FinalCTASection'), {
  loading: () => <SectionFallback />
});

// Toutes les constantes sont maintenant dans data/constants.ts pour optimiser le bundle

/* Page Server Component - Optimisé */
export default function Page() {
  return (
    <div suppressHydrationWarning className="relative min-h-screen bg-white text-gray-900">
      {/* Premium background avec optimisations - Simplifiées sur mobile */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/10 to-white" />
        
        {/* Gradients radials optimisés - moins nombreux */}
        <div className="absolute -left-1/4 top-0 h-[800px] w-[800px] rounded-full bg-gradient-radial from-orange-100/20 via-orange-50/10 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 bottom-1/4 h-[700px] w-[700px] rounded-full bg-gradient-radial from-orange-100/15 via-orange-50/8 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <VideoSection />
          <LogosSection />
          <FormatsSection />
          <ResultsSection />
          <MethodSectionClient>
          <MethodSection />
          </MethodSectionClient>
          <OffersSection />
          <TestimonialsSection />
          <FAQSection />
          <ClientLoginSection />
          <FinalCTASection />
        </main>

        <PremiumFooter />
      </div>
    </div>
  );
}

// Header Component - Optimisé et mémorisé
function Header() {
  return (
    <header className="sticky top-0 z-50 px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 bg-white/80 md:bg-transparent">
      <div className="mx-auto flex max-w-5xl items-center justify-between glass-nav px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3.5">
        {/* Logo glow effect - hidden on mobile */}
        <div className="absolute left-6 top-1/2 -z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-orange-500/20 blur-xl animate-pulse-subtle hidden md:block" />
        
        <Link href="#hero" className="flex items-center gap-2 sm:gap-3 group relative" aria-label="YourStory – Accueil">
          <div className="relative">
            <Image 
              src="/images/logos/urstoryBlack.png" 
              alt="YourStory Logo" 
              width={140} 
              height={40}
              className="h-6 w-auto sm:h-7 md:h-10 transition-all duration-300 group-hover:scale-105"
              priority
            />
            <div className="absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-orange-500/10 blur-lg rounded-full" />
          </div>
          {/* Texte YourStory - caché sur mobile */}
          <span className="hidden lg:inline text-lg md:text-xl font-bold tracking-tight text-gray-900 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--orange-600)] group-hover:to-[var(--orange-500)] group-hover:bg-clip-text group-hover:text-transparent">YourStory</span>
        </Link>
        
        <nav className="hidden items-center gap-6 lg:gap-8 text-xs sm:text-sm font-medium text-gray-700 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="relative transition-all duration-200 hover:text-[var(--accent)] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[var(--orange-500)] after:to-[var(--orange-400)] after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <a 
            href="/login" 
            className="hidden lg:inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-orange-500/40 hover:bg-orange-50 hover:text-orange-600"
          >
            <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden xl:inline">Login</span>
          </a>
          <CalendlyButton className="hidden lg:inline-flex btn-primary !px-3 !py-1.5 md:!px-4 md:!py-2 !text-xs md:!text-sm">
            <span className="hidden xl:inline">Prendre un rendez-vous</span>
            <span className="xl:hidden">RDV</span>
            <ArrowRightIcon className="h-3 w-3 md:h-3.5 md:w-3.5 transition-transform duration-300 hover:translate-x-1" />
          </CalendlyButton>
          <div className="lg:hidden">
            <MobileMenu navLinks={NAV_LINKS} />
          </div>
        </div>
      </div>
    </header>
  );
}
