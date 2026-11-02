#!/usr/bin/env python3
"""Превью шрифта Archangelsk: как выглядят слова логотипа."""
from PIL import Image, ImageDraw, ImageFont

FONT = "/home/z/.fonts/ARCHANGELSK.TTF"

img = Image.new("RGB", (1600, 700), (10, 10, 10))
d = ImageDraw.Draw(img)

f_big = ImageFont.truetype(FONT, 130)
f_small = ImageFont.truetype(FONT, 60)

# КИНОСТУДИЯ красным
t1 = "КИНОСТУДИЯ"
b1 = d.textbbox((0, 0), t1, font=f_small)
d.text(((1600 - (b1[2] - b1[0])) / 2, 60), t1, font=f_small, fill=(220, 30, 30))

# РОСТОВФИЛЬМ белым
t2 = "РОСТОВФИЛЬМ"
b2 = d.textbbox((0, 0), t2, font=f_big)
d.text(((1600 - (b2[2] - b2[0])) / 2, 180), t2, font=f_big, fill=(245, 245, 245))

# Образец заголовка
t3 = "За рекой времени"
b3 = d.textbbox((0, 0), t3, font=f_small)
d.text(((1600 - (b3[2] - b3[0])) / 2, 420), t3, font=f_small, fill=(200, 200, 200))

t4 = "АБВГДЕЁЖЗИЙКЛМН"
b4 = d.textbbox((0, 0), t4, font=ImageFont.truetype(FONT, 40))
d.text(((1600 - (b4[2] - b4[0])) / 2, 560), t4, font=ImageFont.truetype(FONT, 40), fill=(150, 150, 150))

img.save("/home/z/my-project/scripts/font-preview.png")
print("saved font-preview.png")
