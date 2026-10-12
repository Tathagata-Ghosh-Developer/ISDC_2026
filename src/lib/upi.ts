/* ================================================================
   UPI payment links, kept free of React so a test can hold them.

   One query, several doors. Android hands a plain upi:// link to
   whichever UPI app the payer picks. iOS has no such chooser: a
   upi:// link there opens nothing, and each app answers only its own
   scheme. So the page offers the plain link and each big app's own.
   ================================================================ */

export type UpiPayee = {
  /** The payee's UPI ID, e.g. iiscsdc@sbi. */
  vpa: string;
  /** The name the payer's app should show for the payee. */
  name: string;
  /** The payment note. */
  note: string;
};

/**
 * The query every UPI app reads: pa, pn, cu and tn, in NPCI's order.
 * Spaces become %20 (URLSearchParams would write "+", which some apps
 * print literally), and the UPI ID keeps its "@" as it is: several apps
 * read "%40" as part of the ID and then cannot find the payee.
 */
export function upiQuery({ vpa, name, note }: UpiPayee): string {
  return Object.entries({ pa: vpa.trim(), pn: name, cu: "INR", tn: note })
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%40/g, "@")}`)
    .join("&");
}

/**
 * The query inside the bank-issued QR (public/media/qr/upi-qr.jpg),
 * character for character. SBI registered the account as a merchant
 * (mc 8699, mode 02) and signs the request (orgid, sign); UPI apps
 * trust a signed merchant request and may refuse an unsigned one, or
 * show a different name. So the buttons send exactly what the QR does,
 * and scanning and tapping reach the same payee the same way. If the
 * bank issues a new QR, decode it and replace this string.
 */
export const BANK_QR_QUERY =
  "pa=iiscsdc@sbi&pn=IISC%20SHARODIYA%20DURGOTSAB%20COMMITTEE&mc=8699&tr=&tn=&am=&cu=INR&url=&mode=02&purpose=00&orgid=180102&sign=MEQCIHnyumm3+EDJU7okwTZVE54jjK33Y8cMHMK9PZ7WCNvKAiBIjM6yZnM+zTltt55SysKJjx91vmYA2MLTn8R5hKaKUQ==";

/** The UPI ID the bank's signed QR pays. */
export const BANK_QR_VPA = /(?:^|&)pa=([^&]*)/.exec(BANK_QR_QUERY)![1];

/**
 * The links, one per door. For the bank's own UPI ID they carry the
 * signed QR query untouched; for any other ID (say the console is
 * changed to a new account before a new QR is decoded) they fall back
 * to a plain query built from the payee.
 */
export function upiLinks(payee: UpiPayee) {
  const q = payee.vpa.trim() === BANK_QR_VPA ? BANK_QR_QUERY : upiQuery(payee);
  return {
    any: `upi://pay?${q}`,
    gpayAndroid: `tez://upi/pay?${q}`,
    gpayIos: `gpay://upi/pay?${q}`,
    phonepe: `phonepe://pay?${q}`,
    paytm: `paytmmp://pay?${q}`,
  };
}
