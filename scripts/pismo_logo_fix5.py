# Корректирующий проход v5 поверх результата fix4.
# 1) Восстановить хвост «ь» из бэкапа (блок x 496-540, y 156-200), затем в этом блоке
#    снова убрать артефакт-клин (bright при x >= 508 — хвост «ь» кончается на x=506).
# 2) добить белые кромки: правый/нижний край заливки «с», полумесяц в «о».
# Заливка зелёным: построчный поиск ближайшего зелёного (как в fix4).
from PIL import Image
import numpy as np

CARD = "/home/z/my-project/public/images/card-pismo-final.jpg"
BACKUP = "/home/z/my-project/scripts/backup-card-pismo-final.jpg"
cur = np.asarray(Image.open(CARD).convert("RGB"), dtype=np.int16)
bak = np.asarray(Image.open(BACKUP).convert("RGB"), dtype=np.int16)
H, W, _ = cur.shape
R, G, B = cur[..., 0], cur[..., 1], cur[..., 2]
navy = (B > R + 25) & (B > 80) & (R < 130)
bright = (R > 175) & (G > 160) & (B > 105) & ~navy
green = (G > R + 8) & (G > B + 8) & (G > 70)

result = cur.astype(np.float64)

# 1) хвост «ь»: вернуть из бэкапа, затем убрать клин правее x=508
block = bak[156:200, 496:540].astype(np.float64)
result[156:200, 496:540] = block
R2, G2, B2 = result[..., 0], result[..., 1], result[..., 2]
navy2 = (B2 > R2 + 25) & (B2 > 80) & (R2 < 130)
bright2 = (R2 > 175) & (G2 > 160) & (B2 > 105) & ~navy2
wedge = np.zeros((H, W), bool)
wedge[160:196, 508:540] = True
wedge &= bright2
print("wedge px:", int(wedge.sum()))

# 2) добить кромки
extra = np.zeros((H, W), bool)
extra[108:146, 413:430] = bright[108:146, 413:430]   # правая кромка «с»
extra[134:152, 376:420] = bright[134:152, 376:420]   # нижняя кромка «с»
extra[124:174, 644:684] = bright2[124:174, 644:684]  # полумесяц «о»
print("extra px:", int(extra.sum()))

fix = wedge | extra
fill = fix.copy()
it = 0
ys, xs = np.where(fill)
for y, x in zip(ys, xs):
    it += 1
    best = None
    for step in range(1, 80):
        for xx in (x - step, x + step):
            if 0 <= xx < W and green[y, xx]:
                best = result[y, xx]; break
        if best is None:
            for yy in (y - step, y + step):
                if 0 <= yy < H and green[yy, x]:
                    best = result[yy, x]; break
        if best is not None:
            break
    if best is None:
        best = result[green].mean(axis=0)
    result[y, x] = best
print("filled:", it)

out = np.clip(result, 0, 255).astype(np.uint8)
Image.fromarray(out).save(CARD, quality=92)
chk = Image.fromarray(out)
c1 = chk.crop((360, 90, 460, 165)).resize((100 * 6, 75 * 6), Image.LANCZOS)
c2 = chk.crop((630, 115, 700, 180)).resize((70 * 6, 65 * 6), Image.LANCZOS)
c3 = chk.crop((480, 140, 560, 210)).resize((80 * 6, 70 * 6), Image.LANCZOS)
canvas = Image.new("RGB", (600, c1.height + c2.height + c3.height + 16), "black")
canvas.paste(c1, (0, 0)); canvas.paste(c2, (0, c1.height + 8)); canvas.paste(c3, (0, c1.height + c2.height + 16))
canvas.save("/tmp/frames/pismo-after5.png")
print("saved + zoom")
