"""Обработка фото Эдуарда Голюка: кроп 3:4, ресайз до 720x960, JPG q86."""
from PIL import Image

SRC = "/home/z/my-project/scripts/golyuk-raw.png"
DST = "/home/z/my-project/public/images/team-golyuk.jpg"

img = Image.open(SRC).convert("RGB")
w, h = img.size  # 364x482

# Кроп до точного 3:4 (по ширине, по центру)
target_ratio = 3 / 4
new_w = int(h * target_ratio)  # 361
left = (w - new_w) // 2
img = img.crop((left, 0, left + new_w, h))

# Ресайз до 720x960
img = img.resize((720, 960), Image.LANCZOS)
img.save(DST, "JPEG", quality=86, optimize=True, progressive=True)

import os
print("saved:", DST, img.size, os.path.getsize(DST) // 1024, "KB")
