#!/usr/bin/env node
/**
 * Фоновый слушатель событий бота MAX: ловит message_created и пишет
 * chat_id в scripts/max-events.log. Запуск:
 *   NODE_EXTRA_CA_CERTS=certs/russian-trusted-ca.pem node scripts/max-listen.mjs
 */
import { appendFileSync } from "node:fs";

const token = process.env.MAX_BOT_TOKEN;
if (!token) {
  console.error("MAX_BOT_TOKEN не задан");
  process.exit(1);
}
const API = "https://platform-api2.max.ru";
const H = { Authorization: token };
console.log("слушатель запущен");
appendFileSync(new URL("../scripts/max-events.log", import.meta.url), `=== слушатель запущен ${new Date().toISOString()}\n`);

let marker;
for (let i = 0; i < 2000; i++) {
  try {
    const url = `${API}/updates?poll_time=25&types=message_created,bot_started` + (marker !== undefined ? `&marker=${marker}` : "");
    const res = await fetch(url, { headers: H, signal: AbortSignal.timeout(30000) });
    const d = await res.json();
    for (const up of d.updates ?? []) {
      const p = up.payload ?? {};
      const cid = p.chat_id ?? p.recipient?.chat_id ?? p.chat?.chat_id;
      const text = (p.message?.body?.text ?? "").slice(0, 60).replace(/\n/g, " ");
      const who = p.message?.sender?.username ?? p.user?.username ?? "";
      const line = `${new Date().toISOString()} · ${up.update_type} · chat_id=${cid}${who ? ` · @${who}` : ""}${text ? ` · «${text}»` : ""}`;
      console.log(line);
      appendFileSync(new URL("../scripts/max-events.log", import.meta.url), line + "\n");
      // Сырое событие — чтобы не потерять структуру payload
      appendFileSync(new URL("../scripts/max-events-raw.log", import.meta.url), JSON.stringify(up) + "\n");
    }
    if (d.marker !== undefined && d.marker !== null) marker = d.marker;
  } catch (e) {
    appendFileSync(new URL("../scripts/max-events.log", import.meta.url), `${new Date().toISOString()} · таймаут/ошибка: ${e?.message ?? e}\n`);
  }
}
