'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ 
          opacity: 0,
          scale: 0.95,
          filter: 'blur(10px)'
        }}
        animate={{ 
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)'
        }}
        exit={{ 
          opacity: 0,
          scale: 1.05,
          filter: 'blur(10px)'
        }}
        transition={{
          duration: 0.8,
          ease: [0.43, 0.13, 0.23, 0.96]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
