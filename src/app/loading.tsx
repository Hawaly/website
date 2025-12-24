'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-white via-orange-50/20 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 0.9,
        filter: 'blur(20px)',
        transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background circles with staggered animations */}
      <div 
        className="pointer-events-none absolute inset-0 overflow-hidden" 
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-orange-500/20 via-orange-400/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-orange-600/15 via-orange-300/10 to-transparent blur-2xl animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full bg-orange-500/20 blur-xl animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      
      <motion.div 
        className="relative flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {/* Logo with enhanced animations */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Rotating gradient ring behind logo */}
          <div className="absolute inset-0 -z-10 h-20 w-48 -translate-x-6">
            <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-orange-500/0 via-orange-500/30 to-orange-500/0 blur-lg" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Pulsing glow */}
          <div className="absolute inset-0 -z-20 animate-ping rounded-full bg-orange-500/30 blur-2xl" style={{ animationDuration: '2s' }} />
          
          {/* Logo */}
          <Image 
            src="/images/logos/urstoryBlack.png" 
            alt="YourStory Logo" 
            width={200} 
            height={60}
            className="h-16 w-auto transition-all duration-1000 animate-in fade-in"
            priority
          />
        </motion.div>
        
        {/* Enhanced loading spinner with multiple rings */}
        <motion.div 
          className="relative h-16 w-16"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-orange-500/10 border-t-orange-500" style={{ animationDuration: '1.5s' }} />
          
          {/* Middle ring */}
          <div className="absolute inset-2 h-12 w-12 animate-spin rounded-full border-4 border-orange-400/10 border-r-orange-400" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          
          {/* Inner ring */}
          <div className="absolute inset-4 h-8 w-8 animate-spin rounded-full border-4 border-orange-300/10 border-b-orange-300" style={{ animationDuration: '1s' }} />
          
          {/* Center dot */}
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-orange-500" />
        </motion.div>
        
        {/* Loading text with fade animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-sm font-medium text-gray-600 animate-pulse" style={{ animationDuration: '2s' }}>
            Chargement en cours...
          </p>
          
          {/* Animated dots */}
          <div className="mt-2 flex justify-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '0s' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '0.2s' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
