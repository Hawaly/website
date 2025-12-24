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
      {/* Bouton Burger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
        className="grid h-10 w-10 place-items-center rounded-xl border-2 border-white/50 bg-white/50 backdrop-blur-xl text-gray-800 transition-all duration-300 hover:border-orange-500/50 hover:bg-white/60 hover:scale-105 active:scale-95 shadow-lg z-50"
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

      {/* Menu Panel */}
      <div
        className={`fixed top-20 left-4 right-4 z-40 transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="mx-auto max-w-md rounded-2xl border-2 border-white/50 bg-white/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Navigation Links */}
          <nav className="p-4" aria-label="Menu mobile">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="block rounded-xl px-4 py-3.5 text-base font-semibold text-gray-800 transition-all duration-200 hover:bg-orange-500/10 hover:text-orange-600 hover:translate-x-1 active:scale-98"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4" />

          {/* Action Buttons */}
          <div className="p-4 space-y-3">
            <Link
              href="/login"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-orange-50 hover:border-orange-500/40 hover:text-orange-600 hover:scale-[1.02] active:scale-98 shadow-sm"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Login Espace Client</span>
            </Link>

            <CalendlyButton className="block btn-primary text-center w-full !text-base !py-3.5" onClick={handleLinkClick}>
              Prendre un rendez-vous
            </CalendlyButton>
          </div>
        </div>
      </div>
    </>
  );
}


