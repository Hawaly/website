"use client";

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Animation Variants
export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
};

export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 }
};

// Animated Page Wrapper
interface AnimatedPageProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeInUp}
            transition={{ duration: 0.3 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animated Card with hover effects
interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    hoverScale?: number;
    hoverY?: number;
}

export function AnimatedCard({
    children,
    className = '',
    delay = 0,
    hoverScale = 1.02,
    hoverY = -5
}: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{
                scale: hoverScale,
                y: hoverY,
                transition: { duration: 0.2 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animated List Item
interface AnimatedListItemProps {
    children: ReactNode;
    index: number;
    className?: string;
}

export function AnimatedListItem({ children, index, className = '' }: AnimatedListItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animated Table Row
interface AnimatedTableRowProps {
    children: ReactNode;
    index: number;
    className?: string;
}

export function AnimatedTableRow({ children, index, className = '' }: AnimatedTableRowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={className}
        >
            {children}
        </motion.tr>
    );
}

// Animated Stats Card
interface AnimatedStatCardProps {
    children: ReactNode;
    index: number;
    className?: string;
}

export function AnimatedStatCard({ children, index, className = '' }: AnimatedStatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animated Button
interface AnimatedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

export function AnimatedButton({
    children,
    onClick,
    className = '',
    type = "button",
    disabled = false
}: AnimatedButtonProps) {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={className}
        >
            {children}
        </motion.button>
    );
}

// Animated Container with stagger effect
interface AnimatedContainerProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedContainer({ children, className = '' }: AnimatedContainerProps) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animated Number Counter
interface AnimatedNumberProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export function AnimatedNumber({
    value,
    duration = 1.5,
    prefix = '',
    suffix = '',
    className = ''
}: AnimatedNumberProps) {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
        >
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {prefix}{value.toLocaleString('fr-CH')}{suffix}
            </motion.span>
        </motion.span>
    );
}

// Shimmer Loading Placeholder
interface ShimmerProps {
    className?: string;
}

export function Shimmer({ className = '' }: ShimmerProps) {
    return (
        <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ translateX: ['100%', '-100%'] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
        </div>
    );
}

// Page Transition Wrapper
export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Hover Card with Glow Effect
interface GlowCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
}

export function GlowCard({ children, className = '', glowColor = 'orange' }: GlowCardProps) {
    const glowColors: Record<string, string> = {
        orange: 'hover:shadow-orange-500/20',
        blue: 'hover:shadow-blue-500/20',
        green: 'hover:shadow-green-500/20',
        purple: 'hover:shadow-purple-500/20',
        pink: 'hover:shadow-pink-500/20'
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={`transition-shadow duration-300 hover:shadow-2xl ${glowColors[glowColor] || glowColors.orange} ${className}`}
        >
            {children}
        </motion.div>
    );
}
