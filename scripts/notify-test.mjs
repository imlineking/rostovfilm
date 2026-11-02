#!/usr/bin/env node
/**
 * Тест уведомлений вне Next.js:
 *   node --env-file=.env.local scripts/notify-test.mjs            — тест письма
 *   node --env-file=.env.local scripts/notify-test.mjs max <id>   — тест сообщения MAX
 * (MAX требует NODE_EXTRA_CA_CERTS=certs/russian-trusted-ca.pem)
 */
const mode = process.argv[2] || "email";

if (mode === "max") {
  const chatId = process.argv[3];
  if (!process.env.MAX_BOT_TOKEN || !chatId) {
    console.error("Нужны MAX_BOT_TOKEN в .env.local и chat_id аргументом");
    process.exit(1);
  }
  const res = await fetch(`https://platform-api2.max.ru/messages?chat_id=${encodeURIComponent(chatId)}`, {
    method: "POST",
    headers: { Authorization: process.env.MAX_BOT_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ text: "✅ Тест с сайта Ростовфильм: канал MAX работает. Дальше сюда будут приходить заявки с формы." }),
    signal: AbortSignal.timeout(12000),
  });
  console.log("HTTP", res.status, (await res.text()).slice(0, 300));
  process.exit(res.ok ? 0 : 1);
}

// --- email ---
if (!process.env.STUDIO_SMTP_USER || !process.env.STUDIO_SMTP_PASS) {
  console.error("Заполните STUDIO_SMTP_USER/STUDIO_SMTP_PASS в .env.local");
  process.exit(1);
}
const nodemailer = (await import("nodemailer")).default;
const transporter = nodemailer.createTransport({
  host: process.env.STUDIO_SMTP_HOST || "smtp.yandex.ru",
  port: Number(process.env.STUDIO_SMTP_PORT || 465),
  secure: Number(process.env.STUDIO_SMTP_PORT || 465) === 465,
  auth: { user: process.env.STUDIO_SMTP_USER, pass: process.env.STUDIO_SMTP_PASS },
  connectionTimeout: 15000,
});
try {
  const info = await transporter.sendMail({
    from: `"${process.env.STUDIO_FROM_NAME || "Сайт Ростовфильм"}" <${process.env.STUDIO_SMTP_USER}>`,
    to: process.env.STUDIO_NOTIFY_EMAIL || process.env.STUDIO_SMTP_USER,
    subject: "Тест уведомлений с сайта Ростовфильм",
    text: "Это тестовое письмо. Если вы его видите — SMTP настроен верно, заявки с сайта будут приходить на этот ящик.",
    html: "<div style='font-family:Arial,sans-serif'><h2 style='color:#c22'>Тест уведомлений</h2><p>Если вы это читаете — SMTP настроен верно.<br>Заявки с формы сайта будут приходить на этот ящик.</p></div>",
  });
  console.log("Письмо отправлено:", info.messageId, "→", info.accepted);
} catch (e) {
  console.error("ОШИБКА:", e?.code ?? "", e?.message ?? e);
  if (e?.response) console.error("Ответ сервера:", e.response);
  process.exit(1);
}
