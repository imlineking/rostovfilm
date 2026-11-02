# Диагностика артефактов логотипа «Письмо» на карточке card-pismo-final.jpg
# Находит: (1) кремовые компоненты в зоне букв (залитые проёмы с/о и клин над конвертом),
# (2) светлую бахрому старого фона снаружи замкнутых контуров (конверт, росчерки, буквы).
from PIL import Image
import numpy as np
from scipy import ndimage

SRC = "/home/z/my-project/public/images/card-pismo-final.jpg"
im = np.asarray(Image.open(SRC).convert("RGB"), dtype=np.int16)
H, W, _ = im.shape
R, G, B = im[..., 0], im[..., 1], im[..., 2]

# bbox логотипа на карточке
x0, y0, x1, y1 = 100, 30, 780, 320
region = np.zeros((H, W), bool)
region[y0:y1, x0:x1] = True

navy = (B > R + 25) & (B > 80) & (R < 130)          # тёмно-синий контур
green = (G > R + 8) & (G > B + 8) & (G > 70)        # зелёный фон
cream = (R > 195) & (G > 185) & (B > 120) & (R > B + 18) & ~navy  # кремовые буквы/артефакты

# --- 1. Кремовые компоненты в зоне логотипа ---
lab, n = ndimage.label(cream & region)
print("cream components:", n)
for i in range(1, n + 1):
    ys, xs = np.where(lab == i)
    if len(ys) < 25:
        continue
    print(f"  comp {i}: area={len(ys)} bbox x[{xs.min()}..{xs.max()}] y[{ys.min()}..{ys.max()}]")

# --- 2. Бахрома снаружи контуров ---
barrier = navy | cream
free = ~(barrier) & region
out_labels, _ = ndimage.label(free)
outside = np.zeros((H, W), bool)
for seed in [(y0 + 2, x0 + 2), (y0 + 2, x1 - 3), (y1 - 3, x0 + 2), (y1 - 3, x1 - 3), (y0 + 2, (x0 + x1) // 2)]:
    lb = out_labels[seed]
    if lb > 0:
        outside |= out_labels == lb
bright_non_green = (R > 165) & (G > 150) & ~green & ~navy & ~cream
near_navy = ndimage.binary_dilation(navy, iterations=4) & ~navy & ~cream
halo = outside & bright_non_green & near_navy & region
print("halo pixels:", int(haloo := halo.sum()) if (haloo := halo.sum()) else 0)
ys, xs = np.where(halo)
if len(ys):
    print(f"  halo bbox x[{xs.min()}..{xs.max()}] y[{ys.min()}..{ys.max()}]")

# --- 3. Отладочная подсветка ---
dbg = np.asarray(Image.open(SRC).convert("RGB")).copy()
dbg[halo] = [255, 0, 255]
for i in range(1, n + 1):
    m = lab == i
    if m.sum() < 25:
        continue
    dbg[m] = [255, 0, 255]
Image.fromarray(dbg[0:360, 60:820]).save("/tmp/frames/pismo-debug.png")
print("debug saved")
