'use client';

import { useScrollReveal } from '../hooks/useScrollReveal';
import type { ReactNode } from 'react';

export default function MethodSectionClient({ children }: { children: ReactNode }) {
  useScrollReveal();
  
  return <>{children}</>;
}
