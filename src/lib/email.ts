import "server-only";
import { SITE } from "@/lib/site";

/**
 * Emailing a receipt.
 *
 * Optional, like everything else that costs money. Two providers are
 * supported because both have a free tier big enough for a festival:
 * Resend (100 messages a day) and Brevo (300 a day). Set one of them
 * and the receipt goes to the donor's inbox as well as their WhatsApp.
 * Set neither and nothing breaks; the WhatsApp path is unaffected.
 *
 *   RESEND_API_KEY=...        or   BREVO_API_KEY=...
 *   MAIL_FROM="IISc Sharodiya Durgotsab <receipts@yourdomain>"
 *
 * Both providers require the sending address to belong to a domain you
 * have verified with them. An unverified address is the usual reason a
 * first attempt fails.
 */

export type ReceiptEmail = {
  to: string;
  name: string;
  amount: string;
  receiptNo: string;
  url: string;
};

export function emailReady(): boolean {
  return Boolean(
    (process.env.RESEND_API_KEY || process.env.BREVO_API_KEY) &&
      process.env.MAIL_FROM,
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain text, because a receipt should survive any mail client. */
function plain(m: ReceiptEmail): string {
  return [
    `Namaskar ${m.name},`,
    "",
    `Your contribution of ${m.amount} to IISc Sharodiya Durgotsab 2026 has been verified against our bank statement.`,
    "",
    `Receipt ${m.receiptNo}`,
    m.url,
    "",
    "Open the link to view, print or save the receipt as a PDF.",
    "Your name is now on the donation board.",
    "",
    "Thank you, and Shubho Sharodiya.",
    "IISc Sharodiya Durgotsab Committee",
  ].join("\n");
}

function html(m: ReceiptEmail): string {
  const name = escapeHtml(m.name);
  const amount = escapeHtml(m.amount);
  const receipt = escapeHtml(m.receiptNo);
  const url = escapeHtml(m.url);

  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f2e7d2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2e7d2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf6ea;border:1px solid rgba(23,17,12,.16);">
        <tr><td style="height:6px;background:linear-gradient(90deg,#c0271a,#c9871f,#a8842f);"></td></tr>
        <tr><td style="padding:32px;font-family:Georgia,'Times New Roman',serif;color:#17110c;">
          <p style="margin:0 0 4px;font-size:13px;letter-spacing:.24em;text-transform:uppercase;color:#a8842f;">Receipt ${receipt}</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:600;">IISc Sharodiya Durgotsab 2026</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Namaskar ${name},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
            Your contribution of <strong>${amount}</strong> has been verified against our bank statement.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;">
            Your name is now on the donation board. The full receipt, which you can print or save as a PDF, is here.
          </p>
          <p style="margin:0 0 28px;">
            <a href="${url}" style="display:inline-block;background:#c0271a;color:#fbf6ea;text-decoration:none;padding:13px 26px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">View your receipt</a>
          </p>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#4d3a2a;">
            If the button does not work, open this link:<br>
            <a href="${url}" style="color:#a8842f;">${url}</a>
          </p>
          <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid rgba(23,17,12,.16);font-size:13px;line-height:1.7;color:#4d3a2a;">
            Thank you, and Shubho Sharodiya.<br>
            <strong>IISc Sharodiya Durgotsab Committee</strong>
          </p>
          <p style="margin:16px 0 0;font-size:11px;line-height:1.6;color:#8a7360;">
            This receipt link is private to you. The committee is not registered under section 80G, so this contribution is not tax deductible.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

type Result = { ok: true } | { ok: false; error: string };

export async function sendReceiptEmail(m: ReceiptEmail): Promise<Result> {
  if (!emailReady()) return { ok: false, error: "Email is not configured." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.to)) {
    return { ok: false, error: "That donor has no usable email address." };
  }

  const from = process.env.MAIL_FROM!;
  const subject = `Receipt ${m.receiptNo}, IISc Sharodiya Durgotsab 2026`;

  /**
   * Replies go to a person, not to a sending domain.
   *
   * The address the site sends from has to be a domain the committee
   * controls, because iisc.ac.in publishes a hard SPF fail and a
   * DMARC quarantine policy: mail claiming to be from it, sent by
   * anybody else, goes to spam and files a forensic report naming the
   * sender. A donor replying to their receipt should still reach a
   * human at the Institute, so the reply-to says so even though the
   * From cannot.
   */
  const replyTo = process.env.MAIL_REPLY_TO?.trim() || SITE.email;

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to: [m.to],
          reply_to: replyTo,
          subject,
          text: plain(m),
          html: html(m),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        return { ok: false, error: body.message ?? `Resend said ${res.status}.` };
      }
      return { ok: true };
    }

    // Brevo wants the sender split into a name and an address.
    const match = from.match(/^\s*(.*?)\s*<(.+)>\s*$/);
    const senderName = match?.[1] || "IISc Sharodiya Durgotsab";
    const senderEmail = match?.[2] || from;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        replyTo: { email: replyTo, name: "IISc Sharodiya Durgotsab" },
        to: [{ email: m.to, name: m.name }],
        subject,
        textContent: plain(m),
        htmlContent: html(m),
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      return { ok: false, error: body.message ?? `Brevo said ${res.status}.` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach the mail provider.",
    };
  }
}
