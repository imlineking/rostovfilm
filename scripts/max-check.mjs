#!/usr/bin/env node
/**
 * Проверка бота MAX (нужен NODE_EXTRA_CA_CERTS=certs/russian-trusted-ca.pem —
 * API platform-api2.max.ru использует российский УЦ Минцифры).
 *
 *   NODE_EXTRA_CA_CERTS=certs/russian-trusted-ca.pem bun scripts/max-check.mjs <ТОКЕН>
 *      — инфо о боте + chat_id из очереди событий (напишите боту в MAX первым!)
 *
 *   NODE_EXTRA_CA_CERTS=certs/russian-trusted-ca.pem bun scripts/max-check.mjs <ТОКЕН> <CHAT_ID> [текст]
 *      — отправить тестовое сообщение
 *
 * Токен не сохраняется и не выводится.
 */
const token = process.argv[2];
const chatId = process.argv[3];
const text = process.argv[4];
if (!token) {
  console.error("Использование: bun scripts/max-check.mjs <ТОКЕН> [CHAT_ID] [ТЕКСТ]");
  process.exit(1);
}
const API = "https://platform-api2.max.ru";
const H = { Authorization: token };

if (chatId) {
  const res = await fetch(`${API}/messages?chat_id=${encodeURIComponent(chatId)}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({ text: text || "✅ Тест: бот «Ростовфильм» подключён к сайту. Заявки с формы будут приходить сюда." }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`Ошибка ${res.status}:`, body.slice(0, 500));
    process.exit(1);
  }
  console.log("Отправлено:", body.slice(0, 200));
} else {
  const me = await (await fetch(`${API}/me`, { headers: H, signal: AbortSignal.timeout(10000) })).json();
  console.log(`Бот: ${me.first_name} (@${me.username}) · user_id=${me.user_id}`);
  const res = await fetch(`${API}/updates?marker=-1&poll_time=0&types=bot_started,message_created`, {
    headers: H, signal: AbortSignal.timeout(10000),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`Ошибка ${res.status}:`, body.slice(0, 500));
    process.exit(1);
  }
  const data = JSON.parse(body);
  const updates = data.updates ?? [];
  console.log(`Событий в очереди: ${updates.length} (marker=${data.marker})`);
  const seen = new Set();
  for (const u of updates) {
    const p = u.payload ?? {};
    const cid = p.chat_id ?? p.recipient?.chat_id ?? p.chat?.chat_id;
    const who = p.message?.sender?.username ?? p.user?.username ?? "";
    const snippet = (p.message?.body?.text ?? "").slice(0, 40).replace(/\n/g, " ");
    console.log(`- ${u.update_type} · chat_id=${cid}${who ? ` · @${who}` : ""}${snippet ? ` · "${snippet}"` : ""}`);
    if (cid) seen.add(String(cid));
  }
  if (seen.size) {
    console.log(`\nКандидаты в MAX_CHAT_ID: ${[...seen].join(", ")}`);
    console.log(`Проверка: NODE_EXTRA_CA_CERTS=certs/russian-trusted-ca.pem bun scripts/max-check.mjs <ТОКЕН> ${[...seen][0]}`);
  } else {
    console.log("\nЧатов нет. Откройте бота в MAX и напишите ему любое сообщение («Начать»), затем повторите.");
  }
}
