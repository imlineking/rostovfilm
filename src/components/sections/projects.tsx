"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Clapperboard, Phone, RotateCw } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/sections/reveal";
import { PROJECTS, STUDIO_CHANNELS, type Project } from "@/lib/site-data";

/**
 * Flip-cards: клик по карточке переворачивает её —
 * на лицевой стороне постер/кадр, на обороте описание проекта.
 */
function FlipCard({ project, index }: { project: Project; index: number }) {
  const [flipped, setFlipped] = useState(false);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <Reveal delay={0.08 * index} className="h-full [perspective:1600px]">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`«${project.title}» — нажмите, чтобы ${flipped ? "вернуться к обложке" : "прочитать описание"}`}
        onClick={() => setFlipped((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((v) => !v);
          }
        }}
        className="group h-full w-full cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-primary"
        style={{ perspective: "1600px" }}
      >
        <div
          className="relative aspect-[3/4] w-full transition-transform duration-700 ease-[cubic-bezier(0.35,0.1,0.25,1)] [transform-style:preserve-3d] group-focus-visible:outline-2 group-focus-visible:outline-primary"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* ---------- ЛИЦЕВАЯ СТОРОНА ---------- */}
          <div className="absolute inset-0 overflow-hidden rounded-md border border-border bg-card shadow-xl shadow-black/40 backface-hidden transition-colors duration-300 hover:border-primary/40">
            <Image
              src={project.image}
              alt={`Кадр из проекта «${project.title}»`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/20" />

            <span className="absolute left-3 top-3 rounded-sm border border-primary/50 bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
              {project.status}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/90">
                {project.kind}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide text-foreground">
                {project.title}
              </h3>
              <p className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50 transition-colors duration-300 group-hover:text-primary/80">
                <RotateCw className="size-3" aria-hidden />
                Подробнее — по клику
              </p>
            </div>
          </div>

          {/* ---------- ОБОРОТ ---------- */}
          <div className="absolute inset-0 overflow-hidden rounded-md border border-primary/30 bg-card shadow-xl shadow-black/40 backface-hidden [transform:rotateY(180deg)]">
            <Image
              src={project.backImage ?? project.image}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-card/85 via-card/70 to-card/95" />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.62 0.23 27 / 60%), transparent)",
              }}
            />

            <div className="relative flex h-full flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">
                  {project.kind}
                </p>
                <RotateCw className="size-3.5 shrink-0 text-foreground/40" aria-hidden />
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide text-foreground">
                {project.title}
              </h3>
              <div className="card-scroll mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {project.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="flex shrink-0 flex-col gap-2.5 pt-4">
                {project.phone && project.phoneHref ? (
                  <a
                    href={project.phoneHref}
                    onClick={stop}
                    onKeyDown={stop}
                    className="inline-flex items-center gap-2.5 border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label={`${project.title} — позвонить по номеру ${project.phone}`}
                  >
                    <Phone className="size-4 shrink-0" aria-hidden />
                    {project.phone}
                  </a>
                ) : null}
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stop}
                  onKeyDown={stop}
                  className="inline-flex items-center justify-between gap-2.5 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                  aria-label={`${project.title} — открыть пост во ВКонтакте`}
                >
                  {project.phone ? "Пост о кастинге в ВКонтакте" : "Подробнее в ВКонтакте"}
                  <ArrowUpRight className="size-4" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            overline="Каталог"
            title={<>Проекты <span className="text-red-gradient">студии</span></>}
          />
          <Reveal delay={0.1}>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Игровое и анимационное кино, документальные форматы — от кастинга
              до премьеры. Нажмите на карточку, чтобы узнать о проекте больше.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <FlipCard key={project.slug} project={project} index={i} />
          ))}
        </div>

        {/* Наши проекты: площадки со съёмочными материалами и новостями студии */}
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-start gap-5 rounded-md border border-dashed border-primary/40 bg-primary/5 p-6">
            <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
              <Clapperboard className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground">
                {STUDIO_CHANNELS.title}
              </h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {STUDIO_CHANNELS.lead}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {STUDIO_CHANNELS.channels.map((channel) =>
                  channel.href && !channel.soon ? (
                    <a
                      key={channel.name}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-sm border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      aria-label={`${channel.name} — материалы и новости студии`}
                    >
                      {channel.name}
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  ) : (
                    <span
                      key={channel.name}
                      className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-foreground/40"
                      aria-label={`${channel.name} — скоро`}
                    >
                      {channel.name}
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary/70">
                        скоро
                      </span>
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
