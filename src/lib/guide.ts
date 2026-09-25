/** The Pujo Guide's guards, kept apart from the route so they can be tested. */

/**
 * Money questions never reach a model. Nothing a model says can make a
 * payment real, and a confident wrong answer about someone's money is
 * the one mistake this guide must never make.
 */
export const MONEY =
  /\b(donat\w*|paid|pay|payment\w*|upi|receipts?|transactions?|refund\w*|utr|transfer\w*|daan|money|amount|rupees?|rs|inr)\b|₹|দান|টাকা|রসিদ/i;

export const MONEY_REPLY =
  "I can't see or confirm payments, so I won't guess about one. To donate, use the Donate page at /daan, where the committee's account details and UPI QR are printed. If you have already paid, your numbered receipt reaches your WhatsApp once the treasurer matches the payment against the bank statement. For the status of a payment, message a convenor from the Contact page with your transaction reference.";

/**
 * A reply is kept only if every number in it is in the material it was
 * given, and it does not say a payment went through. A model that
 * invents a time or an amount falls through to the next one.
 * ponytail: ASCII digits only; Bengali numerals pass unchecked.
 */
export function grounded(reply: string, context: string): boolean {
  if (/\b(received|confirmed|verified|credited|went through)\b/i.test(reply)) return false;
  // Whole numbers, not substrings: an invented "26" must not pass
  // because "2026" is in the context.
  const tokens = (s: string) =>
    (s.match(/\d[\d,.:]*/g) ?? []).map((n) => n.replace(/,/g, "").replace(/[.:]+$/, ""));
  const known = new Set(tokens(context));
  return tokens(reply).every((n) => known.has(n));
}

/** Questions that differ only in case or punctuation share a cached answer. */
export function cacheKey(q: string): string {
  return q.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();
}
