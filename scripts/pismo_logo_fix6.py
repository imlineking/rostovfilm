# Чистка логотипа «Письмо» v6 — финал. Координаты сняты с 6x-зума с сеткой.
# Маски: bright ∧ ¬navy внутри зон; расширение на 1px (только по bright) для сглаживания.
# Заливка: BFS от зелёного, затем построчный поиск БЛИЖАЙШЕГО зелёного.
from PIL import Image
import numpy as np
from scipy import ndimage

CARD = "/home/z/my-project/public/images/card-pismo-final.jpg"
img = Image.open(CARD).convert("RGB")
card = np.asarray(img, dtype=np.int16)
H, W, _ = card.shape
R, G, B = card[..., 0], card[..., 1], card[..., 2]
navy = (B > R + 25) & (B > 80) & (R < 130)
green = (G > R + 8) & (G > B + 8) & (G > 70)
bright = (R > 175) & (G > 160) & (B > 105) & ~navy

def zone(x0, y0, x1, y1):
    m = np.zeros((H, W), bool)
    m[y0:y1, x0:x1] = True
    return m

mask = (
    (bright & zone(386, 110, 430, 140))   # дыра в завитке «с» + зазор с-ь
    | (bright & zone(654, 132, 677, 162)) # середина «о»
    | (bright & zone(504, 166, 531, 188)) # белая полоса в зазоре ь/м
)
mask |= ndimage.binary_dilation(mask) & bright  # добрать сглаженные кромки
# бахрома: одновременно прижата к navy и к зелёному (осталась от fix4, безопасна)
d_navy = ndimage.distance_transform_edt(~navy)
d_green = ndimage.distance_transform_edt(~green)
mask |= bright & (d_navy <= 2.5) & (d_green <= 2.5)
print("mask px:", int(mask.sum()))

result = card.astype(np.float64)
fill = mask.copy()
src = green & ~fill
# BFS от зелёного
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
print("после BFS не заполнено:", int(fill.sum()))

# построчный фолбэк: ближайший зелёный слева/справа (берём более близкий), затем по вертикали
ys, xs = np.where(fill)
for y, x in zip(ys, xs):
    cands = []
    for step in range(1, 90):
        for xx, sgn in ((x - step, -1), (x + step, 1)):
            if 0 <= xx < W and green[y, xx]:
                cands.append((step, result[y, xx]))
        if cands:
            break
    if not cands:
        for step in range(1, 90):
            for yy in (y - step, y + step):
                if 0 <= yy < H and green[yy, x]:
                    cands.append((step, result[yy, x]))
            if cands:
                break
    best = cands[0][1] if cands else result[green].mean(axis=0)
    result[y, x] = best

out = np.clip(result, 0, 255).astype(np.uint8)
Image.fromarray(out).save(CARD, quality=95)
print("saved")

chk = Image.fromarray(out)
z1 = chk.crop((370, 95, 445, 155)).resize((75 * 6, 60 * 6), Image.LANCZOS)
z2 = chk.crop((635, 115, 695, 180)).resize((60 * 6, 65 * 6), Image.LANCZOS)
z3 = chk.crop((495, 150, 550, 205)).resize((55 * 6, 55 * 6), Image.LANCZOS)
canvas = Image.new("RGB", (450, z1.height + z2.height + z3.height + 16), "black")
canvas.paste(z1, (0, 0)); canvas.paste(z2, (0, z1.height + 8)); canvas.paste(z3, (0, z1.height + z2.height + 16))
canvas.save("/tmp/frames/pismo-after6.png")
print("zoom saved")
