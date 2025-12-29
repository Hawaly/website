'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CalendlyButton from './CalendlyButton';
import type { NAV_LINKS } from '../data/constants';

interface MobileMenuProps {
  navLinks: typeof NAV_LINKS;
}

export default function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Empêcher le scroll quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fermer le menu lors du clic sur un lien
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton Burger - optimisé pour touch */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
        className="grid h-11 w-11 place-items-center rounded-xl border-2 border-white/60 bg-white/60 backdrop-blur-xl text-gray-800 transition-all duration-200 active:scale-90 active:bg-white/80 shadow-md z-50"
      >
        <div className="relative w-5 h-5 flex flex-col items-center justify-center">
          {/* Ligne du haut */}
          <span
            className={`absolute w-5 h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
            }`}
          />
          {/* Ligne du milieu */}
          <span
            className={`absolute w-5 h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          />
          {/* Ligne du bas */}
          <span
            className={`absolute w-5 h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
            }`}
          />
        </div>
      </button>

      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Menu Panel - optimisé pour mobile */}
      <div
        className={`fixed top-[76px] left-3 right-3 z-40 transition-all duration-250 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="mx-auto max-w-md rounded-2xl border-2 border-white/60 bg-white/98 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Navigation Links - meilleur espacement et touch targets */}
          <nav className="p-3" aria-label="Menu mobile">
            <div className="space-y-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="block rounded-xl px-4 py-4 text-base font-semibold text-gray-800 transition-all duration-150 active:bg-orange-500/10 active:text-orange-600"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4" />

          {/* Action Buttons - meilleure taille touch */}
          <div className="p-4 space-y-3">
            <Link
              href="/client-login"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-base font-semibold text-gray-700 transition-all duration-150 active:bg-orange-50 active:border-orange-500/40 active:scale-[0.98] shadow-sm min-h-[56px]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Login Espace Client</span>
            </Link>

            <CalendlyButton className="block btn-primary text-center w-full !text-base !py-4 min-h-[56px]" onClick={handleLinkClick}>
              Prendre un rendez-vous
            </CalendlyButton>
          </div>
        </div>
      </div>
    </>
  );
}


