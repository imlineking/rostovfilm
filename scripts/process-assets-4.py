#!/usr/bin/env python3
"""Итерация 4: логотип «РОСТОВФИЛЬМ» (Archangelsk, слитно) + постер и кадры «За рекой времени»."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

BASE = "/home/z/my-project"
OUT = f"{BASE}/public/images"
ARCH = f"{BASE}/upload/ARCHANGELSK.TTF"
SERIF_B = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SERIF_BI = "/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf"

RED = (226, 35, 26, 255)
WHITE = (245, 245, 245, 255)
NAVY = (14, 20, 30)


def draw_tracked(d, xy, text, font, fill, tracking):
    """Рисует текст с межбуквенным интервалом, возвращает ширину."""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking
    return x - tracking - xy[0]


def tracked_width(text, font, tracking):
    return sum(font.getlength(c) for c in text) + tracking * (len(text) - 1)


def solve_tracking(text, font, target_w):
    """Подбирает межбуквенный интервал под целевую ширину."""
    n = len(text)
    natural = sum(font.getlength(c) for c in text)
    return (target_w - natural) / (n - 1) if n > 1 else 0


# ---------------------------------------------------------------- 1. ЛОГОТИП
# Две строки, слитно: «КИНОСТУДИЯ» (красный) / «РОСТОВФИЛЬМ» (белый, Archangelsk)
W = 2000
f_big = ImageFont.truetype(ARCH, 235)
f_small = ImageFont.truetype(ARCH, 120)

# line2: «РОСТОВФИЛЬМ» почти на всю ширину
t2 = "РОСТОВФИЛЬМ"
tr2 = solve_tracking(t2, f_big, W - 10)
w2 = tracked_width(t2, f_big, tr2)

# line1: «КИНОСТУДИЯ» на ~88% ширины второй строки
t1 = "КИНОСТУДИЯ"
target1 = w2 * 0.88
tr1 = solve_tracking(t1, f_small, target1)
w1 = tracked_width(t1, f_small, tr1)

asc1, desc1 = f_small.getmetrics()
asc2, desc2 = f_big.getmetrics()
gap = 46
H = int(asc1 + desc1 + gap + asc2 + desc2 + 8)

logo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(logo)
draw_tracked(d, (2, 0), t1, f_small, RED, tr1)
draw_tracked(d, (0, asc1 + desc1 + gap), t2, f_big, WHITE, tr2)

logo.save(f"{OUT}/logo-rostovfilm-v2.png")
print("logo:", logo.size, "tr1:", round(tr1, 1), "tr2:", round(tr2, 1))

# --------------------------------------------- 2. ПОСТЕР «ЗА РЕКОЙ ВРЕМЕНИ»
src = Image.open(f"{BASE}/scripts/reka-imgs/p01_x6_1672x941.png").convert("RGB")
art = src.crop((360, 470, 1140, 941))  # 780x471 — без вшитого текста

CW, CH = 900, 1200
poster = Image.new("RGB", (CW, CH), NAVY)
art_r = art.resize((CW, int(art.height * CW / art.width)), Image.LANCZOS)  # 900x544
ay = CH - art_r.height
poster.paste(art_r, (0, ay))

# Плавное перетекание фона в нижний кадр (сверху) и затемнение снизу
grad = Image.new("L", (1, 280), 0)
for i in range(280):
    grad.putpixel((0, i), int(255 * max(0.0, (i / 279 - 0.12) / 0.88) ** 1.35))
mask = grad.resize((CW, 280))
overlay = Image.new("RGB", (CW, 280), NAVY)
poster.paste(overlay, (0, ay), mask)

grad_b = Image.new("L", (1, 150), 0)
for i in range(150):
    grad_b.putpixel((0, i), int(255 * (i / 149) ** 1.6))
poster.paste(Image.new("RGB", (CW, 150), (8, 12, 18)), (0, CH - 150), grad_b.resize((CW, 150)))

d = ImageDraw.Draw(poster)

# верхняя подпись
f_over = ImageFont.truetype(ARCH, 34)
ow = tracked_width("СКАЗКА · ПРИТЧА · 20 МИНУТ", f_over, 10)
draw_tracked(d, ((CW - ow) / 2, 78), "СКАЗКА · ПРИТЧА · 20 МИНУТ", f_over, (226, 35, 26), 10)

# заголовок
f_t1 = ImageFont.truetype(SERIF_B, 150)
f_t2 = ImageFont.truetype(SERIF_BI, 150)
w_a = d.textlength("ЗА РЕКОЙ", font=f_t1)
w_b = d.textlength("ВРЕМЕНИ", font=f_t2)
d.text(((CW - w_a) / 2, 165), "ЗА РЕКОЙ", font=f_t1, fill=(240, 240, 240))
d.text(((CW - w_b) / 2, 330), "ВРЕМЕНИ", font=f_t2, fill=(232, 53, 46))

# слоган
f_tag = ImageFont.truetype(SERIF_B, 27)
tag = "иногда, чтобы найти себя,"
tag2 = "нужно перейти на другую сторону"
for i, t in enumerate([tag, tag2]):
    tw = d.textlength(t, font=f_tag)
    d.text(((CW - tw) / 2, 580 + i * 38), t, font=f_tag, fill=(205, 210, 218))

# подпись студии
f_st = ImageFont.truetype(ARCH, 30)
sw = tracked_width("РОСТОВФИЛЬМ", f_st, 8)
draw_tracked(d, ((CW - sw) / 2, CH - 62), "РОСТОВФИЛЬМ", f_st, (245, 245, 245, 230), 8)

poster.save(f"{OUT}/poster-za-rekoy-v2.jpg", quality=88)
print("poster:", poster.size)

# ------------------------------------------------------- 3. КАДРЫ (для флипа)
p2 = Image.open(f"{BASE}/scripts/reka-imgs/p02_x9_1672x941.png").convert("RGB")
frame1 = p2.crop((1000, 340, 1451, 941))  # 451x601, ~3:4 — трое на набережной, без подписей
frame1.save(f"{OUT}/reka-frame-1.jpg", quality=85)
frame2 = p2.crop((980, 380, 1672, 890))   # 692x510 — план с набережной и мостом
frame2.save(f"{OUT}/reka-frame-2.jpg", quality=85)
print("frames:", frame1.size, frame2.size)
