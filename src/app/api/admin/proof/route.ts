import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db, dbReady, getDonation } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A short-lived link to a donor's payment screenshot.
 *
 * The form has been taking these since the beginning, uploading them
 * to a private bucket, storing the key on the row, and then nothing.
 * No route read them back and no panel displayed them. The treasurer
 * the form promises they will help could not see them, which meant
 * the site was collecting pictures of people's banking apps, often
 * showing an account balance, and deriving nothing from them at all.
 *
 * Either stop asking, or let the treasurer look. The screenshot is
 * genuinely the fastest way to match an unclear payment, so: let them
 * look, for two minutes at a time, and never hand out a permanent URL.
 */
const TTL_SECONDS = 120;

export async function POST(req: Request) {
  let who: string;
  try {
    // A committee member matching a payment needs this as much as an
    // administrator does. Neither gets a link that outlives the tab.
    who = (await requireRole("committee")).user;
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!dbReady) {
    return NextResponse.json({ error: "No database." }, { status: 503 });
  }

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const donation = await getDonation(id);
  if (!donation) {
    return NextResponse.json({ error: "No such entry." }, { status: 404 });
  }
  if (!donation.proof_url) {
    return NextResponse.json(
      { error: "This donor did not upload a screenshot." },
      { status: 404 },
    );
  }

  const { data, error } = await db()
    .storage.from("proofs")
    .createSignedUrl(donation.proof_url, TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[admin/proof]", error?.message);
    return NextResponse.json(
      { error: "Could not open that screenshot." },
      { status: 500 },
    );
  }

  console.info("[admin/proof] %s opened proof for %s", who, id);
  return NextResponse.json({ url: data.signedUrl, expiresIn: TTL_SECONDS });
}
