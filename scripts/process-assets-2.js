/* eslint-disable @typescript-eslint/no-require-imports */
/* Roman Gromyhalov portrait crop + Za Rekoy Vremeni poster */
const sharp = require("sharp");

async function main() {
  // Roman: crop portrait 3:4 around subject (face ~x760 center). Source 1364x767.
  await sharp("/home/z/my-project/upload/pasted_image_1793311743134.png")
    .extract({ left: 488, top: 0, width: 576, height: 766 })
    .resize(720, 958)
    .jpeg({ quality: 88 })
    .toFile("/home/z/my-project/public/images/team-gromyhalov.jpg");

  // Za rekoy vremeni poster: compress
  await sharp("/home/z/my-project/scripts/poster-reka-raw.png")
    .jpeg({ quality: 86 })
    .toFile("/home/z/my-project/public/images/poster-za-rekoy.jpg");

  console.log("assets done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
