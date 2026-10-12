import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import {
  MAX_RECEIPTS,
  MAX_RECEIPT_BYTES,
  checkReceiptFile,
  claimedType,
  isUuid,
  receiptKey,
  receiptType,
} from "@/lib/expenses";
import {
  RECEIPT_BUCKET,
  authorise,
  loadExpense,
  noDatabase,
  updateReceiptKeys,
} from "@/lib/expenses.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Attaches scanned bills and receipts to an expense.
 *
 * Multipart: `id` and one or more `file`. The console sends one file per
 * request, because Vercel refuses any request body over 4.5 MB before
 * this code runs; each file is at most 4 MB, checked in the browser
 * first and again here. Files go to the private bucket the donation
 * screenshots use, under expenses/<id>/, and are only ever opened on a
 * two-minute signed link (see ./view).
 */
export async function POST(req: Request) {
  const session = await authorise();
  if (session instanceof NextResponse) return session;
  if (!dbReady) return noDatabase();
  const who = session.user;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload. Try again with one file." }, { status: 400 });
  }

  const id = form.get("id");
  if (!isUuid(id)) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const files = form.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "Choose a photo or PDF of the bill." }, { status: 400 });
  }

  // Check every file before storing any, by size, by claimed type and by
  // what its first bytes actually are.
  const checked: { file: File; type: string }[] = [];
  for (const file of files) {
    const problem = checkReceiptFile(file);
    if (problem) {
      return NextResponse.json({ error: problem }, { status: file.size > MAX_RECEIPT_BYTES ? 413 : 400 });
    }
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const type = receiptType(claimedType(file.type, file.name), head);
    if (!type) {
      return NextResponse.json(
        { error: "That file does not look like a photo or a PDF. Upload the bill as a JPEG, PNG, WebP, HEIC or PDF." },
        { status: 400 },
      );
    }
    checked.push({ file, type });
  }

  const loaded = await loadExpense(id);
  if ("response" in loaded) return loaded.response;
  const already = loaded.expense.receipt_keys?.length ?? 0;
  if (already + checked.length > MAX_RECEIPTS) {
    return NextResponse.json(
      { error: `An expense can carry at most ${MAX_RECEIPTS} files, and this one has ${already}. Combine pages into one PDF.` },
      { status: 400 },
    );
  }

  const bucket = db().storage.from(RECEIPT_BUCKET);
  const stored: string[] = [];
  for (const { file, type } of checked) {
    const key = receiptKey(id, type);
    const { error } = await bucket.upload(key, file, { contentType: type, upsert: false });
    if (error) {
      console.error("[admin/expenses] upload", error.message);
      if (stored.length) await bucket.remove(stored);
      return NextResponse.json({ error: "Could not store that file. Try again." }, { status: 500 });
    }
    stored.push(key);
  }

  const res = await updateReceiptKeys(id, (keys) => [...keys, ...stored], who);
  if ("response" in res) {
    // The row did not take the files, so they must not linger unlisted.
    await bucket.remove(stored);
    return res.response;
  }

  console.info("[admin/expenses] %s attached %d bill(s) to %s", who, stored.length, id);
  return NextResponse.json({ ok: true, expense: res.expense });
}
