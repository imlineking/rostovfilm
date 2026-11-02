import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.fullName} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#201a18",
    theme_color: "#201a18",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
