"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        user: fd.get("user"),
        password: fd.get("password"),
      }),
    }).catch(() => null);

    if (!res) {
      setError("Could not reach the server.");
      setBusy(false);
      return;
    }

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Sign-in failed.");
      setBusy(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="w-full max-w-[24rem]">
      <div className="mb-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/50 text-gold">
          <Lock size={18} />
        </span>
        <h1 className="font-display mt-5 text-[1.618rem] font-normal text-ink">
          Committee console
        </h1>
        <p className="bangla-display mt-1 text-[1.05rem] text-gold">কমিটির প্রবেশপথ</p>
      </div>

      {!configured ? (
        <div className="surface p-6 text-[0.85rem] leading-relaxed text-ink-soft">
          <p>Admin sign-in is not configured yet. In the environment, set:</p>
          <pre className="mt-3 overflow-x-auto border border-line bg-paper-2/60 p-3 text-[0.72rem] text-ink">
{`AUTH_SECRET=<32+ random characters>
ADMIN_USERS=treasurer:<passphrase>`}
          </pre>
          <p className="mt-3">
            Then redeploy. Generate the secret with{" "}
            <code className="text-gold">
              node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;hex&apos;))&quot;
            </code>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="surface space-y-4 p-6">
          <label className="block">
            <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft">
              User
            </span>
            <input
              name="user"
              required
              autoComplete="username"
              autoFocus
              className="field mt-2"
            />
          </label>
          <label className="block">
            <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft">
              Passphrase
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="field mt-2"
            />
          </label>

          {error && (
            <p className="border border-sindoor/40 p-3 text-[0.8rem] text-sindoor" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? <Loader2 size={15} className="animate-spin" /> : "Sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
