/**
 * Shlokas and micro-facts used by the arrival sequence and the
 * scattered pull-quotes. Committee-editable from the admin console;
 * these are the defaults the site falls back to.
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
    id: "ya-devi",
    sanskrit:
      "যা দেবী সর্বভূতেষু শক্তিরূপেণ সংস্থিতা।\nনমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥",
    transliteration:
      "yā devī sarva-bhūteṣu śakti-rūpeṇa saṁsthitā\nnamas-tasyai namas-tasyai namas-tasyai namo namaḥ",
    meaning:
      "To the Goddess who abides in all beings as power — to her, salutation, salutation, salutation again and again.",
    meaningBangla:
      "যে দেবী সর্বভূতে শক্তিরূপে অবস্থান করেন — তাঁকে প্রণাম, প্রণাম, বারবার প্রণাম।",
    source: "Devi Mahatmya 5.32",
  },
  {
    id: "sarvamangala",
    sanskrit:
      "সর্বমঙ্গলমঙ্গল্যে শিবে সর্বার্থসাধিকে।\nশরণ্যে ত্র্যম্বকে গৌরি নারায়ণি নমোহস্তুতে॥",
    transliteration:
      "sarva-maṅgala-māṅgalye śive sarvārtha-sādhike\nśaraṇye tryambake gauri nārāyaṇi namo'stu te",
    meaning:
      "Auspiciousness of all that is auspicious, fulfiller of every purpose, refuge, three-eyed Gauri — Narayani, salutation to you.",
    meaningBangla:
      "হে নারায়ণি, হে গৌরি — তুমি সর্বমঙ্গলের উৎস, সর্বার্থসাধিকা, আমরা তোমার শরণ নিই।",
    source: "Devi Mahatmya 11.10",
  },
  {
    id: "durge-smrita",
    sanskrit:
      "দুর্গে স্মৃতা হরসি ভীতিমশেষজন্তোঃ\nস্বস্থৈঃ স্মৃতা মতিমতীব শুভাং দদাসি॥",
    transliteration:
      "durge smṛtā harasi bhītim aśeṣa-jantoḥ\nsvasthaiḥ smṛtā matim atīva śubhāṁ dadāsi",
    meaning:
      "Durga, remembered, you take away the fear of every living thing; remembered by the untroubled, you give a mind turned towards the good.",
    meaningBangla:
      "হে দুর্গা, স্মরণ করলে তুমি সকল প্রাণীর ভয় হরণ করো; সুস্থচিত্তে স্মরণ করলে দাও কল্যাণময় বুদ্ধি।",
    source: "Devi Mahatmya 4.16",
  },
  {
    id: "srishti-sthiti",
    sanskrit:
      "সৃষ্টিস্থিতিবিনাশানাং শক্তিভূতে সনাতনি।\nগুণাশ্রয়ে গুণময়ে নারায়ণি নমোহস্তুতে॥",
    transliteration:
      "sṛṣṭi-sthiti-vināśānāṁ śakti-bhūte sanātani\nguṇāśraye guṇamaye nārāyaṇi namo'stu te",
    meaning:
      "You are the power behind creation, preservation and dissolution, eternal, the ground of all qualities — Narayani, salutation to you.",
    meaningBangla:
      "সৃষ্টি, স্থিতি ও লয়ের শক্তি তুমি, সনাতনী, সকল গুণের আশ্রয় — হে নারায়ণি, তোমাকে প্রণাম।",
    source: "Devi Mahatmya 11.9",
  },
  {
    id: "jago-tumi",
    sanskrit: "জাগো তুমি জাগো, জাগো দুর্গা, জাগো দশপ্রহরণধারিণী",
    transliteration: "jāgo tumi jāgo, jāgo durgā, jāgo daśa-praharaṇa-dhāriṇī",
    meaning:
      "Wake, you who wake — wake, Durga, wake, bearer of ten weapons.",
    meaningBangla:
      "জাগো তুমি জাগো — জাগো দুর্গা, জাগো দশপ্রহরণধারিণী।",
    source: "Mahishasuramardini, All India Radio, 1931",
  },
];

/** Short lines shown while the arrival sequence plays. */
export const ARRIVAL_LINES: { bn: string; en: string }[] = [
  {
    bn: "আশ্বিনের শারদপ্রাতে বেজে উঠেছে আলোকমঞ্জীর",
    en: "On an autumn dawn in Ashwin, the anklets of light have begun to sound",
  },
  {
    bn: "মা আসছেন — সঙ্গে লক্ষ্মী, সরস্বতী, কার্তিক, গণেশ",
    en: "Ma is coming, and with her Lakshmi, Saraswati, Kartik and Ganesh",
  },
  {
    bn: "মৃন্ময়ী হয়ে উঠছেন চিন্ময়ী",
    en: "Clay is becoming consciousness",
  },
  {
    bn: "অসুর নিধন — অন্যায়ের উপর ন্যায়ের জয়",
    en: "The asura falls, and what is right prevails over what is not",
  },
  {
    bn: "বাড়ি থেকে বহু দূরে, এই ক্যাম্পাসই আমাদের বাড়ি",
    en: "Far from home, this campus is our home",
  },
];
