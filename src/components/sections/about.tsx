import Image from "next/image";
import { Reveal, SectionHeading } from "@/components/sections/reveal";
import { RollingStat } from "@/components/sections/rolling-stat";
import { PIPELINE, STATS } from "@/lib/site-data";

export function About() {
  return (
    <section id="about" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading overline="О студии" title={<>Кино рождается <span className="text-red-gradient">на Дону</span></>} />
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                «Ростовфильм» — киностудия полного цикла из Ростова-на-Дону.
                Мы разрабатываем концепции и сценарии, снимаем на киносъёмочное
                оборудование, записываем звук и доводим проект до готового
                мастера: монтаж, спецэффекты, цветокоррекция, анимация и
                озвучка.
              </p>
              <p>
                Студия создаёт рекламные и имиджевые ролики, корпоративные и
                документальные фильмы, музыкальные клипы, контент для блогеров,
                ток-шоу и реалити-форматы для телевидения, а также ведёт прямые
                и онлайн-трансляции мероприятий.
              </p>
              <p>
                Мы участвуем в развитии креативных индустрий региона — от форума
                «Креаномика» до создания кластера анимации и кино — и производим
                собственные кинопроекты полного метра.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
              {STATS.map((stat) => (
                <RollingStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </dl>
          </div>

          <Reveal delay={0.15} className="relative">
            <div className="relative overflow-hidden rounded-md border border-border">
              <Image
                src="/images/studio-production.png"
                alt="Павильон киностудии со световым оборудованием"
                width={1344}
                height={768}
                className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/80">
                Съёмочный павильон · Ростов-на-Дону
              </p>
            </div>
            <div className="relative z-10 -mt-16 ml-auto w-3/5 overflow-hidden rounded-md border border-border shadow-2xl shadow-black/60 sm:-mt-24">
              <Image
                src="/images/post-production.png"
                alt="Студия постпродакшна: монтаж и цветокоррекция"
                width={1344}
                height={768}
                className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
              />
            </div>
          </Reveal>
        </div>

        {/* Pipeline */}
        <div className="mt-20 sm:mt-24">
          <Reveal>
            <h3 className="mb-8 font-display text-xl font-semibold uppercase tracking-[0.2em] text-foreground/90 sm:text-2xl">
              Полный цикл производства
            </h3>
          </Reveal>
          <Reveal>
            <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {PIPELINE.map((stage, i) => (
                <li
                  key={stage.step}
                  className="group relative bg-card p-6 transition-colors hover:bg-accent/50"
                >
                <span
                  className="pointer-events-none absolute right-4 top-3 font-display text-5xl font-bold text-foreground/5 transition-colors group-hover:text-primary/10"
                  aria-hidden
                >
                  {stage.step}
                </span>
                <span className="mb-4 inline-block h-1 w-8 bg-primary/80 transition-all duration-300 group-hover:w-14" aria-hidden />
                <h4 className="font-display text-lg font-medium uppercase tracking-wider text-foreground">
                  {stage.title}
                </h4>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {stage.text}
                </p>
                {i < PIPELINE.length - 1 && (
                  <span
                    className="absolute -right-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 rotate-45 border-r border-t border-primary/50 bg-background lg:block"
                    aria-hidden
                  />
                )}
              </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
