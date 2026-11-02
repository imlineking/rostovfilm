/* Диагностика capture(): рисуем capture(i) прямо на видимый канвас и смотрим результат */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.getElementById('cyberscum').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(800);
  const frame = page.frames().find(f => f.url().includes('/cyber-hero/'));

  // Пауза автосмены
  await frame.evaluate(() => document.getElementById('pause-button').click());
  await page.waitForTimeout(200);

  const report = await frame.evaluate(async () => {
    const out = {};
    const media = [0, 1, 2, 3].map(i => document.getElementById('media-' + i));
    out.mediaInfo = media.map((m, i) => ({
      i, tag: m.tagName,
      ready: m.tagName === 'VIDEO' ? m.readyState : 'img',
      nw: m.tagName === 'VIDEO' ? m.videoWidth : m.naturalWidth,
      nh: m.tagName === 'VIDEO' ? m.videoHeight : m.naturalHeight,
      complete: m.tagName === 'IMG' ? m.complete : 'video',
      src: (m.tagName === 'VIDEO' ? m.querySelector('source')?.src : m.src) || ''
    }));
    // Тестовый рендер capture для каждой сцены на отдельный канвас
    out.captures = media.map((item, i) => {
      const w = 720, h = 360;
      const buffer = document.createElement('canvas'); buffer.width = w; buffer.height = h;
      const c = buffer.getContext('2d', { alpha: false });
      c.fillStyle = '#100b0d'; c.fillRect(0, 0, w, h);
      const source = item.tagName === 'VIDEO' ? (item.readyState >= 2 ? item : null) : item;
      let drew = false, err = null;
      if (source) {
        try {
          const sw = source.videoWidth || source.naturalWidth, sh = source.videoHeight || source.naturalHeight;
          if (sw && sh) { const scale = Math.max(w / sw, h / sh), dw = sw * scale, dh = sh * scale; c.drawImage(source, (w - dw) * .6, (h - dh) * .5, dw, dh); drew = true; }
        } catch (e) { err = e.message; }
      }
      const data = c.getImageData(0, 0, w, h).data;
      let sum = 0; for (let k = 0; k < data.length; k += 40) sum += data[k];
      return { i, drew, err, brightness: Math.round(sum / (data.length / 40)) };
    });
    return JSON.stringify(out);
  });
  console.log(report);
  await browser.close();
})();
