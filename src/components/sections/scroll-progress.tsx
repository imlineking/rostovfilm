"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * Полоса прогресса прокрутки — тонкая красная линия поверх экрана,
 * как таймкод плёнки: показывает, сколько страницы уже просмотрено.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-[oklch(0.72_0.19_35)] to-primary"
      aria-hidden
    />
  );
}
