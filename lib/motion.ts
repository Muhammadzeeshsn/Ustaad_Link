// lib/motion.ts
import type { Variants, Easing } from 'framer-motion'

// A nice ease-out cubic-bezier (Expo-ish)
export const easeOutCurve: Easing = [0.16, 1, 0.3, 1]

// Reusable variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOutCurve },
  },
}

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

export const slideCard: Variants = {
  hidden: { opacity: 0, y: 8, rotateX: -4 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.24, ease: easeOutCurve },
  },
  exit: {
    opacity: 0,
    y: -8,
    rotateX: 4,
    transition: { duration: 0.18, ease: easeOutCurve },
  },
}
