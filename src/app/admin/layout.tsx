import type { Metadata } from "next";
import Link from "next/link";
import { currentSession, authConfigured } from "@/lib/auth";
import { dbReady } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import { ROLE_LABEL } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Committee",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await currentSession();

  if (!session) {
    return (
      <div className="grid min-h-dvh place-items-center px-5 py-16">
        <AdminLogin configured={authConfigured()} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-[1.05rem] text-ink">
              Durgotsab
            </Link>
            <span className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
              {ROLE_LABEL[session.role]}
            </span>
          </div>
          <AdminNav user={session.user} role={session.role} />
        </div>
      </header>

      {!dbReady && (
        <div className="border-b border-line bg-sindoor px-5 py-2.5 text-center text-[0.78rem] text-paper-3">
          No database connected. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY,
          then run supabase/schema.sql.
        </div>
      )}

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
