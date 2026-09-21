import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * The Content Security Policy is deliberately explicit about what this
 * site actually loads: fonts from Google, a map frame from
 * OpenStreetMap, an optional video frame from YouTube, and nothing
 * else. `unsafe-inline` on styles is required by the framework's
 * inlined critical CSS, and on scripts by the theme boot snippet in
 * the layout, which runs before paint to stop a flash of the wrong
 * colour scheme.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.youtube.com https://s.ytimg.com",
  "worker-src 'self' blob:",
  "connect-src 'self' blob: data:",
  "frame-src 'self' blob: https://www.openstreetmap.org https://www.youtube-nocookie.com https://www.youtube.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  /**
   * The addresses people type from memory. Every one of these was a
   * 404, including /donate, which turned somebody away from the
   * donation page at the exact moment they wanted to give money.
   */
  async redirects() {
    const map: Record<string, string> = {
      "/donate": "/daan",
      "/donation": "/daan",
      "/donations": "/daan",
      "/board": "/daan/board",
      "/ledger": "/daan/board",
      "/sponsor": "/sponsors",
      "/sponsorship": "/sponsors/proposal",
      "/contact": "/thikana#write-to-us",
      "/feedback": "/thikana#write-to-us",
      "/about": "/utsab",
      "/schedule": "/utsab",
      "/timings": "/utsab",
      "/programme": "/utsab",
      "/map": "/thikana",
      "/directions": "/thikana",
      "/volunteer": "/jogdan",
      "/join": "/jogdan",
      "/music": "/gaan",
      "/songs": "/gaan",
      "/history": "/itihash",
      "/art": "/shilpa",
      "/magazine": "/probash",
      "/photos": "/gallery",
      "/album": "/gallery",
      "/login": "/admin",
    };
    return Object.entries(map).map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    }));
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Receipts hold a donor's personal details behind nothing but
        // an unguessable id. Keep them out of every index and cache.
        source: "/receipt/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
      {
        /*
          The media never changes once published, and the magazines are
          the heaviest thing here by far. Caching them for a year means
          a second reader on the same device costs no bandwidth at all,
          which is what keeps this inside a free tier during a festival.
        */
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
