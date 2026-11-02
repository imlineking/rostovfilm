import { NextRequest, NextResponse } from "next/server";
import { codeFromToken, drawCodeSvg } from "@/lib/captcha";

export const dynamic = "force-dynamic";

/**
 * Резервная выдача капчи картинкой по токену: /api/captcha/image?t=<token>.
 * Используется клиентом, если data:-URL не отрисовался (строгий CSP).
 * Токен подписан и живёт 10 минут — состояние на сервере не нужно.
 */
export function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t") ?? "";
  const code = token ? codeFromToken(token) : null;
  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Токен капчи недействителен — обновите картинку" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }
  return new NextResponse(drawCodeSvg(code), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
