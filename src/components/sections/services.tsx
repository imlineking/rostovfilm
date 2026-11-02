import {
  AudioLines,
  Camera,
  Clapperboard,
  Music,
  PenTool,
  Radio,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Reveal, SectionHeading } from "@/components/sections/reveal";
import { SERVICES } from "@/lib/site-data";

const ICONS: Record<string, LucideIcon> = {
  PenTool,
  Clapperboard,
  Music,
  Camera,
  AudioLines,
  Scissors,
  Radio,
  Sparkles,
};

export function Services() {
  return (
    <section id="services" className="relative scroll-mt-20 border-y border-border/60 bg-card/40 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.8_0.17_84_/_0.05),transparent_55%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            overline="Услуги"
            title={<>Что мы <span className="text-red-gradient">умеем</span></>}
          />
          <Reveal delay={0.1}>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Восемь направлений производства под одной крышей — можно заказать
              отдельный этап или полный цикл «под ключ».
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[service.icon] ?? Camera;
            return (
              <Reveal key={service.title} delay={0.05 * (i % 4)}>
                <article className="group flex h-full flex-col rounded-md border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-accent/40 hover:shadow-lg hover:shadow-black/40">
                  <span className="mb-5 flex size-11 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-lg font-medium uppercase tracking-wider text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {service.text}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
