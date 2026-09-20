import { NextResponse } from "next/server";
import { FACTS } from "@/lib/content/facts";
import { ART_FORMS } from "@/lib/content/artforms";
import { getConfig } from "@/lib/config";
import { VOLUNTEER_ROLES } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

/* ----------------------------------------------------------------
   A very small rate limit, per instance. Enough to stop a single
   bored visitor from draining a free API quota; not a security
   control, and not pretending to be one.
   ---------------------------------------------------------------- */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/* ----------------------------------------------------------------
   The knowledge the guide is allowed to use: this site's own content.
   ---------------------------------------------------------------- */
async function buildContext(): Promise<string> {
  const config = await getConfig();

  const schedule = config.schedule
    .map(
      (d) =>
        `${d.tithi} (${d.tithiBangla}), ${d.date}, ${d.weekday}: ${d.headline}. ` +
        d.rituals.map((r) => `${r.time} ${r.title}`).join("; "),
    )
    .join("\n");

  const facts = FACTS.map(
    (f) => `${f.year ? f.year + ", " : ""}${f.title}: ${f.fact}`,
  ).join("\n");

  const arts = ART_FORMS.map(
    (a) => `${a.name} (${a.bangla}), ${a.category}, ${a.status}: ${a.didYouKnow}`,
  ).join("\n");

  const roles = VOLUNTEER_ROLES.map((r) => `${r.en}: ${r.blurb}`).join("\n");

  return [
    `VENUE: ${config.venue.address}`,
    `SCHEDULE:\n${schedule}`,
    `DONATIONS: Transfer directly to ${config.bank.accountName}, ` +
      `${config.bank.bank} ${config.bank.branch}, account ${config.bank.accountNumber}, IFSC ${config.bank.ifsc}. ` +
      `There is no payment gateway and no minimum amount. After transferring, fill the form at /daan with name, SR number, email, WhatsApp number, amount and transaction reference. ` +
      `The treasurer verifies it against the bank statement, then a numbered receipt is sent to the donor's WhatsApp and the name appears on the public board at /daan/board.`,
    `VOLUNTEERING (form at /jogdan):\n${roles}`,
    `LINKS: Instagram ${config.links.instagram}; YouTube ${config.links.youtube}; WhatsApp group ${config.links.whatsappGroup}; magazine submissions ${config.links.magazineSubmission}; cover competition ${config.links.coverCompetition}; volunteer form ${config.links.volunteerForm}`,
    `ART FORMS:\n${arts}`,
    `HISTORICAL FACTS:\n${facts}`,
  ].join("\n\n");
}

const SYSTEM = `You are the Pujo Guide for the IISc Sharodiya Durgotsab website.

Rules:
- Answer only from the CONTEXT below. If the answer is not there, say you do not know and point to the relevant page or to the student convenors.
- Be warm, brief and concrete. Two to four sentences unless asked for more.
- You may answer in Bengali if the visitor writes in Bengali.
- Never invent dates, amounts, timings or account numbers.
- Never promise that a donation has been received or verified; direct people to the donation board.
- Do not discuss anything unrelated to this Puja, the festival's history, or its art forms.`;

/* ----------------------------------------------------------------
   Providers, in order of preference. All free tiers.
   ---------------------------------------------------------------- */
async function askGroq(messages: Msg[], context: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: "system", content: `${SYSTEM}\n\nCONTEXT:\n${context}` },
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    console.error("[ai] groq", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

async function askGemini(messages: Msg[], context: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM}\n\nCONTEXT:\n${context}` }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
      }),
    },
  );

  if (!res.ok) {
    console.error("[ai] gemini", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

/**
 * No key, or every provider down: fall back to keyword retrieval over
 * the same material. The guide still answers, just without prose.
 */
function fallback(question: string, context: string): string {
  const words = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (words.length === 0) {
    return "Ask me about the schedule, the rituals, how to donate, or the history of the festival.";
  }

  const scored = context
    .split("\n")
    .map((line) => {
      const lower = line.toLowerCase();
      const score = words.reduce((s, w) => (lower.includes(w) ? s + 1 : s), 0);
      return { line: line.trim(), score };
    })
    .filter((x) => x.score > 0 && x.line.length > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) {
    return "I could not find that on this site. The pages in the menu cover the history, the art forms, the four days and the donation details, or message a student convenor from the footer.";
  }

  return (
    "Here is what this site says:\n\n" +
    scored.map((s) => "• " + s.line).join("\n\n")
  );
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { reply: "That is a lot of questions at once. Give me a minute and ask again." },
      { status: 429 },
    );
  }

  const { messages } = (await req.json().catch(() => ({}))) as {
    messages?: Msg[];
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Ask me something." }, { status: 400 });
  }

  const clean: Msg[] = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .slice(-8)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 800) }));

  const question = [...clean].reverse().find((m) => m.role === "user")?.content ?? "";
  const context = await buildContext();

  try {
    const reply = (await askGroq(clean, context)) ?? (await askGemini(clean, context));
    if (reply) return NextResponse.json({ reply });
  } catch (err) {
    console.error("[ai]", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ reply: fallback(question, context) });
}
