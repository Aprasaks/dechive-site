import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DECHIVE",
    short_name: "DECHIVE",
    description: "AI가 만들고 인간이 검증하는 지식 아카이브, DECHIVE",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#092944",
    icons: [
      {
        src: "/icons/dechive-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/dechive-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
