/**
 * Секция «Cyber Scum» — готовый автономный блок, встроенный через iframe.
 *
 * Исходник лежит в public/cyber-hero/ (передан из Codex как есть): внутри —
 * локальный шрифт фильма Marske (assets/fonts/Marske.ttf), локальные Golos Text
 * и Exo 2, четыре сцены (cyber-01…04), глитч-переходы, диалог «Смотреть отрывок».
 * iframe изолирует CSS и JS блока от остального сайта.
 *
 * Блок расположен между «Варяги. Ген храбрости» (#film) и «AI-производство» (#ai)
 * и заменяет прежнюю самодельную секцию Cyber Scum; карточка в каталоге
 * «Проекты» осталась отдельным разделом. Автозапуск фона без звука разрешён
 * через allow="autoplay"; звук включается только в модальном окне отрывка.
 */
export function CyberScum() {
  return (
    <section
      id="cyberscum"
      aria-label="Cyber Scum — анимационный фильм студии Ростов Фильм"
      className="scroll-mt-20 border-y border-border/60 bg-[#100b0d]"
    >
      <iframe
        id="cyber-hero-frame"
        src="/cyber-hero/index.html?v=20"
        title="Cyber Scum — анимационный фильм студии Ростов Фильм"
        allow="autoplay; fullscreen"
        loading="lazy"
        className="block h-[max(100svh,800px)] w-full border-0 lg:h-[801px]"
      />
    </section>
  );
}
