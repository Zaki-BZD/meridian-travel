export type Destination = {
  slug: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  tagline: string;
  priceFrom: number;
  nights: number;
};

/** Where every arc on the globe departs from. */
export const HOME = { name: "London", lat: 51.5072, lng: -0.1276 };

export const DESTINATIONS: Destination[] = [
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    lat: 36.3932,
    lng: 25.4615,
    tagline: "Whitewashed cliffs, caldera sunsets, wine from volcanic soil.",
    priceFrom: 2190,
    nights: 7,
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    lat: 35.0116,
    lng: 135.7681,
    tagline: "Temple gardens at dawn, kaiseki at dusk, ryokan in between.",
    priceFrom: 3490,
    nights: 9,
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    lat: 31.6295,
    lng: -7.9811,
    tagline: "Riads, rooftop mint tea and a night under Agafay stars.",
    priceFrom: 1890,
    nights: 7,
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    lat: -8.4095,
    lng: 115.1889,
    tagline: "Jungle villas in Ubud, reef days on the Bukit coast.",
    priceFrom: 2690,
    nights: 10,
  },
  {
    slug: "patagonia",
    name: "Patagonia",
    country: "Chile & Argentina",
    lat: -50.9423,
    lng: -73.4068,
    tagline: "Granite towers, glacier lakes and wind that clears the head.",
    priceFrom: 4290,
    nights: 10,
  },
  {
    slug: "reykjavik",
    name: "Reykjavík",
    country: "Iceland",
    lat: 64.1466,
    lng: -21.9426,
    tagline: "Lava fields, hot springs and the northern lights overhead.",
    priceFrom: 2490,
    nights: 6,
  },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
