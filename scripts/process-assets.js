/* eslint-disable @typescript-eslint/no-require-imports */
/* Process new assets: Письмо card from real frame, Cyber Scum poster, Ilya Chistov photo */
const sharp = require("sharp");

const IMG = "/home/z/my-project/public/images";
const UP = "/home/z/my-project/upload";

async function main() {
  // ---------- 1. Письмо card: real frame + title logo ----------
  // Extract 35s frame at full res
  await new Promise((res, rej) => {
    const { execSync } = require("child_process");
    execSync(
      `ffmpeg -y -v error -ss 35 -i "${UP}/Письмо.mp4" -frames:v 1 /home/z/my-project/scripts/pismo-full.png`,
      { stdio: "inherit" }
    );
    res();
  });

  // Frame: take the lower part of the left 3:4 region so the hedgehog on the ground is visible.
  // Full frame 1920x1080, hedgehog sits at y ~720-1000, x ~208-624.
  const frameCrop = await sharp("/home/z/my-project/scripts/pismo-full.png")
    .extract({ left: 20, top: 390, width: 810, height: 690 })
    .resize(900, 770, { fit: "cover" })
    .toBuffer();

  // Cream top band 900x430 + frame 900x770
  const BAND_H = 430;
  const band = await sharp({
    create: {
      width: 900,
      height: BAND_H,
      channels: 4,
      background: { r: 251, g: 240, b: 210, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  // Logo clean png, resize to fit band
  const logoW = 640;
  const logoMeta = await sharp(`${IMG}/logo-pismo-clean.png`).metadata();
  const logoH = Math.round((logoMeta.height / logoMeta.width) * logoW);
  const logo = await sharp(`${IMG}/logo-pismo-clean.png`)
    .resize(logoW, logoH)
    .png()
    .toBuffer();

  const bandWithLogo = await sharp(band)
    .composite([
      {
        input: logo,
        left: Math.round((900 - logoW) / 2),
        top: Math.round((BAND_H - logoH) / 2),
      },
    ])
    .png()
    .toBuffer();

  await sharp({
    create: { width: 900, height: 1200, channels: 4, background: "#fbf0d2" },
  })
    .composite([
      { input: bandWithLogo, left: 0, top: 0 },
      { input: frameCrop, left: 0, top: BAND_H },
    ])
    .jpeg({ quality: 88 })
    .toFile(`${IMG}/card-pismo.png`);

  // ---------- 2. Cyber Scum poster ----------
  await sharp(`${UP}/Cyberscum_Poster.jpg`)
    .resize(900, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(`${IMG}/poster-cyberscum.jpg`);

  // ---------- 3. Ilya Chistov photo: center square ----------
  const chMeta = await sharp(`${UP}/pasted_image_1793310401582.png`).metadata();
  console.log("chistov src:", chMeta.width, chMeta.height);
  const side = Math.min(chMeta.width, chMeta.height);
  await sharp(`${UP}/pasted_image_1793310401582.png`)
    .extract({
      left: 0,
      top: 0,
      width: Math.min(1180, chMeta.width),
      height: Math.min(1180, chMeta.height),
    })
    .resize(800, 800)
    .jpeg({ quality: 86 })
    .toFile(`${IMG}/team-chistov.jpg`);

  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
