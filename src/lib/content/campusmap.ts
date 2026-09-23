/**
 * The pandal, on the Institute's own map.
 *
 * Every coordinate below is a fraction of the campus map image, read
 * off the numbered markers on the map itself rather than guessed from
 * a satellite view. The marker numbers and grid references are the
 * ones printed in the map's own index, so anyone holding a paper copy
 * can follow along.
 *
 * Routes follow the roads as drawn on that map. They are traced by
 * hand and are accurate to roughly the width of a road, which is the
 * right precision for a walk you can also do by following the sound.
 *
 * Scale, from the map's own bar: 500 m spans 0.3167 of the image
 * width. That is what turns a traced path into metres.
 */

export type Point = [number, number];

export type MapGate = {
  id: string;
  /** The number printed on the map. */
  marker: number;
  name: string;
  bangla: string;
  /** Grid square from the map's own index. */
  grid: string;
  at: Point;
  /** Traced along the roads, ending at the venue. */
  route: Point[];
  note: string;
  /** What a driver should be told. */
  origin: string;
};

/** The image the overlay is drawn on. */
export const CAMPUS_MAP = {
  src: "/media/map/iisc-campus-map.jpg",
  pdf: "/media/map/iisc-campus-map.pdf",
  width: 1600,
  height: 2262,
  credit:
    "Map composed by Gubbi Labs. Map data © Gubbi Labs and OpenStreetMap contributors.",
} as const;

/** 500 metres, as a fraction of the image width, from the scale bar. */
const METRES_PER_X = 500 / 0.3167;

export const VENUE_POINT: Point = [0.4444, 0.6407];
export const VENUE_MARKER = 126;

/** The bank the venue is described against, so the two can be seen together. */
export const LANDMARKS = [
  {
    marker: 139,
    name: "State Bank of India",
    bangla: "স্টেট ব্যাঙ্ক",
    at: [0.3911, 0.6289] as Point,
    note: "The pandal is directly opposite this branch.",
  },
  {
    marker: 125,
    name: "Students' Council",
    bangla: "ছাত্র সংসদ",
    at: [0.4489, 0.6116] as Point,
    note: "Straight up from the ground.",
  },
];

export const MAP_GATES: MapGate[] = [
  {
    id: "main-gate",
    marker: 175,
    name: "Main Gate",
    bangla: "প্রধান ফটক",
    grid: "G3",
    at: [0.5022, 0.8074],
    route: [
      [0.5022, 0.8074],
      [0.4778, 0.7704],
      [0.4556, 0.7390],
      [0.4444, 0.7075],
      [0.4422, 0.6761],
      VENUE_POINT,
    ],
    note: "The gate every auto and cab driver knows, off C. V. Raman Road at Prof. C. N. R. Rao Circle. Walk straight in, keep going north past the main building road, and the ground is on your left once you reach the bank.",
    origin: "IISc Main Gate, Bengaluru",
  },
  {
    id: "gymkhana-gate",
    marker: 172,
    name: "Gymkhana Gate",
    bangla: "জিমখানা গেট",
    grid: "G2",
    at: [0.2911, 0.7453],
    route: [
      [0.2911, 0.7453],
      [0.3556, 0.7351],
      [0.4000, 0.7273],
      [0.4278, 0.7075],
      [0.4389, 0.6761],
      VENUE_POINT,
    ],
    note: "On C. V. Raman Road at the western end, beside the Gymkhana. A short walk in, and the natural gate if you are coming from Malleswaram by bus.",
    origin: "IISc Gymkhana Gate, Bengaluru",
  },
  {
    id: "d-gate",
    marker: 171,
    name: "D Gate",
    bangla: "ডি গেট",
    grid: "C2",
    at: [0.3067, 0.3616],
    route: [
      [0.3067, 0.3616],
      [0.3667, 0.3695],
      [0.4111, 0.3774],
      [0.4333, 0.4088],
      [0.4444, 0.4560],
      [0.4500, 0.5031],
      [0.4444, 0.5503],
      [0.4356, 0.5975],
      VENUE_POINT,
    ],
    note: "The quiet pedestrian gate on M. S. Ramaiah Road. A long straight walk south through the middle of the campus, and the pleasantest of them under the rain trees.",
    origin: "D Gate, Indian Institute of Science, Bengaluru",
  },
  {
    id: "new-bel-road-gate",
    marker: 179,
    name: "New BEL Road Gate",
    bangla: "নিউ বেল রোড গেট",
    grid: "B5",
    at: [0.8422, 0.2123],
    route: [
      [0.8422, 0.2123],
      [0.7778, 0.2264],
      [0.6889, 0.2358],
      [0.6222, 0.2712],
      [0.5889, 0.3302],
      [0.5611, 0.3695],
      [0.5333, 0.4245],
      [0.5111, 0.4796],
      [0.4944, 0.5346],
      [0.4722, 0.5896],
      VENUE_POINT,
    ],
    note: "By Ramaiah College on New BEL Road, the corner nearest Sadashivanagar and RMV. A long walk once you are through, so take an auto to the bank if it is raining.",
    origin: "IISc New BEL Road Gate, Bengaluru",
  },
  {
    id: "mattikere-gate",
    marker: 177,
    name: "Mattikere Road Gate",
    bangla: "মত্তিকেরে রোড গেট",
    grid: "F2",
    at: [0.2256, 0.6171],
    note: "On the Yeshwantpur side, closest to the new hostel blocks. Straight east along the road past the hostels and you are there.",
    route: [
      [0.2256, 0.6171],
      [0.2778, 0.6250],
      [0.3333, 0.6289],
      [0.3889, 0.6329],
      VENUE_POINT,
    ],
    origin: "IISc Mattikere Road Gate, Bengaluru",
  },
  {
    id: "kv-gate",
    marker: 174,
    name: "KV Gate",
    bangla: "কেন্দ্রীয় বিদ্যালয় গেট",
    grid: "F2",
    at: [0.2, 0.6132],
    route: [
      [0.2000, 0.6132],
      [0.2278, 0.6195],
      [0.2778, 0.6250],
      [0.3333, 0.6289],
      [0.3889, 0.6329],
      VENUE_POINT,
    ],
    note: "Beside Kendriya Vidyalaya. Useful if you are dropping children at the school and walking across afterwards.",
    origin: "Kendriya Vidyalaya IISc Gate, Bengaluru",
  },
  {
    id: "nias-gate",
    marker: 178,
    name: "NIAS Gate",
    bangla: "এনআইএএস গেট",
    grid: "A2",
    at: [0.34, 0.1179],
    route: [
      [0.3400, 0.1179],
      [0.3333, 0.1572],
      [0.3278, 0.2123],
      [0.3244, 0.2594],
      [0.3167, 0.3145],
      [0.3111, 0.3499],
      [0.3067, 0.3616],
      [0.3667, 0.3695],
      [0.4111, 0.3774],
      [0.4333, 0.4088],
      [0.4444, 0.4560],
      [0.4500, 0.5031],
      [0.4444, 0.5503],
      [0.4356, 0.5975],
      VENUE_POINT,
    ],
    note: "The northern gate by the National Institute of Advanced Studies. Rarely used by visitors and the longest walk on this map, but the prettiest way in.",
    origin: "NIAS Gate, Indian Institute of Science, Bengaluru",
  },
];

/** Metres along a traced route, using the map's own scale bar. */
export function routeMetres(route: Point[], aspect = CAMPUS_MAP.height / CAMPUS_MAP.width): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const dx = route[i][0] - route[i - 1][0];
    // Vertical fractions are of the height, so they have to be put
    // back on the same footing as horizontal ones before measuring.
    const dy = (route[i][1] - route[i - 1][1]) * aspect;
    total += Math.hypot(dx, dy);
  }
  return total * METRES_PER_X;
}

/** A comfortable walking pace, rounded up rather than down. */
export function walkMinutes(metres: number): number {
  return Math.max(2, Math.ceil(metres / 75));
}

export function mapsLink(origin: string, destination: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}
