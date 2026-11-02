import "@/app/countdown.css";
import { Sparkles } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/sections/reveal";
import { AI_CINEMA } from "@/lib/site-data";

/**
 * AI-cinema direction cards in the style of ponder.ai/research:
 * floating "terminal window" cards connected by dashed constellation lines.
 */
export function AiCinema() {
  return (
    <section
      id="ai"
      className="hatch-panel film-grain relative scroll-mt-20 overflow-hidden border-t border-border/60 py-20 sm:py-28"
    >
      {/* Обратный отсчёт 9→0 из сетки окон — оригинальный код CodePen
          «Kinetic countdown (CSS only)» (donotfold), фон секции;
          слова слейва вписаны в область цифр, появляются разом одним кадром */}
      <div className="kinetic-countdown-stage" aria-hidden>
        <div className="kinetic-countdown">
          {Array.from({ length: 25 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className="kinetic-slate">
          <span>Свет</span>
          <span>Камера</span>
          <span>Мотор</span>
        </div>
      </div>

      {/* Dashed constellation lines (desktop) */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          x1="18" y1="38" x2="50" y2="30"
          stroke="oklch(0.95 0.01 25 / 0.14)"
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="50" y1="30" x2="82" y2="38"
          stroke="oklch(0.95 0.01 25 / 0.14)"
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="18" y1="38" x2="82" y2="62"
          stroke="oklch(0.95 0.01 25 / 0.08)"
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          overline={AI_CINEMA.overline}
          title={<>Нейрокино <span className="text-red-gradient">и ИИ</span></>}
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {AI_CINEMA.lead}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {AI_CINEMA.directions.map((dir, i) => (
            <Reveal key={dir.window} delay={0.1 * i} className="h-full">
              <article
                className={`group flex h-full flex-col border border-border bg-card/90 shadow-2xl shadow-black/60 backdrop-blur-sm transition-all duration-300 hover:rotate-0 hover:border-primary/50 ${
                  i === 0
                    ? "lg:-rotate-1"
                    : i === 2
                      ? "lg:rotate-1"
                      : "lg:translate-y-4"
                }`}
              >
                {/* Terminal title bar */}
                <header className="flex items-center justify-between gap-3 border-b border-border/80 bg-black/40 px-4 py-2.5">
                  <span className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-foreground/70">
                    <span
                      className="inline-block size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    {dir.window}
                  </span>
                  <span
                    className="font-mono text-sm leading-none text-foreground/40 transition-colors group-hover:text-primary"
                    aria-hidden
                  >
                    +
                  </span>
                </header>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-foreground">
                    {dir.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {dir.text}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2 pt-1">
                    {dir.tags.map((tag) => (
                      <li
                        key={tag}
                        className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/60 transition-colors group-hover:border-primary/40 group-hover:text-foreground/80"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25}>
          <p className="mt-12 flex items-center justify-center gap-3 text-center font-mono text-xs uppercase tracking-[0.25em] text-foreground/50">
            <Sparkles className="size-4 text-primary/70" aria-hidden />
            ИИ под контролем художников — технология служит кино
          </p>
        </Reveal>
      </div>
    </section>
  );
}
