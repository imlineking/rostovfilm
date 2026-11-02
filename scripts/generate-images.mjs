import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images';

const TASKS = [
  {
    name: 'hero-bg',
    size: '1440x768',
    prompt:
      'Cinematic film production set at night, silhouette of a professional cinema camera on crane against dramatic dark sky, warm amber golden rim lighting, haze and volumetric light beams, moody atmosphere, deep shadows, anamorphic lens flare, dark teal and gold color grading, photorealistic, high quality, no text, no words, no watermark',
  },
  {
    name: 'poster-aly',
    size: '768x1344',
    prompt:
      'Cinematic movie poster art without any text: scarlet red sunset over endless steppe road toward the sea, lone figure with suitcase walking into the light, dramatic clouds, film grain, anamorphic widescreen mood, rich crimson and gold palette, photorealistic cinematic still, high quality, no text, no words, no letters, no watermark',
  },
  {
    name: 'poster-pervaya-liniya',
    size: '768x1344',
    prompt:
      'Cinematic war drama poster art without any text: dramatic silhouette of a cameraman with shoulder camera walking along a dusty road at dusk, smoke and golden backlight, documentary film aesthetic, desaturated palette with amber highlights, film grain, photorealistic, high quality, no text, no words, no letters, no watermark',
  },
  {
    name: 'poster-varyagi',
    size: '768x1344',
    prompt:
      'Cinematic naval epic poster art without any text: powerful silhouette of a naval cruiser ship cutting through stormy dark sea at dawn, dramatic golden sunrise breaking through heavy clouds, epic scale, cold blue-black palette with warm gold accents, film grain, photorealistic cinematic still, high quality, no text, no words, no letters, no watermark',
  },
  {
    name: 'studio-production',
    size: '1344x768',
    prompt:
      'Professional film studio interior with cinema lighting equipment, softbox lights glowing warm amber, camera dolly and tracks, dark atmospheric space with haze, cinematic mood, shallow depth of field, dark charcoal and gold color palette, photorealistic, high quality, no text, no words, no watermark',
  },
  {
    name: 'post-production',
    size: '1344x768',
    prompt:
      'Dark professional video editing suite at night, colorist workstation with multiple monitors showing video editing timeline and color grading scopes, warm amber accent lighting, moody atmosphere, shallow depth of field, cinematic charcoal and gold palette, photorealistic, high quality, no readable text on screens, no watermark',
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();

  for (const task of TASKS) {
    const outPath = path.join(OUT_DIR, `${task.name}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`skip (exists): ${outPath}`);
      continue;
    }
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const response = await zai.images.generations.create({
          prompt: task.prompt,
          size: task.size,
        });
        const b64 = response?.data?.[0]?.base64;
        if (!b64) throw new Error('empty response');
        fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
        console.log(`OK: ${outPath} (${task.size})`);
        ok = true;
      } catch (e) {
        console.error(`FAIL ${task.name} attempt ${attempt}: ${e.message}`);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (!ok) console.error(`GAVE UP: ${task.name}`);
  }
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
