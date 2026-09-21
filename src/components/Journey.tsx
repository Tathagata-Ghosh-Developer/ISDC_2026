"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readConsent } from "@/components/Consent";

/* ================================================================
   Following one visit, once the visitor has agreed to it.

   The plain counter in Track.tsx keeps running whatever happens here,
   because it is about nobody. This adds the detail: what brought them,
   what they read in what order, how far down, how long, what they
   pressed. It starts only after consent and erases itself if consent
   is withdrawn.

   Everything is sent with `keepalive`, so the last event of a visit
   survives the tab being closed, which is the one that says how long
   they stayed.
   ================================================================ */

const SESSION_KEY = "isdc-journey";
const SEEN_KEY = "isdc-seen-before";

type Body = Record<string, unknown>;

function post(body: Body) {
  return fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => null);
}

/** What kind of connection, where the browser will say. */
function connection(): string | null {
  const c = (
    navigator as Navigator & { connection?: { effectiveType?: string } }
  ).connection;
  return c?.effectiveType ?? null;
}

/** A browser family, not a version string, which would narrow too far. */
function browserName(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "other";
}

function deviceClass(): string {
  const w = window.innerWidth;
  if (w < 640) return "phone";
  if (w < 1024) return "tablet";
  return "desktop";
}

/** Fires an action into the current journey. Safe to call anywhere. */
export function trackAction(name: string) {
  if (typeof window === "undefined") return;
  if (readConsent() !== "granted") return;
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return;
  void post({ op: "event", id, kind: "action", name, seq: 0 });
}

export default function Journey() {
  const pathname = usePathname();
  const id = useRef<string | null>(null);
  const seq = useRef(0);
  const pages = useRef(0);
  // Initialised on mount rather than during render: Date.now() during
  // render is impure, and React is right to say so.
  const startedAt = useRef(0);
  const pageAt = useRef(0);
  const maxScroll = useRef(0);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const now = Date.now();
    startedAt.current = now;
    pageAt.current = now;
  }, []);

  /* ---- how far down this page they have read ---- */
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = Math.round((window.scrollY / h) * 100);
      if (pct > maxScroll.current) maxScroll.current = Math.min(100, pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const record = useCallback(
    (kind: "view" | "exit", path: string) => {
      if (!id.current) return;
      void post({
        op: "event",
        id: id.current,
        kind,
        path,
        seq: seq.current++,
        dwell_ms: Date.now() - pageAt.current,
        scroll_pct: maxScroll.current,
        page_count: pages.current,
        duration_ms: Date.now() - startedAt.current,
        max_scroll: maxScroll.current,
      });
    },
    [],
  );

  /* ---- begin, once, after consent ---- */
  useEffect(() => {
    if (readConsent() !== "granted") return;

    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      id.current = existing;
      return;
    }

    const url = new URL(window.location.href);
    const p = url.searchParams;
    let seenBefore = false;
    try {
      seenBefore = localStorage.getItem(SEEN_KEY) === "1";
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private window */
    }

    void post({
      op: "start",
      path: pathname ?? "/",
      referrer: document.referrer,
      utm_source: p.get("utm_source"),
      utm_medium: p.get("utm_medium"),
      utm_campaign: p.get("utm_campaign"),
      utm_content: p.get("utm_content"),
      utm_term: p.get("utm_term"),
      device: deviceClass(),
      screen_w: window.screen?.width,
      screen_h: window.screen?.height,
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
      pixel_ratio: window.devicePixelRatio,
      language: navigator.language,
      languages: (navigator.languages ?? []).slice(0, 4).join(","),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? null,
      browser: browserName(),
      connection: connection(),
      touch: navigator.maxTouchPoints > 0,
      prefers_dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
      reduced_motion: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
      is_returning: seenBefore,
    })
      .then((r) => r?.json())
      .then((d: { id?: string } | undefined) => {
        if (!d?.id) return;
        id.current = d.id;
        try {
          sessionStorage.setItem(SESSION_KEY, d.id);
        } catch {
          /* private window */
        }
      })
      .catch(() => {});
    // Runs once; the path at that moment is the landing page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- each page ---- */
  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    if (lastPath.current) record("view", lastPath.current);
    lastPath.current = pathname;
    pages.current += 1;
    pageAt.current = Date.now();
    maxScroll.current = 0;
  }, [pathname, record]);

  /* ---- the last one, as the tab closes ---- */
  useEffect(() => {
    const onLeave = () => {
      if (document.visibilityState === "hidden" && lastPath.current) {
        record("exit", lastPath.current);
      }
    };
    document.addEventListener("visibilitychange", onLeave);
    return () => document.removeEventListener("visibilitychange", onLeave);
  }, [record]);

  /* ---- consent withdrawn: forget the whole visit ---- */
  useEffect(() => {
    const onConsent = (e: Event) => {
      const v = (e as CustomEvent<string>).detail;
      if (v !== "denied") return;
      const existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) void post({ op: "forget", id: existing });
      try {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SEEN_KEY);
      } catch {
        /* ignore */
      }
      id.current = null;
    };
    window.addEventListener("isdc-consent", onConsent);
    return () => window.removeEventListener("isdc-consent", onConsent);
  }, []);

  return null;
}
