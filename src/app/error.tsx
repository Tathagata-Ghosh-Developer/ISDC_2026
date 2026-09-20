"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Something threw. Say so plainly, give the visitor a way out, and do
 * not pretend it did not happen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page]", error);
  }, [error]);

  return (
    <div className="grid min-h-[70dvh] place-items-center px-5 py-20">
      <div className="mx-auto max-w-[40rem] text-center">
        <p className="eyebrow">কিছু একটা ভেঙেছে Something broke</p>

        <h1 className="font-display mt-5 text-[2.058rem] font-normal leading-tight text-ink sm:text-[2.618rem]">
          This page did not load
        </h1>

        <p className="lede mx-auto mt-6 max-w-[46ch] text-[0.95rem]">
          Not your fault. Try again, and if it keeps happening tell a convenor
          what you were doing when it did. That is genuinely useful.
        </p>

        {error.digest && (
          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">
            Reference {error.digest}
          </p>
        )}

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Go home
          </Link>
          <Link href="/thikana#committee" className="btn btn-ghost">
            Tell a convenor
          </Link>
        </div>
      </div>
    </div>
  );
}
