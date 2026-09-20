"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NAV } from "@/lib/site";
import { Wordmark } from "./Logo";

function ThemeToggle({ className = "" }: { className?: string }) {
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
      className={`grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold hover:text-gold ${className}`}
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
    const onScroll = () => setSolid(window.scrollY > 24);
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
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid
            ? "border-b border-line bg-paper/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-3 md:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <Wordmark size={38} />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href) ?? false;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-3 py-2 text-[0.8rem] font-medium tracking-wide transition-colors ${
                    active ? "text-sindoor" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute inset-x-3 -bottom-px h-px origin-left bg-gold transition-transform duration-500 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/daan"
              className="btn btn-primary hidden !px-4 !py-2 !text-[0.68rem] sm:inline-flex"
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
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-paper/95 backdrop-blur-xl transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="relative flex h-full flex-col justify-center px-8">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-baseline justify-between border-b border-line py-4 transition-all duration-500"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(14px)",
                transitionDelay: `${open ? 60 + i * 45 : 0}ms`,
              }}
            >
              <span className="font-display text-[1.9rem] font-normal text-ink group-hover:text-sindoor">
                {item.label}
              </span>
              <span className="bangla-display text-[1.05rem] text-gold">
                {item.bangla}
              </span>
            </Link>
          ))}
          <Link
            href="/daan"
            className="btn btn-primary mt-8 w-full"
            style={{
              opacity: open ? 1 : 0,
              transitionDelay: `${open ? 60 + NAV.length * 45 : 0}ms`,
            }}
          >
            Donate to the Puja
          </Link>
        </div>
      </div>
    </>
  );
}
