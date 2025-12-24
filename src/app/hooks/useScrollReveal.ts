'use client';

import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    // Petit délai pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      // Animation observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              
              // Ajouter classe principale
              target.classList.add('is-visible');
              
              // Animations séquentielles pour les enfants
              const children = target.querySelectorAll('[data-animate-child]');
              children.forEach((child, index) => {
                setTimeout(() => {
                  child.classList.add('is-visible');
                }, index * 100);
              });
              
              // Ne plus observer après animation
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      // Observer toutes les classes de reveal
      const selectors = [
        '.scroll-reveal',
        '.scroll-reveal-left', 
        '.scroll-reveal-right',
        '.scroll-reveal-scale',
        '.scroll-reveal-blur',
        '.scroll-reveal-spiral',
        '.scroll-reveal-elastic'
      ];
      
      const allElements: Element[] = [];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => allElements.push(el));
      });
      
      console.log('ScrollReveal: observing', allElements.length, 'elements');
      
      allElements.forEach((el) => {
        observer.observe(el);
      });

      // Cleanup
      return () => {
        allElements.forEach((el) => observer.unobserve(el));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, []);
}
