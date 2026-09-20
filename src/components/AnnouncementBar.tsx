import Link from "next/link";
import type { Announcement } from "@/lib/config";

/** Rendered only when the committee switches it on from the console. */
export default function AnnouncementBar({
  announcement,
}: {
  announcement: Announcement;
}) {
  if (!announcement.enabled || !announcement.text.trim()) return null;

  const urgent = announcement.tone === "urgent";
  const inner = (
    <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
      <span className="text-[0.78rem] font-medium tracking-wide">
        {announcement.text}
      </span>
      {announcement.bangla && (
        <span className="bangla text-[0.8rem] opacity-80">
          {announcement.bangla}
        </span>
      )}
    </span>
  );

  return (
    <div
      className="relative z-[55] px-4 py-2"
      style={{
        background: urgent ? "var(--c-sindoor)" : "var(--c-indigo)",
        color: "#fbf3e4",
      }}
      role="status"
    >
      {announcement.href ? (
        <Link href={announcement.href} className="block underline-offset-4 hover:underline">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}
