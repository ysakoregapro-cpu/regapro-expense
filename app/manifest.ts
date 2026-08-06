import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "レガプロ経費申請",
    short_name: "経費申請",
    description: "株式会社レガプロの社内経費申請・承認アプリ",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F3F5F7",
    theme_color: "#1E4663",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "finance"],
    lang: "ja",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
