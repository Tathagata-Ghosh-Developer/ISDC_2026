export type Ritual = {
  time: string;
  title: string;
  bangla: string;
  note?: string;
};

export type PujaDay = {
  id: string;
  tithi: string;
  tithiBangla: string;
  date: string;
  weekday: string;
  headline: string;
  story: string;
  rituals: Ritual[];
};

/** Defaults. The committee overrides these from the admin console. */
export const SCHEDULE: PujaDay[] = [
  {
    id: "mahalaya",
    tithi: "Mahalaya",
    tithiBangla: "মহালয়া",
    date: "10 October 2026",
    weekday: "Saturday",
    headline: "The fortnight of the ancestors ends; the fortnight of the goddess begins",
    story:
      "Before dawn, Bengal turns on the radio for a recitation first broadcast in 1931. On the same day the idol receives its eyes, and the countdown that has run since Rath Yatra finally becomes visible to everyone else.",
    rituals: [
      { time: "04:00", title: "Mahishasuramardini on air", bangla: "মহিষাসুরমর্দিনী" },
      { time: "Morning", title: "Tarpan for the ancestors", bangla: "তর্পণ" },
      { time: "Day", title: "Chokkhu Daan — the giving of eyes", bangla: "চক্ষুদান" },
    ],
  },
  {
    id: "shashthi",
    tithi: "Maha Shashthi",
    tithiBangla: "মহাষষ্ঠী",
    date: "17 October 2026",
    weekday: "Saturday",
    headline: "Bodhon — the goddess is woken out of season",
    story:
      "The face of the idol is uncovered. Bodhon, Amantran and Adhibas follow in order: she is woken, invited, and made welcome. The dhak sounds for the first time and the campus stops being a campus.",
    rituals: [
      { time: "17:30", title: "Bodhon — the awakening", bangla: "বোধন" },
      { time: "18:15", title: "Amantran and Adhibas", bangla: "আমন্ত্রণ ও অধিবাস" },
      { time: "19:30", title: "Sandhya Arati", bangla: "সন্ধ্যারতি" },
      { time: "20:30", title: "Opening cultural evening", bangla: "উদ্বোধনী অনুষ্ঠান" },
    ],
  },
  {
    id: "saptami",
    tithi: "Maha Saptami",
    tithiBangla: "মহাসপ্তমী",
    date: "18 October 2026",
    weekday: "Sunday",
    headline: "Nabapatrika is bathed at first light",
    story:
      "Nine plants are bound together, bathed in the river and dressed in a bordered sari. She is not Ganesh's wife, whatever the campus insists — she is Durga in her oldest, green, pre-iconic form.",
    rituals: [
      { time: "06:00", title: "Nabapatrika Snan", bangla: "নবপত্রিকা স্নান" },
      { time: "09:00", title: "Saptami Puja and Pushpanjali", bangla: "সপ্তমী পূজা ও পুষ্পাঞ্জলি" },
      { time: "13:00", title: "Khichuri Bhog", bangla: "খিচুড়ি ভোগ" },
      { time: "19:00", title: "Sandhya Arati and Dhunuchi Naach", bangla: "সন্ধ্যারতি ও ধুনুচি নাচ" },
      { time: "20:30", title: "Cultural programme", bangla: "সাংস্কৃতিক অনুষ্ঠান" },
    ],
  },
  {
    id: "ashtami",
    tithi: "Maha Ashtami",
    tithiBangla: "মহাষ্টমী",
    date: "19 October 2026",
    weekday: "Monday",
    headline: "The longest queue, the loudest dhak, the forty-eight minutes",
    story:
      "Anjali in new clothes, Kumari Puja at midday, and then the seam between Ashtami and Navami when a hundred and eight lamps are lit and nobody speaks. Sandhi Puja is the still centre of four loud days.",
    rituals: [
      { time: "08:30", title: "Ashtami Puja", bangla: "অষ্টমী পূজা" },
      { time: "10:00", title: "Pushpanjali, in batches", bangla: "পুষ্পাঞ্জলি" },
      { time: "12:00", title: "Kumari Puja", bangla: "কুমারী পূজা" },
      { time: "13:00", title: "Bhog", bangla: "ভোগ" },
      {
        time: "Evening",
        title: "Sandhi Puja",
        bangla: "সন্ধিপূজা",
        note: "Last 24 minutes of Ashtami and first 24 of Navami. Exact time confirmed by the priest closer to the day.",
      },
      { time: "21:00", title: "Cultural night", bangla: "সাংস্কৃতিক সন্ধ্যা" },
    ],
  },
  {
    id: "navami",
    tithi: "Maha Navami",
    tithiBangla: "মহানবমী",
    date: "20 October 2026",
    weekday: "Tuesday",
    headline: "The day everyone pretends tomorrow is not coming",
    story:
      "Homa in the morning, the biggest bhog of the four days at noon, and an evening that runs long because no one wants to be the first to leave.",
    rituals: [
      { time: "08:00", title: "Navami Homa", bangla: "নবমী হোম" },
      { time: "10:00", title: "Pushpanjali", bangla: "পুষ্পাঞ্জলি" },
      { time: "13:00", title: "Mahabhog", bangla: "মহাভোগ" },
      { time: "19:00", title: "Arati and Dhunuchi", bangla: "আরতি ও ধুনুচি" },
      { time: "20:30", title: "Grand cultural evening", bangla: "বিশেষ সাংস্কৃতিক সন্ধ্যা" },
    ],
  },
  {
    id: "dashami",
    tithi: "Vijaya Dashami",
    tithiBangla: "বিজয়া দশমী",
    date: "21 October 2026",
    weekday: "Wednesday",
    headline: "Darpan Bisarjan, sindoor, and the walk back",
    story:
      "The priest watches her leave in a mirror so that no one has to watch it directly. Then vermilion, sweets, embraces, and the year-long wait that Bengalis pretend not to be counting.",
    rituals: [
      { time: "09:00", title: "Dashami Puja", bangla: "দশমী পূজা" },
      { time: "11:00", title: "Darpan Bisarjan", bangla: "দর্পণ বিসর্জন" },
      { time: "12:00", title: "Sindoor Khela, open to all", bangla: "সিঁদুরখেলা" },
      { time: "16:00", title: "Bisarjan procession", bangla: "বিসর্জন শোভাযাত্রা" },
      { time: "18:30", title: "Bijoya Sammilani and Kolakuli", bangla: "বিজয়া সম্মিলনী" },
    ],
  },
];
