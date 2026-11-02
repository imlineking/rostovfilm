/* eslint-disable @typescript-eslint/no-require-imports */
// Ассеты итерации 7: Cyber Scum (кадр, анимированный кадр, отрывок) + логотип «Голос времени»
const sharp = require("sharp");
const { execSync } = require("child_process");
const path = require("path");

const PUB = "/home/z/my-project/public";
const SCR = "/home/z/my-project/scripts";

async function main() {
  // 1. Кадр Cyber Scum (VK, 2441x1335) → 1920w JPG
  await sharp(path.join(SCR, "cs-vk.jpg"))
    .resize({ width: 1920 })
    .jpeg({ quality: 82 })
    .toFile(path.join(PUB, "images/cyberscum-frame.jpg"));
  console.log("✓ cyberscum-frame.jpg");

  // 2. Анимированный кадр GIF → animated WebP (вес меньше, качество выше)
  const meta = await sharp(path.join(SCR, "cs-frame.gif"), { animated: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(path.join(PUB, "images/cyberscum-loop.webp"));
  console.log(`✓ cyberscum-loop.webp ${Math.round(meta.size / 1024)}KB`);

  // 3. Постер карточки «Варяги. Голос времени»: затемнённый постер «Варяги» + белый логотип
  const W = 1080, H = 1440;
  const logoBuf = await sharp(path.join(SCR, "logo-golos.png"))
    .resize({ width: 940 })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logoBuf).metadata();
  const glowSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="46%" r="62%">
          <stop offset="0%" stop-color="oklch(0.62 0.23 27)" stop-opacity="0.38"/>
          <stop offset="55%" stop-color="oklch(0.35 0.12 27)" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
          <stop offset="45%" stop-color="#000" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#v)"/>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
    </svg>`
  );
  await sharp(path.join(PUB, "images/poster-varyagi.png"))
    .resize(W, H, { fit: "cover" })
    .modulate({ brightness: 0.42, saturation: 0.75 })
    .composite([
      { input: glowSvg, top: 0, left: 0 },
      {
        input: logoBuf,
        top: Math.round((H - logoMeta.height) / 2),
        left: Math.round((W - logoMeta.width) / 2),
      },
    ])
    .jpeg({ quality: 88 })
    .toFile(path.join(PUB, "images/poster-golos-vremeni.jpg"));
  console.log("✓ poster-golos-vremeni.jpg");

  // 4. Отрывок Cyber Scum: сжатие mp4 + постер-кадр
  execSync(
    `ffmpeg -y -v error -i "${SCR}/cs-otryvok.mp4" -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${PUB}/video/cyberscum-clip.mp4"`
  );
  execSync(
    `ffmpeg -y -v error -ss 1.2 -i "${PUB}/video/cyberscum-clip.mp4" -frames:v 1 -q:v 3 "${PUB}/images/cyberscum-clip-poster.jpg"`
  );
  console.log("✓ cyberscum-clip.mp4 + poster");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
