import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbReady } from "@/lib/db";
import {
  CONFIG_GROUPS,
  saveConfigGroup,
  resetConfigGroup,
  type ConfigGroup,
} from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = new Set<string>(CONFIG_GROUPS.map((g) => g.key));

async function guard(): Promise<string | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const { key, value } = (await req.json().catch(() => ({}))) as {
    key?: string;
    value?: unknown;
  };

  if (!key || !KEYS.has(key)) {
    return NextResponse.json({ error: "Unknown setting." }, { status: 400 });
  }
  if (value === undefined) {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }

  try {
    await saveConfigGroup(key as ConfigGroup, value);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed." },
      { status: 500 },
    );
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const key = new URL(req.url).searchParams.get("key");
  if (!key || !KEYS.has(key)) {
    return NextResponse.json({ error: "Unknown setting." }, { status: 400 });
  }

  await resetConfigGroup(key as ConfigGroup);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
