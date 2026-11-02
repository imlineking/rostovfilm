import Image from "next/image";
import { Send } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/sections/reveal";
import { SUPPORTED_BY, TEAM } from "@/lib/site-data";

/**
 * Team cards in the style of ponder.ai/careers: hairline-bordered cards
 * with a ring marker / social profile button in the corner, portrait and meta.
 */
export function Team() {
  return (
    <section id="team" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          overline="Команда"
          title={<>Люди <span className="text-red-gradient">студии</span></>}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member, i) => (
            <Reveal key={member.name} delay={0.06 * i} className="h-full">
              <article className="group relative flex h-full flex-col border border-border bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
                {/* Кнопка соцпрофиля в углу — вместо кольца-маркера;
                    у карточек без профиля остаётся кольцо, как в ponder role cards */}
                {member.vk ? (
                  <a
                    href={member.vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-foreground/30 bg-black/40 text-foreground/70 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary hover:text-primary"
                    aria-label={`${member.name} — профиль во ВКонтакте`}
                    title="Профиль во ВКонтакте"
                  >
                    <Send className="size-4" aria-hidden />
                  </a>
                ) : (
                  <span
                    className="absolute right-3 top-3 z-10 size-4 rounded-full border border-foreground/30 bg-black/40 transition-colors duration-300 group-hover:border-primary"
                    aria-hidden
                  />
                )}

                {/* Portrait / monogram */}
                <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-border/70">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={`${member.name} — ${member.role}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="hatch-panel flex size-full items-center justify-center bg-secondary/60">
                      <span
                        className="font-display text-6xl font-semibold uppercase tracking-wider text-primary/35 transition-colors duration-300 group-hover:text-primary/60"
                        aria-hidden
                      >
                        {member.initials}
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/95 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/90">
                    {member.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Supported by */}
        <Reveal delay={0.15}>
          <div className="mt-16 border-t border-border/60 pt-10">
            <p className="text-center font-display text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              При поддержке
            </p>
            <ul className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0">
              {SUPPORTED_BY.map((org, i) => (
                <li
                  key={org}
                  className="flex items-center gap-4 sm:gap-0"
                >
                  {i > 0 ? (
                    <span
                      className="mx-6 hidden size-1.5 rotate-45 bg-primary/60 sm:block"
                      aria-hidden
                    />
                  ) : null}
                  <span className="text-center font-display text-lg font-medium uppercase tracking-[0.12em] text-foreground/80 transition-colors hover:text-primary sm:text-xl">
                    {org}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
