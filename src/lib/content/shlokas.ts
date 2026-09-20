/**
 * Shlokas. Every page of the site carries a different one, set in the
 * Bengali script Bengal has always printed Sanskrit in.
 *
 * Almost all are from the Devi Mahatmya, the seven hundred verses that
 * Bengalis recite as the Chandi. Chapter and verse are given so anyone
 * can check them.
 */

export type Shloka = {
  id: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  meaningBangla: string;
  source: string;
};

export const SHLOKAS: Shloka[] = [
  {
    id: "ya-devi-shakti",
    sanskrit:
      "যা দেবী সর্বভূতেষু শক্তিরূপেণ সংস্থিতা।\nনমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥",
    transliteration:
      "yā devī sarva-bhūteṣu śakti-rūpeṇa saṁsthitā\nnamas-tasyai namas-tasyai namas-tasyai namo namaḥ",
    meaning:
      "To the Goddess who abides in all beings as power, salutation, salutation, salutation again and again.",
    meaningBangla:
      "যে দেবী সর্বভূতে শক্তিরূপে অবস্থান করেন, তাঁকে প্রণাম, প্রণাম, বারবার প্রণাম।",
    source: "Devi Mahatmya 5.32",
  },
  {
    id: "sarvamangala",
    sanskrit:
      "সর্বমঙ্গলমঙ্গল্যে শিবে সর্বার্থসাধিকে।\nশরণ্যে ত্র্যম্বকে গৌরি নারায়ণি নমোহস্তুতে॥",
    transliteration:
      "sarva-maṅgala-māṅgalye śive sarvārtha-sādhike\nśaraṇye tryambake gauri nārāyaṇi namo'stu te",
    meaning:
      "Auspiciousness of all that is auspicious, fulfiller of every purpose, refuge, three eyed Gauri, Narayani, salutation to you.",
    meaningBangla:
      "হে নারায়ণি, হে গৌরি, তুমি সর্বমঙ্গলের উৎস, সর্বার্থসাধিকা, আমরা তোমার শরণ নিই।",
    source: "Devi Mahatmya 11.10",
  },
  {
    id: "durge-smrita",
    sanskrit:
      "দুর্গে স্মৃতা হরসি ভীতিমশেষজন্তোঃ\nস্বস্থৈঃ স্মৃতা মতিমতীব শুভাং দদাসি॥",
    transliteration:
      "durge smṛtā harasi bhītim aśeṣa-jantoḥ\nsvasthaiḥ smṛtā matim atīva śubhāṁ dadāsi",
    meaning:
      "Durga, remembered, you take away the fear of every living thing. Remembered by the untroubled, you give a mind turned towards the good.",
    meaningBangla:
      "হে দুর্গা, স্মরণ করলে তুমি সকল প্রাণীর ভয় হরণ করো, সুস্থচিত্তে স্মরণ করলে দাও কল্যাণময় বুদ্ধি।",
    source: "Devi Mahatmya 4.16",
  },
  {
    id: "srishti-sthiti",
    sanskrit:
      "সৃষ্টিস্থিতিবিনাশানাং শক্তিভূতে সনাতনি।\nগুণাশ্রয়ে গুণময়ে নারায়ণি নমোহস্তুতে॥",
    transliteration:
      "sṛṣṭi-sthiti-vināśānāṁ śakti-bhūte sanātani\nguṇāśraye guṇamaye nārāyaṇi namo'stu te",
    meaning:
      "You are the power behind creation, preservation and dissolution, eternal, the ground of all qualities. Narayani, salutation to you.",
    meaningBangla:
      "সৃষ্টি, স্থিতি ও লয়ের শক্তি তুমি, সনাতনী, সকল গুণের আশ্রয়। হে নারায়ণি, তোমাকে প্রণাম।",
    source: "Devi Mahatmya 11.9",
  },
  {
    id: "ya-devi-buddhi",
    sanskrit:
      "যা দেবী সর্বভূতেষু বুদ্ধিরূপেণ সংস্থিতা।\nনমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥",
    transliteration:
      "yā devī sarva-bhūteṣu buddhi-rūpeṇa saṁsthitā\nnamas-tasyai namas-tasyai namas-tasyai namo namaḥ",
    meaning:
      "To the Goddess who abides in all beings as intelligence, salutation, salutation, salutation again and again.",
    meaningBangla:
      "যে দেবী সর্বভূতে বুদ্ধিরূপে অবস্থান করেন, তাঁকে প্রণাম, প্রণাম, বারবার প্রণাম।",
    source: "Devi Mahatmya 5.20",
  },
  {
    id: "ya-devi-vidya",
    sanskrit:
      "যা দেবী সর্বভূতেষু বিদ্যারূপেণ সংস্থিতা।\nনমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥",
    transliteration:
      "yā devī sarva-bhūteṣu vidyā-rūpeṇa saṁsthitā\nnamas-tasyai namas-tasyai namas-tasyai namo namaḥ",
    meaning:
      "To the Goddess who abides in all beings as learning, salutation, salutation, salutation again and again.",
    meaningBangla:
      "যে দেবী সর্বভূতে বিদ্যারূপে অবস্থান করেন, তাঁকে প্রণাম, প্রণাম, বারবার প্রণাম।",
    source: "Devi Mahatmya 5.x, Ya Devi litany",
  },
  {
    id: "ya-devi-matru",
    sanskrit:
      "যা দেবী সর্বভূতেষু মাতৃরূপেণ সংস্থিতা।\nনমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥",
    transliteration:
      "yā devī sarva-bhūteṣu mātṛ-rūpeṇa saṁsthitā\nnamas-tasyai namas-tasyai namas-tasyai namo namaḥ",
    meaning:
      "To the Goddess who abides in all beings as the mother, salutation, salutation, salutation again and again.",
    meaningBangla:
      "যে দেবী সর্বভূতে মাতৃরূপে অবস্থান করেন, তাঁকে প্রণাম, প্রণাম, বারবার প্রণাম।",
    source: "Devi Mahatmya 5.x, Ya Devi litany",
  },
  {
    id: "ya-devi-daya",
    sanskrit:
      "যা দেবী সর্বভূতেষু দয়ারূপেণ সংস্থিতা।\nনমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥",
    transliteration:
      "yā devī sarva-bhūteṣu dayā-rūpeṇa saṁsthitā\nnamas-tasyai namas-tasyai namas-tasyai namo namaḥ",
    meaning:
      "To the Goddess who abides in all beings as compassion, salutation, salutation, salutation again and again.",
    meaningBangla:
      "যে দেবী সর্বভূতে দয়ারূপে অবস্থান করেন, তাঁকে প্রণাম, প্রণাম, বারবার প্রণাম।",
    source: "Devi Mahatmya 5.x, Ya Devi litany",
  },
  {
    id: "ya-devi-tushti",
    sanskrit:
      "যা দেবী সর্বভূতেষু তুষ্টিরূপেণ সংস্থিতা।\nনমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥",
    transliteration:
      "yā devī sarva-bhūteṣu tuṣṭi-rūpeṇa saṁsthitā\nnamas-tasyai namas-tasyai namas-tasyai namo namaḥ",
    meaning:
      "To the Goddess who abides in all beings as contentment, salutation, salutation, salutation again and again.",
    meaningBangla:
      "যে দেবী সর্বভূতে তুষ্টিরূপে অবস্থান করেন, তাঁকে প্রণাম, প্রণাম, বারবার প্রণাম।",
    source: "Devi Mahatmya 5.x, Ya Devi litany",
  },
  {
    id: "rupam-dehi",
    sanskrit:
      "রূপং দেহি জয়ং দেহি যশো দেহি দ্বিষো জহি।\nবিধেহি দেবি কল্যাণং বিধেহি বিপুলাং শ্রিয়ম্‌॥",
    transliteration:
      "rūpaṁ dehi jayaṁ dehi yaśo dehi dviṣo jahi\nvidhehi devi kalyāṇaṁ vidhehi vipulāṁ śriyam",
    meaning:
      "Give form, give victory, give honour, and destroy enmity. Bring about welfare, Devi, and abundant good fortune.",
    meaningBangla:
      "রূপ দাও, জয় দাও, যশ দাও, শত্রুতা নাশ করো। হে দেবী, কল্যাণ আনো, প্রচুর শ্রী আনো।",
    source: "Devi Mahatmya, Aparajita Stuti",
  },
  {
    id: "namo-devyai",
    sanskrit:
      "নমো দেব্যৈ মহাদেব্যৈ শিবায়ৈ সততং নমঃ।\nনমঃ প্রকৃত্যৈ ভদ্রায়ৈ নিয়তাঃ প্রণতাঃ স্ম তাম্‌॥",
    transliteration:
      "namo devyai mahādevyai śivāyai satataṁ namaḥ\nnamaḥ prakṛtyai bhadrāyai niyatāḥ praṇatāḥ sma tām",
    meaning:
      "Salutation to the Goddess, to the great Goddess, to the auspicious one, always. Salutation to nature herself, the gracious one. Composed, we bow to her.",
    meaningBangla:
      "দেবীকে প্রণাম, মহাদেবীকে প্রণাম, শিবাকে সর্বদা প্রণাম। প্রকৃতিস্বরূপা ভদ্রাকে প্রণাম, সংযতচিত্তে আমরা তাঁকে নমস্কার করি।",
    source: "Devi Mahatmya 5.9",
  },
  {
    id: "jayanti-mangala",
    sanskrit:
      "জয়ন্তী মঙ্গলা কালী ভদ্রকালী কপালিনী।\nদুর্গা ক্ষমা শিবা ধাত্রী স্বাহা স্বধা নমোহস্তুতে॥",
    transliteration:
      "jayantī maṅgalā kālī bhadrakālī kapālinī\ndurgā kṣamā śivā dhātrī svāhā svadhā namo'stu te",
    meaning:
      "Jayanti, Mangala, Kali, Bhadrakali, Kapalini, Durga, Kshama, Shiva, Dhatri, Svaha, Svadha. Salutation to you.",
    meaningBangla:
      "জয়ন্তী, মঙ্গলা, কালী, ভদ্রকালী, কপালিনী, দুর্গা, ক্ষমা, শিবা, ধাত্রী, স্বাহা, স্বধা, তোমাকে প্রণাম।",
    source: "Durga dhyana, widely recited",
  },
  {
    id: "sarva-svarupe",
    sanskrit:
      "সর্বস্বরূপে সর্বেশে সর্বশক্তিসমন্বিতে।\nভয়েভ্যস্ত্রাহি নো দেবি দুর্গে দেবি নমোহস্তুতে॥",
    transliteration:
      "sarva-svarūpe sarveśe sarva-śakti-samanvite\nbhayebhyas trāhi no devi durge devi namo'stu te",
    meaning:
      "You whose form is everything, ruler of all, joined with every power, protect us from our fears. Durga, Devi, salutation to you.",
    meaningBangla:
      "হে সর্বস্বরূপা, সর্বেশ্বরী, সর্বশক্তিময়ী, ভয় থেকে আমাদের রক্ষা করো। হে দুর্গা, হে দেবী, তোমাকে প্রণাম।",
    source: "Devi Mahatmya 11.24",
  },
  {
    id: "jago-tumi",
    sanskrit: "জাগো তুমি জাগো, জাগো দুর্গা, জাগো দশপ্রহরণধারিণী",
    transliteration: "jāgo tumi jāgo, jāgo durgā, jāgo daśa-praharaṇa-dhāriṇī",
    meaning: "Wake, you who wake. Wake, Durga, wake, bearer of ten weapons.",
    meaningBangla: "জাগো তুমি জাগো, জাগো দুর্গা, জাগো দশপ্রহরণধারিণী।",
    source: "Mahishasuramardini, All India Radio, 1931",
  },
];

/**
 * One shloka per page, so no visitor meets the same verse twice.
 * The key is the route.
 */
export const PAGE_SHLOKA: Record<string, string> = {
  "/": "ya-devi-shakti",
  "/itihash": "namo-devyai",
  "/shilpa": "rupam-dehi",
  "/utsab": "jayanti-mangala",
  "/mahalaya": "jago-tumi",
  "/thikana": "sarva-svarupe",
  "/daan": "ya-devi-daya",
  "/daan/board": "ya-devi-tushti",
  "/gaan": "ya-devi-shakti",
  "/probash": "ya-devi-vidya",
  "/gallery": "ya-devi-matru",
  "/jogdan": "durge-smrita",
  "/sponsors": "srishti-sthiti",
  "/receipt": "sarvamangala",
};

export function shlokaFor(path: string): Shloka {
  const id = PAGE_SHLOKA[path] ?? "ya-devi-buddhi";
  return SHLOKAS.find((s) => s.id === id) ?? SHLOKAS[0];
}

/** Short lines shown while the arrival sequence plays. */
export const ARRIVAL_LINES: { bn: string; en: string }[] = [
  {
    bn: "আশ্বিনের শারদপ্রাতে বেজে উঠেছে আলোকমঞ্জীর",
    en: "On an autumn dawn in Ashwin, the anklets of light have begun to sound",
  },
  {
    bn: "মা আসছেন, সঙ্গে লক্ষ্মী, সরস্বতী, কার্তিক, গণেশ",
    en: "Ma is coming, and with her Lakshmi, Saraswati, Kartik and Ganesh",
  },
  {
    bn: "মৃন্ময়ী হয়ে উঠছেন চিন্ময়ী",
    en: "Clay is becoming consciousness",
  },
  {
    bn: "অসুর নিধন, অন্যায়ের উপর ন্যায়ের জয়",
    en: "The asura falls, and what is right prevails over what is not",
  },
  {
    bn: "বাড়ি থেকে বহু দূরে, এই ক্যাম্পাসই আমাদের বাড়ি",
    en: "Far from home, this campus is our home",
  },
];
