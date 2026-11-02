import sharp from 'sharp';

const ART = '/home/z/my-project/public/images/poster-pismo.png';
const LOGO = '/home/z/my-project/public/images/logo-pismo-clean.png';
const OUT = '/home/z/my-project/public/images/card-pismo.png';

async function main() {
  const art = sharp(ART).resize(864, 1152, { fit: 'cover' });
  const artBuf = await art.toBuffer();

  // Logo: 2458x1221 -> width 520 (height ~258), add soft shadow via darkened blurred copy
  const logoW = 520;
  const logoMeta = await sharp(LOGO).metadata();
  const logoH = Math.round((logoW * (logoMeta.height ?? 1221)) / (logoMeta.width ?? 2458));
  const logoResized = await sharp(LOGO).resize(logoW, logoH).png().toBuffer();

  // Shadow: silhouette darkened + blur
  const shadow = await sharp(LOGO)
    .resize(logoW, logoH)
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from(
          `<svg width="${logoW}" height="${logoH}"><rect width="100%" height="100%" fill="black" fill-opacity="0.55"/></svg>`
        ),
        blend: 'dest-in',
      },
    ])
    .blur(6)
    .png()
    .toBuffer();

  const logoX = Math.round((864 - logoW) / 2);
  const logoY = 56;

  const out = await sharp(artBuf)
    .composite([
      { input: shadow, left: logoX + 4, top: logoY + 6 },
      { input: logoResized, left: logoX, top: logoY },
    ])
    .png()
    .toBuffer();

  await sharp(out).toFile(OUT);
  console.log('OK', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
