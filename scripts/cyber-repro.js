/* Воспроизведение перехода сцен cyber-hero с прокруткой к секции: пауза автоленты, детерминированные клики, бёрст кадров */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Скролл к секции киберблока
  await page.evaluate(() => document.getElementById('cyberscum').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(900);

  const frame = page.frames().find(f => f.url().includes('/cyber-hero/'));
  if (!frame) { console.log('IFRAME NOT FOUND'); await browser.close(); return; }

  // Ставим автосмену на паузу, возвращаемся к сцене 1
  await frame.evaluate(() => document.getElementById('pause-button').click());
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="0"]').click());
  await page.waitForTimeout(900);

  const shot = (n) => page.screenshot({ path: `/tmp/cyber-frames/repro-${n}.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // Пере A: 1 -> 3 (Мир корпораций)
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="2"]').click());
  for (let i = 0; i < 7; i++) { await shot(`a${i}`); await page.waitForTimeout(90); }
  await page.waitForTimeout(700);

  // Переход B: 3 -> 4 (Остаться человеком) — как у пользователя
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="3"]').click());
  for (let i = 0; i < 7; i++) { await shot(`b${i}`); await page.waitForTimeout(90); }
  await page.waitForTimeout(700);
  await shot('b-final');

  // Переход C: быстрый двойной клик 4 -> 2 -> 1 (стресс)
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="1"]').click());
  await page.waitForTimeout(50);
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="0"]').click());
  for (let i = 0; i < 7; i++) { await shot(`c${i}`); await page.waitForTimeout(90); }
  await page.waitForTimeout(800);
  await shot('c-final');

  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})();
