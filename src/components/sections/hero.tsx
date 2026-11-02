"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MARQUEE_ITEMS, SITE } from "@/lib/site-data";

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

function useTimecode() {
  const [tc, setTc] = useState("00:00:00:00");
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const frames = Math.floor((elapsed % 1000) / 40);
      const seconds = Math.floor(elapsed / 1000) % 60;
      const minutes = Math.floor(elapsed / 60000) % 60;
      const hours = Math.floor(elapsed / 3600000);
      setTc(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`);
    }, 40);
    return () => clearInterval(id);
  }, []);
  return tc;
}

export function Hero() {
  const timecode = useTimecode();

  return (
    <section id="top" className="film-grain relative flex min-h-svh flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.png"
          alt="Профессиональная кинокамера на площадке киностудии"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,oklch(0.13_0.01_25_/_0.88)_100%)]" />
      </div>

      {/* Letterbox bars */}
      <motion.div
        initial={{ height: "16vh" }}
        animate={{ height: "0vh" }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
        className="absolute inset-x-0 top-0 z-10 bg-black"
        aria-hidden
      />
      <motion.div
        initial={{ height: "16vh" }}
        animate={{ height: "0vh" }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
        className="absolute inset-x-0 bottom-0 z-10 bg-black"
        aria-hidden
      />

      {/* Viewfinder HUD */}
      <div
        className="pointer-events-none absolute inset-0 z-20 hidden px-6 pb-24 pt-24 sm:block lg:px-10"
        aria-hidden
      >
        <div className="flex items-start justify-between">
          <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-foreground/80">
            <span className="rec-dot inline-block size-2.5 rounded-full bg-red-600" />
            REC
          </span>
          <span className="font-mono text-xs tracking-widest text-foreground/80">
            TC {timecode}
          </span>
        </div>
        <span className="absolute left-6 top-32 border-l-2 border-t-2 border-foreground/30 p-4 lg:left-10 lg:top-36" />
        <span className="absolute right-6 top-32 border-r-2 border-t-2 border-foreground/30 p-4 lg:right-10 lg:top-36" />
        <span className="absolute bottom-24 left-6 border-b-2 border-l-2 border-foreground/30 p-4 lg:bottom-28 lg:left-10" />
        <span className="absolute bottom-24 right-6 border-b-2 border-r-2 border-foreground/30 p-4 lg:bottom-28 lg:right-10" />
        <span className="absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/50 lg:right-10 lg:block">
          25 fps · 4K
        </span>
      </div>

      {/* Content */}
      <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary sm:text-sm"
        >
          <Clapperboard className="size-4" aria-hidden />
          {SITE.tagline} · {SITE.city}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          className="font-brand text-5xl uppercase leading-[1.08] tracking-[0.03em] drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] sm:text-7xl lg:text-8xl"
        >
          Ростов<span className="text-red-gradient">фильм</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.25 }}
          className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] sm:text-lg"
        >
          Видеопроизводство и постпродакшн под ключ — от идеи и сценария до эфира
          и кинопроката. Собственное телевизионное и киносъёмочное оборудование.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.45 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
        >
          <Button
            asChild
            size="lg"
            className="glow-red h-12 bg-primary px-8 font-display text-base uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
          >
            <a href="#contacts">Обсудить проект</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-foreground/30 px-8 font-display text-base uppercase tracking-widest text-foreground hover:border-primary hover:text-primary"
          >
            <a href="#projects">Смотреть проекты</a>
          </Button>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 text-foreground/60 transition-colors hover:text-primary"
        aria-label="Прокрутить вниз"
      >
        <ChevronDown className="size-6 animate-bounce" aria-hidden />
      </motion.a>

      {/* Marquee ticker */}
      <div className="relative z-30 border-y border-primary/25 bg-black/55 py-3.5 backdrop-blur-sm">
        <div className="marquee-track gap-0" aria-hidden>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {MARQUEE_ITEMS.map((item, i) => (
                <span
                  key={`${copy}-${i}`}
                  className="flex items-center gap-6 pr-6 font-display text-sm uppercase tracking-[0.25em] text-foreground/75"
                >
                  {item}
                  <span className="inline-block size-1.5 rotate-45 bg-primary/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className="sr-only">
          {MARQUEE_ITEMS.join(", ")}
        </p>
      </div>
    </section>
  );
}
