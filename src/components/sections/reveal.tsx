"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, y = 28, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  overline,
  title,
  className,
}: {
  overline: string;
  title: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
        <span className="inline-block h-px w-10 bg-primary/70" aria-hidden />
        {overline}
      </p>
      <h2 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
