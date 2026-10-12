/**
 * The UPI links on /daan: the payee must come through exactly, in
 * every app's own door.
 */
import { describe, expect, it } from "vitest";
import { BANK_QR_QUERY, BANK_QR_VPA, upiLinks, upiQuery } from "@/lib/upi";
import { DEFAULTS } from "@/lib/config";

const payee = { vpa: "iiscsdc@sbi", name: "IISC SHARODIYA DURGOTSAB", note: "IISc Durga Puja 2026" };

describe("the UPI payment link", () => {
  it("keeps the @ in the UPI ID, and spaces as %20", () => {
    expect(upiQuery(payee)).toBe(
      "pa=iiscsdc@sbi&pn=IISC%20SHARODIYA%20DURGOTSAB&cu=INR&tn=IISc%20Durga%20Puja%202026",
    );
  });

  it("never encodes the @, never writes + for a space", () => {
    const q = upiQuery(payee);
    expect(q).not.toContain("%40");
    expect(q).not.toContain("+");
  });

  it("trims a UPI ID pasted with spaces around it", () => {
    expect(upiQuery({ ...payee, vpa: " iiscsdc@sbi " })).toMatch(/^pa=iiscsdc@sbi&/);
  });

  it("still escapes characters that would break the query", () => {
    expect(upiQuery({ ...payee, note: "Puja & bhog = 2026" })).toContain("tn=Puja%20%26%20bhog%20%3D%202026");
  });

  it("sends the bank's signed QR request, untouched, for the bank's UPI ID", () => {
    const l = upiLinks(payee);
    expect(l.any).toBe(`upi://pay?${BANK_QR_QUERY}`);
    expect(l.gpayAndroid).toBe(`tez://upi/pay?${BANK_QR_QUERY}`);
    expect(l.gpayIos).toBe(`gpay://upi/pay?${BANK_QR_QUERY}`);
    expect(l.phonepe).toBe(`phonepe://pay?${BANK_QR_QUERY}`);
    expect(l.paytm).toBe(`paytmmp://pay?${BANK_QR_QUERY}`);
    // the merchant fields and the signature survive, "+" and "=" included
    expect(l.any).toContain("&mc=8699&");
    expect(l.any).toContain("&mode=02&");
    expect(l.any).toMatch(/&sign=[A-Za-z0-9+/]+=*$/);
    expect(l.any).not.toContain("%40");
  });

  it("matches the UPI ID the site shows", () => {
    expect(BANK_QR_VPA).toBe(DEFAULTS.bank.upiId);
    expect(upiLinks({ ...payee, vpa: " iiscsdc@sbi " }).any).toBe(`upi://pay?${BANK_QR_QUERY}`);
  });

  it("falls back to a plain, correct link for any other UPI ID", () => {
    const other = { ...payee, vpa: "someone@okaxis" };
    expect(upiLinks(other).any).toBe(`upi://pay?${upiQuery(other)}`);
    expect(upiLinks(other).any).toMatch(/^upi:\/\/pay\?pa=someone@okaxis&/);
  });

  it("uses the committee's account by default", () => {
    expect(DEFAULTS.bank.upiId).toBe("iiscsdc@sbi");
  });
});
