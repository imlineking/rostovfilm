#!/usr/bin/env python3
"""Извлечение фотографий из PDF «ЗА РЕКОЙ ВРЕМЕНИ_с охватом.pdf»."""
import fitz
import os

candidates = [f for f in os.listdir("/home/z/my-project/upload")
              if f.lower().endswith(".pdf") and "охватом" in f]
SRC = os.path.join("/home/z/my-project/upload", candidates[0])
OUT = "/home/z/my-project/scripts/reka-imgs"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(SRC)
print("pages:", len(doc))

count = 0
seen = set()
for pno in range(len(doc)):
    page = doc[pno]
    for img in page.get_images(full=True):
        xref = img[0]
        if xref in seen:
            continue
        seen.add(xref)
        try:
            pix = fitz.Pixmap(doc, xref)
        except Exception as e:
            print("err", xref, e)
            continue
        if pix.width < 500 or pix.height < 400:
            continue  # мелкие иконки пропускаем
        if pix.colorspace and pix.colorspace.n > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        name = f"p{pno+1:02d}_x{xref}_{pix.width}x{pix.height}.png"
        pix.save(os.path.join(OUT, name))
        count += 1

print("saved:", count)
for f in sorted(os.listdir(OUT)):
    print(" ", f)
