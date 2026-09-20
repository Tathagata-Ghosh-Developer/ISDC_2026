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
  venue: "Ground opposite SBI Bank, Indian Institute of Science, Bengaluru 560012",
  venueShort: "SBI Ground, IISc Campus",
  venueMapUrl: "https://maps.app.goo.gl/6zbSMtnPLbLPGLRt5",
  established: 2023,
} as const;

/** Verified against Drik Panchang's 2026 Kolkata calendar. */
export const PUJA_DATES = {
  mahalaya: "2026-10-10T00:00:00+05:30",
  shashthi: "2026-10-17T00:00:00+05:30",
  saptami: "2026-10-18T00:00:00+05:30",
  ashtami: "2026-10-19T00:00:00+05:30",
  navami: "2026-10-20T00:00:00+05:30",
  dashami: "2026-10-21T00:00:00+05:30",
  /** The countdown target — Bodhon, when the goddess is woken. */
  countdownTo: "2026-10-17T17:30:00+05:30",
} as const;

/**
 * Bank account of the registered committee. Donations are transferred
 * directly — no payment gateway, so not one rupee is lost to fees.
 */
export const BANK = {
  accountName: "IISc Sharodiya Durgotsab Committee",
  accountNumber: "43391254585",
  accountType: "Savings",
  ifsc: "SBIN0040007",
  bank: "State Bank of India",
  branch: "IISc Campus Branch, Bengaluru 560012",
  /** Drop the committee UPI VPA here once the QR is issued. */
  upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "",
  /** Place the QR image at public/media/qr/upi-qr.png when it arrives. */
  qrImage: "/media/qr/upi-qr.png",
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

export const CONTACTS = [
  {
    name: "Devraj Karmakar",
    role: "Student Convenor",
    phone: "7384859512",
  },
  {
    name: "Sirshendu Pathak",
    role: "Student Convenor",
    phone: "7001453229",
  },
  {
    name: "Sayanta Goswami",
    role: "Sponsorship",
    phone: "7319388191",
  },
] as const;

export const NAV = [
  { href: "/", label: "Home", bangla: "বাড়ি" },
  { href: "/itihash", label: "Itihash", bangla: "ইতিহাস" },
  { href: "/shilpa", label: "Shilpa", bangla: "শিল্প" },
  { href: "/utsab", label: "Utsab", bangla: "উৎসব" },
  { href: "/probash", label: "Probash", bangla: "প্রবাস" },
  { href: "/gallery", label: "Chhobi", bangla: "ছবি" },
  { href: "/daan", label: "Daan", bangla: "দান" },
  { href: "/jogdan", label: "Join Us", bangla: "যোগদান" },
] as const;

/** Volunteer verticals, lifted verbatim from the committee's own call. */
export const VOLUNTEER_ROLES = [
  {
    id: "content-design",
    icon: "🎨",
    en: "Content & Design",
    bn: "কন্টেন্ট ও ডিজাইন",
    blurb:
      "Turn creativity into devotion. Social posts, banners, storytelling, visual design — the Puja gets its face from your hands.",
    blurbBn:
      "সৃজনশীলতাকে পুজোর রূপ দাও। সোশাল মিডিয়া পোস্ট থেকে ব্যানার, গল্প বলা থেকে ভিজ্যুয়াল ডিজাইন — তোমার হাতের ছোঁয়ায় পুজো পাক তার পরিচয়।",
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
      "Sharad has its own language — marigolds, earthen lamps, the golden haze of autumn. No experience needed, only willing hands.",
    blurbBn:
      "শরতের নিজের একটা ভাষা আছে — গাঁদা ফুলের মালা, মাটির প্রদীপ, সোনালি আলোর ছায়া। সেই ভাষায় সাজাও আমাদের মণ্ডপ।",
  },
  {
    id: "puja-arrangements",
    icon: "🪔",
    en: "Puja Arrangements",
    bn: "পুজোর আয়োজন",
    blurb:
      "The sacred heart of it all. Flowers, incense, dhuno, mantra, the conch — from Bodhon to Bisarjan. This is not work, it is worship.",
    blurbBn:
      "এটি সবচেয়ে পবিত্র ভূমিকা — ফুল, ধূপ, ধুনো, মন্ত্র, শঙ্খধ্বনি, বোধন থেকে বিসর্জন। এটি শুধু কাজ নয়, এটি আরাধনা।",
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
      "Pandal build, sound, lighting, procurement, venue execution — the backbone that keeps four days of festivity flawless.",
    blurbBn:
      "মণ্ডপ তৈরি, সাউন্ড, লাইটিং থেকে শুরু করে পুজোর যাবতীয় সরঞ্জামের পরিচালনা — পেছনের সারির মাস্টারমাইন্ড।",
  },
  {
    id: "magazine",
    icon: "📖",
    en: "Magazine — Probash",
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
