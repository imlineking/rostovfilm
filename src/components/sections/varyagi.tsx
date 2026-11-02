import Image from "next/image";
import { Mic, Send, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/sections/reveal";
import { VARYAGI } from "@/lib/site-data";

export function Varyagi() {
  return (
    <section
      id="varyagi"
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
              Флагманский проект
            </p>
            <h2 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide sm:text-4xl lg:text-5xl">
              «Варяги. <span className="text-gold-gradient">Голос времени</span>»
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {VARYAGI.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <blockquote className="mt-8 border-l-2 border-primary/70 bg-black/30 py-4 pl-5 pr-4 backdrop-blur-sm">
              <p className="text-base italic leading-relaxed text-foreground/90 sm:text-lg">
                {VARYAGI.quote}
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-7 flex flex-wrap gap-2.5" aria-label="Герои проекта">
              {VARYAGI.tags.map((tag) => (
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
                  Автор
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {VARYAGI.author}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card/80 p-4 backdrop-blur-sm">
                <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  <Video className="size-4" aria-hidden />
                  Производство
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {VARYAGI.producer} при участии киностудии «Ростов Фильм»
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
                Смотреть в ВКонтакте
              </a>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
