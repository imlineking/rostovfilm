import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * Собственная капча без внешних сервисов:
 *  - код из 5 цифр рисуется в SVG отрезками (path/polyline) — текстовых узлов нет,
 *    поэтому бот не может «прочитать» ответ из разметки;
 *  - ответ сервер хранит не в открытом виде, а как HMAC-подпись в токене
 *    (stateless, без БД), токен живёт 10 минут;
 *  - ограничение попыток подбора на один токен.
 */

const CODE_LENGTH = 5;
const TOKEN_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;

/** Цифры без похожих символов (нет 0/1 — их легко перепутать с О/l). */
const DIGITS = "23456789";

function secret(): string {
  return (
    process.env.STUDIO_CAPTCHA_SECRET ||
    createHash("sha256")
      .update(process.env.MAX_BOT_TOKEN || "rostovfilm-captcha-fallback")
      .digest("hex")
  );
}

function hmac(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createToken(code: string, ttlMs: number = TOKEN_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = `${code}.${exp}`;
  const sig = hmac(payload);
  return Buffer.from(`${payload}.${sig}`, "utf8").toString("base64url");
}

/** Нормализация ответа: оставляем только цифры. */
function normalizeAnswer(answer: string): string {
  return answer.replace(/\D+/g, "");
}

export type CaptchaResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "attempts" };

/** Не более MAX_ATTEMPTS неудачных проверок на один токен. */
const attempts = new Map<string, number>();

function bumpAttempts(sig: string): number {
  const next = (attempts.get(sig) ?? 0) + 1;
  attempts.set(sig, next);
  if (attempts.size > 1000) {
    // простая чистка: токены одноразовые по TTL, карта не должна расти вечно
    for (const key of attempts.keys()) {
      attempts.delete(key);
      if (attempts.size <= 500) break;
    }
  }
  return next;
}

export function verifyCaptcha(token: string, answer: string): CaptchaResult {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "invalid" };
  }

  const parts = decoded.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };

  const [code, expStr, sig] = parts;
  if (!/^\d{4,8}$/.test(code) || !/^\d{13,16}$/.test(expStr)) {
    return { ok: false, reason: "invalid" };
  }

  const expected = Buffer.from(hmac(`${code}.${expStr}`), "hex");
  let provided: Buffer;
  try {
    provided = Buffer.from(sig, "hex");
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, reason: "invalid" };
  }

  if (Date.now() > Number(expStr)) return { ok: false, reason: "expired" };

  if (bumpAttempts(sig) > MAX_ATTEMPTS) return { ok: false, reason: "attempts" };

  if (normalizeAnswer(answer) !== code) return { ok: false, reason: "invalid" };

  return { ok: true };
}

/* ---------- Рисование SVG ---------- */

/** Сегменты семисегментного шаблона на сетке: x ∈ [0..1], y ∈ [0..2]. */
const SEGMENTS: Record<string, [number, number][]> = {
  a: [[0.1, 0], [0.9, 0]],
  b: [[1, 0.08], [1, 0.92]],
  c: [[1, 1.08], [1, 1.92]],
  d: [[0.1, 2], [0.9, 2]],
  e: [[0, 1.08], [0, 1.92]],
  f: [[0, 0.08], [0, 0.92]],
  g: [[0.1, 1], [0.9, 1]],
};

const DIGIT_SEGS: Record<string, string[]> = {
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "b", "g", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "c", "d"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

const CHAR_COLORS = ["#e85d4f", "#f0e9e4", "#d94f42", "#e6d9d1", "#c94a3e"];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Сегмент → polyline из 3 точек с дрожанием (эффект рукописности). */
function segmentPath(
  points: [number, number][],
  scale: number,
  ox: number,
  oy: number
): string {
  const jittered = points.map(([gx, gy]) => [
    ox + gx * scale + rand(-1.2, 1.2),
    oy + gy * scale + rand(-1.2, 1.2),
  ]);
  const [x1, y1] = jittered[0];
  const [x2, y2] = jittered[1];
  const mx = (x1 + x2) / 2 + rand(-1.6, 1.6);
  const my = (y1 + y2) / 2 + rand(-1.6, 1.6);
  return `${x1.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += DIGITS[Math.floor(Math.random() * DIGITS.length)];
  }
  return code;
}

function drawNoise(width: number, height: number): string {
  let svg = "";
  for (let i = 0; i < 3; i++) {
    const y = rand(8, height - 8);
    const c1x = rand(width * 0.2, width * 0.4);
    const c1y = y + rand(-18, 18);
    const c2x = rand(width * 0.6, width * 0.8);
    const c2y = y + rand(-18, 18);
    const color = i === 1 ? "#a34a3f" : "#6f5a53";
    svg += `<path d="M -10 ${y.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${width + 10} ${(y + rand(-10, 10)).toFixed(1)}" fill="none" stroke="${color}" stroke-width="1" opacity="0.4"/>`;
  }
  for (let i = 0; i < 18; i++) {
    svg += `<circle cx="${rand(4, width - 4).toFixed(1)}" cy="${rand(4, height - 4).toFixed(1)}" r="${rand(0.7, 1.7).toFixed(1)}" fill="#8a6f66" opacity="0.35"/>`;
  }
  return svg;
}

/** Рисуем SVG-капчу для конкретного кода (дрожание/наклон случайны при каждом вызове). */
export function drawCodeSvg(code: string): string {
  // Размеры захардкожены НАРОЧНО: минификатор Turbopack при свёртке
  // константных интерполяций вида ${width} портит хвост шаблонной строки
  // (проверено: из бандла исчезает closing "> и SVG становится не-XML).
  // Плюс без role/aria внутри: картинка вставляется через <img alt="",
  // а роль и подпись уже на контейнерном div.
  const scale = 15; // высота цифры 30px
  const startX = 20;
  const gap = 12; // шаг между цифрами

  let chars = "";
  [...code].forEach((digit, i) => {
    const ox = startX + i * (scale + gap);
    const oy = rand(10, 14);
    const cx = ox + scale / 2;
    const cy = oy + scale;
    const rotate = rand(-14, 14).toFixed(1);
    const color = CHAR_COLORS[i % CHAR_COLORS.length];
    const strokeWidth = rand(2.5, 3.2).toFixed(1);
    const opacity = rand(0.85, 1).toFixed(2);

    const polylines = (DIGIT_SEGS[digit] ?? [])
      .map((segKey) => {
        const pts = segmentPath(SEGMENTS[segKey], scale, ox, oy);
        return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
      })
      .join("");

    chars += `<g transform="rotate(${rotate} ${cx.toFixed(1)} ${cy.toFixed(1)})">${polylines}</g>`;
  });

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="170" height="54" viewBox="0 0 170 54">' +
    '<rect width="170" height="54" fill="#201a18"/>' +
    drawNoise(170, 54) +
    chars +
    "</svg>"
  );
}

export function generateCaptcha(): { code: string; token: string; svg: string } {
  const code = randomCode();
  const token = createToken(code);
  return { code, token, svg: drawCodeSvg(code) };
}

/**
 * Достаём код из токена (проверяя подпись и срок) — чтобы отдать картинку
 * отдельным эндпоинтом /api/captcha/image?t=<token> без хранения состояния.
 */
export function codeFromToken(token: string): string | null {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const [code, expStr, sig] = decoded.split(".");
  if (!code || !expStr || !sig) return null;
  if (!/^\d{4,8}$/.test(code) || !/^\d{13,16}$/.test(expStr)) return null;
  const expected = Buffer.from(hmac(`${code}.${expStr}`), "hex");
  let provided: Buffer;
  try {
    provided = Buffer.from(sig, "hex");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }
  if (Date.now() > Number(expStr)) return null;
  return code;
}
