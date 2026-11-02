# Чистка логотипа «Письмо» на card-pismo-final.jpg через привязку к чистому оригиналу.
# Идея: в logo-pismo.png (2458x1221, белый фон) тот же логотип, но проёмы с/о и клин над
# конвертом — фон (белый), а на карточке их ошибочно залили кремом, плюс по контурам
# осталась бахрома старого фона. Карта: card -> clean (масштаб по осям). Пиксели карточки,
# которые в чистом оригинале являются фоном, перекрашиваются в зелёный (текстура вокруг).
from PIL import Image
import numpy as np
from scipy import ndimage

CARD = "/home/z/my-project/public/images/card-pismo-final.jpg"
CLEAN = "/home/z/my-project/public/images/logo-pismo.png"

card = np.asarray(Image.open(CARD).convert("RGB"), dtype=np.int16)
clean = np.asarray(Image.open(CLEAN).convert("RGB"), dtype=np.int16)

def masks(a):
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    navy = (B > R + 25) & (B > 80) & (R < 130)
    cream = (R > 195) & (G > 185) & (B > 120) & (R > B + 18) & ~navy
    return navy, cream

cnavy, ccream = masks(card)
knavy, kcream = masks(clean)
kbright = (clean[..., 0] > 190) & (clean[..., 1] > 180) & (clean[..., 2] > 110)
klogo = knavy | kcream

# bbox логотипа на карточке считаем ТОЛЬКО внутри известного окна логотипа,
# иначе кремовые элементы открытки (ёжик, поляна) ломают привязку
win = np.zeros(card.shape[:2], bool)
win[30:320, 100:780] = True
clogo_win = (cnavy | ccream) & win

def bbox(m):
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max(), ys.max()

cx0, cy0, cx1, cy1 = bbox(clogo_win)
kx0, ky0, kx1, ky1 = bbox(klogo)
print("card logo bbox:", (cx0, cy0, cx1, cy1))
print("clean logo bbox:", (kx0, ky0, kx1, ky1))

# карта: пиксель карточки (x, y) -> чистый оригинал
sx = (kx1 - kx0) / (cx1 - cx0)
sy = (ky1 - ky0) / (cy1 - cy0)
print(f"scale x={sx:.4f} y={sy:.4f}")

Xs = np.arange(card.shape[1])
Ys = np.arange(card.shape[0])
map_x = np.round((Xs - cx0) * sx + kx0).astype(int).clip(0, clean.shape[1] - 1)
map_y = np.round((Ys - cy0) * sy + ky0).astype(int).clip(0, clean.shape[0] - 1)
MX, MY = np.meshgrid(map_x, map_y)
clean_at = clean[MY, MX]  # цвет чистого оригинала, соответствующий каждому пикселю карточки

# согласованность привязки: карточный navy должен попадать в чистый navy
navy_in_logo = cnavy & (MX >= kx0) & (MX <= kx1) & (MY >= ky0) & (MY <= ky1)
mapped_navy = (clean_at[..., 2] > clean_at[..., 0] + 25) & (clean_at[..., 0] < 130)
agree = (mapped_navy & navy_in_logo).sum() / max(navy_in_logo.sum(), 1)
print(f"navy agreement: {agree:.3f} ({navy_in_logo.sum()} px)")

# белый фон в чистом оригинале
clean_bg = (clean_at[..., 0] > 238) & (clean_at[..., 1] > 238) & (clean_at[..., 2] > 225)

# артефакты: на карточке светлое/кремовое (не navy), а в оригинале — фон
R, G, B = card[..., 0], card[..., 1], card[..., 2]
bright = (R > 175) & (G > 160) & (B > 105) & ~cnavy
artifact = bright & clean_bg

# в пределах окна логотипа
artifact &= win
# убираем одиночные пиксели
artifact = ndimage.binary_opening(artifact, np.ones((2, 2)))
print("artifact px:", int(artifact.sum()))

# --- заливка зелёным: итеративное разрастание зелёного фона в маску ---
green = (G > R + 8) & (G > B + 8) & (G > 70)
fill = artifact.copy()
src = green & ~fill
result = card.astype(np.float32)
filled_any = True
it = 0
while fill.any() and filled_any:
    it += 1
    grown = ndimage.binary_dilation(src) & fill
    filled_any = grown.any()
    if not filled_any:
        break
    # цвет = среднее зелёных соседей 3x3
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
    src = src | grown
    fill &= ~grown
print("fill iterations:", it, "unfilled left:", int(fill.sum()))

out = np.clip(result, 0, 255).astype(np.uint8)
Image.fromarray(out).save(CARD, quality=92)
print("saved", CARD)

# контрольный зум проблемных зон
chk = Image.fromarray(out)
c1 = chk.crop((380, 60, 660, 200)).resize((280 * 3, 140 * 3), Image.LANCZOS)
c2 = chk.crop((330, 190, 640, 310)).resize((310 * 3, 120 * 3), Image.LANCZOS)
canvas = Image.new("RGB", (max(c1.width, c2.width), c1.height + c2.height + 8), "black")
canvas.paste(c1, (0, 0)); canvas.paste(c2, (0, c1.height + 8))
canvas.save("/tmp/frames/pismo-after.png")
print("after-zoom saved")
