'use client';

import { useEffect } from 'react';

// Déclaration TypeScript pour Calendly
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

interface CalendlyButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function CalendlyButton({ children, className = '', onClick }: CalendlyButtonProps) {
  useEffect(() => {
    // S'assurer que Calendly est chargé
    const script = document.querySelector('script[src*="calendly.com"]');
    if (script) {
      script.addEventListener('load', () => {
        console.log('Calendly loaded');
      });
    }
  }, []);

  const openCalendly = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined' && window.Calendly) {
      window.Calendly.initPopupWidget({ 
        url: 'https://calendly.com/ur-story-ch' 
      });
    } else {
      console.error('Calendly is not loaded yet');
      // Fallback : ouvrir dans un nouvel onglet
      window.open('https://calendly.com/ur-story-ch', '_blank');
    }
    
    // Appeler le callback onClick si fourni
    if (onClick) {
      onClick();
    }
    
    return false;
  };

  return (
    <button
      onClick={openCalendly}
      className={className}
    >
      {children}
    </button>
  );
}
