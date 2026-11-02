import Image from "next/image";
import { Send } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <a href="#top" className="inline-flex items-center" aria-label="Киностудия Ростовфильм — на главную">
              <Image
                src="/images/logo-rostovfilm-v2.png"
                alt="Киностудия Ростовфильм"
                width={2000}
                height={411}
                className="h-10 w-auto"
              />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
          </div>

          <nav aria-label="Навигация в подвале">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-foreground/80">
              Разделы
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="link-underline w-fit text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-foreground/80">
              Мы в ВКонтакте
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={SITE.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Send className="size-3.5" aria-hidden />
                  vk.ru/rostovfilm — студия
                </a>
              </li>
              <li>
                <a
                  href={SITE.vkHanuman}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Send className="size-3.5" aria-hidden />
                  vk.ru/hanuman_media — «Хануман Медиа»
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Киностудия «Ростовфильм». Все права защищены.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            Свет · Камера · Мотор
          </p>
        </div>
      </div>
    </footer>
  );
}
