/**
 * Durga Puja and the Bengali revolutionaries.
 *
 * The under-told chapter, and the one most likely to be told badly.
 * Every claim below carries a confidence: verified, contested, or
 * unverified. That register is the point of the chapter. It is very
 * easy to write a stirring page about pandals full of revolutionaries
 * and very hard to source one, and the sourcing is where the real
 * story turns out to be stranger than the myth.
 *
 * Researched from primary documents where they exist: the Sedition
 * Committee Report of 1918, J. C. Ker's Political Trouble in India,
 * the 1849 Parliamentary Return on idolatry, Sumit Sarkar's monograph
 * on the Swadeshi movement, and Kalpana Datta's own memoir of 1945.
 *
 * Generated from research/revolutionaries.json.
 */

export type Confidence = "verified" | "contested" | "unverified";

export type Section = {
  id: string;
  heading: string;
  headingBangla: string;
  body: string;
  pullQuote: string | null;
  confidence: Confidence;
};

export type Figure = {
  name: string;
  nameBangla: string;
  years: string;
  what: string;
  source: string;
};

export type ChapterImage = {
  id: string;
  title: string;
  src: string;
  licence: string;
  attribution: string;
  sourcePage: string;
  relevance: string;
};

export const CONFIDENCE_NOTE: Record<Confidence, string> = {
  verified:
    "Documented in a primary source, named inline.",
  contested:
    "Reported by more than one account, and those accounts disagree.",
  unverified:
    "Widely repeated and not sourced anywhere we could reach.",
};

export const SECTIONS: Section[] = [
  {
    id: "bankim-anandamath",
    heading: "The novel and the hymn",
    headingBangla: "উপন্যাস ও সঙ্গীত — Upanyas o sangeet",
    body: "Bankim Chandra Chattopadhyay (বঙ্কিমচন্দ্র চট্টোপাধ্যায়, 1838–1894) was a deputy magistrate in the service of the Government of Bengal for thirty-three years. The man who gave the Indian revolution its battle-cry spent his working life collecting the revenue of the government it was aimed at.\n\nHe wrote *Bande Mataram* (বন্দে মাতরম্) around 1875; the date everyone gives, 7 November 1875, rests on the Government of India's commemoration rather than on any manuscript traced here. The claim that it appeared in *Bangadarshan* (বঙ্গদর্শন) that year is a confusion: it reached print inside *Anandamath* (আনন্দমঠ), serialised there from March 1881 and published as a book in December 1882.\n\nWhat the novel does with the goddess is stranger than the popular account. In Chapter XI the ascetic Satyananda leads the householder Mahendra through three chambers. In the first stands Jagaddhatri (জগদ্ধাত্রী): \"The Mother,\" says the monk, \"as she was.\" In an underground room lit by one straggling streak of light stands Kali (কালী) — \"Look what the mother has now become… despoiled of all wealth, and without a cloth to wear.\" Mahendra asks why there are weapons in her hands. \"We are her children, we have only just given her the arms.\" Then a tunnel opens into sunlight, and in a marble temple stands \"a golden image of the ten-handed goddess smiling brightly in the morning sun.\" This is \"the mother as she would be.\"\n\nNote what Bankim does not do. He does not write *Durga* there; he writes *dashabhuja*, the ten-handed one. It is Nares Chandra Sen-Gupta, his 1906 translator, who closes the circle in a footnote: the figure \"is called Rajrajeswari or simply Durga and is the form in which the goddess is worshipped in September–October by the Hindus of Bengal\" — adding, scrupulously, that \"the new meaning read into it is, of course, the author's own.\" (*The Abbey of Bliss*, 1906, ch. XI, pp. 40–42.) The hymn leaves nothing to inference: \"Durga bold who wields her arms / With half a score of hands… / What are they but, mother, thou.\"\n\nRabindranath Tagore set the song to music in Bankim's lifetime and sang it first, at the Calcutta Congress of 1896. Forty-one years later he was the man who insisted on cutting it. Asked for his view by Subhas Chandra Bose and the Congress Working Committee, he wrote on 20 October 1937: \"The core of Vande Mataram is a hymn to goddess Durga: this is so plain that there can be no debate about it… no Mussulman can be expected patriotically to worship the ten-handed deity.\" The Committee adopted his recommendation that only the first two stanzas be sung. (*Selected Works of Jawaharlal Nehru* vol. 8, pp. 825–30; *Selected Letters of Rabindranath Tagore*, CUP, p. 487.)\n\nThe man best placed to know thought the Durga identification was the whole point — and thought that was the problem.",
    pullQuote: "The man best placed to know thought the Durga identification was the whole point - and thought that was the problem.",
    confidence: "verified",
  },
  {
    id: "swadeshi-1905",
    heading: "What the Puja was actually used for",
    headingBangla: "স্বদেশী — Swadeshi",
    body: "The popular claim is that Durga Puja pandals became Swadeshi meeting grounds. That is not what the archive shows. Sumit Sarkar's *The Swadeshi Movement in Bengal, 1903–1908* (1973), the standard monograph, does not contain the phrase \"Durga Puja\" once — it was searched in full, and *sarbajanin* does not appear either. Nor does Ker's intelligence compilation treat Durga Puja as a surveilled gathering; his festival chapters are about the Shivaji, Ganpati and Pratapaditya festivals, and about Kali Puja.\n\nWhat the Bengal Intelligence Branch files record is narrower, stranger and more interesting. It is collected in Amiya K. Samanta's *Terrorism in Bengal: A Collection of Documents*, vol. II (Government of West Bengal, 1995).\n\n**Boycott enforcement, conducted at the Puja.** H. L. Salkeld's report on the Dacca Anushilan Samiti, 10 December 1908: before the holidays the Samiti's agents distributed leaflets threatening those who sold *bilati* goods, and \"during the Pujas agents went round under Pulin's orders to note those shopkeepers who disregarded this warning… There was also active persecution of those who decorated their images with 'rang'… In Bikrampur some offending idols were destroyed.\"\n\n**A campaign fought on the body of the goddess herself.** The Swadesh Bandhab Samiti of Barisal reported that foreign tin-foil ornaments had long been used on Durga images, and that \"now through the effort of this Samiti no one defiles the pure idols of gods and goddesses by dressing and decorating them with foreign cloths and ornaments. In consequence of this the skill of the potters and *malakars*… is gradually improving.\" And: \"At the time of the Durga Puja not a jot of bilati article was sold in the district.\" The politics of Durga Puja, in the documents, is largely an argument about where the tinsel came from.\n\n**The Puja vacation as the organising window.** A police report on the Jubak Samiti at Dumartalla notes \"some private sittings during the last Durga Puja holidays, when all the members of the Association who lived in Calcutta had come to their homes.\" A samiti minute of 29 Kartik 1315 BS (14 November 1908): \"It is settled that during the Durga Puja holidays the members will inspect village samitis and collect subscriptions.\" An approver dates a dacoity by Shashthi and Saptami. The festival's gift to the underground was not cover. It was a fortnight in which every student in Calcutta went home to his village at once.\n\nAnd once, spectacularly, the calendar itself was used. On **Mahalaya, 28 September 1905**, at the Kalighat temple, \"priests administered the swadeshi pledge to a crowd which — despite heavy rain — the *Amrita Bazar Patrika* estimated to have numbered 50,000\" (Sarkar, p. 311, citing *Bengalee* and *Amrita Bazar Patrika*, 29 September 1905). Twenty thousand more took the vow there on 3 March 1906; by August 1907 the \"puja-cum-boycott meeting\" at Kalighat was an Extremist fixture, addressed by Bipin Chandra Pal (বিপিনচন্দ্র পাল) and Brahmabandhab Upadhyay. Mahalaya opens the Puja fortnight — but Kalighat is a Kali temple, and Mahalaya is not a Puja day.\n\nPal wrote the argument down. In \"The Durga Puja,\" *New India*, 24 September 1906, he urged Bengalis to worship Durga \"not merely as a pauranic deity or as a mythological figure, but as the visible representation of the eternal spirit of their race\" (reprinted in Pal, *Swadeshi and Swaraj*, p. 105; quoted in Sarkar, p. 495). That is newspaper rhetoric rather than an organisation of pujas — but it is the clearest statement anyone made.\n\nRabindranath's Rakhi Bandhan (রাখীবন্ধন) belongs to the same autumn: on 16 October 1905, the day the Partition took effect, he called for *arandhan* — kitchens shut in mourning — and for Hindus and Muslims to tie thread on each other's wrists. Sarkar's verdict on all of it is unsparing: for all the power of such gestures, Swadeshi closed with Bengal's two communities more conscious of the antagonisms between them, not less.",
    pullQuote: "The movement did not colonise the pandal. It colonised the calendar, and the temple.",
    confidence: "verified",
  },
  {
    id: "bharat-mata",
    heading: "The painting that is not quite Durga",
    headingBangla: "ভারতমাতা — Bharat Mata",
    body: "Abanindranath Tagore (অবনীন্দ্রনাথ ঠাকুর, 1871–1951) painted *Bharat Mata* (ভারতমাতা) in 1905 and first called it *Banga Mata* (বঙ্গমাতা), Mother Bengal — a small wash watercolour, now at the Victoria Memorial Hall, Kolkata, which Sister Nivedita called \"the first great masterpiece in a new style.\"\n\nThe temptation is to read her as Durga. Look at what is in the frame and the reading collapses. Four arms, not ten. No weapon: a book, a sheaf of paddy, a piece of white cloth, a rudraksha *mala* — *shiksha, anna, vastra, diksha*. No lion. No Mahishasura. She stands barefoot, dressed as a *sadhvi*, and she is not fighting anybody. Sumathi Ramaswamy's *The Goddess and the Nation* (Duke, 2010) tracks precisely this: the earliest canonical image of nation-as-mother is ascetic and giving, and it is the later poster and calendar art that arms her and mounts her on a lion. The Durga in Bharat Mata is something the twentieth century put in.",
    pullQuote: "The Durga in Bharat Mata is something the twentieth century put in.",
    confidence: "verified",
  },
  {
    id: "oaths-anushilan-jugantar",
    heading: "Oaths before the goddess",
    headingBangla: "অনুশীলন সমিতি ও যুগান্তর — Anushilan Samiti o Jugantar",
    body: "Here the popular claim turns out to be true, and far better documented than most who repeat it realise. The evidence is in the government's own files.\n\nThe *Sedition Committee 1918 Report* (the Rowlatt Committee), pp. 62–63, prints sworn evidence from Priya Nath Acharji, a witness in the Barisal supplementary conspiracy case whose testimony the court accepted:\n\n> \"Before the Durga Puja vacation on the Mahalaya day, Ramesh, myself and several others of the Dacca Samiti were formally initiated at Ramna Siddheswari Kalibari by Pulin Das. There were 10 or 12 of us… There was no priest present and the ceremony took place at 8 a.m. before the goddess Kali. Pulin Das performed jajna before the goddess and other puja… The special vow was taken by each of us specially before the goddess with a sword and Gita on the head and kneeling on the left knee. This is called the Pratyalidha position and is supposed to represent a lion about to spring on his prey.\"\n\nMahalaya again, in a Kali temple, administered by Pulin Behari Das (পুলিন বিহারী দাস), founder of the Dacca Anushilan Samiti. The same report prints a second statement, from a boy recruited at Comilla in 1914: after fasting all day on Kali Puja he was taken after nightfall to a cremation ground, where \"Purna had arranged for the image of Kali and at the feet of the image he had placed two revolvers. We were all of us made to touch the image and take a vow to remain faithful to the Samiti.\" The printed vows open *Om Bande Mataram*.\n\nSo: documented, in the Sedition Committee Report of 1918. The goddess is Kali rather than Durga — but Kali is Durga's form, the calendar is the Durga Puja calendar, and Bankim had already fused the two.\n\nAurobindo Ghose's (অরবিন্দ ঘোষ) *Bhawani Mandir* (ভবানী মন্দির, 1905) is the programme behind the ritual. J. C. Ker, personal assistant to the Director of Criminal Intelligence, reprinted it entire because it \"really contains the germ of the Hindu revolutionary movement in Bengal.\" The Sedition Committee summarised it at paragraph 94: Kali glorified as Sakti and Bhawani, and a temple \"far from the contamination of modern cities… in a high and pure air steeped in calm and energy,\" served by a new order of political *sannyasis*. \"The central idea,\" it noted, \"is taken from the well-known novel Ananda Math of Bankim Chandra.\" The temple was never built.\n\nKer preserves something sharper. At a Sakti celebration in Shobhabazar on 25 May 1907, Bipin Chandra Pal proposed organising public Rakshakali pujas through the villages of Bengal: \"It would impart a religious meaning and significance to our national movements… We too may perplex and demoralise them by the organisation of these pujas.\" The first, disputed report of the speech put it more baldly — \"The Kali Puja will not be prohibited by Government.\" Pal denied that version and issued a correction, but somebody in that room understood exactly what a religious festival was worth to a movement being watched. Note again which festival: Kali Puja, not Durga Puja.\n\nA caution from the same file: the Committee recorded that samitis formed after 1908 \"gradually dropped the religious ideas underlying the Bhawani Mandir pamphlet (with the exception of the formalities of oaths and vows) and developed the terroristic side.\" The goddess was a recruiting idiom of the first decade. It faded.",
    pullQuote: "The special vow was taken by each of us specially before the goddess with a sword and Gita on the head.",
    confidence: "verified",
  },
  {
    id: "subhas-chandra-bose",
    heading: "Subhas Chandra Bose",
    headingBangla: "সুভাষচন্দ্র বসু — Subhas Chandra Bose",
    body: "Netaji's association with particular Calcutta pujas is the most repeated claim in this subject and the most thinly sourced. What can be said with reasonable confidence, from the committees' own accounts, is that he presided over the Baghbazar Sarbojanin committee in 1938–39, and that Kumartuli Sarbojanin (কুমারটুলি সর্বজনীন) states on its own website that \"in 1938, Netaji Subhas Chandra Bose was the President of the Organising Committee\" — the year fire destroyed the *ek-chala* frame at Panchami and the image-maker Gopeswar Pal rebuilt it in separate sections, inventing the multi-*chala* form now standard across Kolkata.\n\nWhat must be flagged: the widely circulated claim that Bose presided over a Durga Puja at Simla Street, or ran a political Puja from the Elgin Road house, is supported by nothing found here. The Bose family's Durga Puja is at Kodalia in South 24 Parganas, at the house built by his grandfather Haranath Bose — an ancestral family puja, not a political one, and not at Elgin Road. Treat \"Netaji's Elgin Road Puja\" as folklore until someone produces a document.\n\nMore securely his is the martial-feminine idiom — the Mahila Rashtriya Sangha of 1928, whose three hundred women marched in formation at that year's Calcutta Congress, and the Rani of Jhansi Regiment raised in Singapore in 1943. Whether he read that as Durga, as Lakshmibai, or simply as good organising, the record does not say.",
    pullQuote: "Treat Netaji's Elgin Road Puja as folklore until someone produces a document.",
    confidence: "contested",
  },
  {
    id: "pujas-revolutionary-descent",
    heading: "The pujas that claim a revolutionary descent",
    headingBangla: "সর্বজনীন — Sarbajanin",
    body: "Begin with a warning sign. The candidates for \"first community puja\" are mutually incompatible: Guptipara 1790 or 1761, Bhowanipore 1909 or 1910, Shyampukur 1911, Sikdar Bagan 1913, Baghbazar 1918 or 1919, Simla Byayam Samity and Maniktala 1926. When a dozen institutions claim the same origin on different dates, the origin is being asked to carry more than the evidence can bear.\n\nThe *Friend of India* (Serampore, 1820) describes the Guptipara event within living memory: \"About thirty years ago at Gooptipara near Santipoora… a number of Brahmins formed an association for the celebration of a pooja independently of the rule of the Shastras.\" Twelve men, hence *baro-yaari*; subscriptions from the surrounding villages. The impulse recorded is ritual autonomy and neighbourhood finance — and the deity was Bindhyabasini, a form of Jagaddhatri. Not Durga, and a century before nationalism.\n\nThe first *barowari* Durga Puja in Kolkata is usually dated to 1909, at Balaram Bose Ghat Road, Bhowanipore, by the Bhowanipore Sanatan Dharmotsahini Sabha (ভবানীপুর সনাতন ধর্মোৎসাহিনী সভা) — the occasion on which Aurobindo published his *Durga Stotra* in his Bengali weekly *Dharma* (ধর্ম), 4 October 1909. Jatindranath Mukherjee (যতীন্দ্রনাথ মুখোপাধ্যায়), Bagha Jatin, belonged to the same circle.\n\n**Simla Byayam Samity (সিমলা ব্যায়াম সমিতি)** is the strongest single story and needs stating exactly. Founded on 2 April 1926 by Atindranath Bose (অতীন্দ্রনাথ বসু) in Vivekananda's own north Calcutta neighbourhood as a gymnasium — physical culture for young men, which in Bengal in 1926 was never only physical culture — it began a Durga Puja the same year. It is said to have been declared illegal and closed on 4 January 1932, its furniture and equipment confiscated, and unbanned in 1939, when Mahendranath Dutta (মহেন্দ্রনাথ দত্ত), Vivekananda's younger brother, took charge, fixed the form of the image still followed, and Netaji inaugurated that year's puja.\n\nHere is the honest position. **4 January 1932 is a real date**: the day four emergency ordinances were promulgated across India and mass declarations of unlawful associations began (*India in 1931-32*, the official statement to Parliament). The state was demonstrably suspicious of gymnastic clubs — an Intelligence Branch report complains that a club's drill \"goes far beyond the needs of a gymnastic club.\" But **no notification naming Simla Byayam Samity was found** in Ker, the Sedition Committee Report, Samanta's IB volumes or the official annual statements, and the journalism contradicts itself about which years the ban covered. The story is plausible, contextually anchored, and unproven.\n\n**Baghbazar Sarbojanin (বাগবাজার সর্বজনীন)** began in 1918 or 1919 at the Sarkar house as the Lebubagan Baroyari puja. Durgacharan Bandyopadhyay, president from 1930, started the exhibition promoting indigenous goods and boycotting British imports — it survives as the Puja-cum-exhibition today, the clearest institutional trace of Swadeshi still standing inside a Durga Puja. **Kumartuli Park Sarbojanin**, often swept into this story, was founded in 1992 and has no revolutionary history; the puja people mean is the older, separate Kumartuli Sarbojanin.",
    pullQuote: "When a dozen institutions claim the same origin on different dates, the origin is being asked to carry more than the evidence can bear.",
    confidence: "contested",
  },
  {
    id: "surveillance-restriction",
    heading: "What the government actually did",
    headingBangla: "নজরদারি — Nazardari",
    body: "**First, a myth to retire.** It is said everywhere that in 1840 the Company prohibited its European servants from attending Durga Puja at Bengali houses. No such order was found, and the search was not casual: the 1849 Parliamentary Return on idolatry, Hansard, and the most recent peer-reviewed treatment of nineteenth-century Calcutta pujas (Monolina Bhattacharyya, *Journal of Festive Studies* 6, 2024) contain no trace of it. What exists is a cluster of adjacent things — the Court of Directors' despatch of 1833 ordering government to sever its \"connexion with idolatry\"; a House of Lords debate of 10 August 1840 about *troops* attending idolatrous ceremonies; Act X of 1840, a **Madras** measure about temple endowments; and the despatch of 31 March 1841 \"directing the discontinuance of the attendance of troops or military bands, and firing of salutes on the occasion of native festivals.\" The withdrawal of Europeans from the babu pujas was a gradual matter of reputation rather than law: nautch fees had already collapsed from Rs 500–1,000 a night to Rs 50 by the late 1830s.\n\n**What the state did restrict was melas, not pujas.** The Nangalband mela drew 300,000 people and a thousand samiti volunteers parading with lathis and badges; Salkeld concluded that \"I would deprecate strongly any further recognition of volunteers on these occasions.\" The official list of fairs at which volunteers intervened between 1907 and 1909 — Nangalband, Mahakati, Jamalpur, the Mymensingh rathajatra, Siddheswari, Jhalakati, Sitakund — contains not one Durga Puja. Section 144 was used against Mukunda Das's swadeshi *jatra*; he got a year's rigorous imprisonment on 23 January 1909.\n\nThe only documented prohibition of a goddess festival on political grounds is small and early: in the last week of August 1905, \"a special Kali Puja to avert the partition was planned at Faridpur; the chairman of the municipality refused permission for it at the last moment\" (Sarkar, p. 309).\n\nThe pattern is consistent. The Raj suppressed the *akhara*, the pamphlet, the travelling play and the fair. It left Durga Puja alone.",
    pullQuote: "The Raj suppressed the akhara, the pamphlet, the travelling play and the fair. It left Durga Puja alone.",
    confidence: "verified",
  },
  {
    id: "women-shakti-idiom",
    heading: "Women, and the Shakti idiom",
    headingBangla: "শক্তি — Shakti",
    body: "The most concrete link between a woman and the Durga calendar is also the least famous. In **October 1902** — not 1903 or 1904, as usually stated — Sarala Devi Chaudhurani (সরলা দেবী চৌধুরানী), Rabindranath's niece, held the first Birashtami (বীরাষ্টমী), the \"heroes' eighth,\" at her father's house on Ballygunj Circular Road, as part of a programme of physical training for young men; the *Bengalee* reported it on 15 October 1902 (Sarkar, p. 304 n. 204). It involved reciting a Sanskrit roll of the heroes of India, from Krishna and Rama to Rana Pratap and Shivaji.\n\nShe did not claim to have invented it. In her memoir *Jibaner Jharapata* she describes leafing through an almanac for the Puja dates and discovering that Ashtami \"had also been celebrated in the past as Birashtami — paying homage to the brave and the valiant,\" and resolving to *re-introduce* it. The Intelligence Branch noticed: Armstrong's report records that \"Miss Sarala Ghosal\" reorganised the Suhrid Samiti at Mymensingh in 1905 \"as an instrument for political work\" and \"introduced the 'Birastami Brata' and 'Pratapaditya Brata'… modelled on the Sivaji cult.\" Orthodox Bengal noticed too — the *Rangalay* of 6 September 1903 thought her conduct unworthy of a Hindu woman.\n\nThe generation that followed used a different vocabulary. Pritilata Waddedar (প্রীতিলতা ওয়াদ্দেদার) led the attack on the Pahartali European Club on 24 September 1932 and took potassium cyanide, aged twenty-one, rather than be captured. Bina Das (বীণা দাস) fired at Governor Stanley Jackson at the Calcutta University convocation on 6 February 1932. Matangini Hazra (মাতঙ্গিনী হাজরা) was shot leading a procession at Tamluk on 29 September 1942.\n\nAll three are now routinely called Durga, or Shakti incarnate. The evidence that they called *themselves* that is thin, and there is a striking piece of counter-evidence. Kalpana Datta (কল্পনা দত্ত), who was in the Chittagong group with Pritilata and wrote *Chittagong Armoury Raiders: Reminiscences* (People's Publishing House, Bombay, October 1945), does not use the word *Durga* once in the whole book. Nor *Shakti*. Nor *Bande Mataram*. The single appearance of the festival in her memoir is this:\n\n> \"During the Puja holidays in 1930, she had asked me to go to their place for a feast. We were discussing whether either of us could slaughter a goat for the mutton. I said, 'Of course, I can! There is nothing much in it.' Preeti said, 'There is nothing frightening in it, of course, but I won't be able to slaughter a poor inoffensive creature in cold blood.'\"\n\nTwo years before Pahartali, Durga Puja in the life of Bengal's most famous woman revolutionary was holidays, a feast, and a friend who could not kill a goat. The goddess framing was applied to these women. It was largely not chosen by them.",
    pullQuote: "Durga Puja in the life of Bengal's most famous woman revolutionary was holidays, a feast, and a friend who could not kill a goat.",
    confidence: "verified",
  },
  {
    id: "after-1947",
    heading: "After 1947",
    headingBangla: "স্বাধীনতার পরে — Swadhinatar pore",
    body: "The political Puja did not end; its politics changed owner. What had been a way of gathering people out of sight of the police became a way of gathering them in sight of a party. Manas Ray, reviewing Guha-Thakurta in *Modern Asian Studies* (2017), reads the arc as a movement from unruly plebeian festivity in the 1960s and 1970s toward middle-class respectability under Left Front governance — and argues that the new civic codes and the corporate award economy were what made the contemporary art-puja possible. The Asian Paints Sharad Shamman, first of the big prizes, began in 1985; the CPI(M) formally accepted in 2016 that its members could sit on puja committees.\n\nIn September 2018 the West Bengal government began making direct grants to puja committees — Rs 10,000 each to some 28,000 of them. The Calcutta High Court stayed the order, then a division bench rejected the petition against it; the grant has since risen above a lakh, and in 2024 several committees refused it in protest over the R. G. Kar killing. On 15 December 2021, at its sixteenth session in Paris, UNESCO inscribed \"Durga Puja in Kolkata\" on the Representative List of the Intangible Cultural Heritage of Humanity (ref. 00703), on a dossier prepared by Tapati Guha-Thakurta. The festival that once worked in the state's blind spot now takes the state's cheque, and argues about whether to cash it.",
    pullQuote: "The festival that once worked in the state's blind spot now takes the state's cheque, and argues about whether to cash it.",
    confidence: "verified",
  },
  {
    id: "the-case-against",
    heading: "The case against",
    headingBangla: "বিপরীত যুক্তি — Biporit jukti",
    body: "The strongest argument that the \"revolutionary Durga Puja\" is substantially retrospective is not made by a revisionist. It is made, in 1973, by the historian who established the field.\n\nSumit Sarkar closes *The Swadeshi Movement in Bengal* with this: many thought a popular nationalism could be founded on Hinduism, \"and so we had the curious but by no means unique phenomenon of intellectuals utterly westernised in outlook and way of life striving by a tour de force to turn overnight into orthodox Hindus, imparting to age-old rituals and symbols a political content which was in fact quite untraditional.\" His verdict on how it landed: \"Such incongruous combinations probably left most genuinely orthodox people cold\" (p. 495). It is in that same passage that he quotes Pal on Durga — as evidence of the strategy's *failure*.\n\nThe revolutionaries themselves said so. Bhupendranath Dutta refused to swear on the Hindu shastras alone; Khagendrachandra Das complained to Debabrata Basu that the Hindu rituals were alienating possible Muslim and Brahmo sympathisers. When the Shivaji Utsava of 1906 introduced an image of Bhawani, the Brahmo-led Anti-Circular Society boycotted the whole function: \"We could not take part in the last Shivaji festival, lest it might wound the susceptibilities of our numerous Mahomedan workers and sympathisers\" (*Bengalee*, 9 November 1906). The Sedition Committee, no friend of the movement, concluded flatly that in Bengal \"the cult of Sivaji… took little root.\"\n\nThe scholarship on the festival points elsewhere entirely. Jyotirmoyee Sarma's \"Pūjā Associations in West Bengal\" (*Journal of Asian Studies*, 1969) describes them as voluntary neighbourhood bodies of young men collecting subscriptions and providing secular diversions — written before the nationalist framing hardened. Tithi Bhattacharya's \"Tracking the Goddess\" (*JAS*, 2007) reads the nineteenth-century festival through modernity, urban space and new classes, not nationalism. Monolina Bhattacharyya (*Journal of Festive Studies*, 2024) reads it as elite status competition, the barowari turn produced by the exclusion of the masses rather than by politics. Tapati Guha-Thakurta's *In the Name of the Goddess* (Primus, 2015) locates its meaning in neighbourhood rivalry, patronage, artisanal labour and public art. And Kalpana Datta's memoir has no goddess in it at all.\n\nThe fair conclusion is narrower than the legend and more interesting. Revolutionaries did swear oaths before images of the goddess; that is in the government's own evidence. Samitis did enforce the boycott during the Pujas, and fought a real campaign over the foreign tinsel on the idols. The Puja vacation was the fortnight in which the organisation travelled. Pal did urge, in print, that the festival be read politically. What is not established is the picture most often painted — pandals up and down Bengal serving as routine cover for revolutionary cells. That belongs to the era's memory of itself. It was a real strategy, proposed by real people, that mostly did not take.",
    pullQuote: "It was a real strategy, proposed by real people, that mostly did not take.",
    confidence: "verified",
  },
];

export const FIGURES: Figure[] = [
  {
    name: "Bankim Chandra Chattopadhyay",
    nameBangla: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়",
    years: "1838-1894",
    what: "Novelist and deputy magistrate. Wrote Bande Mataram c.1875 and Anandamath (1882), in which the motherland appears as Jagaddhatri, Kali and the ten-handed goddess.",
    source: "The Abbey of Bliss, trans. N. C. Sen-Gupta, 1906, ch. XI (archive.org)",
  },
  {
    name: "Aurobindo Ghose",
    nameBangla: "অরবিন্দ ঘোষ",
    years: "1872-1950",
    what: "Author of the Bhawani Mandir pamphlet (1905), which proposed an order of political sannyasis around a temple to Bhawani; published the Durga Stotra in his weekly Dharma on 4 October 1909.",
    source: "J. C. Ker, Political Trouble in India 1907-1917, ch. III; Sedition Committee 1918 Report, para. 94",
  },
  {
    name: "Bipin Chandra Pal",
    nameBangla: "বিপিনচন্দ্র পাল",
    years: "1858-1932",
    what: "Extremist leader who argued in print that Bengalis should worship Durga as the spirit of their race, and proposed organising public Rakshakali pujas as political mass gatherings.",
    source: "'The Durga Puja', New India, 24 Sept 1906 (in Swadeshi and Swaraj, p.105); Ker, 'Sakti Puja or the Worship of Power'",
  },
  {
    name: "Pulin Behari Das",
    nameBangla: "পুলিন বিহারী দাস",
    years: "1877-1949",
    what: "Founder of the Dacca Anushilan Samiti. Administered initiations before an image of Kali at Ramna Siddheswari Kalibari, on Mahalaya, with sword and Gita.",
    source: "Sedition Committee 1918 Report, pp. 62-63 (evidence of Priya Nath Acharji)",
  },
  {
    name: "Sarala Devi Chaudhurani",
    nameBangla: "সরলা দেবী চৌধুরানী",
    years: "1872-1945",
    what: "Rabindranath's niece. Founded the Birashtami festival in October 1902 as part of a physical-culture programme for young men, presenting it as a revival of an older Ashtami observance.",
    source: "Sumit Sarkar, The Swadeshi Movement in Bengal, p.304 n.204, citing Bengalee, 15 Oct 1902; Armstrong's Report in Samanta, Terrorism in Bengal vol. II",
  },
  {
    name: "Abanindranath Tagore",
    nameBangla: "অবনীন্দ্রনাথ ঠাকুর",
    years: "1871-1951",
    what: "Painted Bharat Mata (1905), first titled Banga Mata: a four-armed ascetic figure holding book, paddy, cloth and rudraksha mala - unarmed, with no lion and no Mahishasura.",
    source: "Sumathi Ramaswamy, The Goddess and the Nation (Duke, 2010); Victoria Memorial Hall, Kolkata",
  },
  {
    name: "Rabindranath Tagore",
    nameBangla: "রবীন্দ্রনাথ ঠাকুর",
    years: "1861-1941",
    what: "First sang Bande Mataram at the 1896 Calcutta Congress; led the Rakhi Bandhan of 16 October 1905; in 1937 argued that the song's core was a hymn to Durga and that only the first two stanzas should be sung.",
    source: "Letter to Subhas Chandra Bose, 20 Oct 1937, in Selected Letters of Rabindranath Tagore (CUP), p.487",
  },
  {
    name: "Subhas Chandra Bose",
    nameBangla: "সুভাষচন্দ্র বসু",
    years: "1897-1945",
    what: "Said to have presided over the Baghbazar Sarbojanin committee in 1938-39 and Kumartuli Sarbojanin in 1938. The family Durga Puja is at Kodalia, South 24 Parganas, not Elgin Road.",
    source: "Kumartuli Sarbojanin's own website; Bengali cultural journalism - no contemporary document located",
  },
  {
    name: "Atindranath Bose",
    nameBangla: "অতীন্দ্রনাথ বসু",
    years: "fl. 1926-1940s",
    what: "Founded Simla Byayam Samity on 2 April 1926 as a gymnasium in Vivekananda's north Calcutta neighbourhood; began its Durga Puja the same year.",
    source: "Millennium Post; Get Bengal - institutional memory, not archivally verified",
  },
  {
    name: "Mahendranath Dutta",
    nameBangla: "মহেন্দ্রনাথ দত্ত",
    years: "1869-1956",
    what: "Vivekananda's younger brother; took charge of the Simla Byayam Samity puja in 1939 and fixed the form of the image still followed.",
    source: "Millennium Post; Get Bengal - institutional memory",
  },
  {
    name: "Jatindranath Mukherjee (Bagha Jatin)",
    nameBangla: "যতীন্দ্রনাথ মুখোপাধ্যায়",
    years: "1879-1915",
    what: "Jugantar's military leader; associated with the circle around the 1909 Bhowanipore barowari Durga Puja.",
    source: "Wikipedia, Barowari; Sedition Committee 1918 Report",
  },
  {
    name: "Pritilata Waddedar",
    nameBangla: "প্রীতিলতা ওয়াদ্দেদার",
    years: "1911-1932",
    what: "Led the attack on the Pahartali European Club, 24 September 1932, and took potassium cyanide rather than be captured. No self-description in goddess terms has been located.",
    source: "Standard biographies; Kalpana Datta, Chittagong Armoury Raiders (1945)",
  },
  {
    name: "Kalpana Datta",
    nameBangla: "কল্পনা দত্ত",
    years: "1913-1995",
    what: "Chittagong armoury raid group. Her 1945 memoir uses the words Durga, Shakti and Bande Mataram not once; the festival appears only as holidays and a feast.",
    source: "Chittagong Armoury Raiders: Reminiscences, People's Publishing House, Bombay, Oct 1945 (archive.org, full text searched)",
  },
  {
    name: "Bina Das",
    nameBangla: "বীণা দাস",
    years: "1911-1986",
    what: "Fired at Governor Stanley Jackson at the Calcutta University convocation, 6 February 1932.",
    source: "Standard biographies",
  },
  {
    name: "Matangini Hazra",
    nameBangla: "মাতঙ্গিনী হাজরা",
    years: "1870-1942",
    what: "Shot leading a procession at Tamluk, 29 September 1942. Popularly called Gandhi Buri; the Durga framing of her is posthumous.",
    source: "Standard biographies",
  },
  {
    name: "J. C. Ker",
    nameBangla: "(J. C. Ker)",
    years: "1878-1961",
    what: "Personal assistant to the Director of Criminal Intelligence. His Political Trouble in India 1907-1917 reprints Bhawani Mandir entire and preserves Pal's Rakshakali speech of 25 May 1907.",
    source: "Political Trouble in India 1907-1917 (archive.org, in.ernet.dli.2015.45679)",
  },
  {
    name: "Sumit Sarkar",
    nameBangla: "সুমিত সরকার",
    years: "1939-2026",
    what: "Historian whose The Swadeshi Movement in Bengal, 1903-1908 (1973) remains the standard monograph - and which does not contain the phrase 'Durga Puja' once.",
    source: "The Swadeshi Movement in Bengal 1903-1908 (archive.org, dli.bengal.10689.13361, full text searched)",
  },
  {
    name: "Tapati Guha-Thakurta",
    nameBangla: "তপতী গুহঠাকুরতা",
    years: "b. 1956",
    what: "Art historian; In the Name of the Goddess (2015) reads the puja through neighbourhood rivalry, patronage, artisanal labour and public art. Prepared the UNESCO nomination dossier.",
    source: "In the Name of the Goddess: The Durga Pujas of Contemporary Kolkata (Primus, 2015)",
  },
];

export const IMAGES: ChapterImage[] = [
  {
    id: "bankim-portrait",
    title: "Bankim Chandra Chattopadhyay, portrait",
    src: "/media/biplob/bankim-portrait.jpg",
    licence: "Public domain",
    attribution: "Unknown author, Calcutta State Archive, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bankimchandra_Chattapadhay.jpg",
    relevance: "The author of Anandamath and Bande Mataram; the origin point of the chapter.",
  },
  {
    id: "anandamath-telugu-1924",
    title: "Aananda-Mathamu, Telugu edition of Anandamath, printed cover, 1924",
    src: "/media/biplob/anandamath-telugu-1924.jpg",
    licence: "Public domain",
    attribution: "Vavilla Venkateswara Sastry (1884-1956), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Aananda-Mathamu_Telugu_book_cover_1924_(page_6_crop).jpg",
    relevance: "The only freely licensed cover image of any Anandamath edition on Commons; also evidence of the novel's spread beyond Bengal.",
  },
  {
    id: "bande-mataram-1907",
    title: "Bande Mataram newspaper, 29 September 1907",
    src: "/media/biplob/bande-mataram-1907.jpg",
    licence: "Public domain",
    attribution: "Bipin Chandra Pal, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bande_Mataram_29_September_1907.jpg",
    relevance: "The Pal/Aurobindo daily that turned Bankim's hymn into the masthead of extremist politics.",
  },
  {
    id: "vande-mataram-painting-1923",
    title: "Devotional painting of Vande Mataram, published 1923",
    src: "/media/biplob/vande-mataram-painting-1923.jpg",
    licence: "Public domain",
    attribution: "Unknown author, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:A_rare_painting_of_our_national_song,_Vande_Mataram,_published_in_1923.jpg",
    relevance: "Shows the hymn already visualised as goddess-iconography by the 1920s.",
  },
  {
    id: "bharat-mata-1905",
    title: "Abanindranath Tagore, Bharat Mata, 1905",
    src: "/media/biplob/bharat-mata-1905.jpg",
    licence: "Public domain",
    attribution: "Abanindranath Tagore, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bharat_Mata_by_Abanindranath_Tagore.jpg",
    relevance: "The central image of section 3 - four-armed, unarmed, ascetic; the case that she is NOT Durga rests on looking at it.",
  },
  {
    id: "abanindranath-1907",
    title: "Abanindranath Tagore, portrait, 1907",
    src: "/media/biplob/abanindranath-1907.jpg",
    licence: "Public domain",
    attribution: "The Cyclopedia of India, Vol. I (Calcutta, 1907), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Abanindra_Nath_Tagore.jpg",
    relevance: "Contemporary portrait of the painter, within two years of Bharat Mata.",
  },
  {
    id: "aurobindo-c1900",
    title: "Aurobindo Ghose, c. 1900",
    src: "/media/biplob/aurobindo-c1900.jpg",
    licence: "Public domain",
    attribution: "Photographer unknown (via Heehs, The Lives of Sri Aurobindo), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Sri_aurobindo.jpg",
    relevance: "Aurobindo in his Baroda/revolutionary years - the period of Bhawani Mandir.",
  },
  {
    id: "aurobindo-1901",
    title: "Aurobindo Ghose, seated, 9 January 1901",
    src: "/media/biplob/aurobindo-1901.jpg",
    licence: "Public domain",
    attribution: "Sri Aurobindo Ashram archive, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Sri-Aurobindo-sit-side.jpg",
    relevance: "Second dated early image; useful for a non-repeating pair.",
  },
  {
    id: "subhas-bose-nrb",
    title: "Subhas Chandra Bose, portrait, c. 1930s",
    src: "/media/biplob/subhas-bose-nrb.jpg",
    licence: "Public domain",
    attribution: "Unknown (Netaji Research Bureau, Calcutta), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Subhas_Chandra_Bose_NRB.jpg",
    relevance: "Best-resolution public-domain portrait from his Calcutta Congress years.",
  },
  {
    id: "bose-dumdum-1938",
    title: "Bose arriving at Dum Dum aerodrome, Calcutta, 1938",
    src: "/media/biplob/bose-dumdum-1938.jpg",
    licence: "Public domain",
    attribution: "Unknown author, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Subhas_Chandra_Bose_arrives_at_Dum_Dum_aerodrome.jpg",
    relevance: "1938 - the year of the Baghbazar and Kumartuli puja presidencies.",
  },
  {
    id: "bose-nabadwip-1938",
    title: "Bose at Nabadwip, December 1938",
    src: "/media/biplob/bose-nabadwip-1938.jpg",
    licence: "Public domain",
    attribution: "Amiya Gopal Dutta, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Subhas_Chandra_Bose_in_Nabadwip,_December_1938.jpg",
    relevance: "Bose in a Bengali devotional town; good for the religion-and-nationalism thread.",
  },
  {
    id: "rabindranath-1905",
    title: "Rabindranath Tagore, 1905",
    src: "/media/biplob/rabindranath-1905.jpg",
    licence: "Public domain",
    attribution: "Sukumar Ray, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Rabindranath_Tagore_1905-1906_Sukumar_Ray.jpg",
    relevance: "The anti-Partition and Rakhi Bandhan year. Low resolution (260x390) but the only public-domain image dated to 1905.",
  },
  {
    id: "khudiram-1905",
    title: "Khudiram Bose, 1905",
    src: "/media/biplob/khudiram-1905.jpg",
    licence: "Public domain",
    attribution: "Unknown author, Calcutta State Archive, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Khudiram_Bose_1905.jpg",
    relevance: "The archetypal martyr of the Swadeshi-era secret societies.",
  },
  {
    id: "bagha-jatin",
    title: "Jatindranath Mukherjee (Bagha Jatin)",
    src: "/media/biplob/bagha-jatin.jpg",
    licence: "Public domain",
    attribution: "Unknown photographer, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:BaghaJatin12.jpg",
    relevance: "Jugantar's military leader; linked to the 1909 Bhowanipore barowari circle.",
  },
  {
    id: "pulin-behari-das",
    title: "Pulin Behari Das",
    src: "/media/biplob/pulin-behari-das.jpg",
    licence: "Public domain",
    attribution: "Unknown author, from Jibantara Halder's history of the Anushilan Samiti, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Pulin_Behari_Das.jpg",
    relevance: "The man who administered the Mahalaya initiations before the image of Kali - section 4's central figure.",
  },
  {
    id: "bipin-chandra-pal",
    title: "Bipin Chandra Pal",
    src: "/media/biplob/bipin-chandra-pal.jpg",
    licence: "Public domain",
    attribution: "Unknown, Calcutta State Archives, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bipin_Chandra_Pal.jpg",
    relevance: "Author of 'The Durga Puja' (1906) and of the Rakshakali proposal of 1907.",
  },
  {
    id: "barindra-kumar-ghosh",
    title: "Barindra Kumar Ghosh, 1922",
    src: "/media/biplob/barindra-kumar-ghosh.jpg",
    licence: "Public domain",
    attribution: "From Barindra Ghosh, The Tale of My Exile: Twelve Years in the Andamans (1922), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Barindra_Kumar_Ghosh_01.jpg",
    relevance: "Aurobindo's brother; the Maniktala garden group and the Alipore case.",
  },
  {
    id: "pritilata-waddedar",
    title: "Pritilata Waddedar, before 1932",
    src: "/media/biplob/pritilata-waddedar.jpg",
    licence: "Public domain",
    attribution: "Unknown author (via Banglapedia), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Pritilata-waddedar.jpg",
    relevance: "Leader of the Pahartali European Club raid.",
  },
  {
    id: "pritilata-police-notice",
    title: "Police notice concerning Pritilata Waddedar",
    src: "/media/biplob/pritilata-police-notice.jpg",
    licence: "CC0",
    attribution: "Swomitra Palit / Shankar Ghosh, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Pritilata_Notice_Police.jpg",
    relevance: "High-resolution primary document (2133x3043); a strong full-page plate.",
  },
  {
    id: "kalpana-dutt",
    title: "Kalpana Datta",
    src: "/media/biplob/kalpana-dutt.jpg",
    licence: "Public domain",
    attribution: "Calcutta State Archives, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Woman_revolutionary,_Kalpana_Dutt.jpg",
    relevance: "Author of the 1945 memoir whose silence about the goddess is section 8's key evidence.",
  },
  {
    id: "bina-das",
    title: "Bina Das",
    src: "/media/biplob/bina-das.jpg",
    licence: "Public domain",
    attribution: "Uploader 'Enhancer'; PD-India, author unknown, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bina_Das_revolutionary.jpg",
    relevance: "Fired at the Governor of Bengal at the 1932 Calcutta University convocation.",
  },
  {
    id: "matangini-hazra",
    title: "Matangini Hazra ('Gandhi Buri')",
    src: "/media/biplob/matangini-hazra.jpg",
    licence: "Public domain",
    attribution: "Calcutta Mahajati Sadan collection, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:%22Gandhi_Buri%22_-_Matangini_Hazra.jpg",
    relevance: "Killed at Tamluk in 1942; the rural Midnapore face of the movement.",
  },
  {
    id: "alipore-trial-room",
    title: "Alipore Bomb Case 1908-09 trial room, Alipore Sessions Court",
    src: "/media/biplob/alipore-trial-room.jpg",
    licence: "CC BY 3.0",
    attribution: "Biswarup Ganguly, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Alipore_Bomb_Case_1908-09_Trial_Room_-_Alipore_Sessions_Court_-_Calcutta_1997_1.jpg",
    relevance: "The preserved room where Aurobindo and Barindra were tried, and where Bhawani Mandir went in as evidence. Modern photograph, 5883x5761.",
  },
  {
    id: "durga-puja-1809-patna",
    title: "Durga Puja, watercolour, Patna style, 1809",
    src: "/media/biplob/durga-puja-1809-patna.jpg",
    licence: "Public domain (PD-Art / PD-old-100)",
    attribution: "Sevak Ram (c.1770-c.1830), British Library Add.Or.29, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Durga_Puja,_1809_watercolour_painting_in_Patna_Style.jpg",
    relevance: "The best pre-modern depiction of the puja available freely; Company/Patna School, 3903x2313.",
  },
  {
    id: "durga-procession-c1800",
    title: "Religious Procession: Durga, c. 1800",
    src: "/media/biplob/durga-procession-c1800.jpg",
    licence: "Public domain",
    attribution: "Unknown Indian artist, Los Angeles County Museum of Art 37.28.19, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Religious_Procession-_Durga_LACMA_37.28.19.jpg",
    relevance: "Immersion procession c.1800 - the public, street-level side of the festival.",
  },
  {
    id: "prinsep-durga-puja",
    title: "William Prinsep: Europeans entertained during Durga Puja in a Calcutta house, 1830s-40s",
    src: "/media/biplob/prinsep-durga-puja.jpg",
    licence: "Public domain",
    attribution: "William Prinsep (1794-1874), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:William_Prinsep,_Europeans_being_entertained_by_dancers_and_musicians_in_a_splendid_Indian_house_in_Calcutta_during_Durga_puja_(1830s%E2%80%931840s).jpg",
    relevance: "The babu puja as colonial social theatre - the pre-nationalist meaning of the festival, and the best illustration for the '1840 order' discussion in section 7.",
  },
  {
    id: "durga-calcutta-1858",
    title: "Festival of the Goddess Durga at Calcutta, plate, 1858",
    src: "/media/biplob/durga-calcutta-1858.jpg",
    licence: "Public domain",
    attribution: "Louis-Henri de Rudder, after Alexei Dmitriyevich Saltykov, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Plate_3._Festival_of_the_Goddess_Durga_at_Calcutta.jpg",
    relevance: "Mid-century European print of the thakur-dalan puja.",
  },
  {
    id: "durga-puja-photo-c1900",
    title: "Durga Puja, photograph, late 19th / early 20th century",
    src: "/media/biplob/durga-puja-photo-c1900.jpg",
    licence: "Public domain (PD-India)",
    attribution: "Unknown photographer, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Durga_Puja_(late_19th_or_early_20th_century).jpg",
    relevance: "The ONLY freely licensed period photograph of a Durga Puja found; the pre-1947 photographic record on Commons is otherwise empty.",
  },
  {
    id: "pratima-visarjan-gaganendranath",
    title: "Gaganendranath Tagore, Pratima Visarjan, c. 1915",
    src: "/media/biplob/pratima-visarjan-gaganendranath.jpg",
    licence: "Public domain",
    attribution: "Gaganendranath Tagore (d. 1938), via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Pratima_Visarjan_by_Gaganendranath_Tagore.png",
    relevance: "The Bengal School painting the immersion - same milieu and moment as Bharat Mata. Small (283x345).",
  },
  {
    id: "kumartuli-street",
    title: "Kumartuli, the idol-makers' quarter, Calcutta",
    src: "/media/biplob/kumartuli-street.jpg",
    licence: "CC0",
    attribution: "AD Hopper, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Kumartuli_Street.jpg",
    relevance: "Modern, but CC0 and the cleanest Kumartuli image; no pre-1947 Kumartuli photograph exists on Commons.",
  },
  {
    id: "bengal-partition-map-1905",
    title: "Map of the 1905 Partition of Bengal",
    src: "/media/biplob/bengal-partition-map-1905.jpg",
    licence: "CC BY-SA 4.0",
    attribution: "XrysD, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:BengalPartition1905_Map.png",
    relevance: "The standard reference map; 3000x1989, large enough for a full-page plate.",
  },
  {
    id: "bengal-partition-protest-1906",
    title: "Anti-Partition mass meeting, The Sphere, 27 October 1906",
    src: "/media/biplob/bengal-partition-protest-1906.jpg",
    licence: "Public domain",
    attribution: "The Sphere, 1906, via Wikimedia Commons",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Bengal_Partition_Mass_1906.jpg",
    relevance: "Contemporary British press image of the Swadeshi agitation; panoramic (1275x408), works as a strip across a spread.",
  },
];

export function imageById(id: string): ChapterImage | undefined {
  return IMAGES.find((i) => i.id === id);
}
