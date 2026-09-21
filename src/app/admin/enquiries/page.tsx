import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import EnquiriesPanel from "@/components/admin/EnquiriesPanel";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const session = await currentSession();
  if (!session) return null;
  if (session.role === "viewer") redirect("/daan/board");

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Enquiries
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          Everything the website can send us, in one place. Sponsors asking
          what we can offer, other institutes writing in, and anyone telling us
          the site is wrong about something. Mark one answered once you have
          actually replied, so nobody writes to them twice.
        </p>
      </div>
      <EnquiriesPanel role={session.role} />
    </div>
  );
}
