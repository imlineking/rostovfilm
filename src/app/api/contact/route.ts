import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { notifyNewRequest } from "@/lib/notify";
import { verifyCaptcha } from "@/lib/captcha";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя (минимум 2 символа)")
    .max(80, "Имя слишком длинное"),
  contact: z
    .string()
    .trim()
    .min(5, "Укажите телефон, email или мессенджер")
    .max(120, "Контакт слишком длинный"),
  projectType: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000, "Сообщение слишком длинное").optional().or(z.literal("")),
  // капча: токен от /api/captcha + цифры с картинки
  captchaToken: z.string().min(10, "Обновите проверку").max(600),
  captchaCode: z
    .string()
    .regex(/^[0-9\s-]{4,10}$/, "Введите цифры с картинки"),
  // honeypot: невидимое для человека поле, боты заполняют его
  company: z.string().max(300).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Некорректный формат запроса" },
        { status: 400 }
      );
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Проверьте заполнение полей",
        },
        { status: 400 }
      );
    }

    const { name, contact, projectType, message, captchaToken, captchaCode, company } =
      parsed.data;

    // Honeypot заполнен → молча имитируем успех: бот не узнаёт, что раскрыт,
    // заявка не сохраняется и уведомления не отправляются
    if (company && company.trim().length > 0) {
      console.log(
        "[contact] honeypot заполнен — спам отклонён:",
        name.slice(0, 40)
      );
      return NextResponse.json({ ok: true, id: "skipped" }, { status: 201 });
    }

    const captcha = verifyCaptcha(captchaToken, captchaCode);
    if (!captcha.ok) {
      return NextResponse.json(
        {
          ok: false,
          captchaInvalid: true,
          error:
            captcha.reason === "expired"
              ? "Время истекло — обновите картинку и введите новый код"
              : captcha.reason === "attempts"
                ? "Слишком много попыток — обновите картинку и введите новый код"
                : "Неверный код с картинки — попробуйте ещё раз",
        },
        { status: 400 }
      );
    }

    // Лимит заявок с одного IP (считаются только прошедшие капчу —
    // живые заявки): защита базы и уведомлений от флуда
    const ip = clientIpFromHeaders(req.headers);
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      const minutes = Math.max(1, Math.ceil(rate.retryAfterSec / 60));
      console.log(
        `[contact] лимит исчерпан (${ip}): ${rate.limit} заявок / ${rate.windowMin} мин, retry через ${rate.retryAfterSec}с`
      );
      return NextResponse.json(
        {
          ok: false,
          error: `Слишком много заявок с одного адреса — не больше ${rate.limit} за ${rate.windowMin} минут. Попробуйте через ${minutes} мин. или напишите нам в ВКонтакте — ссылка в разделе «Контакты».`,
        },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const saved = await db.contactRequest.create({
      data: {
        name,
        contact,
        projectType: projectType || null,
        message: message || null,
      },
    });

    // Уведомления (e-mail на Яндекс + бот MAX): ошибки не ломают приём заявки
    await notifyNewRequest({
      id: saved.id,
      name,
      contact,
      projectType: projectType || null,
      message: message || null,
    });

    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (err) {
    console.error("[/api/contact] error:", err);
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку. Попробуйте позже." },
      { status: 500 }
    );
  }
}
