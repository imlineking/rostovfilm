# Чистка логотипа «Письмо» v4 — только точные зоны, сначала DEBUG-подсветка.
# Зоны: (1) залитый проём «с», (2) залитый проём «о», (3) клин над конвертом,
# (4) бахрома старого фона: bright ∧ не-navy ∧ (<=2.5px до navy) ∧ (<=2.5px до зелёного).
# Запуск: python3 pismo_logo_fix4.py debug   — подсветка без изменения файла
#         python3 pismo_logo_fix4.py apply   — применить и сохранить
from PIL import Image
import numpy as np
from scipy import ndimage
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "debug"
CARD = "/home/z/my-project/public/images/card-pismo-final.jpg"
card = np.asarray(Image.open(CARD).convert("RGB"), dtype=np.int16)
H, W, _ = card.shape
R, G, B = card[..., 0], card[..., 1], card[..., 2]

navy = (B > R + 25) & (B > 80) & (R < 130)
green = (G > R + 8) & (G > B + 8) & (G > 70)
bright = (R > 175) & (G > 160) & (B > 105) & ~navy

def rect_mask(x0, y0, x1, y1):
    m = np.zeros((H, W), bool)
    m[y0:y1, x0:x1] = True
    return m

# пятна-заливки (проёмы букв) — перекрашиваем bright внутри прямоугольника
blob_c = bright & rect_mask(377, 110, 418, 142)   # проём «с»
blob_o = bright & rect_mask(649, 128, 679, 168)   # проём «о»
blob_s = bright & rect_mask(503, 166, 534, 190)   # клин над конвертом

# бахрома: одновременно прижата к navy и к зелёному
d_navy = ndimage.distance_transform_edt(~navy)
d_green = ndimage.distance_transform_edt(~green)
halo = bright & (d_navy <= 2.5) & (d_green <= 2.5)

fix = blob_c | blob_o | blob_s | halo
print("blob_c:", int(blob_c.sum()), "blob_o:", int(blob_o.sum()),
      "blob_s:", int(blob_s.sum()), "halo:", int(halo.sum()), "total:", int(fix.sum()))

if MODE == "debug":
    dbg = np.asarray(Image.open(CARD).convert("RGB")).copy()
    dbg[halo] = [255, 0, 255]
    dbg[blob_c | blob_o | blob_s] = [0, 255, 0]
    for (x0, y0, x1, y1) in [(377, 110, 418, 142), (649, 128, 679, 168), (503, 166, 534, 190)]:
        dbg[y0:y1, x0] = [255, 255, 0]; dbg[y0:y1, x1 - 1] = [255, 255, 0]
        dbg[y0, x0:x1] = [255, 255, 0]; dbg[y1 - 1, x0:x1] = [255, 255, 0]
    im = Image.fromarray(dbg[40:330, 90:800])
    im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
    im.save("/tmp/frames/pismo-debug4.png")
    print("debug saved")
    sys.exit(0)

# --- применение: заливка зелёным (BFS от зелёного + построчный фолбэк) ---
fill = fix.copy()
src = green & ~fill
result = card.astype(np.float64)
while True:
    grown = ndimage.binary_dilation(src) & fill
    if not grown.any():
        break
    gsum = np.zeros(result.shape[:2] + (3,), np.float64)
    gcnt = np.zeros(result.shape[:2], np.float64)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy == 0 and dx == 0:
                continue
            sh_src = np.roll(src, (dy, dx), (0, 1))
            sh_col = np.roll(result, (dy, dx), (0, 1))
            w = sh_src.astype(np.float64)
            gsum += sh_col * w[..., None]
            gcnt += w
    ok = grown & (gcnt > 0)
    result[ok] = gsum[ok] / gcnt[ok][..., None]
    src |= grown
    fill &= ~grown
ys, xs = np.where(fill)
for y, x in zip(ys, xs):
    best = None
    for step in range(1, 80):
        for xx in (x - step, x + step):
            if 0 <= xx < W and green[y, xx]:
                best = result[y, xx]; break
        if best is None:
            for yy in (y - step, y + step):
                if 0 <= yy < H and green[yy, x]:
                    best = result[yy, x]; break
        if best is not None:
            break
    if best is None:
        best = result[green].mean(axis=0)
    result[y, x] = best
print("fill done, leftover:", int(fill.sum()))

out = np.clip(result, 0, 255).astype(np.uint8)
Image.fromarray(out).save(CARD, quality=92)
chk = Image.fromarray(out)
c1 = chk.crop((330, 60, 660, 200)).resize((330 * 3, 140 * 3), Image.LANCZOS)
c2 = chk.crop((600, 90, 760, 200)).resize((160 * 4, 110 * 4), Image.LANCZOS)
c3 = chk.crop((240, 180, 640, 310)).resize((400 * 2, 130 * 2), Image.LANCZOS)
canvas = Image.new("RGB", (max(c1.width, c2.width, c3.width),
                           c1.height + c2.height + c3.height + 16), "black")
canvas.paste(c1, (0, 0)); canvas.paste(c2, (0, c1.height + 8)); canvas.paste(c3, (0, c1.height + c2.height + 16))
canvas.save("/tmp/frames/pismo-after4.png")
print("applied and saved")
