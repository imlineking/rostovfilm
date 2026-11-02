"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Статистика с «плёночным счётчиком»: когда блок попадает в кадр,
 * цифры на миг крутятся как барабан счётчика метража, затем
 * фиксируются слева направо. Нечисловые символы (K, %, /) не мигают.
 * При prefers-reduced-motion значение показывается сразу.
 */
export function RollingStat({ value, label }: { value: string; label: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    const chars = value.split("");
    const start = performance.now();
    // Каждая цифра «замирает» со сдвигом ~120 мс от предыдущей
    const lockAt = chars.map((_, i) => 250 + i * 120);

    const id = window.setInterval(() => {
      const elapsed = performance.now() - start;
      let done = true;
      const next = chars.map((c, i) => {
        if (!/\d/.test(c) || elapsed >= lockAt[i]) return c;
        done = false;
        return String(Math.floor(Math.random() * 10));
      });
      setDisplay(next.join(""));
      if (done) {
        window.clearInterval(id);
        setDisplay(value);
      }
    }, 55);

    return () => window.clearInterval(id);
  }, [inView, reduce, value]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-1.5 bg-card px-4 py-5 transition-colors hover:bg-accent/60"
    >
      <dt className="order-2 text-xs leading-snug text-muted-foreground">
        {label}
      </dt>
      <dd className="order-1 font-display text-3xl font-semibold text-primary">
        {display}
      </dd>
    </div>
  );
}
