import Image from "next/image";
import { Mic, Send, Podcast as PodcastIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/sections/reveal";
import { PODCAST } from "@/lib/site-data";

export function Podcast() {
  return (
    <section
      id="podcast"
      className="film-grain relative scroll-mt-20 overflow-hidden border-y border-border/60 py-20 sm:py-28"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/images/poster-varyagi.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <p className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <span className="inline-block h-px w-10 bg-primary/70" aria-hidden />
              Проект студии
            </p>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-sm border border-primary/50 bg-primary/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                {PODCAST.status}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {PODCAST.subtitle}
              </span>
            </div>
            <h2 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide sm:text-4xl lg:text-5xl">
              «Голос <span className="text-red-gradient">времени»</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <blockquote className="mt-8 border-l-2 border-primary/70 bg-black/30 py-4 pl-5 pr-4 backdrop-blur-sm">
              <p className="text-base italic leading-relaxed text-foreground/90 sm:text-lg">
                {PODCAST.quote}
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-7 flex flex-wrap gap-2.5" aria-label="Герои выпусков">
              {PODCAST.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground/85 backdrop-blur-sm transition-colors hover:border-primary/60 hover:text-primary"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-card/80 p-4 backdrop-blur-sm">
                <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  <Mic className="size-4" aria-hidden />
                  Ведущий
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {PODCAST.host}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card/80 p-4 backdrop-blur-sm">
                <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  <PodcastIcon className="size-4" aria-hidden />
                  Производство
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {PODCAST.producer} при участии киностудии «Ростовфильм»
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <Button
              asChild
              size="lg"
              className="mt-9 h-12 bg-primary px-8 font-display text-base uppercase tracking-widest text-primary-foreground hover:bg-primary/85"
            >
              <a href="https://vk.ru/varyagi_voice" target="_blank" rel="noopener noreferrer">
                <Send className="size-4" aria-hidden />
                Слушать в ВКонтакте
              </a>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
