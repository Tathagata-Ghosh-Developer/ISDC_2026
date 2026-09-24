"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { atLeast, CAN, type Role } from "@/lib/roles";

/**
 * Tabs a role cannot use are not rendered at all, so nobody is
 * invited to click something that will refuse them. The routes
 * themselves check the role again, because a hidden link is a
 * courtesy and never a control.
 */
const TABS: { href: string; label: string; min: Role }[] = [
  { href: "/admin", label: "Donations", min: CAN.enterDonation },
  { href: "/admin/enquiries", label: "Enquiries", min: CAN.readEnquiries },
  { href: "/admin/team", label: "Contact sheet", min: CAN.contactSheet },
  { href: "/admin/expenses", label: "Expenses", min: CAN.manageExpenses },
  { href: "/admin/content", label: "Content", min: CAN.editContent },
  { href: "/admin/visits", label: "Visits", min: CAN.seeVisits },
];

export default function AdminNav({ user, role }: { user: string; role: Role }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  const tabs = TABS.filter((t) => atLeast(role, t.min));

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {tabs.map((t) => {
        const active =
          t.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(t.href);
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

      <Link
        href="/daan/board"
        className="px-3 py-1.5 text-[0.75rem] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-ink"
      >
        Board
      </Link>

      <span className="ml-2 hidden text-[0.68rem] text-ink-faint sm:inline">
        {user}
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
