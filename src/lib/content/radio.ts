import "server-only";

/**
 * The live streams, checked and not used. See the note above the
 * dial. Each responds 200 with an open CORS header and carries a
 * 32 and a 64 kilobit rendition. If Prasar Bharati ever writes back,
 * this is the whole of what has to change.
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
  siliguri:
    "https://radio.wavespb.com/live/165856ba98ca031a/165856ba98ca031a.m3u8",
  murshidabad:
    "https://radio.wavespb.com/live/47a45f818dd9203b/47a45f818dd9203b.m3u8",
  shantiniketan:
    "https://radio.wavespb.com/live/66249dfecaf80241/66249dfecaf80241.m3u8",
  kurseong:
    "https://radio.wavespb.com/live/1f781b48497e67d3/1f781b48497e67d3.m3u8",
};

/** Prasar Bharati's published terms, quoted so nobody has to go looking. */
export const AKASHVANI_TERMS = {
  url: "https://prasarbharati.gov.in/terms-conditions/",
  quote:
    "you may not reproduce, republish, post, transmit or distribute any material on Prasar Bharati website",
  verdict:
    "Link out to the official player. The open CORS header on the streams is a technical affordance, not a licence. If the committee wants inline playback, write to Prasar Bharati citing their hyperlinking policy and keep the reply.",
} as const;
