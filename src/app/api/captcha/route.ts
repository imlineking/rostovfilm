import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

/**
 * Выдаёт новую капчу: подписанный токен + картинка.
 *
 * SVG отдаётся в двух видах:
 *  - svg   — исходная разметка (совместимость/отладка);
 *  - svgB64 — base64 того же SVG: клиент показывает её через
 *    <img src="data:image/svg+xml;base64,...">. Это обходит санитайзеры
 *    и прокси, которые «чистят» SVG-разметку в JSON-ответах (из-за них
 *    на внешнем деплое капча приезжала пустой), и не зависит от CSP,
 *    запрещающей innerHTML.
 */
export function GET() {
  const { svg, token } = generateCaptcha();
  const svgB64 = Buffer.from(svg, "utf8").toString("base64");
  return NextResponse.json(
    { svg, svgB64, token },
    { headers: { "Cache-Control": "no-store" } }
  );
}
