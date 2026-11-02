/**
 * Простой лимит заявок с одного IP: не больше STUDIO_RATE_LIMIT
 * (по умолчанию 3) за окно STUDIO_RATE_WINDOW_MS (по умолчанию 10 минут).
 * Счётчик в памяти процесса — достаточно для одного инстанса лендинга.
 *
 * Лимит применяется только к заявкам, прошедшим проверку капчи
 * (см. POST /api/contact): ошибки капчи и honeypot слоты не расходуют,
 * чтобы не блокировать живых людей, опечатавшихся в коде.
 */

const WINDOW_MS = Number(process.env.STUDIO_RATE_WINDOW_MS ?? 10 * 60 * 1000);
const LIMIT = Number(process.env.STUDIO_RATE_LIMIT ?? 3);

const buckets = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  /** Сколько секунд до освобождения слота (для Retry-After) */
  retryAfterSec: number;
  /** Осталось заявок в текущем окне */
  remaining: number;
  limit: number;
  windowMin: number;
};

export function checkRateLimit(ip: string): RateLimitResult {
  const limit = LIMIT;
  const windowMin = Math.round(WINDOW_MS / 60000);

  // Запросы без прокси-заголовков (локальный loopback в dev) не ограничиваем:
  // в проде Caddy всегда проставляет X-Forwarded-For, напрямую порт не открыт
  if (ip === "local") {
    return { allowed: true, retryAfterSec: 0, remaining: limit, limit, windowMin };
  }

  const now = Date.now();
  const hits = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (hits.length >= limit) {
    const oldest = hits[0];
    buckets.set(ip, hits);
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
      remaining: 0,
      limit,
      windowMin,
    };
  }

  hits.push(now);
  buckets.set(ip, hits);

  // защита карты от роста: старые записи и так отфильтрованы по времени
  if (buckets.size > 2000) {
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (buckets.size <= 1000) break;
    }
  }

  return { allowed: true, retryAfterSec: 0, remaining: limit - hits.length, limit, windowMin };
}

/** IP клиента из прокси-заголовков (Caddy): первый адрес из X-Forwarded-For. */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = headers.get("x-real-ip");
  if (xri?.trim()) return xri.trim();
  return "local";
}
