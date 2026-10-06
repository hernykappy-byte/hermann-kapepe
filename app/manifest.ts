import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Grrand",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbfafd",
    theme_color: "#2d1b5e",
    icons: [
      { src: "/pwa/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
