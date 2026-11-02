#!/usr/bin/env python3
"""Карточка «Письмо» v3: новый аккуратный логотип поверх лесной сцены.
Лес берём из card-pismo-real.png (ниже кремовой плашки, y>=399),
масштабируем до 864x1152 как в текущей карточке, логотип — upload/pasted_image_1793355876363.png.
"""
import numpy as np
from PIL import Image

SRC_FOREST = "public/images/card-pismo-real.png"
CUR = "public/images/card-pismo-final-v2.jpg"
NEW_LOGO = "upload/pasted_image_1793355876363.png"
OUT = "public/images/card-pismo-final-v3.jpg"

W, H = 864, 1152
BAND_END = 399  # нижняя граница кремовой плашки в real.png

# 1) Старый логотип в текущей карточке: bbox по тёмно-синим пикселям (верхние 40%)
cur = np.array(Image.open(CUR).convert("RGB")).astype(int)
top = cur[: int(H * 0.40)]
r, g, b = top[:, :, 0], top[:, :, 1], top[:, :, 2]
blue = (b > r + 40) & (b > g + 30) & (b < 140) & (r < 90)
ys, xs = np.where(blue)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
print(f"old logo bbox: x {x0}..{x1} (w={x1-x0}), y {y0}..{y1} (h={y1-y0}), aspect={(x1-x0)/(y1-y0):.2f}")

# 2) Чистый лес: кроп real.png ниже плашки, scale-to-fill 864x1152, центр-кроп
real = Image.open(SRC_FOREST).convert("RGB")
forest = real.crop((0, BAND_END, real.width, real.height))  # 900x801
scale = max(W / forest.width, H / forest.height)
fw, fh = round(forest.width * scale), round(forest.height * scale)
forest = forest.resize((fw, fh), Image.LANCZOS)
left = (fw - W) // 2
forest = forest.crop((left, 0, left + W, min(fh, H)))
if forest.height < H:  # страховка от округления
    pad = Image.new("RGB", (W, H), forest.getpixel((W // 2, forest.height - 1)))
    pad.paste(forest, (0, 0))
    forest = pad
print(f"forest: {forest.size}")

# 3) Новый логотип: ширина = ширина старого bbox (чуть больше для аккуратности),
#    центр по X = центр старого bbox, верх по Y старого bbox
logo = Image.open(NEW_LOGO).convert("RGBA")
target_w = int((x1 - x0) * 1.03)
logo_w, logo_h = logo.size
new_h = round(logo_h * target_w / logo_w)
logo_r = logo.resize((target_w, new_h), Image.LANCZOS)
cx = (x0 + x1) // 2
px = cx - target_w // 2
py = max(10, y0 - round((new_h - (y1 - y0)) * 0.45))  # центрируем блок по вертикали старого
print(f"new logo: w={target_w} h={new_h}, pos=({px},{py})")

card = forest.convert("RGBA")
card.alpha_composite(logo_r, (px, py))
card.convert("RGB").save(OUT, quality=90)
print("saved:", OUT)

# 4) Превью для визуальной проверки (на светлом и тёмном фоне карточки)
prev = card.convert("RGB")
prev.thumbnail((420, 560))
prev.save("/tmp/v3-preview.jpg", quality=80)
print("preview: /tmp/v3-preview.jpg")
