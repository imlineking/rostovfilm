#!/usr/bin/env python3
"""Замена фото Ильи Чистова (режиссёр) на новое: PNG 1086x1448 -> JPG 720x960."""
from PIL import Image

SRC = "/home/z/my-project/upload/pasted_image_1793648033778.png"
DST = "/home/z/my-project/public/images/team-chistov.jpg"

im = Image.open(SRC).convert("RGB")
w, h = im.size
print("исходник:", im.size, f"пропорция {w/h:.3f}")

# Целевая пропорция 3:4 (как у остальных фото команды)
target_ratio = 3 / 4
cur_ratio = w / h
if cur_ratio > target_ratio:  # шире, чем нужно -> режем края по ширине
    new_w = round(h * target_ratio)
    x0 = (w - new_w) // 2
    im = im.crop((x0, 0, x0 + new_w, h))
elif cur_ratio < target_ratio:  # уже -> режем по высоте сверху-вниз (лицо сверху)
    new_h = round(w / target_ratio)
    im = im.crop((0, 0, w, new_h))

im = im.resize((720, 960), Image.LANCZOS)
im.save(DST, "JPEG", quality=86, optimize=True, progressive=True)

import os
print("готово:", DST, im.size, os.path.getsize(DST) // 1024, "КБ")
