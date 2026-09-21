"use client";

import { useSyncExternalStore } from "react";

/* ================================================================
   Reading the browser without a second render.

   The pattern these replace is the familiar one: start with a
   placeholder, read the real value in an effect, set state. It works,
   and it renders twice every time, once with a value that was never
   true. React's own rule now flags it, and the rule is right: this is
   external state being mirrored into React rather than owned by it,
   and useSyncExternalStore is the tool for exactly that.

   Every hook here returns the server's answer during rendering on the
   server, so nothing hydrates mismatched.
   ================================================================ */

function noop() {
  return () => {};
}

/** True when the visitor has asked their system for less movement. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

/** Any media query, kept in step if the visitor changes it mid-visit. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return noop();
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** True once the page has scrolled past `after` pixels. */
export function useScrolledPast(after: number): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return noop();
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > after,
    () => false,
  );
}

/** True once the component has mounted, for browser-only rendering. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
