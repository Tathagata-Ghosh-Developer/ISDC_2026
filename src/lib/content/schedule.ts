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

/**
 * Taken from the committee's own 2026 schedule sheet.
 * Editable from the admin console without touching this file.
 */
export const SCHEDULE: PujaDay[] = [
  {
    id: "mahalaya",
    tithi: "Mahalaya",
    tithiBangla: "মহালয়া",
    date: "10 October 2026",
    weekday: "Saturday",
    headline: "The fortnight of the ancestors ends and the fortnight of the goddess begins",
    story:
      "Before dawn, Bengal turns on the radio for a recitation broadcast every year since the 1930s. On the same day the idol receives its eyes, and the count that has run quietly since Rath Yatra becomes visible to everyone else.",
    rituals: [
      {
        time: "04:00",
        title: "Mahishasuramardini on air",
        bangla: "মহিষাসুরমর্দিনী",
        note: "Birendra Krishna Bhadra's recitation, as it has opened the season for close to a century.",
      },
      { time: "Morning", title: "Tarpan for the ancestors", bangla: "তর্পণ" },
      { time: "Day", title: "Chokkhu Daan, the giving of eyes", bangla: "চক্ষুদান" },
    ],
  },
  {
    id: "shashthi",
    tithi: "Maha Shashthi",
    tithiBangla: "মহাষষ্ঠী",
    date: "16 October 2026",
    weekday: "Friday",
    headline: "Bodhon, when the goddess is woken out of season",
    story:
      "The face of the idol is uncovered. Bodhon, Astradan, Amantran and Adhibas follow in order, so she is woken, armed, invited and made welcome. The dhak sounds for the first time and the ground stops being a ground.",
    rituals: [
      {
        time: "by 8:30 AM",
        title: "Bodhon, Astradan, Amantran and Adhibas",
        bangla: "বোধন, অস্ত্রদান, আমন্ত্রণ ও অধিবাস",
        note: "At the TMC ground.",
      },
      {
        time: "6:30 PM",
        title: "Puja inauguration and Sandhya Arati",
        bangla: "পুজো উদ্বোধন, সন্ধ্যারতি",
      },
    ],
  },
  {
    id: "saptami",
    tithi: "Maha Saptami",
    tithiBangla: "মহাসপ্তমী",
    date: "17 and 18 October 2026",
    weekday: "Saturday and Sunday",
    headline: "Nabapatrika is installed on one day and worshipped on the next",
    story:
      "Nine plants are bound together, bathed and dressed in a bordered sari. Most households know her as Kola Bou and seat her at Ganesh's side, and that name has held for centuries. In the ritual itself she is Durga, in her oldest green form, from before anyone thought to give her a face.",
    rituals: [
      {
        time: "17 Oct, 7:00 AM",
        title: "Nabapatrika Sthapan and Prabesh",
        bangla: "নবপত্রিকা স্নান ও প্রবেশ",
      },
      {
        time: "18 Oct, by 5:53 AM",
        title: "Saptami Puja",
        bangla: "সপ্তমী পূজা",
      },
      {
        time: "6:30 PM",
        title: "Sandhya Arati and cultural evening",
        bangla: "সন্ধ্যারতি, সাংস্কৃতিক অনুষ্ঠান",
      },
    ],
  },
  {
    id: "ashtami",
    tithi: "Maha Ashtami",
    tithiBangla: "মহাষ্টমী",
    date: "19 October 2026",
    weekday: "Monday",
    headline: "The longest queue, the loudest dhak, and the forty-eight minutes",
    story:
      "Anjali in new clothes in the morning, and then the seam between Ashtami and Nabami when the lamps are lit and nobody speaks. Sandhi Puja is the still centre of five loud days.",
    rituals: [
      {
        time: "6:00 AM",
        title: "Maha Ashtami Puja and Pushpanjali",
        bangla: "মহাষ্টমী পূজো, পুষ্পাঞ্জলি",
      },
      {
        time: "7:26 to 8:14 AM",
        title: "Sandhi Puja",
        bangla: "সন্ধি পূজো",
        note: "The last twenty four minutes of Ashtami and the first twenty four of Nabami.",
      },
      {
        time: "6:30 PM",
        title: "Sandhya Arati and cultural evening",
        bangla: "সন্ধ্যারতি, সাংস্কৃতিক অনুষ্ঠান",
      },
    ],
  },
  {
    id: "nabami",
    tithi: "Maha Nabami",
    tithiBangla: "মহানবমী",
    date: "20 October 2026",
    weekday: "Tuesday",
    headline: "The day everyone pretends tomorrow is not coming",
    story:
      "Homa in the morning, the largest bhog of the five days at noon, and an evening that runs long because nobody wants to be the first to leave.",
    rituals: [
      {
        time: "8:30 AM",
        title: "Nabami Puja and Homa",
        bangla: "নবমী পূজো ও হোম",
      },
      {
        time: "6:30 PM",
        title: "Sandhya Arati and cultural evening",
        bangla: "সন্ধ্যারতি, সাংস্কৃতিক অনুষ্ঠান",
      },
    ],
  },
  {
    id: "dashami",
    tithi: "Bijoya Dashami",
    tithiBangla: "বিজয়া দশমী",
    date: "21 October 2026",
    weekday: "Wednesday",
    headline: "Debi Boron, vermilion, and the walk back",
    story:
      "She is welcomed one last time before she goes, given sweets and sent off. Then vermilion, embraces, and the year-long wait that Bengalis pretend not to be counting.",
    rituals: [
      {
        time: "by 8:31 AM",
        title: "Dashami Puja",
        bangla: "বিজয়া দশমী পূজো",
      },
      {
        time: "12:00 PM",
        title: "Debi Boron and Sindoor Khela",
        bangla: "দেবী বরণ ও সিঁদুর খেলা",
        note: "Open to everyone who wants to take part.",
      },
      {
        time: "6:00 PM",
        title: "Bisarjan",
        bangla: "প্রতিমা নিরঞ্জন",
      },
    ],
  },
];
