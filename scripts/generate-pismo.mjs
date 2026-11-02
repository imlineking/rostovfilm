import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const OUT = '/home/z/my-project/public/images/poster-pismo.png';
const PROMPT =
  'Cute hedgehog postman character holding a paper envelope letter, paper cutout animation style, children book illustration, flat solid warm cream background, navy dark blue accents and outlines matching cream-navy palette, soft paper texture, kind and cozy mood, for kids 0+ animation, no text, no words, no letters, no watermark, high quality';

async function main() {
  const zai = await ZAI.create();
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const r = await zai.images.generations.create({ prompt: PROMPT, size: '864x1152' });
      const b64 = r?.data?.[0]?.base64;
      if (!b64) throw new Error('empty');
      fs.writeFileSync(OUT, Buffer.from(b64, 'base64'));
      console.log('OK', OUT);
      ok = true;
    } catch (e) {
      console.error(`attempt ${attempt}: ${e.message}`);
      if (attempt < 3) await new Promise((res) => setTimeout(res, 1500));
    }
  }
  if (!ok) process.exit(1);
}

main();
