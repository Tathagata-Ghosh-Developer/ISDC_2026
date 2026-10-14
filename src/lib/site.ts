/**
 * Single source of truth for every committee-editable constant.
 * Change things here, not in the pages.
 */

export const SITE = {
  name: "IISc Sharodiya Durgotsab",
  nameBangla: "আইআইএসসি শারদীয়া দুর্গোৎসব",
  year: 2026,
  tagline: "Where the Ganga meets the river of knowledge",
  taglineBangla: "গঙ্গা যেখানে মেশে জ্ঞানের নদীতে",
  description:
    "The Durga Puja of the Indian Institute of Science, Bengaluru. Five days of ritual, art and homecoming on a campus built for the pursuit of knowledge.",
  /**
   * The address, and the one place it is written down.
   *
   * The handle is iiscsharodiyadurgotsab everywhere: the Vercel
   * project, the domain when one is bought, and the social accounts.
   * It is long and it is unambiguous, which is the right trade for a
   * name people will be told out loud at a pandal.
   *
   * NEXT_PUBLIC_SITE_URL overrides it, so moving to a real domain is
   * an environment variable rather than a deploy of changed code.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "https://iiscsharodiyadurgotsab.vercel.app",
  /** The handle to claim, consistently, wherever it is available. */
  handle: "iiscsharodiyadurgotsab",
  venue:
    "Tata Memorial Club (TMC) Ground, opposite the SBI branch, Indian Institute of Science, Bengaluru 560012",
  venueShort: "TMC Ground, opposite SBI",
  /** Grid F3, building 126 on the official IISc campus map. */
  venueMapRef: "F3 126 on the IISc campus map",
  venueMapUrl:
    "https://www.google.com/maps/search/?api=1&query=Tata+Memorial+Club+Indian+Institute+of+Science+Bengaluru",
  venueDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Tata+Memorial+Club+Indian+Institute+of+Science+Bengaluru&travelmode=walking",
  campusMapPdf: "/media/map/iisc-campus-map.pdf",
  /** The committee crest, lifted from its own receipt book. */
  logo: "/media/brand/logo.png",
  logoMono: "/media/brand/logo-mono.png",
  icon: "/media/brand/icon-512.png",
  email: "iiscdurgotsab@gmail.com",
  /**
   * What the committee expects this year, stated as an expectation.
   * The measured figure from 2025 lives on the sponsorship proposal and
   * is what any claim here has to be reconciled against.
   */
  attendance: "over ten thousand visitors expected across the five days",
  campusMapSource: "https://iisc.ac.in/wp-content/uploads/2016/02/New-IISc-Map.pdf",
  established: 2023,
} as const;

/** Verified against Drik Panchang's 2026 Kolkata calendar. */
export const PUJA_DATES = {
  mahalaya: "2026-10-10T04:00:00+05:30",
  shashthi: "2026-10-16T08:30:00+05:30",
  saptami: "2026-10-17T07:00:00+05:30",
  ashtami: "2026-10-19T06:00:00+05:30",
  navami: "2026-10-20T08:30:00+05:30",
  dashami: "2026-10-21T08:31:00+05:30",
  /**
   * Two counts, because there are two arrivals. Mahalaya is when the
   * season opens on the radio. Shashthi is when she reaches this
   * campus and we go out to meet her.
   */
  countdownTo: "2026-10-10T04:00:00+05:30",
  arrival: "2026-10-16T08:30:00+05:30",
} as const;

/**
 * Bank account of the registered committee. Donations are transferred
 * directly, no payment gateway, so not one rupee is lost to fees.
 */
export const BANK = {
  accountName: "IISc Sharodiya Durgotsab Committee",
  accountNumber: "43391254585",
  ifsc: "SBIN0040007",
  bank: "State Bank of India",
  branch: "IISc Campus Branch, Bengaluru 560012",
  /**
   * Read off the bank issued QR, which prints the merchant as
   * IISC SHARODIYA DURGOTSAB. Override from the environment if the
   * bank ever reissues it.
   */
  upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "iiscsdc@sbi",
  merchantName: "IISC SHARODIYA DURGOTSAB",
  qrImage: "/media/qr/upi-qr.jpg",
} as const;

export const LINKS = {
  whatsappGroup: "https://chat.whatsapp.com/GmCMOD6sT9rCEkKrz4a0xS",
  instagram: "https://www.instagram.com/iiscsharodiyadurgotsab",
  youtube: "https://youtube.com/@iiscdurgotsab",
  volunteerForm:
    "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=l80Vb6f240Gyxa1Bk5dkdkZ2DdxWoepPjQfwChrWnjxUMVVUUTc5STg4SFlEM1FFTkRJRTE3QkhBMi4u",
  magazineSubmission:
    "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=l80Vb6f240Gyxa1Bk5dkdkZ2DdxWoepPjQfwChrWnjxUN0dUTzNXNllEWldYWVpHTjBKN1FHNlBLVi4u",
  coverCompetition:
    "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=l80Vb6f240Gyxa1Bk5dkdkZ2DdxWoepPjQfwChrWnjxUNkhGVDdBR0FUTFdYWlpNQTM5M1NUNzVKSi4u",
} as const;

/**
 * The executive committee elected at the General Body Meeting of
 * 19 July 2026, as recorded in the charge-transfer resolution.
 * Phone numbers appear only where the committee has published them.
 */
export const COMMITTEE = [
  {
    name: "Dr. Tapajyoti Das Gupta",
    role: "Faculty Advisor",
    bangla: "উপদেষ্টা",
    phone: "",
  },
  {
    name: "Tathagata Ghosh",
    role: "General Secretary",
    bangla: "সাধারণ সম্পাদক",
    phone: "7890825610",
  },
  {
    name: "Arnab Ghosh",
    role: "General Secretary",
    bangla: "সাধারণ সম্পাদক",
    phone: "",
  },
  {
    name: "Devraj Karmakar",
    role: "Convenor",
    bangla: "আহ্বায়ক",
    phone: "7384859512",
  },
  {
    name: "Sirshendu Pathak",
    role: "Convenor",
    bangla: "আহ্বায়ক",
    phone: "7001453229",
  },
  {
    name: "Sayak Maji",
    role: "Treasurer",
    bangla: "কোষাধ্যক্ষ",
    phone: "",
  },
  {
    name: "Ayan Das",
    role: "Treasurer",
    bangla: "কোষাধ্যক্ষ",
    phone: "",
  },
] as const;

/** Whoever a visitor should actually ring. */
export const CONTACTS = COMMITTEE.filter((m) => m.phone !== "").map((m) => ({
  name: m.name,
  role: m.role,
  phone: m.phone,
}));

/**
 * Who to go to for what.
 *
 * This sheet is behind a login and is never rendered on the public
 * site, because it carries working phone numbers for people who did
 * not publish them. Committee members and administrators can read it;
 * nobody else, including a signed-in viewer, can.
 *
 * `who` matches a name in COMMITTEE, so a change up there carries
 * down here rather than drifting out of step.
 */
export const POINTS_OF_CONTACT = [
  {
    area: "Money, receipts and the ledger",
    bangla: "হিসাব",
    who: ["Sayak Maji", "Ayan Das"],
    note: "Anything about a payment that has not been matched, a receipt number, or a donor asking where their money went. They hold the bank statement.",
  },
  {
    area: "Sponsorship and the souvenir",
    bangla: "পৃষ্ঠপোষকতা",
    who: ["Tathagata Ghosh", "Arnab Ghosh"],
    note: "Companies, alumni firms and anyone wanting a stall or a banner. Every sponsorship enquiry from the website lands in the committee inbox and one of them answers it.",
  },
  {
    area: "The ground, the pandal and the idol",
    bangla: "মণ্ডপ ও প্রতিমা",
    who: ["Devraj Karmakar", "Sirshendu Pathak"],
    note: "TMC Ground bookings, the decorator, the Kumartuli order and its transport, electricity and the sound system.",
  },
  {
    area: "Bhog, prasad and the kitchen",
    bangla: "ভোগ",
    who: ["Devraj Karmakar"],
    note: "Counts, timings, the caterer and the volunteer roster on the serving line.",
  },
  {
    area: "Cultural evenings and the invited artists",
    bangla: "সাংস্কৃতিক অনুষ্ঠান",
    who: ["Sirshendu Pathak", "Arnab Ghosh"],
    note: "The programme, rehearsal slots, the stage, and anyone arriving from another institute to perform.",
  },
  {
    area: "Permissions and the Institute",
    bangla: "অনুমতি",
    who: ["Dr. Tapajyoti Das Gupta", "Tathagata Ghosh"],
    note: "Anything needing the administration's signature: the ground, late-night sound, gate passes for vehicles, and the police intimation.",
  },
  {
    area: "The website, the magazine and photographs",
    bangla: "ওয়েবসাইট ও পত্রিকা",
    who: ["Tathagata Ghosh"],
    note: "Copy that is wrong, a photograph that should come down, the Probash submissions, and the logins for this console.",
  },
] as const;

/** The sheet with real numbers filled in, for the committee console. */
export function pointsOfContact() {
  const byName = new Map(COMMITTEE.map((m) => [m.name, m]));
  return POINTS_OF_CONTACT.map((p) => ({
    ...p,
    people: p.who.map((n) => {
      const m = byName.get(n);
      return {
        name: n,
        role: m?.role ?? "",
        phone: m?.phone ?? "",
      };
    }),
  }));
}

/**
 * Gates of the main campus, named as IISc names them.
 * Source: iisc.ac.in gate directory.
 */
export const GATES = [
  {
    id: "main-gate",
    name: "Main Gate",
    bangla: "প্রধান ফটক",
    note: "Marker 175 on the campus map, grid G3. The gate every auto and cab driver knows, off C. V. Raman Road at Prof. C. N. R. Rao Circle. Under four hundred metres to the ground.",
    origin: "IISc Main Gate, Bengaluru",
  },
  {
    id: "gymkhana-gate",
    name: "Gymkhana Gate",
    bangla: "জিমখানা গেট",
    note: "Marker 172, grid G2. The western end of C. V. Raman Road, beside the Gymkhana. A short walk in, and the natural gate if you arrive from Malleswaram by bus.",
    origin: "IISc Gymkhana Gate, Bengaluru",
  },
  {
    id: "d-gate",
    name: "D Gate",
    bangla: "ডি গেট",
    note: "Marker 171, grid C2. The quiet pedestrian gate on M. S. Ramaiah Road. A long straight walk south through the middle of the campus, and the pleasantest of them under the rain trees.",
    origin: "D Gate, Indian Institute of Science, Bengaluru",
  },
  {
    id: "new-bel-road-gate",
    name: "New BEL Road Gate",
    bangla: "নিউ বেল রোড গেট",
    note: "Marker 179, grid B5, by Ramaiah College. Closest if you are coming from Sadashivanagar or RMV, and a long walk once you are inside.",
    origin: "IISc New BEL Road Gate, Bengaluru",
  },
  {
    id: "mattikere-gate",
    name: "Mattikere Road Gate",
    bangla: "মত্তিকেরে রোড গেট",
    note: "Marker 177, grid F2. The Yeshwantpur side, closest to the new hostel blocks. Straight east along the road past the hostels.",
    origin: "IISc Mattikere Road Gate, Bengaluru",
  },
  {
    id: "kv-gate",
    name: "KV Gate",
    bangla: "কেন্দ্রীয় বিদ্যালয় গেট",
    note: "Marker 174, grid F2, beside Kendriya Vidyalaya. Useful if you are dropping children at the school and walking across afterwards.",
    origin: "Kendriya Vidyalaya IISc Gate, Bengaluru",
  },
  {
    id: "nias-gate",
    name: "NIAS Gate",
    bangla: "এনআইএএস গেট",
    note: "Marker 178, grid A2, at the National Institute of Advanced Studies. Rarely used by visitors and a genuinely long walk, but the prettiest way in.",
    origin: "NIAS Gate, Indian Institute of Science, Bengaluru",
  },
] as const;

/**
 * The menu reads in English so a visitor who does not read Bengali can
 * navigate it. The Bengali name and its romanisation travel with each
 * entry and appear on the page itself, which is where a name is worth
 * teaching rather than guessing at.
 */
export const NAV = [
  { href: "/utsab", label: "The Festival", bangla: "উৎসব", roman: "Utsab" },
  { href: "/mahalaya", label: "Mahalaya", bangla: "মহালয়া", roman: "Mahalaya" },
  { href: "/itihash", label: "History", bangla: "ইতিহাস", roman: "Itihash" },
  { href: "/shilpa", label: "Art Forms", bangla: "শিল্প", roman: "Shilpa" },
  { href: "/gaan", label: "Music", bangla: "গান", roman: "Gaan" },
  { href: "/probash", label: "Magazine", bangla: "প্রবাস", roman: "Probash" },
  { href: "/gallery", label: "Gallery", bangla: "ছবি", roman: "Chhobi" },
  { href: "/thikana", label: "Find Us", bangla: "ঠিকানা", roman: "Thikana" },
  { href: "/jogdan", label: "Join Us", bangla: "যোগদান", roman: "Jogdan" },
] as const;

/** Sponsorship tiers, taken from the committee's own deck. */
export const SPONSOR_TIERS = [
  {
    id: "title",
    name: "Title Sponsor",
    bangla: "শিরোনাম",
    amount: 100000,
    headline: 'Recognised as "Company Presents" across every creative',
    benefits: [
      "Ten promotional banners and standees through all event days",
      "Dedicated exhibition stall for all event days",
      "Premium stage branding and logo on official merchandise",
      "Brand presence in the magazine, invitation cards and brochures",
      "Promotional video on the venue LED display at peak hours",
      "Dedicated sponsor showcase across our social media",
      "On-stage acknowledgement at every cultural programme",
    ],
  },
  {
    id: "diamond",
    name: "Diamond Sponsor",
    bangla: "হীরক",
    amount: 75000,
    headline: "Secondary branding on the main entrance gate banner",
    benefits: [
      "Five promotional banners through all event days",
      "One stall space for all event days",
      "Five standees at prominent locations",
      "Logo on official merchandise and in the magazine",
      "Video presentation slot on the LED display",
      "Company profile distribution with social media promotion",
      "Vocal acknowledgement at all major events",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Sponsor",
    bangla: "প্ল্যাটিনাম",
    amount: 50000,
    headline: "Four banners, four standees and an LED slot",
    benefits: [
      "Four promotional banners for all event days",
      "Four standees at prominent locations",
      "Video presentation slot on the LED display",
      "Logo on official merchandise and in the magazine",
      "Company profile distribution with social media promotion",
      "Vocal acknowledgement at all major events",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    bangla: "স্বর্ণ",
    amount: 35000,
    headline: "Prominent placement on the sponsor strip",
    benefits: [
      "Three promotional banners for all event days",
      "Three standees at prominent locations",
      "Prominent logo on the sponsor strip",
      "Logo on the LED video panel",
      "Company profile and information distribution",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    bangla: "রৌপ্য",
    amount: 25000,
    headline: "On the sponsor strip and the LED panel",
    benefits: [
      "Promotional banners for all event days",
      "Standees at prominent locations",
      "Logo on the sponsor strip and LED video panel",
    ],
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    bangla: "ব্রোঞ্জ",
    amount: 15000,
    headline: "A first foot in the door",
    benefits: [
      "Promotional banner for all event days",
      "Logo on the sponsor strip",
      "Acknowledgement on social media",
    ],
  },
] as const;

/**
 * The title sponsor for this year.
 *
 * This lives in code and not in the console, on purpose. The console's
 * sponsor list is for partners that come and go between one edit and
 * the next. The title sponsorship is a signed arrangement, and a stray
 * edit to a JSON field must not be able to take it off the site.
 * Changing it is a commit, with a name against it.
 *
 * The display name is the two constants just below and nowhere else:
 * every page, the metadata, the JSON-LD, llms.txt and the FAQ read it
 * from here, so a change of name is a change of one line.
 *
 * The four marks are cut to one size, 1200 by 480, so they render at
 * the same scale in tiles of the same 5:2 shape. The order is the
 * committee's; keep it. An empty url means there is no link: the tile
 * renders plain, and an address is never guessed. The site is "Powered
 * by" Genotypic Group, the umbrella over all four companies, so the
 * line names the group and each mark carries its own company's name.
 *
 * The first mark follows the sponsor's brand guidelines (December
 * 2025), which are stricter than the others: never under 150 px wide,
 * clear space on every side at least the height of the "G", the
 * full-colour version only on a light ground (on a dark one, only the
 * negative version, white on their sky blue #1F9CD6). So genotypic.png
 * carries its clear space in the file (the artwork is 750 wide,
 * centred) and always sits on a light tile. It is cut from the master
 * artwork the sponsor sent; never redraw or recolour it.
 */
const TITLE_SPONSOR_NAME = "Genotypic Group";
const TITLE_SPONSOR_NAME_BANGLA = "জেনোটাইপিক গ্রুপ";
const TITLE_SPONSOR_YEAR = 2026;

export const TITLE_SPONSOR = {
  name: TITLE_SPONSOR_NAME,
  nameBangla: TITLE_SPONSOR_NAME_BANGLA,
  line: `Powered by ${TITLE_SPONSOR_NAME}`,
  lineBangla: `নিবেদনে ${TITLE_SPONSOR_NAME_BANGLA}`,
  year: TITLE_SPONSOR_YEAR,
  tierId: "title",
  /**
   * The trademark notice the guidelines ask for in the footer of
   * anything that carries the name or the logo. Their wording, kept
   * verbatim (the spelling "GTExprees" is theirs); the company named
   * in it is the registered one, not the display name above.
   */
  notice: `© ${TITLE_SPONSOR_YEAR} An ISO 9001:2015 certified company Genotypic Technology Pvt Ltd. All rights reserved. Genotypic Technology Pvt Ltd, Commander, GTGPU, GTnRich, GTExprees the sky blue, red, green, yellow color and the streaming bases design are trademarks of Genotypic Technology Pvt Ltd. and/or its affiliate(s) in India and/or other countries. All other names, logos, and other trademarks are the property of their respective owners.`,
  logos: [
    {
      id: "genotypic",
      // the company's own name, as its brand guidelines write it
      name: "Genotypic Technology",
      logo: "/media/sponsors/genotypic.png",
      url: "https://genotypic.co.in/",
    },
    {
      id: "genstride",
      name: "Genstride Technologies",
      logo: "/media/sponsors/genstride.png",
      url: "",
    },
    {
      id: "dhitiomics",
      name: "Dhitiomics Technologies",
      logo: "/media/sponsors/dhitiomics.png",
      url: "https://www.dhitiomics.com/",
    },
    {
      id: "qtlomics",
      name: "Qtlomics",
      logo: "/media/sponsors/qtlomics.png",
      url: "https://www.qtlomics.com/",
    },
  ],
} as const;

/** One mark on the partner strip; see PARTNERS. */
export type Partner = {
  id: string;
  role: string;
  bangla: string;
  name: string;
  logo: string;
  width: number;
  height: number;
  /** Checked by hand; empty when nothing official could be found. */
  url: string;
  /** Rupees; 0 means in kind. */
  contribution: number;
  note: string;
  /** The ground the mark was drawn for: the tile keeps it on either theme. */
  tile: "light" | "dark";
  /** The sponsorship level it was bought at, when it was one of SPONSOR_TIERS. */
  tier?: string;
  /** A second organisation in the same partnership and the same payment. */
  with?: Omit<Partner, "url" | "contribution" | "note" | "with" | "tier"> & { url: string };
};

/**
 * The partners after the title sponsor, in the order of what they put
 * in, and given room on the page in that order. `contribution` is in
 * rupees; 0 means in kind. An empty url means no link: nothing official
 * could be found online for IITxIIM Jewels (12 October 2026) or for
 * Britton Innotech, Swadisht Bhojan Adda and Prakriti Foundation
 * (14 October 2026), so those tiles are the name and the mark and no
 * address is guessed. Each tile keeps the ground its mark was drawn
 * on, light or dark, on either theme.
 *
 * Swadisht Bhojan Adda and its NGO, Prakriti Foundation, came in
 * together with one payment, so they share one tile and one amount.
 * Britton Innotech's ₹15,000 arrived as ₹14,700 by NEFT on 14 October
 * 2026: the 2% TDS a company deducts on a sponsorship.
 */
export const PARTNERS: readonly Partner[] = [
  {
    id: "bronze-britton",
    role: "Bronze Sponsor",
    bangla: "ব্রোঞ্জ পৃষ্ঠপোষক",
    name: "Britton Innotech",
    logo: "/media/sponsors/britton-innotech.png",
    width: 1200,
    height: 480,
    url: "",
    contribution: 15000,
    note: "",
    tile: "light",
    tier: "bronze",
  },
  {
    id: "jewellery",
    role: "Jewellery Partner",
    bangla: "অলংকার সহযোগী",
    name: "IITxIIM Jewels",
    logo: "/media/sponsors/iitxiim-jewels.jpg",
    width: 869,
    height: 580,
    url: "",
    contribution: 15000,
    note: "",
    tile: "dark",
  },
  {
    id: "food",
    role: "Food Partner",
    bangla: "খাদ্য সহযোগী",
    name: "Swadisht Bhojan Adda",
    logo: "/media/sponsors/swadisht-bhojan-adda.webp",
    width: 720,
    height: 720,
    url: "",
    contribution: 15000,
    note: "Their roll and sweets stall stands by the pandal through the five days, with Bengali rolls, cutlets and sweets, and they come with their NGO, Prakriti Foundation.",
    tile: "light",
    with: {
      id: "ngo",
      role: "NGO Partner",
      bangla: "সমাজসেবী সহযোগী",
      name: "Prakriti Foundation",
      logo: "/media/sponsors/prakriti-foundation.jpg",
      width: 629,
      height: 720,
      url: "",
      tile: "dark",
    },
  },
  {
    id: "merchandise",
    role: "Merchandise Partner",
    bangla: "মার্চেন্ডাইজ সহযোগী",
    name: "Meme Theory",
    logo: "/media/sponsors/meme-theory.png",
    width: 512,
    height: 512,
    url: "https://www.memetheory.in/",
    contribution: 0,
    note: "A bootstrapped start-up by IISc students. They make, sell and deliver the official T-shirt; no money passes between them and the committee.",
    tile: "dark",
  },
];

/**
 * The food partner's menu card, as they printed it for the stall by the
 * pandal. Prices are theirs; the card is shown as supplied.
 */
export const FOOD_STALL = {
  partner: "food",
  menu: "/media/sponsors/swadisht-bhojan-adda-menu.webp",
  menuWidth: 1066,
  menuHeight: 1599,
  where: "The roll and sweets stall beside the pandal, on the TMC Ground",
} as const;

/**
 * The official merchandise. Sold, paid for and delivered entirely by
 * the merchandise partner, under their terms; the committee takes no
 * orders and no money. Read off the product and policy pages on 12
 * October 2026. Price and delivery are theirs to change, so check the
 * product page before quoting them anywhere else.
 */
export const MERCH = {
  title: "Pujo Hits IISc",
  line: "The official T-shirt of the IISc Sharodiya Durgotsab",
  lineBangla: "পুজোর অফিসিয়াল টি-শার্ট",
  url: "https://www.memetheory.in/product/6aca697a15387416873f0e0d",
  price: 449,
  fits: ["Regular", "Oversized"],
  sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
  /** Regular fit, chest in inches, from the committee's size sheet. */
  chart: [
    { size: "S", chest: 38 },
    { size: "M", chest: 40 },
    { size: "L", chest: 42 },
    { size: "XL", chest: 44 },
    { size: "2XL", chest: 46 },
    { size: "3XL", chest: 48 },
  ],
  colour: "Petrol blue",
  front: "Durga in white alpona with a floral border, the committee crest on the chest, and the title sponsor's four marks on the sleeves.",
  back: "Durga in a half-sun of gold and red, the trishul, দেবী, and the Institute's crest at the collar.",
  delivery: "Free delivery to IISc hostel blocks, or collect at Aryabhatta or NGH. Campus orders only.",
  seller: "Meme Theory Apparel",
  support: "support@memetheory.in",
  terms: "https://www.memetheory.in/terms",
  refunds: "https://www.memetheory.in/refund-policy",
  shipping: "https://www.memetheory.in/shipping-policy",
} as const;

/**
 * The printed receipt. Modelled on the committee's own bill book, down
 * to the wording. Drop scanned signatures into public/media/signatures
 * and name them here when the treasurers provide them.
 */
export const RECEIPT = {
  heading: "Indian Institute of Science, Bengaluru 560012",
  towards: "Sharodiya Durgotsab 2026",
  note: "Received with thanks. This contribution is voluntary and carries no consideration in return. No payment gateway was used, so the full amount reaches the committee account.",
  signatories: [
    { name: "Sayak Maji", role: "Treasurer", image: "" },
    { name: "Ayan Das", role: "Treasurer", image: "" },
  ],
} as const;

/** Back issues of Probash, readable in the browser. */
export const MAGAZINES = [
  {
    id: "probash-2025",
    year: "2025",
    title: "Probash 2025",
    bangla: "প্রবাস ২০২৫",
    file: "/media/magazine/probash-2025.pdf",
    pages: 70,
    note: "The full issue, as it was printed and handed out at the pandal.",
  },
  {
    id: "probash-2024",
    year: "2024",
    title: "Probash 2024",
    bangla: "প্রবাস ২০২৪",
    file: "/media/magazine/probash-2024.pdf",
    pages: 89,
    note: "The online edition, the longest issue the committee has produced.",
  },
] as const;

export const SPONSOR_CONTACT = {
  emails: ["iiscdurgotsab@gmail.com", "tathagatag@iisc.ac.in", "devrajk@iisc.ac.in"],
  deck: "/media/sponsorship-tiers.pdf",
} as const;

/** Volunteer verticals, lifted verbatim from the committee's own call. */
export const VOLUNTEER_ROLES = [
  {
    id: "content-design",
    icon: "🎨",
    en: "Content & Design",
    bn: "কন্টেন্ট ও ডিজাইন",
    blurb:
      "Turn creativity into devotion. Social posts, banners, storytelling, visual design, the Puja gets its face from your hands.",
    blurbBn:
      "সৃজনশীলতাকে পুজোর রূপ দাও। সোশাল মিডিয়া পোস্ট থেকে ব্যানার, গল্প বলা থেকে ভিজ্যুয়াল ডিজাইন, তোমার হাতের ছোঁয়ায় পুজো পাক তার পরিচয়।",
  },
  {
    id: "sponsorship",
    icon: "💼",
    en: "Sponsorship",
    bn: "স্পনসরশিপ",
    blurb:
      "Be the bridge between the celebration and the world around it. Connect, communicate, and help build the resources that bring Durgotsab to life.",
    blurbBn:
      "পুজোর আয়োজনকে সম্ভব করে তোলার পেছনে থাকে অনেক মানুষের সংযোগ। সেই সেতু হয়ে ওঠো তুমি।",
  },
  {
    id: "decoration",
    icon: "🌸",
    en: "Decoration",
    bn: "সাজসজ্জা",
    blurb:
      "Sharad has its own language, marigolds, earthen lamps, the golden haze of autumn. No experience needed, only willing hands.",
    blurbBn:
      "শরতের নিজের একটা ভাষা আছে, গাঁদা ফুলের মালা, মাটির প্রদীপ, সোনালি আলোর ছায়া। সেই ভাষায় সাজাও আমাদের মণ্ডপ।",
  },
  {
    id: "puja-arrangements",
    icon: "🪔",
    en: "Puja Arrangements",
    bn: "পুজোর আয়োজন",
    blurb:
      "The sacred heart of it all. Flowers, incense, dhuno, mantra, the conch, from Bodhon to Bisarjan. This is not work, it is worship.",
    blurbBn:
      "এটি সবচেয়ে পবিত্র ভূমিকা, ফুল, ধূপ, ধুনো, মন্ত্র, শঙ্খধ্বনি, বোধন থেকে বিসর্জন। এটি শুধু কাজ নয়, এটি আরাধনা।",
  },
  {
    id: "fundraising",
    icon: "💰",
    en: "Fundraising",
    bn: "ফান্ডরেইজিং",
    blurb:
      "Desks outside the mess counters three weeks before the Puja. Chat with peers, spread the festive mood, mobilise the campus.",
    blurbBn:
      "পুজোর ঠিক তিন সপ্তাহ আগে মেসে বসে শিক্ষার্থীদের সাথে গল্পে-আড্ডায় অনুদান সংগ্রহের দায়িত্ব।",
  },
  {
    id: "logistics",
    icon: "📦",
    en: "Logistics",
    bn: "লজিস্টিকস",
    blurb:
      "Pandal build, sound, lighting, procurement, venue execution, the backbone that keeps five days of festivity running.",
    blurbBn:
      "মণ্ডপ তৈরি, সাউন্ড, লাইটিং থেকে শুরু করে পুজোর যাবতীয় সরঞ্জামের পরিচালনা, পেছনের সারির মাস্টারমাইন্ড।",
  },
  {
    id: "magazine",
    icon: "📖",
    en: "Magazine, Probash",
    bn: "স্মারকপত্র ও ম্যাগাজিন",
    blurb:
      "Capture the magic in words, art and nostalgia. Curate, edit and lay out our annual souvenir so campus memories outlive us.",
    blurbBn:
      "লেখা, ছবি ও স্মৃতির কোলাজে আমাদের পুজোর নিজস্ব ম্যাগাজিন সাজিয়ে তোলার কাজ।",
  },
  {
    id: "prasad",
    icon: "🥣",
    en: "Bhog & Prasad",
    bn: "ভোগ ও প্রসাদ বিতরণ",
    blurb:
      "Serve Ma's khichuri bhog and prasad with affection. Be the hospitality of the festival; nobody leaves without a blessing.",
    blurbBn:
      "মায়ের মহাপ্রসাদ ও খিচুড়ি ভোগ ভক্তি আর ভালোবাসায় সবার মাঝে বিতরণ করার পবিত্র দায়িত্ব।",
  },
] as const;

export const DONOR_CATEGORIES = [
  { value: "student", label: "Student", bangla: "ছাত্রছাত্রী" },
  { value: "faculty", label: "Faculty / Staff", bangla: "অধ্যাপক / কর্মী" },
  { value: "alumni", label: "Alumni", bangla: "প্রাক্তনী" },
  { value: "guest", label: "Well-wisher / Guest", bangla: "শুভানুধ্যায়ী" },
] as const;

export type DonorCategory = (typeof DONOR_CATEGORIES)[number]["value"];
