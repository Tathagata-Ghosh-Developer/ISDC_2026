import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Receipts carry a donor's name, email, phone and SR number. They are
 * protected only by an unguessable id, so they must never be crawled,
 * and neither must the committee console.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/receipt/", "/admin", "/api/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
