import { SiteHeader } from "@/components/sections/site-header";
import { ScrollProgress } from "@/components/sections/scroll-progress";
import { BackToTop } from "@/components/sections/back-to-top";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { FlagshipFilm } from "@/components/sections/flagship-film";
import { CyberScum } from "@/components/sections/cyber-scum";
import { AiCinema } from "@/components/sections/ai-cinema";
import { Projects } from "@/components/sections/projects";
import { Team } from "@/components/sections/team";
import { Contact } from "@/components/sections/contact";
import { SiteFooter } from "@/components/sections/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <FlagshipFilm />
        <CyberScum />
        <AiCinema />
        <Projects />
        <Team />
        <Contact />
      </main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
