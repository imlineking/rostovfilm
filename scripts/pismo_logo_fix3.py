# Чистка логотипа «Письмо» на card-pismo-final.jpg — хирургический метод.
# Артефакты = светлые (кремово-белые) пиксели, которые прилегают к зелёному фону
# снаружи замкнутых контуров (бахрома старого фона) либо залиты в проёмах букв.
# Критерий: bright ∧ ~navy ∧ (расстояние до «внешней» зелёной области <= 3.5px),
# плюс заливка проёма «о» по прямоугольнику (он замкнут кольцом navy).
# Затем — текстурная заливка зелёным (BFS-разрастание от окружающего фона).
from PIL import Image
import numpy as np
from scipy import ndimage

CARD = "/home/z/my-project/public/images/card-pismo-final.jpg"
card = np.asarray(Image.open(CARD).convert("RGB"), dtype=np.int16)
H, W, _ = card.shape
R, G, B = card[..., 0], card[..., 1], card[..., 2]

win = np.zeros((H, W), bool)
win[30:320, 100:780] = True

navy = (B > R + 25) & (B > 80) & (R < 130)
green = (G > R + 8) & (G > B + 8) & (G > 70)
bright = (R > 175) & (G > 160) & (B > 105) & ~navy

# «внешняя» область: flood-fill из углов окна по не-navy и не-cream
cream = (R > 195) & (G > 185) & (B > 120) & (R > B + 18) & ~navy
free = ~(navy | cream) & win
lbl, _ = ndimage.label(free)
outside = np.zeros((H, W), bool)
for seed in [(32, 102), (32, 778), (318, 102), (318, 778), (32, 440), (318, 440)]:
    lb = lbl[seed]
    if lb > 0:
        outside |= lbl == lb
print("outside px:", int(outside.sum()))

dist_out = ndimage.distance_transform_edt(~outside)

# 1) бахрома и залитые проёмы, открытые к фону
fringe = bright & win & (dist_out <= 3.5)
fringe |= ndimage.binary_dilation(fringe) & bright & win  # добрать толщину
# 2) проём «о» (замкнут) — прямоугольник
rect = np.zeros((H, W), bool)
rect[131:165, 693:724] = True
hole_o = bright & rect
print("fringe px:", int(fringe.sum()), "| hole_o px:", int(hole_o.sum()))

fix = fringe | hole_o
fix &= ~navy

# --- текстурная заливка зелёным: BFS от окружающего зелёного ---
fill = fix.copy()
src = green & ~fill
result = card.astype(np.float64)
it = 0
while fill.any():
    it += 1
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
print("BFS iterations:", it, "unfilled after BFS:", int(fill.sum()))

# --- второй проход: построчный/вертикальный поиск ближайшего зелёного ---
ys, xs = np.where(fill)
print("row-scan for", len(ys), "px")
green_coords = green
for y, x in zip(ys, xs):
    best = None
    for step in range(1, 70):
        for xx in (x - step, x + step):
            if 0 <= xx < W and green_coords[y, xx]:
                best = result[y, xx]
                break
        if best is None:
            for yy in (y - step, y + step):
                if 0 <= yy < H and green_coords[yy, x]:
                    best = result[yy, x]
                    break
        if best is not None:
            break
    if best is None:
        best = result[green_coords & win].mean(axis=0)
    result[y, x] = best
print("row-scan done")

out = np.clip(result, 0, 255).astype(np.uint8)
Image.fromarray(out).save(CARD, quality=92)
print("saved", CARD)

chk = Image.fromarray(out)
c1 = chk.crop((330, 60, 660, 200)).resize((330 * 3, 140 * 3), Image.LANCZOS)
c2 = chk.crop((560, 90, 780, 200)).resize((220 * 3, 110 * 3), Image.LANCZOS)
c3 = chk.crop((240, 180, 640, 310)).resize((400 * 2, 130 * 2), Image.LANCZOS)
canvas = Image.new("RGB", (max(c1.width, c2.width, c3.width), c1.height + c2.height + c3.height + 16), "black")
canvas.paste(c1, (0, 0)); canvas.paste(c2, (0, c1.height + 8)); canvas.paste(c3, (0, c1.height + c2.height + 16))
canvas.save("/tmp/frames/pismo-after.png")
print("after-zoom saved")
