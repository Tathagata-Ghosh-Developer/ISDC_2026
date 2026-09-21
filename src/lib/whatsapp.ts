import "server-only";

/**
 * Sending the receipt to the donor.
 *
 * Three paths, tried in order, and the committee can run any of them.
 *
 * 1. **Meta's WhatsApp Cloud API**, if the committee has a business
 *    account and an approved template. The official route. Free for
 *    service conversations, and the only one with no account risk.
 *    Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID.
 *
 * 2. **OpenWA**, a self-hosted gateway the committee runs itself.
 *    Set OPENWA_URL, OPENWA_API_KEY and OPENWA_SESSION. See the long
 *    note below before doing so; it is not free of consequences.
 *
 * 3. **The link**, which is the default and needs nothing at all. A
 *    committee member presses a button, their own WhatsApp opens with
 *    the message already written, and they press send. Costs nothing,
 *    needs no approval, works from a phone at the donation desk, and
 *    cannot get anybody banned.
 *
 * Whichever path is configured, the fallback link is always returned
 * alongside a failure, so a committee member can finish the job by
 * hand the moment anything goes wrong.
 *
 * ---
 *
 * **What OpenWA is, in its own words.**
 *
 * OpenWA is a well-built, MIT-licensed, actively maintained gateway,
 * and its own README is honest about what it does:
 *
 *   "OpenWA is an unofficial, community-maintained gateway. It
 *    connects to WhatsApp through reverse-engineered clients (the
 *    whatsapp-web.js project and @whiskeysockets/baileys), not through
 *    Meta's official Cloud API."
 *
 *   "There is always a non-zero risk of account restriction or ban.
 *    WhatsApp's anti-abuse systems actively look for unofficial
 *    automation. No amount of code quality on our side can make that
 *    risk zero."
 *
 * Three things follow, and the committee decided to proceed knowing
 * them.
 *
 * **Use a number nobody minds losing.** Not a personal number that
 * carries a bank, a UPI id and a family group. A spare SIM. If it is
 * restricted there is often no appeal.
 *
 * **It cannot run on Vercel.** OpenWA is a long-lived server holding a
 * live WhatsApp session, several hundred megabytes of it when the
 * whatsapp-web.js engine is used, because that engine drives a real
 * headless browser. It needs an always-on host: a small virtual
 * machine, a free tier that does not sleep, or a machine on campus.
 * This site talks to it over HTTP and does not care where it lives.
 *
 * **Warm the number up first.** OpenWA's own guidance is to behave
 * like a person for the first few days, and never to send a first
 * message to a batch of strangers. Receipts go to people who have just
 * paid but who have usually never messaged the committee, which is the
 * pattern their guidance warns about. Send them spread out rather than
 * in a burst, and keep the link path for anything urgent.
 */

export type ReceiptMessage = {
  phone: string;
  name: string;
  amount: string;
  receiptNo: string;
  url: string;
};

export type Provider = "cloud" | "openwa" | "link";

/* ---------------------------------------------------------------
   Which paths are configured
   --------------------------------------------------------------- */

export function cloudApiReady(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

export function openWaReady(): boolean {
  return Boolean(
    process.env.OPENWA_URL &&
      process.env.OPENWA_API_KEY &&
      process.env.OPENWA_SESSION,
  );
}

/** True when anything at all can send without a human pressing send. */
export function whatsappReady(): boolean {
  return cloudApiReady() || openWaReady();
}

export function activeProvider(): Provider {
  if (cloudApiReady()) return "cloud";
  if (openWaReady()) return "openwa";
  return "link";
}

/* ---------------------------------------------------------------
   The message
   --------------------------------------------------------------- */

/**
 * The name is donor supplied and ends up in a message sent from an
 * account belonging to a real person, so newlines and length are
 * clamped before it goes anywhere.
 */
function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 80);
}

/**
 * Ten digits, however the donor wrote them.
 *
 * Numbers arrive with +91, with a leading zero, with spaces, with
 * hyphens. A link built from an unnormalised number fails silently:
 * WhatsApp opens on a chat with nobody.
 */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

export function receiptText(m: ReceiptMessage): string {
  return [
    `Namaskar ${clean(m.name)},`,
    "",
    `Your contribution of ${m.amount} to IISc Sharodiya Durgotsab 2026 has been verified against our bank statement.`,
    "",
    `Receipt ${m.receiptNo}`,
    m.url,
    "",
    "Your name is now on the donation board. Thank you, and Shubho Sharodiya.",
    "",
    "IISc Sharodiya Durgotsab Committee",
  ].join("\n");
}

/** A wa.me link, for the path that needs no account anywhere. */
export function waLink(m: ReceiptMessage): string {
  const ten = normalisePhone(m.phone);
  const to = ten ? `91${ten}` : m.phone.replace(/\D/g, "");
  return `https://wa.me/${to}?text=${encodeURIComponent(receiptText(m))}`;
}

type SendResult =
  | { ok: true; id: string; provider: Provider }
  | { ok: false; error: string; fallback: string; provider: Provider };

/* ---------------------------------------------------------------
   OpenWA
   --------------------------------------------------------------- */

function openWaBase(): string {
  return (process.env.OPENWA_URL ?? "").replace(/\/+$/, "");
}

/**
 * Whether the gateway is up and its session is linked to a phone.
 *
 * Worth checking before the festival rather than during it: a session
 * that has been logged out looks exactly like a working one until the
 * first receipt fails.
 */
export async function openWaStatus(): Promise<{
  ok: boolean;
  status?: string;
  number?: string;
  error?: string;
}> {
  if (!openWaReady()) return { ok: false, error: "OpenWA is not configured." };

  try {
    const res = await fetch(
      `${openWaBase()}/api/sessions/${process.env.OPENWA_SESSION}`,
      {
        headers: { "x-api-key": process.env.OPENWA_API_KEY! },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return { ok: false, error: `The gateway answered ${res.status}.` };
    }
    const data = (await res.json().catch(() => ({}))) as {
      status?: string;
      state?: string;
      me?: { id?: string; number?: string };
      phoneNumber?: string;
    };
    const status = data.status ?? data.state ?? "unknown";
    return {
      ok: /connected|authenticated|working|ready/i.test(status),
      status,
      number: data.me?.number ?? data.phoneNumber ?? data.me?.id,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Could not reach the gateway.",
    };
  }
}

async function sendViaOpenWa(m: ReceiptMessage): Promise<SendResult> {
  const ten = normalisePhone(m.phone);
  if (!ten) {
    return {
      ok: false,
      error: `That does not look like an Indian mobile number: ${m.phone}`,
      fallback: waLink(m),
      provider: "openwa",
    };
  }

  try {
    const res = await fetch(
      `${openWaBase()}/api/sessions/${process.env.OPENWA_SESSION}/messages/send-text`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.OPENWA_API_KEY!,
        },
        // The sender is whatever number that session is linked to. It
        // is never named here, so changing the SIM is a change on the
        // gateway and not a deploy of this site.
        body: JSON.stringify({
          chatId: `91${ten}@c.us`,
          text: receiptText(m),
        }),
        signal: AbortSignal.timeout(20000),
      },
    );

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      messageId?: string;
      message?: string;
      error?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error:
          data.error ??
          data.message ??
          `The gateway refused it (${res.status}).`,
        fallback: waLink(m),
        provider: "openwa",
      };
    }

    return {
      ok: true,
      id: data.id ?? data.messageId ?? "sent",
      provider: "openwa",
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Could not reach the gateway: ${err.message}`
          : "Could not reach the gateway.",
      fallback: waLink(m),
      provider: "openwa",
    };
  }
}

/* ---------------------------------------------------------------
   Meta's Cloud API
   --------------------------------------------------------------- */

async function sendViaCloud(m: ReceiptMessage): Promise<SendResult> {
  const phoneId = process.env.WHATSAPP_PHONE_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const template = process.env.WHATSAPP_TEMPLATE?.trim();
  const ten = normalisePhone(m.phone);
  const to = `91${ten ?? m.phone.replace(/\D/g, "").slice(-10)}`;

  const body = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG ?? "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: clean(m.name) },
                { type: "text", text: m.amount },
                { type: "text", text: m.receiptNo },
                { type: "text", text: m.url },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: true, body: receiptText(m) },
      };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      },
    );

    const data = (await res.json().catch(() => ({}))) as {
      messages?: { id: string }[];
      error?: { message?: string };
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.error?.message ?? `WhatsApp refused it (${res.status}).`,
        fallback: waLink(m),
        provider: "cloud",
      };
    }

    return {
      ok: true,
      id: data.messages?.[0]?.id ?? "sent",
      provider: "cloud",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach WhatsApp.",
      fallback: waLink(m),
      provider: "cloud",
    };
  }
}

/* ---------------------------------------------------------------
   The one the console calls
   --------------------------------------------------------------- */

export async function sendReceipt(m: ReceiptMessage): Promise<SendResult> {
  if (cloudApiReady()) {
    const result = await sendViaCloud(m);
    // Meta's API is the preferred path, but a refusal there should not
    // waste a working gateway sitting behind it.
    if (result.ok || !openWaReady()) return result;
  }

  if (openWaReady()) return sendViaOpenWa(m);

  return {
    ok: false,
    error: "No gateway is configured, so this one is sent by hand.",
    fallback: waLink(m),
    provider: "link",
  };
}
