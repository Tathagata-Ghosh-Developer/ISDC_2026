/**
 * Pull-quote facts, scattered across the site.
 *
 * Every entry is checked against a named source. Where historians
 * disagree, the disagreement is stated inside the fact rather than
 * smoothed over.
 */

export type Era =
  | "Ancient"
  | "Medieval"
  | "Colonial"
  | "Modern"
  | "Contemporary";

export type Fact = {
  id: string;
  era: Era;
  year: string | null;
  title: string;
  fact: string;
  bangla: string;
  source: string;
  tags: string[];
};

export const FACTS: Fact[] = [
  {
    id: "devi-mahatmya",
    era: "Ancient",
    year: "c. 5th–6th c. CE",
    title: "The seven hundred verses",
    fact: "The Devi Mahatmya, 700 verses embedded in the Markandeya Purana, is the first Sanskrit text to make the Goddess the supreme reality rather than a consort. Bengalis still recite it as the Chandi.",
    bangla:
      "মার্কণ্ডেয় পুরাণের অন্তর্গত দেবীমাহাত্ম্য — সাতশো শ্লোকের এই গ্রন্থই প্রথম দেবীকে পরমা শক্তি হিসেবে প্রতিষ্ঠা করে। বাঙালি আজও একে চণ্ডী নামে পাঠ করে।",
    source: "Markandeya Purana",
    tags: ["scripture", "origins"],
  },
  {
    id: "akalbodhan",
    era: "Medieval",
    year: "15th c.",
    title: "An untimely awakening",
    fact: "The story of Rama waking Durga out of season — Akalbodhan — comes from Krittibas Ojha's Bengali Ramayana. It is not in Valmiki's Sanskrit original, which is why autumn Puja is scripturally the irregular one.",
    bangla:
      "অকালবোধন — রামচন্দ্রের অসময়ে দুর্গাকে জাগানোর কাহিনি এসেছে কৃত্তিবাস ওঝার বাংলা রামায়ণ থেকে। বাল্মীকির মূল সংস্কৃত রামায়ণে এর উল্লেখ নেই।",
    source: "Krittibasi Ramayan",
    tags: ["origins", "myth"],
  },
  {
    id: "basanti-puja",
    era: "Medieval",
    year: null,
    title: "Spring was the real season",
    fact: "By the texts, Durga's proper worship is Basanti Puja in spring. The autumn festival that now defines Bengali life is the exception that swallowed the rule.",
    bangla:
      "শাস্ত্রমতে দুর্গার প্রকৃত পূজা বসন্তকালে — বাসন্তী পূজা। শরতের যে উৎসব আজ বাঙালির জীবন, তা আসলে ব্যতিক্রম, যা নিয়মকেই গ্রাস করেছে।",
    source: "Kalika Purana",
    tags: ["ritual", "calendar"],
  },
  {
    id: "taherpur",
    era: "Medieval",
    year: "c. 1580",
    title: "The first grand household Puja",
    fact: "Raja Kangshanarayan of Taherpur in Rajshahi is widely credited with the first large-scale Sharadiya Durga Puja in Bengal. Competing claims name Bhabananda Majumdar of Nadia in the same decades.",
    bangla:
      "রাজশাহীর তাহিরপুরের রাজা কংসনারায়ণকে বাংলার প্রথম বড় মাপের শারদীয়া দুর্গাপূজার প্রবর্তক বলা হয়। একই সময়ে নদিয়ার ভবানন্দ মজুমদারের দাবিও রয়েছে।",
    source: "Contested; see Bengal zamindari histories",
    tags: ["bengal", "origins"],
  },
  {
    id: "barisha-1610",
    era: "Medieval",
    year: "1610",
    title: "Kolkata's oldest unbroken Puja",
    fact: "The Sabarna Roy Choudhury family began their Puja at Barisha in 1610 — before Job Charnock, before the city. It has run without a break for over four centuries.",
    bangla:
      "১৬১০ সালে বড়িশায় সাবর্ণ রায়চৌধুরী পরিবারের পূজা শুরু হয় — জব চার্নকেরও আগে, শহরটির জন্মেরও আগে। চারশো বছরেরও বেশি সময় ধরে তা অবিচ্ছিন্ন।",
    source: "Sabarna Roy Choudhury Paribar Parishad",
    tags: ["kolkata", "bonedi"],
  },
  {
    id: "company-puja",
    era: "Colonial",
    year: "1757",
    title: "The Puja that entertained Clive",
    fact: "After Plassey, Nabakrishna Deb held a Durga Puja at Shobhabazar Rajbari that English officers, Robert Clive among them, are recorded as attending. Nautch girls performed where the Chandi was read.",
    bangla:
      "পলাশীর পরে নবকৃষ্ণ দেব শোভাবাজার রাজবাড়িতে যে দুর্গাপূজা করেন, সেখানে রবার্ট ক্লাইভ-সহ ইংরেজ কর্মকর্তাদের উপস্থিতির নথি আছে। চণ্ডীপাঠের পাশেই চলত বাইনাচ।",
    source: "Shobhabazar Rajbari records",
    tags: ["colonial", "kolkata"],
  },
  {
    id: "baroyari-1790",
    era: "Colonial",
    year: "1790",
    title: "Twelve friends, one Puja",
    fact: "Turned away from a household Puja at Guptipara in Hooghly, twelve friends pooled their money and started their own. Baro-yari — twelve friends — is why community Puja has that name.",
    bangla:
      "হুগলির গুপ্তিপাড়ায় বাড়ির পূজা থেকে ফিরিয়ে দেওয়া বারোজন বন্ধু চাঁদা তুলে নিজেরাই পূজা শুরু করেন। বারো-ইয়ারি থেকেই বারোয়ারি — সর্বজনীন পূজার নামের উৎস।",
    source: "Guptipara Baroyari",
    tags: ["community", "origins"],
  },
  {
    id: "sarbojanin-1919",
    era: "Colonial",
    year: "1919",
    title: "Everyone's Puja",
    fact: "Baghbazar Sarbojanin turned the subscription Puja into a civic institution open to all castes and classes. The word sarbojanin — 'of all people' — became the template for modern Kolkata.",
    bangla:
      "বাগবাজার সর্বজনীন চাঁদার পূজাকে এক নাগরিক প্রতিষ্ঠানে পরিণত করে, যা সব শ্রেণি ও বর্ণের জন্য উন্মুক্ত। সর্বজনীন শব্দটিই হয়ে ওঠে আধুনিক কলকাতার আদর্শ।",
    source: "Baghbazar Sarbojanin Durgotsab",
    tags: ["community", "kolkata"],
  },
  {
    id: "mahishasuramardini-1931",
    era: "Modern",
    year: "1931",
    title: "A voice before dawn",
    fact: "All India Radio first broadcast Mahishasuramardini in 1931. Birendra Krishna Bhadra's Chandipath at four in the morning has opened Mahalaya for almost a century.",
    bangla:
      "১৯৩১ সালে আকাশবাণী প্রথম মহিষাসুরমর্দিনী সম্প্রচার করে। ভোর চারটেয় বীরেন্দ্রকৃষ্ণ ভদ্রের চণ্ডীপাঠ প্রায় এক শতাব্দী ধরে মহালয়ার সূচনা করছে।",
    source: "All India Radio",
    tags: ["radio", "mahalaya"],
  },
  {
    id: "uttam-kumar-1976",
    era: "Modern",
    year: "1976",
    title: "The year Bengal refused",
    fact: "In 1976 All India Radio replaced Bhadra's recording with a new version fronted by the film star Uttam Kumar. Listeners revolted so completely that the old tape was restored within the same season.",
    bangla:
      "১৯৭৬ সালে আকাশবাণী ভদ্রের রেকর্ডিং সরিয়ে উত্তমকুমারকে দিয়ে নতুন সংস্করণ প্রচার করে। শ্রোতাদের প্রবল প্রতিবাদে সেই বছরেই পুরনো রেকর্ডিং ফিরিয়ে আনা হয়।",
    source: "All India Radio",
    tags: ["radio", "mahalaya"],
  },
  {
    id: "sandhi-puja",
    era: "Ancient",
    year: null,
    title: "Forty-eight minutes",
    fact: "Sandhi Puja occupies the last twenty-four minutes of Ashtami and the first twenty-four of Navami — the seam between two days, when Durga is said to have taken the form of Chamunda.",
    bangla:
      "সন্ধিপূজা হয় অষ্টমীর শেষ চব্বিশ মিনিট আর নবমীর প্রথম চব্বিশ মিনিট জুড়ে — দুই তিথির সন্ধিক্ষণে, যখন দেবী চামুণ্ডা রূপ ধারণ করেছিলেন।",
    source: "Brihaddharma Purana",
    tags: ["ritual"],
  },
  {
    id: "kumari-puja-1901",
    era: "Modern",
    year: "1901",
    title: "The goddess as a child",
    fact: "Swami Vivekananda began Kumari Puja at Belur Math in 1901, worshipping a young girl as the living goddess. The rite is now among the most photographed moments of Ashtami.",
    bangla:
      "১৯০১ সালে স্বামী বিবেকানন্দ বেলুড় মঠে কুমারী পূজার সূচনা করেন — এক বালিকাকে জীবন্ত দেবীরূপে পূজা। অষ্টমীর সবচেয়ে আলোকচিত্রিত মুহূর্তগুলির একটি আজ এটি।",
    source: "Ramakrishna Mission",
    tags: ["ritual", "ashtami"],
  },
  {
    id: "nabapatrika",
    era: "Ancient",
    year: null,
    title: "Kola Bou is not Ganesh's wife",
    fact: "The banana plant bathed at dawn on Saptami is the Nabapatrika — nine plants bound together, each a form of Durga. The popular belief that she is Ganesh's bride has no textual basis.",
    bangla:
      "সপ্তমীর ভোরে স্নান করানো কলাগাছটি আসলে নবপত্রিকা — ন'টি গাছের বন্ধন, প্রতিটি দুর্গার এক-একটি রূপ। কলাবউ গণেশের স্ত্রী, এই প্রচলিত ধারণার কোনও শাস্ত্রীয় ভিত্তি নেই।",
    source: "Nabapatrika ritual texts",
    tags: ["ritual", "myth"],
  },
  {
    id: "family-group",
    era: "Medieval",
    year: null,
    title: "A Bengali invention",
    fact: "Lakshmi, Saraswati, Kartik and Ganesh flanking Durga on one frame is a Bengali arrangement. Elsewhere in India, Mahishasuramardini usually stands alone.",
    bangla:
      "এক চালচিত্রে দুর্গার দুপাশে লক্ষ্মী, সরস্বতী, কার্তিক ও গণেশ — এই সাজানো সম্পূর্ণ বাঙালি রীতি। ভারতের অন্যত্র মহিষাসুরমর্দিনী সাধারণত একাই থাকেন।",
    source: "Bengal iconography studies",
    tags: ["iconography"],
  },
  {
    id: "daker-saj",
    era: "Colonial",
    year: "19th c.",
    title: "Ornaments that came by post",
    fact: "Daker Saj is named for the postal service. The silver and white foil used to dress the idol was ordered from Germany and arrived by dak, and the name outlived the import.",
    bangla:
      "ডাকের সাজ নামটি এসেছে ডাকঘর থেকে। প্রতিমা সাজানোর রুপোলি ও সাদা ফয়েল জার্মানি থেকে ডাকে আসত — আমদানি বন্ধ হয়েছে, নামটি থেকে গেছে।",
    source: "Kumartuli artisan tradition",
    tags: ["craft", "iconography"],
  },
  {
    id: "sholapith",
    era: "Medieval",
    year: null,
    title: "Cork that grows in marshes",
    fact: "Sholar Saj is carved from the pith of Aeschynomene aspera, a marsh reed, by the Malakar community. It is lighter than paper and whiter than any paint.",
    bangla:
      "শোলার সাজ তৈরি হয় জলাভূমির শোলা গাছের নরম শাঁস থেকে, মালাকার সম্প্রদায়ের হাতে। কাগজের চেয়ে হালকা, যে কোনও রঙের চেয়ে সাদা।",
    source: "Malakar craft tradition",
    tags: ["craft"],
  },
  {
    id: "kathamo-puja",
    era: "Medieval",
    year: null,
    title: "Next year begins on Rath Yatra",
    fact: "In Kumartuli the bamboo skeleton of the idol is worshipped on the day of Rath Yatra, three months before Puja. The festival's real calendar starts in monsoon, not autumn.",
    bangla:
      "কুমারটুলিতে প্রতিমার বাঁশের কাঠামো পূজা হয় রথযাত্রার দিনে, পুজোর তিন মাস আগে। উৎসবের আসল পঞ্জিকা শুরু হয় বর্ষায়, শরতে নয়।",
    source: "Kumartuli practice",
    tags: ["craft", "calendar"],
  },
  {
    id: "chokkhu-daan",
    era: "Medieval",
    year: null,
    title: "The eyes are drawn last",
    fact: "Chokkhu Daan — the giving of eyes — happens on Mahalaya. The artisan fasts, and paints the three eyes in a fixed order, the forehead eye last of all.",
    bangla:
      "চক্ষুদান হয় মহালয়ার দিনে। শিল্পী উপবাস করে নির্দিষ্ট ক্রমে তিনটি চোখ আঁকেন — কপালের তৃতীয় নয়ন সবার শেষে।",
    source: "Kumartuli practice",
    tags: ["craft", "mahalaya"],
  },
  {
    id: "punya-mati",
    era: "Medieval",
    year: null,
    title: "Soil from a forbidden door",
    fact: "Tradition asks for a handful of earth from a courtesan's threshold in the clay of the idol. Scholars read it as a statement that the goddess refuses society's idea of purity.",
    bangla:
      "প্রথা বলে, প্রতিমার মাটিতে মিশতে হবে নিষিদ্ধ পল্লির দরজার এক মুঠো মাটি। গবেষকেরা একে দেখেন সমাজের শুদ্ধতার ধারণাকে দেবীর প্রত্যাখ্যান হিসেবে।",
    source: "Contested folk tradition",
    tags: ["craft", "society"],
  },
  {
    id: "unesco-2021",
    era: "Contemporary",
    year: "2021",
    title: "A festival on the UNESCO list",
    fact: "In December 2021 UNESCO inscribed 'Durga Puja in Kolkata' on the Representative List of the Intangible Cultural Heritage of Humanity — the first festival from India to be listed in that form.",
    bangla:
      "২০২১ সালের ডিসেম্বরে ইউনেস্কো 'দুর্গাপূজা ইন কলকাতা'-কে মানবতার অস্পৃশ্য সাংস্কৃতিক ঐতিহ্যের প্রতিনিধিত্বমূলক তালিকায় অন্তর্ভুক্ত করে।",
    source: "UNESCO, 16th session",
    tags: ["heritage", "modern"],
  },
  {
    id: "chandannagar-light",
    era: "Modern",
    year: null,
    title: "The town that lights Bengal",
    fact: "Almost every animated light tableau at a Kolkata pandal is built in Chandannagar, a former French colony on the Hooghly whose artisans turned festival lighting into a narrative art.",
    bangla:
      "কলকাতার মণ্ডপের প্রায় প্রতিটি আলোকসজ্জা তৈরি হয় চন্দননগরে — হুগলির তীরে সাবেক ফরাসি উপনিবেশ, যার শিল্পীরা আলোকে গল্প বলার মাধ্যম বানিয়েছেন।",
    source: "Chandannagar light artisans",
    tags: ["light", "craft"],
  },
  {
    id: "theme-puja",
    era: "Contemporary",
    year: "1990s",
    title: "When pandals became art",
    fact: "From the 1990s Kolkata's pandals stopped imitating temples and started commissioning artists. A pandal today may be built of jute, terracotta, bicycle parts or discarded plastic.",
    bangla:
      "নব্বইয়ের দশক থেকে কলকাতার মণ্ডপ মন্দিরের অনুকরণ ছেড়ে শিল্পীদের ডেকে আনে। আজ মণ্ডপ তৈরি হয় পাট, পোড়ামাটি, সাইকেলের যন্ত্রাংশ বা ফেলে দেওয়া প্লাস্টিক দিয়ে।",
    source: "Kolkata theme-puja movement",
    tags: ["art", "modern"],
  },
  {
    id: "dhaki",
    era: "Medieval",
    year: null,
    title: "The drummers come by train",
    fact: "Dhakis travel each autumn from Nadia, Murshidabad and the Sundarbans to the cities, carrying drums taller than a child. Many still wait at Sealdah station to be hired on the spot.",
    bangla:
      "প্রতি শরতে নদিয়া, মুর্শিদাবাদ ও সুন্দরবন থেকে ঢাকিরা শহরে আসেন, সঙ্গে শিশুর চেয়েও উঁচু ঢাক। আজও অনেকে শিয়ালদহ স্টেশনে বসে বায়নার অপেক্ষা করেন।",
    source: "Dhaki communities of Bengal",
    tags: ["music", "labour"],
  },
  {
    id: "agomoni",
    era: "Medieval",
    year: "18th c.",
    title: "Songs about a daughter",
    fact: "Agomoni songs do not address a goddess. They are sung from Menaka's point of view, a mother counting the days until her married daughter comes home for four days.",
    bangla:
      "আগমনী গান দেবীকে সম্বোধন করে না। মেনকার কণ্ঠে গাওয়া হয় — এক মা দিন গুনছেন, কবে বিবাহিত মেয়ে চার দিনের জন্য বাড়ি ফিরবে।",
    source: "Ramprasad Sen and the Agomoni tradition",
    tags: ["music", "emotion"],
  },
  {
    id: "darpan-bisarjan",
    era: "Ancient",
    year: null,
    title: "Immersion seen in a mirror",
    fact: "On Dashami the priest does not watch the idol leave. He watches its reflection in a bowl of water — darpan bisarjan, so that no one sees the goddess go.",
    bangla:
      "দশমীতে পুরোহিত প্রতিমার বিদায় সরাসরি দেখেন না। জলভরা পাত্রে তার প্রতিবিম্ব দেখেন — দর্পণ বিসর্জন, যাতে দেবীর যাওয়া কেউ না দেখে।",
    source: "Dashami ritual",
    tags: ["ritual", "dashami"],
  },
  {
    id: "sindoor-khela",
    era: "Colonial",
    year: null,
    title: "Vermilion, and who may wear it",
    fact: "Sindoor khela on Dashami was long restricted to married women. Since the 2010s a growing number of Kolkata pujas have opened it to widows, single and transgender women.",
    bangla:
      "দশমীর সিঁদুরখেলা বহুকাল কেবল সধবাদের জন্যই সীমাবদ্ধ ছিল। ২০১০-এর দশক থেকে কলকাতার বহু পুজো তা বিধবা, অবিবাহিত ও রূপান্তরকামী নারীদের জন্যও উন্মুক্ত করেছে।",
    source: "Contemporary Kolkata pujas",
    tags: ["dashami", "society"],
  },
  {
    id: "women-priests",
    era: "Contemporary",
    year: "2021",
    title: "Four women at the altar",
    fact: "In 2021 a Kolkata puja engaged an all-woman team of priests led by Nandini Bhowmick to conduct the full rite — a first for a major community Puja in the city.",
    bangla:
      "২০২১ সালে কলকাতার একটি পুজোয় নন্দিনী ভৌমিকের নেতৃত্বে সম্পূর্ণ নারী পুরোহিত দল পূজা পরিচালনা করেন — শহরের বড় সর্বজনীন পুজোয় যা প্রথম।",
    source: "Shubhamastu, Kolkata",
    tags: ["society", "modern"],
  },
  {
    id: "london-1963",
    era: "Modern",
    year: "1963",
    title: "The Puja that crossed the sea",
    fact: "Britain's first community Durga Puja was held in Camden, London, in 1963. Diaspora pujas now run from Nairobi to New Jersey, usually moved to the nearest weekend.",
    bangla:
      "ব্রিটেনের প্রথম সর্বজনীন দুর্গাপূজা হয় ১৯৬৩ সালে লন্ডনের ক্যামডেনে। আজ নাইরোবি থেকে নিউ জার্সি — প্রবাসী পুজো সাধারণত কাছের সপ্তাহান্তে সরিয়ে নেওয়া হয়।",
    source: "Camden Durgotsav",
    tags: ["diaspora"],
  },
  {
    id: "alpona",
    era: "Ancient",
    year: null,
    title: "Drawn to be erased",
    fact: "Alpona is painted in rice paste on a swept floor, and is meant to dissolve under the feet of the people it welcomes. Nandalal Bose brought it from village brata rites into Santiniketan's art school.",
    bangla:
      "আলপনা আঁকা হয় নিকোনো মেঝেতে চালের গুঁড়ো দিয়ে, আর মুছে যাওয়ার জন্যই আঁকা হয় — যাদের বরণ করছে, তাদেরই পায়ে। নন্দলাল বসু গ্রামীণ ব্রতের এই শিল্পকে শান্তিনিকেতনের পাঠে আনেন।",
    source: "Kala Bhavana, Santiniketan",
    tags: ["art", "craft"],
  },
  {
    id: "puja-economy",
    era: "Contemporary",
    year: "2013",
    title: "A festival the size of an industry",
    fact: "A British Council study of Durga Puja's creative economy found that idol makers, decorators, lighting crews, dhakis and printers together turn the festival into one of eastern India's largest seasonal employers.",
    bangla:
      "দুর্গাপূজার সৃজনশীল অর্থনীতি নিয়ে ব্রিটিশ কাউন্সিলের সমীক্ষা দেখায় — প্রতিমাশিল্পী, ডেকরেটর, আলোকশিল্পী, ঢাকি ও মুদ্রক মিলে এই উৎসব পূর্ব ভারতের বৃহত্তম মরশুমি কর্মসংস্থানের একটি।",
    source: "British Council creative economy study",
    tags: ["economy", "modern"],
  },
  {
    id: "iisc-1909",
    era: "Modern",
    year: "1909",
    title: "A campus built on a conversation",
    fact: "The Indian Institute of Science was vested in 1909 and took its first students in 1911, from a plan Jamsetji Tata carried for over a decade after a shipboard conversation with Swami Vivekananda in 1893.",
    bangla:
      "ইন্ডিয়ান ইনস্টিটিউট অফ সায়েন্স প্রতিষ্ঠিত হয় ১৯০৯ সালে, প্রথম ছাত্র ভর্তি হয় ১৯১১-তে — ১৮৯৩ সালে জাহাজে স্বামী বিবেকানন্দের সঙ্গে জামশেদজি টাটার কথোপকথনের এক দশক পরের পরিকল্পনা থেকে।",
    source: "IISc institutional history",
    tags: ["iisc"],
  },
  {
    id: "raman-1933",
    era: "Modern",
    year: "1933",
    title: "The first Indian Director",
    fact: "C. V. Raman became IISc's first Indian Director in 1933, five years after the scattering effect that carried his name won him the Nobel Prize in Physics.",
    bangla:
      "১৯৩৩ সালে সি ভি রামন আইআইএসসি-র প্রথম ভারতীয় অধিকর্তা হন — যে বিচ্ছুরণ-প্রভাব তাঁর নাম বহন করে, তার জন্য নোবেল পাওয়ার পাঁচ বছর পরে।",
    source: "IISc institutional history",
    tags: ["iisc", "science"],
  },
];

/** A deterministic slice, so server and client agree on what to show. */
export function pickFacts(n: number, offset = 0): Fact[] {
  const out: Fact[] = [];
  for (let i = 0; i < n; i++) out.push(FACTS[(offset + i * 7) % FACTS.length]);
  return out;
}

export function factsByEra(era: Era): Fact[] {
  return FACTS.filter((f) => f.era === era);
}
