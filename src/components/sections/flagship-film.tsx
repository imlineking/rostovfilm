"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play, Send, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Reveal } from "@/components/sections/reveal";
import { FLAGSHIP_FILM } from "@/lib/site-data";

function TrailerDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) videoRef.current?.pause();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl sm:max-w-4xl lg:max-w-5xl border-primary/25 bg-black p-2 sm:p-3">
        <DialogHeader className="sr-only">
          <DialogTitle>Трейлер — {FLAGSHIP_FILM.title}</DialogTitle>
          <DialogDescription>
            Официальный трейлер фильма студии «Ростовфильм»
          </DialogDescription>
        </DialogHeader>
        <video
          ref={videoRef}
          src={FLAGSHIP_FILM.trailer}
          poster={FLAGSHIP_FILM.poster}
          controls
          autoPlay
          playsInline
          className="aspect-[1280/548] w-full rounded-sm bg-black object-contain"
        >
          Ваш браузер не поддерживает встроенное видео.
        </video>
      </DialogContent>
    </Dialog>
  );
}

export function FlagshipFilm() {
  return (
    <section
      id="film"
      className="film-grain relative scroll-mt-20 overflow-hidden border-b border-border/60 py-20 sm:py-28"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={FLAGSHIP_FILM.poster}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Предпросмотр (постер) увеличен на ~30% относительно former равных колонок:
            574px → ~746px при 1440 (колонка 1.77fr против 1fr) */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.77fr)] lg:gap-12">
          {/* Text */}
          <div>
            <Reveal>
              <p className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                <span className="inline-block h-px w-10 bg-primary/70" aria-hidden />
                Флагманский проект
              </p>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-sm border border-primary/50 bg-primary/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                  {FLAGSHIP_FILM.status}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {FLAGSHIP_FILM.kind}
                </span>
              </div>
              <h2 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide sm:text-4xl lg:text-5xl">
                Варяги. <span className="text-red-gradient">Ген Храбрости</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/90 sm:text-lg">
                {FLAGSHIP_FILM.logline}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="О фильме">
                {FLAGSHIP_FILM.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground/85 backdrop-blur-sm"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <TrailerDialog>
                  <Button
                    size="lg"
                    className="glow-red h-12 bg-primary px-8 font-display text-base uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
                  >
                    <Play className="size-4" aria-hidden />
                    Смотреть трейлер
                  </Button>
                </TrailerDialog>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-foreground/30 px-6 font-display text-base uppercase tracking-widest text-foreground hover:border-primary hover:text-primary"
                >
                  <a href={FLAGSHIP_FILM.href} target="_blank" rel="noopener noreferrer">
                    <Send className="size-4" aria-hidden />
                    Сообщество проекта
                  </a>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Poster with play */}
          <Reveal delay={0.15}>
            <TrailerDialog>
              <button
                type="button"
                className="group relative block w-full cursor-pointer overflow-hidden rounded-md border border-border shadow-2xl shadow-black/60 transition-all duration-300 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring"
                aria-label="Смотреть трейлер фильма «Варяги. Ген Храбрости»"
              >
                <Image
                  src={FLAGSHIP_FILM.poster}
                  alt={`Кадр из фильма «${FLAGSHIP_FILM.title}»: морпех в берете крупным планом`}
                  width={1280}
                  height={548}
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                <span className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full border border-primary/60 bg-black/60 text-primary backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground sm:size-20">
                  <Play className="ml-1 size-6 sm:size-8" aria-hidden />
                </span>
                <span className="absolute bottom-3 left-3 rounded-sm bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/85 backdrop-blur-sm">
                  Трейлер · {FLAGSHIP_FILM.trailerDuration}
                </span>
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-sm bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/85 backdrop-blur-sm">
                  <Film className="size-3" aria-hidden />
                  Премьера
                </span>
              </button>
            </TrailerDialog>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
