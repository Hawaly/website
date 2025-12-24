'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TransitionOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide overlay after smooth transition
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // Smooth elastic easing
  const smoothEase = [0.25, 0.1, 0.25, 1] as const;
  const elasticEase = [0.68, -0.55, 0.265, 1.55] as const;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Liquid morphing background */}
          <motion.div
            className="fixed inset-0 z-[100] overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: smoothEase }}
          >
            {/* Animated gradient blobs */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
              initial={{ scale: 1.5, rotate: 0 }}
              animate={{ 
                scale: [1.5, 1.2, 0.8],
                rotate: [0, 180, 360],
                borderRadius: ['0%', '30%', '50%']
              }}
              transition={{ duration: 1.5, ease: smoothEase }}
            />
            
            {/* Overlay morphing circles */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-orange-300/40 to-transparent blur-3xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 2.5],
                opacity: [0, 0.6, 0]
              }}
              transition={{ duration: 1.8, ease: smoothEase }}
            />
            
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-white/30 to-transparent blur-2xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 2],
                opacity: [0, 0.8, 0]
              }}
              transition={{ duration: 1.6, delay: 0.2, ease: smoothEase }}
            />
          </motion.div>
          
          {/* Smooth reveal curtain */}
          <motion.div
            className="fixed inset-0 z-[99] bg-white"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ clipPath: 'circle(150% at 50% 50%)' }}
            transition={{ duration: 1.2, delay: 1, ease: smoothEase }}
          />
          
          {/* Logo with smooth animations */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.1, 1],
                y: [100, -10, 0],
                opacity: [0, 1, 1]
              }}
              transition={{ 
                duration: 0.8,
                ease: elasticEase
              }}
            >
              {/* Logo with glow effect */}
              <motion.div
                className="relative"
                animate={{ 
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="absolute inset-0 -z-10 blur-2xl bg-orange-500/50 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <Image
                  src="/images/logos/urstoryBlack.png"
                  alt="YourStory Logo"
                  width={240}
                  height={72}
                  className="h-20 w-auto drop-shadow-2xl"
                  priority
                />
              </motion.div>
              
              {/* Text with letter animation */}
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {['u', 'r', 's', 't', 'o', 'r', 'y', '.', 'c', 'h'].map((letter, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl font-bold text-gray-900"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1,
                      y: [20, -5, 0]
                    }}
                    transition={{
                      delay: 0.4 + i * 0.05,
                      duration: 0.5,
                      ease: elasticEase
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
              
              {/* Loading bar */}
              <motion.div
                className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mt-2"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 128 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.9, duration: 1, ease: smoothEase }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
