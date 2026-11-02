#!/usr/bin/env python3
"""Remove opaque white background from logo-pismo.png via border flood fill."""
from collections import deque

import numpy as np
from PIL import Image

SRC = "/home/z/my-project/public/images/logo-pismo.png"
DST = "/home/z/my-project/public/images/logo-pismo-clean.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
h, w = arr.shape[:2]

rgb = arr[..., :3].astype(int)
# near-white mask (threshold 238 on all channels)
whiteish = (rgb[..., 0] >= 238) & (rgb[..., 1] >= 238) & (rgb[..., 2] >= 238)

# BFS from border pixels that are whiteish
outside = np.zeros((h, w), dtype=bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if whiteish[y, x] and not outside[y, x]:
            outside[y, x] = True
            q.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if whiteish[y, x] and not outside[y, x]:
            outside[y, x] = True
            q.append((y, x))

while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and whiteish[ny, nx] and not outside[ny, nx]:
            outside[ny, nx] = True
            q.append((ny, nx))

# soft edge: pixels adjacent to outside that are near-white get partial alpha
alpha = arr[..., 3].copy()
alpha[outside] = 0
# feather: near-white pixels not outside but adjacent to outside -> semi
near = whiteish & ~outside
# dilate outside by 1
dil = outside.copy()
dil[1:, :] |= outside[:-1, :]
dil[:-1, :] |= outside[1:, :]
dil[:, 1:] |= outside[:, :-1]
dil[:, :-1] |= outside[:, 1:]
feather = near & dil
alpha[feather] = 90

arr[..., 3] = alpha
Image.fromarray(arr).save(DST)

# report
removed = int(outside.sum()) + int(feather.sum())
print(f"removed {removed} px of {h * w} ({100 * removed / (h * w):.1f}%)")
print("saved", DST)
