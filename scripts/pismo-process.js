/**
 * Обработка «Письмо»:
 * 1) вырезать логотип с кремовой шапки → прозрачный PNG (flood fill от краёв);
 * 2) кадр с ёжиком обрезать до 3:4 и увеличить до 864×1152;
 * 3) наложить логотип поверх кадра → card-pismo-final.jpg.
 * Плюс: фото Демиденко → team-demidenko.jpg (720×960, 3:4).
 */
const sharp = require("sharp");

const SRC = "public/images/card-pismo-real.png";
const W = 900, H = 1200;

async function main() {
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };

  // 1. Найти границу крема/кадра: доля кремовых пикселей в строке
  const isCream = ([r, g, b]) => r > 225 && g > 215 && b > 175 && b < 245 && r - b > 15;
  let boundary = 0;
  for (let y = 0; y < H; y++) {
    let cnt = 0;
    for (let x = 0; x < W; x += 5) if (isCream(px(x, y))) cnt++;
    if (cnt / (W / 5) > 0.9) boundary = y;
  }
  boundary += 1;
  console.log("cream boundary y =", boundary);

  // 2. BBox логотипа (некремовые пиксели в шапке)
  let minX = W, maxX = 0, minY = boundary, maxY = 0;
  for (let y = 0; y < boundary; y++) {
    for (let x = 0; x < W; x++) {
      if (!isCream(px(x, y))) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 14;
  minX = Math.max(0, minX - pad); maxX = Math.min(W - 1, maxX + pad);
  minY = Math.max(0, minY - pad); maxY = Math.min(boundary - 1, maxY + pad);
  const lw = maxX - minX + 1, lh = maxY - minY + 1;
  console.log("logo bbox", { minX, minY, maxX, maxY, lw, lh });

  // 3. Flood fill кремового фона от краёв региона логотипа
  const mask = new Uint8Array(lw * lh); // 1 = фон (прозрачно)
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= lw || y >= lh) return;
    const idx = y * lw + x;
    if (mask[idx]) return;
    const c = px(minX + x, minY + y);
    const d = Math.hypot(c[0] - 247, c[1] - 238, c[2] - 213); // ≈ крем
    if (d < 52) { mask[idx] = 1; queue.push([x, y]); }
  };
  for (let x = 0; x < lw; x++) { push(x, 0); push(x, lh - 1); }
  for (let y = 0; y < lh; y++) { push(0, y); push(lw - 1, y); }
  while (queue.length) {
    const [x, y] = queue.pop();
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  let removed = 0;
  for (let i = 0; i < mask.length; i++) removed += mask[i];
  console.log("flood removed", removed, "of", lw * lh);

  // 4. Собрать RGBA логотипа: фон → альфа 0, полупрозрачная растушёвка на границе
  const out = Buffer.alloc(lw * lh * 4, 255);
  for (let y = 0; y < lh; y++) {
    for (let x = 0; x < lw; x++) {
      const idx = y * lw + x, di = idx * 4;
      const [r, g, b] = px(minX + x, minY + y);
      out[di] = r; out[di + 1] = g; out[di + 2] = b;
      if (mask[idx]) { out[di + 3] = 0; continue; }
      // край: рядом прозрачный и цвет близок к крему → полупрозрачность
      let nearBg = false;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < lw && ny < lh && mask[ny * lw + nx]) { nearBg = true; break; }
      }
      if (nearBg) {
        const d = Math.hypot(r - 247, g - 238, b - 213);
        if (d < 110) out[di + 3] = Math.round(255 * (d / 110));
      }
    }
  }
  await sharp(out, { raw: { width: lw, height: lh, channels: 4 } })
    .png().toFile("scripts/pismo-logo.png");
  console.log("logo saved scripts/pismo-logo.png");

  // 5. Кадр 3:4 из зоны под шапкой
  const fh = H - boundary;               // высота кадра
  const fw = Math.round(fh * 0.75);      // ширина под 3:4
  const fx = Math.round((W - fw) / 2);
  console.log("frame crop", { fx, boundary, fw, fh });
  const frame = await sharp(SRC)
    .extract({ left: fx, top: boundary, width: fw, height: fh })
    .resize(864, 1152, { kernel: "lanczos3" })
    .toBuffer();

  // 6. Логотип поверх кадра: ширина 72%, отступ сверху 44px
  const logoW = Math.round(864 * 0.72);
  const logoH = Math.round(logoW * (lh / lw));
  const logo = await sharp("scripts/pismo-logo.png")
    .resize(logoW, logoH, { kernel: "lanczos3" })
    .png().toBuffer();
  await sharp(frame)
    .composite([{ input: logo, left: Math.round((864 - logoW) / 2), top: 44 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile("public/images/card-pismo-final.jpg");
  console.log("saved public/images/card-pismo-final.jpg");

  // 7. Фото Демиденко 720×960
  await sharp("scripts/demidenko-raw.jpg")
    .resize(720, 960, { kernel: "lanczos3" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile("public/images/team-demidenko.jpg");
  console.log("saved public/images/team-demidenko.jpg");
}

main().catch((e) => { console.error(e); process.exit(1); });
