import "server-only";

/**
 * Sending the receipt to the donor.
 *
 * Two paths, and the committee can use either.
 *
 * 1. The default. A committee member presses a button and their own
 *    WhatsApp opens with the message already written, including the
 *    link to the filled receipt. Costs nothing, needs no approval,
 *    works from a phone at the donation desk.
 *
 * 2. The WhatsApp Cloud API, if the committee sets it up with Meta.
 *    Then the message goes out from the server without anyone
 *    pressing anything. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID.
 *
 * Note that Meta only allows a free form message inside a twenty four
 * hour window opened by the donor writing to you first. Outside it you
 * must use an approved template, which is what WHATSAPP_TEMPLATE is
 * for. Without a template name this falls back to a plain text message
 * and reports honestly when Meta refuses it.
 */

export type ReceiptMessage = {
  phone: string;
  name: string;
  amount: string;
  receiptNo: string;
  url: string;
};

export function whatsappReady(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

export function receiptText(m: ReceiptMessage): string {
  return [
    `Namaskar ${m.name},`,
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

/** A wa.me link, for the path that needs no Meta account at all. */
export function waLink(m: ReceiptMessage): string {
  return `https://wa.me/91${m.phone}?text=${encodeURIComponent(receiptText(m))}`;
}

type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fallback: string };

export async function sendReceipt(m: ReceiptMessage): Promise<SendResult> {
  if (!whatsappReady()) {
    return {
      ok: false,
      error: "The Cloud API is not configured.",
      fallback: waLink(m),
    };
  }

  const phoneId = process.env.WHATSAPP_PHONE_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const template = process.env.WHATSAPP_TEMPLATE?.trim();
  const to = `91${m.phone}`;

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
                { type: "text", text: m.name },
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
      };
    }

    return { ok: true, id: data.messages?.[0]?.id ?? "sent" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach WhatsApp.",
      fallback: waLink(m),
    };
  }
}
