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
    "The Durga Puja of the Indian Institute of Science, Bengaluru. Four days of ritual, art and homecoming on a campus built for the pursuit of knowledge.",
  url: "https://iisc-durgotsab.vercel.app",
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
  attendance: "over 10,000 visitors across five days",
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
  /** The countdown runs to Mahalaya, when the recitation goes on air. */
  countdownTo: "2026-10-10T04:00:00+05:30",
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
 * Gates of the main campus, named as IISc names them.
 * Source: iisc.ac.in gate directory.
 */
export const GATES = [
  {
    id: "main-gate",
    name: "Main Gate",
    bangla: "প্রধান ফটক",
    note: "The gate most visitors use, off Prof. C. N. R. Rao Circle. Auto and cab drivers know it as the Tata Institute gate.",
    origin: "IISc Main Gate, Bengaluru",
  },
  {
    id: "d-gate",
    name: "D Gate",
    bangla: "ডি গেট",
    note: "The quieter pedestrian entrance on the Malleswaram side.",
    origin: "D Gate, Indian Institute of Science, Bengaluru",
  },
  {
    id: "new-bel-road-gate",
    name: "New BEL Road Gate",
    bangla: "নিউ বেল রোড গেট",
    note: "Opens onto New BEL Road, closest if you are coming from Sadashivanagar or RMV.",
    origin: "IISc New BEL Road Gate, Bengaluru",
  },
  {
    id: "new-hostel-gate",
    name: "New Hostel Complex Gate",
    bangla: "নতুন হস্টেল গেট",
    note: "The gate nearest the new hostel blocks, for residents walking across.",
    origin: "IISc New Hostel Complex Gate, Bengaluru",
  },
  {
    id: "central-school-gate",
    name: "Central School Gate",
    bangla: "কেন্দ্রীয় বিদ্যালয় গেট",
    note: "Beside Kendriya Vidyalaya, on the Yeshwantpur side of campus.",
    origin: "Kendriya Vidyalaya IISc Gate, Bengaluru",
  },
] as const;

export const NAV = [
  { href: "/utsab", label: "Utsab", bangla: "উৎসব" },
  { href: "/itihash", label: "Itihash", bangla: "ইতিহাস" },
  { href: "/shilpa", label: "Shilpa", bangla: "শিল্প" },
  { href: "/gaan", label: "Gaan", bangla: "গান" },
  { href: "/probash", label: "Probash", bangla: "প্রবাস" },
  { href: "/gallery", label: "Chhobi", bangla: "ছবি" },
  { href: "/thikana", label: "Thikana", bangla: "ঠিকানা" },
  { href: "/jogdan", label: "Jogdan", bangla: "যোগদান" },
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
      "On stage acknowledgement at every cultural programme",
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
      "Desks outside the mess counters three weeks before the Puja. Chat with peers, spread the festive vibe, mobilise the campus.",
    blurbBn:
      "পুজোর ঠিক তিন সপ্তাহ আগে মেসে বসে শিক্ষার্থীদের সাথে গল্পে-আড্ডায় অনুদান সংগ্রহের দায়িত্ব।",
  },
  {
    id: "logistics",
    icon: "📦",
    en: "Logistics",
    bn: "লজিস্টিকস",
    blurb:
      "Pandal build, sound, lighting, procurement, venue execution, the backbone that keeps four days of festivity flawless.",
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
