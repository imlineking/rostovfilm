#!/usr/bin/env python3
"""Генерация SEO-изображений киностудии «Ростовфильм».

Создаёт:
  src/app/opengraph-image.jpg      — картинка для OpenGraph (1200x630)
  src/app/twitter-image.jpg        — картинка для Twitter Card (1200x630)
  src/app/opengraph-image.alt.txt / twitter-image.alt.txt
  src/app/apple-icon.png           — иконка Apple (180x180)
  src/app/favicon.ico              — фавикон (16/32/48)
  public/icons/icon-192.png, icon-512.png — иконки для manifest.webmanifest

Дизайн: тёмный фон сайта (#201a18), красный акцент (#e85d4f), хлопушка-кинематограф,
шрифт DejaVu (есть кириллица).
"""
from PIL import Image, ImageDraw, ImageFont
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BG = (32, 26, 24)        # #201a18 — фон сайта
RED = (232, 93, 79)      # #e85d4f — красный акцент
FG = (245, 240, 235)     # почти белый
MUTED = (184, 171, 164)  # приглушённый серо-тёплый
STRIP = (45, 37, 33)     # плёнка чуть светлее фона

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def draw_clapper(d: ImageDraw.ImageDraw, x: float, y: float, s: float,
                 body=RED, dark=BG) -> None:
    """Хлопушка: корпус + верхняя планка с диагональными полосами."""
    # корпус
    d.rounded_rectangle([x, y + s * 0.46, x + s, y + s], radius=s * 0.09, fill=body)
    # планка
    d.rounded_rectangle([x, y + s * 0.16, x + s, y + s * 0.40], radius=s * 0.06, fill=body)
    # диагональные полосы на планке
    for i in range(4):
        x0 = x + s * (0.03 + i * 0.25)
        d.polygon(
            [
                (x0, y + s * 0.16),
                (x0 + s * 0.15, y + s * 0.16),
                (x0 + s * 0.07, y + s * 0.40),
                (x0 - s * 0.08, y + s * 0.40),
            ],
            fill=dark,
        )
    # две «строчки» на корпусе — отсылка к перфорации
    for k in (0.60, 0.78):
        d.rounded_rectangle(
            [x + s * 0.08, y + s * k, x + s * 0.92, y + s * (k + 0.06)],
            radius=s * 0.03,
            fill=dark,
        )


def film_strip(d: ImageDraw.ImageDraw, y: int, h: int, w: int) -> None:
    """Горизонтальная киноплёнка во всю ширину."""
    d.rectangle([0, y, w, y + h], fill=STRIP)
    hole = h - 16
    x = 12
    while x + hole <= w - 12:
        d.rounded_rectangle([x, y + 8, x + hole, y + h - 8], radius=3, fill=BG)
        x += hole + 14


def make_og(path: str) -> None:
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    film_strip(d, 0, 40, W)
    film_strip(d, H - 40, 40, W)

    # VK в правом верхнем углу (под плёнкой)
    vk = "vk.ru/rostovfilm"
    vw = d.textlength(vk, font=font(FONT_REG, 30))
    d.text((W - 84 - vw, 74), vk, font=font(FONT_REG, 30), fill=MUTED)

    # хлопушка и подпись
    draw_clapper(d, 84, 104, 116)
    d.text((84, 268), "КИНОСТУДИЯ ПОЛНОГО ЦИКЛА", font=font(FONT_BOLD, 34), fill=RED)

    # заголовок
    d.text((78, 322), "РОСТОВФИЛЬМ", font=font(FONT_BOLD, 118), fill=FG)

    # подзаголовок
    d.text((84, 476), "Ростов-на-Дону · видео- и кинопроизводство",
           font=font(FONT_REG, 38), fill=MUTED)

    img.save(path, "JPEG", quality=88, optimize=True)
    print("og:", path, img.size)


def make_icon(path: str, size: int, rounded: bool = False) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, size, size], radius=int(size * 0.22), fill=BG + (255,))
    else:
        d.rectangle([0, 0, size, size], fill=BG + (255,))
    s = size * 0.62
    draw_clapper(d, size * 0.19, size * 0.19, s)
    img.save(path)
    print("icon:", path, img.size)


def main() -> None:
    app = os.path.join(ROOT, "src", "app")
    icons_dir = os.path.join(ROOT, "public", "icons")
    os.makedirs(icons_dir, exist_ok=True)

    # OG / Twitter
    og_path = os.path.join(app, "opengraph-image.jpg")
    make_og(og_path)
    shutil.copyfile(og_path, os.path.join(app, "twitter-image.jpg"))

    alt = "Киностудия «Ростовфильм» — киностудия полного цикла в Ростове-на-Дону"
    for name in ("opengraph-image.alt.txt", "twitter-image.alt.txt"):
        with open(os.path.join(app, name), "w", encoding="utf-8") as f:
            f.write(alt)

    # иконки
    make_icon(os.path.join(app, "apple-icon.png"), 180)
    make_icon(os.path.join(icons_dir, "icon-192.png"), 192)
    make_icon(os.path.join(icons_dir, "icon-512.png"), 512)

    # favicon: скруглённый квадрат, несколько размеров в одном .ico
    base = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    d = ImageDraw.Draw(base)
    d.rounded_rectangle([0, 0, 256, 256], radius=56, fill=BG + (255,))
    draw_clapper(d, 256 * 0.19, 256 * 0.19, 256 * 0.62)
    base.resize((48, 48), Image.LANCZOS).save(
        os.path.join(app, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print("icon: favicon.ico (16/32/48)")


if __name__ == "__main__":
    main()
