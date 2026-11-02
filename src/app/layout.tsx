import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Oswald, Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SITE } from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-config";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const archangelsk = localFont({
  src: "../fonts/Archangelsk.ttf",
  variable: "--font-archangelsk",
  weight: "400",
  display: "swap",
});

/* Слейв съёмки «КАМЕРА / МОТОР / НАЧАЛИ» в блоке «Нейрокино» */
const benzin = localFont({
  src: "../fonts/Benzin-ExtraBold.ttf",
  variable: "--font-benzin",
  weight: "800",
  display: "swap",
});

/* Шрифт цифр отсчёта «Kinetic countdown» (оригинальный код CodePen) */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "wdth"],
});

const SEO_TITLE = "РОСТОВФИЛЬМ — киностудия полного цикла в Ростове-на-Дону";
const SEO_DESCRIPTION = SITE.description;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_TITLE,
    template: "%s — РОСТОВФИЛЬМ",
  },
  description: SEO_DESCRIPTION,
  keywords: [
    "киностудия",
    "Ростов-на-Дону",
    "Ростовфильм",
    "видеопроизводство",
    "постпродакшн",
    "рекламные ролики",
    "документальные фильмы",
    "музыкальные клипы",
    "Варяги. Ген Храбрости",
    "Голос времени подкаст",
    "мультфильм Письмо",
  ],
  applicationName: SITE.name,
  authors: [{ name: SITE.fullName, url: SITE_URL }],
  creator: SITE.fullName,
  publisher: SITE.fullName,
  category: "кинопроизводство",
  alternates: { canonical: "/" },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    siteName: SITE.name,
    locale: "ru_RU",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#201a18",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Киностудия «Ростовфильм»",
  alternateName: "ROSTOVFILM",
  description: SITE.description,
  slogan: SITE.tagline,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  image: `${SITE_URL}/icons/icon-512.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ростов-на-Дону",
    addressCountry: "RU",
  },
  sameAs: [SITE.vk, SITE.vkHanuman, SITE.vkVaryagi],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${manrope.variable} ${archangelsk.variable} ${bricolage.variable} ${benzin.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Ambient-фон сайта: «дышащее» свечение остаётся за контентом (z -10),
            а гигантский водяной знак вынесен отдельным fixed-слоем ПОВЕРХ контента —
            он перекрывает собой и видео-блоки, и карточки (ниже шапки и диалогов) */}
        <div className="site-ambient" aria-hidden />
        <span className="site-ambient__word" aria-hidden>
          ростовфильм
        </span>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
