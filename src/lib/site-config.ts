/**
 * Единая точка правды о публичном адресе сайта.
 *
 * metadataBase отсюда используют метаданные, sitemap, robots и JSON-LD.
 * Реальный домен задаётся переменной NEXT_PUBLIC_SITE_URL (без завершающего
 * слэша); до её появления используется базовый адрес.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
  "https://rostovfilm.ru"
);
