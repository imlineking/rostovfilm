"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, SITE } from "@/lib/site-data";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center gap-3" aria-label="Киностудия Ростовфильм — на главную">
          <Image
            src="/images/logo-rostovfilm-v2.png"
            alt="Киностудия Ростовфильм"
            width={2000}
            height={411}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Основная навигация">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground sm:inline-flex">
            <a href={SITE.vk} target="_blank" rel="noopener noreferrer">
              <Send className="size-4" aria-hidden />
              Мы в ВК
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-border lg:hidden"
                aria-label="Открыть меню"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetHeader>
                <SheetTitle className="font-display uppercase tracking-[0.2em]">
                  Меню
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-4" aria-label="Мобильная навигация">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 font-display text-lg uppercase tracking-wider text-foreground/90 transition-colors hover:bg-accent hover:text-primary"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={SITE.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary/50 px-3 py-3 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Send className="size-4" aria-hidden />
                  Сообщество ВКонтакте
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-transparent via-primary/70 to-transparent"
            aria-hidden
          />
        )}
      </AnimatePresence>
    </header>
  );
}
