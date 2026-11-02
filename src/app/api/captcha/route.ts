import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

/** Выдаёт новую капчу: SVG-картинка + подписанный токен. */
export function GET() {
  const { svg, token } = generateCaptcha();
  return NextResponse.json(
    { svg, token },
    { headers: { "Cache-Control": "no-store" } }
  );
}
