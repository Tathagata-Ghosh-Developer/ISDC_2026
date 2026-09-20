/**
 * The research institutions around us, and the Bengali organisations
 * of this city. Both lists exist so the invitation can be specific
 * rather than vague.
 *
 * Generated from research/neighbours.json. Only organisations whose
 * details could actually be verified are included.
 */

export type Institute = {
  id: string;
  name: string;
  short: string;
  founded: string;
  blurb: string;
  campus: string;
  url: string;
  iiscLink: string;
};

export type BengaliOrg = {
  id: string;
  name: string;
  founded: string;
  area: string;
  url: string;
  note: string;
};

export type Figure = {
  label: string;
  value: string;
  year: string;
  source: string;
};

export const INSTITUTES: Institute[] = [
  {
    id: "ncbs",
    name: "National Centre for Biological Sciences, Tata Institute of Fundamental Research",
    short: "NCBS",
    founded: "1991",
    blurb: "A campus where people chase fruit flies down corridors to find out how memory works, map the monsoon's effect on frog song, and keep a natural-history archive of India - biology at every scale from a single molecule to a whole ecosystem.",
    campus: "GKVK Campus, Bellary Road, Bengaluru 560065",
    url: "https://www.ncbs.res.in/",
    iiscLink: "Began life on the IISc campus. NCBS's own history records that the TIFR Council approved locating it temporarily in the TIFR Centre at IISc, in space vacated by the Radio Astronomy Group, before it moved to GKVK. An autonomous unit under the aegis of TIFR.",
  },
  {
    id: "jncasr",
    name: "Jawaharlal Nehru Centre for Advanced Scientific Research",
    short: "JNCASR",
    founded: "1989",
    blurb: "A small, deliberately un-departmental institute where a chemist, a geneticist and a fluid dynamicist share a corridor - set up in Nehru's birth-centenary year and built around the idea that the interesting science happens where the subjects collide.",
    campus: "Jakkur, Bengaluru 560064 - about 11 km from the IISc campus",
    url: "https://www.jncasr.ac.in/",
    iiscLink: "The closest personal link of any institute here. Founded in 1989 with Prof C N R Rao as its founding President - the same C N R Rao who was Director of IISc from August 1984 to July 1994. DST's own page notes the campus is about 11 km from IISc and that JNCASR maintains close institutional links with the Institute.",
  },
  {
    id: "icts",
    name: "International Centre for Theoretical Sciences, Tata Institute of Fundamental Research",
    short: "ICTS-TIFR",
    founded: "2007",
    blurb: "A hillside campus built for the specific purpose of putting string theorists, climate modellers, mathematicians and cell biologists in the same building for a month at a time, and seeing what comes out.",
    campus: "Survey No. 151, Shivakote, Hesaraghatta Hobli, Bengaluru 560089",
    url: "https://www.icts.res.in/",
    iiscLink: "Collaborative. ICTS's own prospectus names IISc first among the Bengaluru institutions it was sited to draw on, alongside JNCASR, RRI, IIA and ISI. Approved by the TIFR Council in August 2007; campus inaugurated 20 June 2015.",
  },
  {
    id: "rri",
    name: "Raman Research Institute",
    short: "RRI",
    founded: "1948",
    blurb: "The institute a Nobel laureate built for himself because he refused to stop working - today it points radio telescopes at the early universe, watches liquid crystals misbehave, and still keeps Raman's own collection of gemstones and iridescent beetles.",
    campus: "C. V. Raman Avenue, Sadashivanagar, Bengaluru 560080",
    url: "https://www.rri.res.in/",
    iiscLink: "Founded by Sir C V Raman, IISc's first Indian Director (April 1933 - July 1937) and head of its Physics department until 1948. RRI's own overview states he established the institute to continue his research after he retired from the Indian Institute of Science. Raman directed RRI until his death in November 1970; it became a DST-aided autonomous institute in 1972.",
  },
  {
    id: "iia",
    name: "Indian Institute of Astrophysics",
    short: "IIA",
    founded: "1971",
    blurb: "India's oldest scientific institution by descent - a lineage running from a colonial Madras observatory of 1786 to a telescope at 4,500 m in Ladakh that astronomers in Koramangala operate over the internet.",
    campus: "II Block, Koramangala, Bengaluru 560034",
    url: "https://www.iiap.res.in/",
    iiscLink: "No institutional link. Neighbourly and collaborative; named by ICTS among the city's core research institutions. Autonomous institute under DST. Traces its origin to an observatory set up at Madras in 1786; headquarters moved to Bengaluru in 1975.",
  },
  {
    id: "tifr-cam",
    name: "TIFR Centre for Applicable Mathematics",
    short: "TIFR-CAM",
    founded: "2007",
    blurb: "A small, intense mathematics centre for the kind of equations that describe real things - fluids, waves, control systems, the shape of an optimal solution.",
    campus: "P.B. No. 6503, Sharada Nagar, Chikkabommasandra, Yelahanka, Bengaluru 560065",
    url: "https://www.math.tifrbng.res.in/",
    iiscLink: "Direct and structural. TIFR-CAM is the descendant of the TIFR Centre founded inside the IISc campus in the 1970s; it moved out to Yelahanka in 2007 and took its present name. Founding of the parent TIFR Centre: 1970s; 2007 is the year of the move and renaming.",
  },
  {
    id: "blisc",
    name: "Bangalore Life Science Cluster",
    short: "BLiSC",
    founded: "",
    blurb: "Four institutes sharing one fence, one set of microscopes and one canteen: fundamental biology, stem-cell medicine, a start-up incubator and a genetics-for-society institute, all on the same north-Bengaluru field.",
    campus: "GKVK Campus, Bellary Road, Bengaluru 560065 - the NCBS site",
    url: "https://instem.res.in/blisc/",
    iiscLink: "Through NCBS's origins on the IISc campus. Members: NCBS (1991), inStem (2009), C-CAMP (2009) and TIGS (2017). No formation year for the cluster itself is published on its own pages.",
  },
  {
    id: "instem",
    name: "Institute for Stem Cell Science and Regenerative Medicine",
    short: "inStem",
    founded: "2009",
    blurb: "An institute trying to persuade cells to rebuild what disease took away - heart, nerve, skin - and to grow human disease in a dish so it can be argued with.",
    campus: "GKVK Campus, Bellary Road, Bengaluru 560065",
    url: "https://www.instem.res.in/",
    iiscLink: "None institutional. Autonomous institute under the Department of Biotechnology; member of the Bangalore Life Science Cluster next door to NCBS.",
  },
  {
    id: "ccamp",
    name: "Centre for Cellular and Molecular Platforms",
    short: "C-CAMP",
    founded: "2009",
    blurb: "The place where a life-science idea goes to become a company - shared million-rupee instruments, and one of India's busiest biotech incubators.",
    campus: "GKVK Campus, Bellary Road, Bengaluru 560065",
    url: "https://www.ccamp.res.in/",
    iiscLink: "None institutional. Conceptualised by the Department of Biotechnology in 2009; member of the Bangalore Life Science Cluster.",
  },
  {
    id: "tigs",
    name: "Tata Institute for Genetics and Society",
    short: "TIGS",
    founded: "2017",
    blurb: "Genetics pointed squarely at Indian problems - malaria-carrying mosquitoes, rare inherited disease, and crops that have to survive an Indian summer.",
    campus: "NCBS/inStem campus, GKVK, Bellary Road, Bengaluru 560065",
    url: "https://tigs.res.in/",
    iiscLink: "None institutional. Founded by Tata Trusts in partnership with UC San Diego and inStem; member of the Bangalore Life Science Cluster.",
  },
  {
    id: "ursc",
    name: "U R Rao Satellite Centre, ISRO",
    short: "URSC",
    founded: "1972",
    blurb: "The building where India's satellites are actually screwed together - more than a hundred of them so far, for communications, navigation, weather, Earth observation and trips to the Moon and Mars.",
    campus: "Old Airport Road, Vimanapura Post, Bengaluru 560017",
    url: "https://www.ursc.gov.in/",
    iiscLink: "No institutional link, but the shared history is worth knowing: Prof Satish Dhawan was Director of IISc from January 1963 to July 1981 and simultaneously Chairman of ISRO for much of that period. Founded 1972 as the Indian Scientific Satellite Project, later the ISRO Satellite Centre, renamed U R Rao Satellite Centre with effect from 2 April 2018. ISRO's headquarters is also in Bengaluru, at Antariksh Bhavan, New BEL Road 560094.",
  },
  {
    id: "csir-nal",
    name: "CSIR-National Aerospace Laboratories",
    short: "CSIR-NAL",
    founded: "1959",
    blurb: "India's only civilian aerospace laboratory - home of the Saras and Hansa aircraft, and of wind tunnels big enough to walk into, where everything from a fighter's wing to a bridge deck gets put in front of a very large fan.",
    campus: "HAL Airport Road, Kodihalli, Bengaluru 560017; second campus at Belur",
    url: "https://nal.res.in/",
    iiscLink: "None institutional. A constituent laboratory of CSIR, working alongside HAL, DRDO and ISRO. Note: www.nal.res.in did not resolve on test - use the bare domain.",
  },
  {
    id: "iiitb",
    name: "International Institute of Information Technology Bangalore",
    short: "IIIT-B",
    founded: "1998",
    blurb: "A graduate school planted deliberately in the middle of Electronic City, close enough to the software industry that the faculty and the customers share a traffic jam.",
    campus: "26/C, Electronics City Phase 1, Hosur Road, Bengaluru 560100",
    url: "https://www.iiitb.ac.in/",
    iiscLink: "None. Established 18 September 1998; Deemed University since February 2005; moved to the Electronic City campus in August 2003.",
  },
  {
    id: "isi-bangalore",
    name: "Indian Statistical Institute, Bangalore Centre",
    short: "ISI Bangalore",
    founded: "1978",
    blurb: "Thirty acres of eucalyptus on the Mysore Road where pure mathematicians and statisticians work on everything from operator algebras to how India counts itself.",
    campus: "8th Mile, Mysore Road, RVCE Post, Bengaluru 560059",
    url: "https://www.isibang.ac.in/",
    iiscLink: "None institutional; named by ICTS among the city's core research institutions. Conceived by P C Mahalanobis in the 1960s, land granted 1966, activities began September 1978, moved to the present campus May 1985, formally declared a Centre of ISI in September 1996.",
  },
];

export const BENGALI_ORGS: BengaliOrg[] = [
  {
    id: "bengalee-association",
    name: "The Bengalee Association, Bangalore",
    founded: "Puja from 1950; association registered 16 September 1959",
    area: "Tagore Cultural Centre, 1/A Assaye Road, Sivanchetti Gardens, Ulsoor, Bengaluru 560042",
    url: "https://thebengaleeassociation.com/",
    note: "The city's oldest Bengali association, and the one that matters most to us: its first Sarbajanin Durga Puja in 1950 was, in its own words, 'held under the initiatives and tutelage of a few Professors of the Indian Institute of Science, Bangalore'. One of the very few with a permanent cultural centre rather than an annual pandal - land allotted April 1977, building inaugurated 4 April 1980. Use 1950 for the Puja and 1959 for the association; do NOT print the '70th year' figure circulating on listicles, which contradicts the association's own #75years in 2025.",
  },
  {
    id: "jayamahal-cultural-association",
    name: "Jayamahal Cultural Association (JCA)",
    founded: "1955",
    area: "Ladies Club premises, Jayamahal Extension, next to Jayamahal Park, Bengaluru 560046",
    url: "https://jayamahal.org/",
    note: "The city's second-oldest Puja - the first was held in a vacant building in Mysore Lancer Lines in 1955, and 2026 is its 72nd year. Claims to have introduced the theme-puja concept to Bengaluru in 2014; runs 'Muktangan' for emerging artists.",
  },
  {
    id: "nbcs-bangalore-kali-bari",
    name: "North Bangalore Cultural Samithi (NBCS) / Bangalore Kali Bari",
    founded: "1978",
    area: "Kali Bari temple at Nandini Layout, Bengaluru 560096; 2025 Durga Puja pandal at Nagavara",
    url: "https://www.facebook.com/bangalore.kalibari",
    note: "The third-oldest Puja in the city, after Ulsoor (1950) and Jayamahal (1955). One of very few Bengali bodies in Bengaluru with a permanent Kali temple rather than only an annual pandal. Deccan Herald (25 Sept 2025) reported its 48th Durga Puja at Nagavara, which matches a 1978 founding. The relationship between the Nandini Layout temple and the Nagavara pandal is unresolved - check before printing an address. Aggregator lists that place the Kali Bari in Rajajinagar appear to be wrong.",
  },
  {
    id: "socio-cultural-association-indiranagar",
    name: "Socio Cultural Association, Indiranagar (SCA)",
    founded: "Conflicting: c. 1967 (its own 2025 '58 years' claim) or c. 1970 (Citykemp 2015, '45 years old')",
    area: "Sishu Griha and Poorna Prajna School Grounds, HAL III Stage / New Thippasandra, Indiranagar",
    url: "https://www.facebook.com/SCAIndiranagar/",
    note: "Indiranagar's long-running Puja, started by Bengali residents of Indiranagar, Domlur and Ulsoor on the initiative of the late Dilu Sen, then a manager at Tata Steel. Also runs Lakshmi, Kali and Saraswati Puja and Poila Boishakh. The domain scaindiranagar.com no longer resolves - do not publish it. Organisation verified active; founding year NOT resolved.",
  },
  {
    id: "sarathi-koramangala",
    name: "Sarathi Socio-Cultural Trust, Koramangala",
    founded: "First Puja 2003; formally registered 2006",
    area: "Mangala Kalyana Mantapa, 80 ft Road near Forum Mall, KHB 7th Block, Koramangala",
    url: "https://sarathionline.org/",
    note: "The city's largest-footfall Puja, claiming 1.5-2 lakh visitors; its five-day cultural festival is branded 'Sammad'. Won the Senco Sharod Samman 2018 for ambience and crowd management. Caution: a separate 'Sarathi Cultural Association' with a different Koramangala venue also exists - do not merge the two.",
  },
  {
    id: "kolaj-koramangala",
    name: "Kolaj Socio-Cultural Trust, Koramangala",
    founded: "2010",
    area: "Sri Krishna Temple, near Jyothi Nivas College, Koramangala, Bengaluru 560034",
    url: "https://www.instagram.com/kolaj_socioculturaltrust/",
    note: "Deliberately 'ghoroa' - homely and intimate rather than mega-scale. Strongly concept-driven idols, e.g. Durga as ascetic Brahmacharini rather than warrior. Free entry, no parking. No standalone website.",
  },
  {
    id: "whitefield-cultural-association",
    name: "Whitefield Cultural Association (WCA)",
    founded: "2003",
    area: "Whitefield; 2025 venue Palm Meadows, near Mahaveer Tranquil",
    url: "https://whitefielddurgapuja.com/",
    note: "Runs the trademarked 'Whitefield Durga Puja'. Registered under the Government of Karnataka, with an explicit CSR arm in education, healthcare and environment. The family-oriented East Bengaluru Puja.",
  },
  {
    id: "sorrba-sarjapur",
    name: "SORRBA - Sarjapur Outer Ring Road Bengali Association",
    founded: "2008 (news-sourced, not primary)",
    area: "Sarjapur Road; 2025 venue Samskruti Pavilion Convention Centre, Sulikunte",
    url: "https://www.sorrba.org/",
    note: "Formed by Bengali families living around the junction of Sarjapur Road and the Outer Ring Road. Heavy on Bengali theatre productions and Kolkata street-food stalls alongside the Puja. The 2008 date is from a 2015 Citykemp feature; SORRBA's own site does not state a year.",
  },
  {
    id: "barsha-hsr",
    name: "BARSHA - Bengali Association for HSR and Sarjapur, Bangalore",
    founded: "December 2014",
    area: "BARSHA Durga Puja Ground, opposite TCIS School, HSR Extension / Haralur, off Sarjapur Road",
    url: "https://www.barshabangalore.org/",
    note: "Its own about page says 'We started our journey in December, 2014', corroborated by Karnataka society registration number JNR-S344-2014-15. Aggregators variously claim 2016 and 2019 - both appear wrong. Grew from 20 to 125 members; runs Rabindra-Nazrul Jayanti at The HSR Club; CSR work with Samarthanam Trust.",
  },
  {
    id: "ecca-electronic-city",
    name: "ECCA - Electronic City Cultural Association",
    founded: "2012",
    area: "White Feather Convention Centre, near NICE Toll Gate, Electronic City",
    url: "https://www.facebook.com/eccablr/",
    note: "The IT-corridor Puja, run largely by tech-professional volunteers; a registered charitable organisation formed in 2012, with its first Sarvajanin Durgotsav the same year. Large award haul. No official website - a page at sumandeyashi.github.io is a personal build, not ECCA's site.",
  },
  {
    id: "sanskritik-jp-nagar",
    name: "Sanskritik Bengali Association Bangalore",
    founded: "c. 2013-2014 (approximate; site says 'Celebrating 11 Glorious Years' but gives no year)",
    area: "Elite Banquet Hall, Puttenahalli Road, JP Nagar Phase 6, Bengaluru 560078",
    url: "https://sanskritik.org/",
    note: "This is the real organisation behind what people call 'Sanskriti Bangalore' - no body of that exact name exists. A non-profit trust started by South Bangalore families; won Sharod Samman Best Theme Puja 2018 and Best Venue Branding 2018. Founding year approximate.",
  },
  {
    id: "anandadhara",
    name: "Anandadhara Bangalore",
    founded: "Conflicting: founded 2011 (Citykemp 2015) or registered 2012 (other sources)",
    area: "JP Nagar, South Bengaluru",
    url: "https://www.facebook.com/anandadhara/",
    note: "Explicitly themed around rural Bengal rather than urban spectacle. No official website found. Organisation verified; YEAR CONFLICTING - most likely founded 2011 and registered 2012, but not confirmed from a primary source.",
  },
  {
    id: "rt-nagar-bengali",
    name: "R T Nagar Bengali Socio Cultural Trust (R T Nagar Sarbajanin Durga Puja Samiti)",
    founded: "2006",
    area: "Puja at Palace Grounds, Gate 9 (Princess Green), Bellary Road; registered at No. 17, 10th Cross, Manorayanapalya, Sultanpalya Main Road, R T Nagar PO, Bengaluru 560032",
    url: "https://rtnagardurgapuja.org/",
    note: "The Palace Grounds Puja. One of the few that runs Jagadhatri Puja as well as Saraswati, Durga, Kali and Lakshmi. Blood-donation camps, hosts around 50 NGO children, wheelchair access for seniors, and its own mobile app. 'R T Nagar Bengali Association' and the Samiti are the same body, not three organisations.",
  },
  {
    id: "oikotan-hebbal",
    name: "Oikotan Hebbal Cultural Society",
    founded: "2013",
    area: "Hebbal, North Bengaluru",
    url: "https://www.facebook.com/OikotanHebbal/",
    note: "Runs all four Pujas - Durga, Kali, Lakshmi and Saraswati. Repeat winner of best-theme awards; named by Deccan Herald among 2025's notable pandals. The domain oikotan.in only redirects to Facebook, so the Facebook page is the real address.",
  },
  {
    id: "kba-kaggadasapura",
    name: "Kaggadasapura Bengali Association (KBA)",
    founded: "15 August 2007",
    area: "V K Sports Convention Hall, Malleshpalya; serves Kaggadasapura and C V Raman Nagar",
    url: "https://kbaonline.in/",
    note: "Claims 6,500+ members. Its Puja is branded 'Sharad Utsav'. Notable for us because its catchment, C V Raman Nagar, is named after the same physicist who founded RRI and directed IISc.",
  },
  {
    id: "binb",
    name: "Bengali in Bangalore (BinB)",
    founded: "2004",
    area: "Durgotsav at Chandrodaya Convention Centre, Dairy Circle; registered office at WorkFlo, Ranka Junction, Dooravani Nagar, Bengaluru 560016",
    url: "https://www.bengaliinbangalore.org/",
    note: "Started as an online Bengali community and is unusually broad: BinB Sports (badminton, table tennis, a football league, gully cricket), BinB JobMart, and Kannada Rajyotsava alongside the Bengali calendar. Deccan Herald covered its 15th Durgotsav, honouring Tagore. The 2004 date is on its membership page, not its homepage.",
  },
  {
    id: "jbca-kr-puram",
    name: "Jagriti Bongiyo Cultural Association (JBCA)",
    founded: "2014",
    area: "ITI Hockey Ground, beside K R Puram Hanging Bridge",
    url: "https://www.facebook.com/p/Jagriti-Bangiyo-Cultural-Association-100066752209251/",
    note: "Formed by Bengali families around RM Nagar and TC Palya; society registration DRO/SJN/SOR/119/14-15. Social and environmental themes. The spelling varies across its own channels - Bangiya, Bangiyo, Bongiyo. jbca.co.in is a GoDaddy placeholder, not a working site.",
  },
  {
    id: "bbsct-begur",
    name: "Begur Bengali Socio-Cultural Trust (BBSCT)",
    founded: "2023",
    area: "Begur, South-East Bengaluru",
    url: "https://begurbengali.in/",
    note: "One of the newest, and unusually transparent about its legal status - Trust Registration BGR-4-00003-2023-2, Darpan KA/2023/0346089, 12AA and 80G effective FY 2023-24, so donations are tax-exempt. Pairs the Puja with education, healthcare and environment work.",
  },
  {
    id: "vca-yelahanka",
    name: "Vivekananda Cultural Association (VCA), Yelahanka",
    founded: "Founded April 2002 by a 42-member team; registered 2004",
    area: "Yelahanka New Town, Bengaluru",
    url: "https://vca.org.in/",
    note: "The Yelahanka-area Bengali association, running a year-round Bengali festival calendar for the New Town diaspora. Both years come from the indexed text of its own site, corroborated by a 2013 Bengaluru Puja blog.",
  },
  {
    id: "smarannik",
    name: "SmaranniK (Bengali theatre group)",
    founded: "2012",
    area: "Performs at Ranga Shankara, JP Nagar",
    url: "https://www.facebook.com/p/SmaranniK-Theatre-Festival-Bangalore-100069937250329/",
    note: "The only Bengali theatre group regularly performing at Ranga Shankara, and it runs its own annual SmaranniK Theatre Festival. Director Sayandeb Bhattacharya; has travelled to 15 festivals. The strongest candidate if the Puja wants a Bengali stage production.",
  },
];

/** Published figures a sponsor would ask for, each with its source. */
export const IISC_FIGURES: Figure[] = [
  {
    label: "NIRF ranking, University category",
    value: "Rank 1 in India",
    year: "NIRF 2026 (released September 2026)",
    source: "https://ddnews.gov.in/en/iit-madras-tops-nirf-rankings-for-7th-year-in-a-row-iisc-bengaluru-named-best-university/",
  },
  {
    label: "NIRF ranking, Overall category",
    value: "Rank 2 in India, after IIT Madras",
    year: "NIRF 2026",
    source: "https://www.tribuneindia.com/news/india/iit-madras-tops-nirf-rankings-for-7th-time-iisc-bengaluru-second/",
  },
  {
    label: "THE World University Rankings",
    value: "Joint 201-250 band; India's highest-placed institution",
    year: "THE WUR 2026",
    source: "https://www.timeshighereducation.com/world-university-rankings/indian-institute-science",
  },
  {
    label: "QS World University Rankings",
    value: "219th, overall score 54.2",
    year: "QS WUR 2026",
    source: "Secondary reporting only - QS's own page returned HTTP 403 and could not be read; a conflicting '=221 in QS 2027' claim was also seen. Re-check at https://www.topuniversities.com/universities/indian-institute-science-iisc-bangalore before publishing.",
  },
  {
    label: "Institution of Eminence",
    value: "Formally notified as an Institution of Eminence (IoE) Deemed to be University on 11 October 2018; MoU signed with the then MHRD (now Ministry of Education) in October 2018",
    year: "2018",
    source: "https://www.iisc.ac.in/events/iisc-formally-notified-as-institution-of-eminence-ioe-deemed-to-be-university/",
  },
  {
    label: "Institution of Eminence support",
    value: "An additional Rs 1,000 crore over 5 years, over and above the annual MHRD grant",
    year: "2018",
    source: "https://www.iisc.ac.in/events/iisc-formally-notified-as-institution-of-eminence-ioe-deemed-to-be-university/",
  },
  {
    label: "Students on roll",
    value: "5,621",
    year: "2024-25",
    source: "IISc Annual Report 2024-25, https://www.iisc.ac.in/wp-content/uploads/2026/02/Annual-Report-2024-25.pdf",
  },
  {
    label: "Doctoral students",
    value: "2,710 full-time and 148 part-time PhD students (including Integrated PhD)",
    year: "up to 2024-25",
    source: "IISc data submitted to NIRF 2026, https://www.iisc.ac.in/wp-content/uploads/2026/04/Indian-Institute-of-Science20260406-Overall.pdf",
  },
  {
    label: "Degrees conferred",
    value: "1,788",
    year: "2024-25",
    source: "IISc Annual Report 2024-25",
  },
  {
    label: "Departments",
    value: "43 departments (Biological Sciences 8, Chemical Sciences 4, EECS 4, Mechanical Sciences 10, Medical Sciences 2, Physical and Mathematical Sciences 5, Interdisciplinary Sciences 10)",
    year: "2024-25",
    source: "IISc Annual Report 2024-25",
  },
  {
    label: "Academic divisions",
    value: "7",
    year: "2024-25",
    source: "IISc Annual Report 2024-25",
  },
  {
    label: "Faculty",
    value: "482 full-time faculty listed in IISc's NIRF submission",
    year: "2024-25",
    source: "IISc data submitted to NIRF 2026",
  },
  {
    label: "Staff",
    value: "864 total - Academic, Scientific and Technical 541; Support 323",
    year: "2024-25",
    source: "IISc Annual Report 2024-25",
  },
  {
    label: "Research output",
    value: "3,873 publications - 2,878 journal papers, 834 conference proceedings, 12 books, 149 book chapters",
    year: "2024-25",
    source: "IISc Annual Report 2024-25",
  },
  {
    label: "Patents",
    value: "191 patents published, 176 patents granted",
    year: "calendar year 2024",
    source: "IISc data submitted to NIRF 2026, IPR table",
  },
  {
    label: "Sponsored research",
    value: "1,318 projects from 157 funding agencies; Rs 10,70,02,14,963 received (about Rs 1,070 crore)",
    year: "FY 2024-25",
    source: "IISc data submitted to NIRF 2026",
  },
  {
    label: "Consultancy",
    value: "490 projects for 319 client organisations; Rs 1,66,21,96,639 received (about Rs 166 crore)",
    year: "FY 2024-25",
    source: "IISc data submitted to NIRF 2026",
  },
  {
    label: "Founded",
    value: "27 May 1909 - 'IISc finally came into existence on 27 May 1909 in Bangalore following a vesting order and resolution passed by the government of India'",
    year: "1909",
    source: "https://www.iisc.ac.in/about/history/",
  },
];
