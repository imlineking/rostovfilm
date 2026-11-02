import nodemailer from "nodemailer";

/**
 * Уведомления о новых заявках с сайта:
 *  1) письмо на внешний Яндекс-ящик студии (SMTP);
 *  2) сообщение от бота в мессенджер MAX.
 *
 * Все переменные окружения необязательны: если что-то не настроено,
 * соответствующий канал просто пропускается — приём заявок не ломается.
 * Никогда не бросаем исключение наружу: сохранение в БД важнее уведомлений.
 *
 * ENV:
 *  STUDIO_SMTP_HOST     (по умолчанию smtp.yandex.ru)
 *  STUDIO_SMTP_PORT     (по умолчанию 465)
 *  STUDIO_SMTP_USER     — ящик-отправитель (нужен «пароль приложения» Яндекс 360)
 *  STUDIO_SMTP_PASS     — пароль приложения
 *  STUDIO_NOTIFY_EMAIL  — получатель (внешний Яндекс-ящик; можно несколько через запятую)
 *  STUDIO_FROM_NAME     (по умолчанию «Сайт Ростовфильм»)
 *  MAX_BOT_TOKEN        — токен бота MAX (платформа dev.max.ru → Чат-боты)
 *  MAX_CHAT_ID          — ID чата/диалога с ботом (бот пишет туда)
 */

export type RequestPayload = {
  id: string;
  name: string;
  contact: string;
  projectType?: string | null;
  message?: string | null;
};

const SMTP_HOST = process.env.STUDIO_SMTP_HOST || "smtp.yandex.ru";
const SMTP_PORT = Number(process.env.STUDIO_SMTP_PORT || 465);
const SMTP_USER = process.env.STUDIO_SMTP_USER;
const SMTP_PASS = process.env.STUDIO_SMTP_PASS;
const NOTIFY_EMAIL = process.env.STUDIO_NOTIFY_EMAIL;
const FROM_NAME = process.env.STUDIO_FROM_NAME || "Сайт Ростовфильм";

const MAX_TOKEN = process.env.MAX_BOT_TOKEN;
const MAX_CHAT_ID = process.env.MAX_CHAT_ID;
const MAX_API = "https://platform-api2.max.ru";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rows(p: RequestPayload): Array<[string, string]> {
  return [
    ["Имя", p.name],
    ["Контакт", p.contact],
    ["Тип проекта", p.projectType || "—"],
    ["Сообщение", p.message || "—"],
  ];
}

function emailHtml(p: RequestPayload): string {
  const body = rows(p)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 14px;border:1px solid #ddd;color:#666;font-size:13px;white-space:nowrap">${k}</td>` +
        `<td style="padding:8px 14px;border:1px solid #ddd;font-size:14px"><b>${escapeHtml(v)}</b></td></tr>`,
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="color:#c22">Новая заявка с сайта</h2>
    <table style="border-collapse:collapse;width:100%">${body}</table>
    <p style="color:#999;font-size:12px;margin-top:14px">
      Заявка №${escapeHtml(p.id)} · ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} (МСК) ·
      источник: ${escapeHtml(SITE_URL)}
    </p>
  </div>`;
}

function emailText(p: RequestPayload): string {
  const lines = rows(p).map(([k, v]) => `${k}: ${v}`);
  return [
    "НОВАЯ ЗАЯВКА С САЙТА",
    ...lines,
    `Заявка №${p.id} · ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} (МСК)`,
  ].join("\n");
}

function maxText(p: RequestPayload): string {
  const lines = rows(p)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `🎬 Новая заявка с сайта Ростовфильм\n\n${lines}\n\n№${p.id} · ${new Date().toLocaleString(
    "ru-RU",
    { timeZone: "Europe/Moscow" },
  )} (МСК)`;
}

async function sendEmail(p: RequestPayload): Promise<void> {
  if (!SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    console.log("[notify] e-mail не настроен (STUDIO_SMTP_USER/STUDIO_SMTP_PASS/STUDIO_NOTIFY_EMAIL) — пропуск");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${SMTP_USER}>`,
    to: NOTIFY_EMAIL,
    replyTo: p.contact.includes("@") ? p.contact : undefined,
    subject: `Новая заявка с сайта — ${p.name}${p.projectType ? ` · ${p.projectType}` : ""}`,
    text: emailText(p),
    html: emailHtml(p),
  });
  console.log(`[notify] письмо отправлено на ${NOTIFY_EMAIL}`);
}

async function sendMax(p: RequestPayload): Promise<void> {
  if (!MAX_TOKEN || !MAX_CHAT_ID) {
    console.log("[notify] MAX не настроен (MAX_BOT_TOKEN/MAX_CHAT_ID) — пропуск");
    return;
  }
  const res = await fetch(`${MAX_API}/messages?chat_id=${encodeURIComponent(MAX_CHAT_ID)}`, {
    method: "POST",
    headers: { Authorization: MAX_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ text: maxText(p) }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`MAX API ${res.status}: ${t.slice(0, 300)}`);
  }
  console.log("[notify] сообщение отправлено в MAX");
}

/** Отправляет уведомления во все настроенные каналы. Ошибки логируются, не бросаются. */
export async function notifyNewRequest(p: RequestPayload): Promise<void> {
  const tasks: Array<Promise<void>> = [];
  if (SMTP_USER && SMTP_PASS && NOTIFY_EMAIL) tasks.push(sendEmail(p).catch((e) => console.error("[notify] e-mail ошибка:", e?.message ?? e)));
  if (MAX_TOKEN && MAX_CHAT_ID) tasks.push(sendMax(p).catch((e) => console.error("[notify] MAX ошибка:", e?.message ?? e)));
  if (!tasks.length) {
    console.log("[notify] уведомления не настроены (STUDIO_SMTP_* / MAX_* в .env.local отсутствуют) — заявка сохранена в БД, отправка пропущена");
    return;
  }
  await Promise.allSettled(tasks);
}
