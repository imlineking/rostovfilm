/* Диагностика переходов сцен в cyber-hero: покадровая съёмка + состояние DOM */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const frame = page.frames().find(f => f.url().includes('/cyber-hero/'));
  if (!frame) { console.log('IFRAME NOT FOUND'); await browser.close(); return; }

  const state = () => frame.evaluate(() => {
    const hero = document.getElementById('hero');
    const active = [...document.querySelectorAll('.scene-media')].map((m, i) => ({ i, a: m.classList.contains('active'), op: getComputedStyle(m).opacity }));
    return JSON.stringify({
      scene: hero.dataset.scene, switching: hero.classList.contains('switching'),
      canvasRunning: document.getElementById('glitch-canvas').classList.contains('running'),
      media: active, videos: [...document.querySelectorAll('video.scene-media')].map(v => v.readyState)
    });
  });

  // Полный автотест: дождаться автосмены и снимать каждые 120мс первые 900мс перехода
  console.log('initial state:', await state());

  // 1) Ручной переход 1 -> 3 (Мир корпораций) кликом по choice
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="2"]').click());
  for (let i = 0; i < 8; i++) {
    await page.screenshot({ path: `/tmp/cyber-frames/t3-${String(i).padStart(2, '0')}.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
    console.log(`t3-${i}`, await state());
    await page.waitForTimeout(110);
  }

  // 2) Быстрые клики подряд (стресс: 3 -> 2 -> 1)
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="1"]').click());
  await page.waitForTimeout(60);
  await frame.evaluate(() => document.querySelector('.scene-choice[data-scene="0"]').click());
  for (let i = 0; i < 6; i++) {
    await page.screenshot({ path: `/tmp/cyber-frames/stress-${String(i).padStart(2, '0')}.png` });
    console.log(`stress-${i}`, await state());
    await page.waitForTimeout(120);
  }

  // 3) Финальное состояние спустя 2с
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/cyber-frames/final.png' });
  console.log('final state:', await state());
  console.log('console errors:', JSON.stringify(errors, null, 1));
  await browser.close();
})();
