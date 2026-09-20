"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Donations" },
  { href: "/admin/expenses", label: "Expenses" },
  { href: "/admin/content", label: "Content" },
];

export default function AdminNav({ admin }: { admin: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {TABS.map((t) => {
        const active =
          t.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-1.5 text-[0.75rem] uppercase tracking-[0.16em] transition-colors ${
              active ? "text-sindoor" : "text-ink-faint hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
      <span className="ml-2 hidden text-[0.68rem] text-ink-faint sm:inline">
        {admin}
      </span>
      <button
        onClick={signOut}
        aria-label="Sign out"
        className="ml-1 grid h-8 w-8 place-items-center border border-line text-ink-faint transition-colors hover:border-sindoor hover:text-sindoor"
      >
        <LogOut size={13} />
      </button>
    </nav>
  );
}
