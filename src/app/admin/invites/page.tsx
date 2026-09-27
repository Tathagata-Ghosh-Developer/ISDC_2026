import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { can } from "@/lib/roles";
import InvitesPanel from "@/components/admin/InvitesPanel";

export const dynamic = "force-dynamic";

/**
 * The faculty invitation tracker. The executive committee sees the whole
 * list; a volunteer signed in with a fund raiser account sees only the
 * faculty the committee has given them.
 */
export default async function AdminInvitesPage() {
  const session = await currentSession();
  if (!session) return null;
  if (!can(session.role, "ownInvites")) redirect("/daan/board");
  const manage = can(session.role, "manageInvites");

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          {manage ? "Faculty invitations" : "My faculty"}
        </h1>
        <p className="mt-1 max-w-[74ch] text-[0.85rem] leading-relaxed text-ink-soft">
          {manage
            ? "Give each faculty member to a volunteer who will take them the invitation card. Tick several and assign them together, or type a volunteer's name on a row. Volunteers tick off the card and the payment as they go. Only the executive committee can see this whole list."
            : "The faculty the committee has asked you to invite. Tick “Card given” once you have handed over the invitation in person, and “Paid” with the amount once they have given. Note any special request or sponsorship lead in the remarks."}
        </p>
      </div>
      <InvitesPanel canManage={manage} user={session.user} />
    </div>
  );
}
