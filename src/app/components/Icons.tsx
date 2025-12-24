// Composants d'icônes optimisés et mémorisés
import { memo, SVGProps } from 'react';

export const ArrowRightIcon = memo(function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h12m0 0-4-4m4 4-4 4" />
    </svg>
  );
});

export const SparkleIcon = memo(function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3.5 13.4 8.6l5.1 1.4-5.1 1.4L12 16.5l-1.4-5.1-5.1-1.4 5.1-1.4L12 3.5Z" opacity="0.25" />
      <path d="M12 5.5 13 9l3.5 1-3.5 1L12 14l-1-3.5L7.5 10 11 9l1-3.5Z" />
    </svg>
  );
});

export const StarIcon = memo(function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9.05 2.927c.35-.898 1.55-.898 1.9 0l1.51 3.865a1 1 0 0 0 .87.63l4.15.31c.97.07 1.37 1.267.63 1.856l-3.2 2.57a1 1 0 0 0-.34 1.02l1.01 3.99c.23.93-.78 1.66-1.58 1.14l-3.5-2.23a1 1 0 0 0-1.08 0l-3.5 2.23c-.8.52-1.81-.21-1.58-1.14l1.01-3.99a1 1 0 0 0-.34-1.02l-3.2-2.57c-.74-.59-.34-1.786.63-1.856l4.15-.31a1 1 0 0 0 .87-.63l1.51-3.865Z" />
    </svg>
  );
});

