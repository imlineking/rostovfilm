const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.getElementById('cyberscum').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(600);
  const frame = page.frames().find(f => f.url().includes('/cyber-hero/'));
  const geo = await frame.evaluate(() => {
    const r = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const canvas = document.getElementById('glitch-canvas');
    const img = document.getElementById('media-3');
    const cs = getComputedStyle(img);
    return JSON.stringify({
      iframeInner: { w: innerWidth, h: innerHeight },
      hero: r(document.getElementById('hero')),
      stage: r(document.querySelector('.stage')),
      canvas: r(canvas), canvasAttr: { w: canvas.width, h: canvas.height },
      img: r(img),
      imgStyle: { objectFit: cs.objectFit, objectPosition: cs.objectPosition, transform: cs.transform },
      dpr: devicePixelRatio
    });
  });
  console.log(geo);
  await browser.close();
})();
