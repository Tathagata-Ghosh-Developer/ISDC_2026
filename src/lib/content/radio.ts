import "server-only";

/**
 * The live streams, checked and not used. See the note above the
 * dial. Each responds 200 with an open CORS header and carries a
 * 32 and a 64 kilobit rendition. If Prasar Bharati ever writes back,
 * this is the whole of what has to change.
 *
 * Four regional Bengali stations were listed here and have been
 * removed: Siliguri, Murshidabad, Shantiniketan and Kurseong. They
 * lived on Prasar Bharati's WAVES platform, which now redirects to a
 * CloudFront distribution that answers a bare 404. They are named
 * here so that nobody spends an afternoon rediscovering them.
 *
 * Checked 22 September 2026. These things move; check again before
 * relying on any of them.
 */
export const AKASHVANI_STREAMS: Record<string, string> = {
  maitree:
    "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio245/hlspbaudio245_Auto.m3u8",
  "kolkata-a":
    "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio055/hlspbaudio055_Auto.m3u8",
  "kolkata-b":
    "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio056/hlspbaudio056_Auto.m3u8",
  bangla:
    "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio137/hlspbaudio137_Auto.m3u8",
  "fm-gold-kolkata":
    "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio057/hlspbaudio057_Auto.m3u8",
  rainbow:
    "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio058/hlspbaudio058_Auto.m3u8",
  "vividh-bharati":
    "https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio275/hlspbaudio275_Auto.m3u8",
};

/** Prasar Bharati's published terms, quoted so nobody has to go looking. */
export const AKASHVANI_TERMS = {
  url: "https://prasarbharati.gov.in/terms-conditions/",
  quote:
    "you may not reproduce, republish, post, transmit or distribute any material on Prasar Bharati website",
  verdict:
    "Link out to the official player. The open CORS header on the streams is a technical affordance, not a licence. If the committee wants inline playback, write to Prasar Bharati citing their hyperlinking policy and keep the reply.",
} as const;
