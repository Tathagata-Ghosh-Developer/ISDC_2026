import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { isUuid, receiptKind } from "@/lib/expenses";
import {
  RECEIPT_BUCKET,
  RECEIPT_TTL_SECONDS,
  authorise,
  loadExpense,
  noDatabase,
} from "@/lib/expenses.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Short-lived links to an expense's bills, exactly as the donation
 * screenshots are opened (see ../../../proof): two minutes, never a
 * permanent URL, and every opening written to the log under the name of
 * whoever asked.
 *
 * Only a key already listed on that expense's own row can be signed, so
 * this cannot be turned into a way of opening a donor's screenshot from
 * the same bucket.
 *
 * Body: { id, key? }. Without a key, every bill on the row (for the
 * thumbnails); with one, just that bill.
 */
export async function POST(req: Request) {
  const session = await authorise();
  if (session instanceof NextResponse) return session;
  if (!dbReady) return noDatabase();

  const { id, key } = ((await req.json().catch(() => ({}))) ?? {}) as { id?: unknown; key?: unknown };
  if (!isUuid(id)) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const loaded = await loadExpense(id);
  if ("response" in loaded) return loaded.response;
  const listed = loaded.expense.receipt_keys ?? [];

  let keys: string[];
  if (key === undefined || key === null) {
    keys = listed;
  } else if (typeof key === "string" && listed.includes(key)) {
    keys = [key];
  } else {
    return NextResponse.json({ error: "That file is not on this expense." }, { status: 404 });
  }
  if (keys.length === 0) {
    return NextResponse.json({ error: "No bills are attached to this expense yet." }, { status: 404 });
  }

  const { data, error } = await db().storage.from(RECEIPT_BUCKET).createSignedUrls(keys, RECEIPT_TTL_SECONDS);
  if (error || !data) {
    console.error("[admin/expenses] sign", error?.message);
    return NextResponse.json({ error: "Could not open that bill." }, { status: 500 });
  }

  const urls = data
    .filter((d) => d.signedUrl && !d.error && d.path)
    .map((d) => ({ key: d.path as string, url: d.signedUrl as string, kind: receiptKind(d.path as string) }));
  if (urls.length === 0) {
    return NextResponse.json({ error: "Could not open that bill." }, { status: 500 });
  }

  for (const u of urls) {
    console.info("[admin/expenses] %s opened bill %s for %s", session.user, u.key, id);
  }
  return NextResponse.json(
    { urls, expiresIn: RECEIPT_TTL_SECONDS },
    { headers: { "cache-control": "private, no-store" } },
  );
}
