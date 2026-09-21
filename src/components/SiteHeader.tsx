"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NAV } from "@/lib/site";
import Logo, { Wordmark } from "./Logo";

/* ================================================================
   The masthead.

   On a laptop it is two rows, because nine destinations crammed onto
   one line beside a wordmark and a button is a list, not a menu. The
   top row carries the mark and the two things you might press. The
   navigation sits beneath it on its own baseline with a phi step
   between items and the Bengali name under each English one. Once you
   scroll, the second row folds away and the navigation rides up into
   the first, which is when you want the page back rather than the
   chrome.
   ================================================================ */

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("isdc-theme") as "light" | "dark" | null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(stored ?? system);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("isdc-theme", next);
    } catch {
      /* private browsing */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to day" : "Switch to night"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold hover:text-gold"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${
          solid
            ? "border-b border-line bg-paper/88 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          {/* ---------- row one ---------- */}
          <div
            className={`flex items-center justify-between gap-6 transition-[padding] duration-500 ${
              solid ? "py-2.5" : "py-4 lg:py-5"
            }`}
          >
            <Link href="/" className="shrink-0">
              <Wordmark size={solid ? 32 : 40} />
            </Link>

            {/* the navigation rides up here once the page has scrolled */}
            <nav
              className={`hidden min-w-0 flex-1 items-center justify-center gap-1 transition-opacity duration-300 lg:flex ${
                solid ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!solid}
            >
              {NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} compact />
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Link
                href="/daan"
                className="btn btn-primary hidden !px-5 !py-2.5 !text-[0.66rem] sm:inline-flex"
              >
                Donate
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Menu"
                aria-expanded={open}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink lg:hidden"
              >
                {open ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* ---------- row two, the navigation at rest ---------- */}
          <nav
            className={`hidden items-center justify-center overflow-hidden border-t border-line/60 transition-[max-height,opacity,padding] duration-500 lg:flex ${
              solid ? "max-h-0 py-0 opacity-0" : "max-h-24 py-3 opacity-100"
            }`}
            aria-label="Main"
            aria-hidden={solid}
          >
            <ul className="flex items-baseline gap-[2.618rem] xl:gap-[3.4rem]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} pathname={pathname} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* ---------- the drawer ---------- */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-paper/96 backdrop-blur-xl transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="relative flex h-full flex-col justify-center overflow-y-auto px-7 py-24">
          <Logo size={54} className="mb-8" />
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-baseline justify-between gap-4 border-b border-line py-3.5 transition-all duration-500"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(14px)",
                transitionDelay: `${open ? 50 + i * 40 : 0}ms`,
              }}
            >
              <span className="font-display text-[1.5rem] font-normal text-ink group-hover:text-sindoor">
                {item.label}
              </span>
              <span className="shrink-0 text-right">
                <span className="bangla-display block text-[1.1rem] text-gold">
                  {item.bangla}
                </span>
                <span className="block text-[0.58rem] uppercase tracking-[0.2em] text-ink-faint">
                  {item.roman}
                </span>
              </span>
            </Link>
          ))}
          <Link
            href="/daan"
            className="btn btn-primary mt-7 w-full"
            style={{
              opacity: open ? 1 : 0,
              transitionDelay: `${open ? 50 + NAV.length * 40 : 0}ms`,
            }}
          >
            Donate to the Puja
          </Link>
        </div>
      </div>
    </>
  );
}

function NavLink({
  item,
  pathname,
  compact = false,
}: {
  item: (typeof NAV)[number];
  pathname: string | null;
  compact?: boolean;
}) {
  const active = pathname?.startsWith(item.href) ?? false;

  return (
    <Link
      href={item.href}
      className={`group relative block text-center transition-colors ${
        compact ? "px-2.5 py-1.5" : "px-1 pb-1.5"
      } ${active ? "text-sindoor" : "text-ink-soft hover:text-ink"}`}
    >
      <span
        className={`block whitespace-nowrap font-medium tracking-wide ${
          compact ? "text-[0.76rem]" : "text-[0.85rem]"
        }`}
      >
        {item.label}
      </span>
      {!compact && (
        <span className="bangla-display mt-0.5 block text-[0.8rem] text-gold/70 transition-colors group-hover:text-gold">
          {item.bangla}
        </span>
      )}
      <span
        className={`absolute inset-x-0 bottom-0 h-px origin-center bg-gold transition-transform duration-500 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}
