"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Tells the server a page was read.
 *
 * Nothing is stored in the browser except one flag in sessionStorage,
 * which the browser throws away when the tab closes and which says
 * only "this tab has already been counted once". There is no cookie,
 * no identifier and nothing that survives the visit, which is why the
 * site needs no consent banner to keep counting.
 *
 * Failures are swallowed. A page that will not load because a counter
 * is down is a worse page.
 */

let queued = false;

export function track(event: string) {
  if (typeof window === "undefined") return;
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {});
}

export default function Track() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;

    let first = false;
    try {
      first = sessionStorage.getItem("isdc_seen") === null;
      if (first) sessionStorage.setItem("isdc_seen", "1");
    } catch {
      // Private windows and blocked storage both land here. The view
      // still counts; it simply counts as a returning one.
    }

    // The referrer is only useful on the first page of a visit, and
    // only ever reduced to a hostname on the server.
    const referrer = first ? document.referrer : "";

    if (queued) return;
    queued = true;

    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer,
        width: window.innerWidth,
        first,
      }),
      keepalive: true,
    })
      .catch(() => {})
      .finally(() => {
        queued = false;
      });
  }, [pathname]);

  return null;
}
