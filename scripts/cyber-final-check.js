/* Финальная проверка: автолента, модалка, мобайл 390x844, overflowX */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // ---- Desktop 1440x900 ----
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.getElementById('cyberscum').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(800);
  const frame = page.frames().find(f => f.url().includes('/cyber-hero/'));

  // Автолента: не трогаем паузу, ждём автосмену (6с) и фиксируем смену сцены
  const s0 = await frame.evaluate(() => document.getElementById('hero').dataset.scene);
  await page.screenshot({ path: '/tmp/cyber-frames/final-auto-before.png' });
  await page.waitForTimeout(6800);
  const s1 = await frame.evaluate(() => document.getElementById('hero').dataset.scene);
  await page.screenshot({ path: '/tmp/cyber-frames/final-auto-after.png' });
  console.log(`autoplay: scene ${s0} -> ${s1} (expect different)`);

  // Модалка «Смотреть отрывок»
  await frame.evaluate(() => document.getElementById('scene-cta').click());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/cyber-frames/final-modal.png' });
  const modalOpen = await frame.evaluate(() => document.getElementById('film-dialog').open);
  await frame.evaluate(() => document.getElementById('close-dialog').click());
  await page.waitForTimeout(400);
  const modalClosed = await frame.evaluate(() => !document.getElementById('film-dialog').open);
  console.log('modal open/close:', modalOpen, modalClosed);

  // Состояние после модалки: сцена активна, видео играет
  const st = await frame.evaluate(() => JSON.stringify({
    scene: document.getElementById('hero').dataset.scene,
    activeCount: document.querySelectorAll('.scene-media.active').length,
    vid0: document.getElementById('media-0').paused
  }));
  console.log('state after modal:', st);

  // Серия из 6 быстрых переключений подряд — финальное состояние должно быть валидным
  for (const n of [1, 2, 3, 0, 3, 2]) {
    await frame.evaluate(i => document.querySelector(`.scene-choice[data-scene="${i}"]`).click(), String(n));
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(900);
  const st2 = await frame.evaluate(() => JSON.stringify({
    scene: document.getElementById('hero').dataset.scene,
    activeCount: document.querySelectorAll('.scene-media.active').length,
    switching: document.getElementById('hero').classList.contains('switching')
  }));
  await page.screenshot({ path: '/tmp/cyber-frames/final-after-stress.png' });
  console.log('state after rapid clicks:', st2);
  await page.close();

  // ---- Mobile 390x844 ----
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  m.on('pageerror', e => errors.push('M-PAGEERROR: ' + e.message));
  await m.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await m.waitForTimeout(1200);
  await m.evaluate(() => document.getElementById('cyberscum').scrollIntoView({ block: 'start' }));
  await m.waitForTimeout(700);
  const mf = m.frames().find(f => f.url().includes('/cyber-hero/'));
  await mf.evaluate(() => document.getElementById('pause-button').click());
  await m.screenshot({ path: '/tmp/cyber-frames/final-mobile-1.png' });
  await mf.evaluate(() => document.querySelector('.scene-choice[data-scene="3"]').click());
  await m.waitForTimeout(300);
  await m.screenshot({ path: '/tmp/cyber-frames/final-mobile-2.png' });
  await m.waitForTimeout(700);
  await m.screenshot({ path: '/tmp/cyber-frames/final-mobile-3.png' });
  const mob = await m.evaluate(() => JSON.stringify({
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    sectionH: Math.round(document.getElementById('cyberscum').getBoundingClientRect().height)
  }));
  console.log('mobile:', mob);
  await m.close();

  console.log('console errors:', JSON.stringify(errors));
  await browser.close();
})();
