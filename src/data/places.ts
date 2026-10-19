import type { StaticImageData } from "next/image";
import amalfi from "../../public/images/places/amalfi-coast.jpg";
import bali from "../../public/images/places/bali.jpg";
import cappadocia from "../../public/images/places/cappadocia.jpg";
import kyoto from "../../public/images/places/kyoto.jpg";
import marrakech from "../../public/images/places/marrakech.jpg";
import patagonia from "../../public/images/places/patagonia.jpg";
import reykjavik from "../../public/images/places/reykjavik.jpg";
import santorini from "../../public/images/places/santorini.jpg";

export type Place = {
  slug: string;
  name: string;
  country: string;
  image: StaticImageData;
  /** CSS object-position: keeps the subject inside a narrow strip. */
  focus: string;
  alt: string;
  line: string;
  description: string;
  highlights: string[];
  bestTime: string;
  priceFrom: number;
  nights: number;
  credit: { name: string; username: string };
};

export const PLACES: Place[] = [
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    image: santorini,
    focus: "68% 50%",
    alt: "The white cliffside village of Oia, Santorini, glowing at dusk above the Aegean Sea",
    line: "Whitewashed cliffs and caldera sunsets above the Aegean.",
    description:
      "A cave suite carved into the caldera, a private catamaran to the hot springs, and dinners timed to the island's famous sunset. We keep you clear of the cruise crowds and close to the quiet villages.",
    highlights: ["Cave suite in Imerovigli", "Private caldera catamaran", "Assyrtiko tasting in Pyrgos", "Akrotiri at opening hour"],
    bestTime: "Apr–Jun",
    priceFrom: 2190,
    nights: 7,
    credit: { name: "James Ting", username: "jamesting" },
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    image: kyoto,
    focus: "62% 50%",
    alt: "Vermilion pagoda of Kiyomizu-dera temple rising above green trees in Kyoto",
    line: "Temple gardens at dawn, kaiseki by lantern light.",
    description:
      "Two nights in a family-run ryokan, a private morning at a Zen garden before the gates open, and a tea ceremony with a twelfth-generation host. Kyoto, at the pace it deserves.",
    highlights: ["Ryokan with private onsen", "Pre-opening temple garden", "Tea ceremony in Higashiyama", "Arashiyama by bicycle"],
    bestTime: "Mar–May",
    priceFrom: 3490,
    nights: 9,
    credit: { name: "zhenzhong liu", username: "lzzbest" },
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    image: marrakech,
    focus: "50% 55%",
    alt: "Carved cedar pavilion and tiled fountain in the courtyard of Dar Si Said, Marrakech",
    line: "Riads, rooftop mint tea and a night under desert stars.",
    description:
      "A restored riad in the medina, a guide who has walked the souks for thirty years, and a night in a canvas camp in the Agafay desert with the Atlas mountains on the horizon.",
    highlights: ["Restored riad in the medina", "Souk walk with a master guide", "Agafay desert camp", "Hammam ritual"],
    bestTime: "Mar–May",
    priceFrom: 1890,
    nights: 7,
    credit: { name: "Oussama Abouchatir", username: "paradigmvisuals" },
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    image: bali,
    focus: "40% 50%",
    alt: "Terraced green rice fields and palm trees at Tegallalang, north of Ubud, Bali",
    line: "Jungle villas in Ubud, reef days on the Bukit coast.",
    description:
      "Split between a pool villa above the Ayung river and a cliff-top retreat in Uluwatu. Sunrise at the rice terraces, a water-temple blessing, and nothing on the schedule after lunch.",
    highlights: ["Valley pool villa in Ubud", "Sunrise at Tegallalang", "Water-temple blessing", "Cliff-top Uluwatu retreat"],
    bestTime: "Apr–Oct",
    priceFrom: 2690,
    nights: 10,
    credit: { name: "Niklas Weiss", username: "treesoftheplanet" },
  },
  {
    slug: "patagonia",
    name: "Patagonia",
    country: "Chile",
    image: patagonia,
    focus: "50% 50%",
    alt: "Lenticular cloud glowing red over the snow-capped peaks of Torres del Paine at sunrise",
    line: "Granite towers, glacier lakes and wind that clears the head.",
    description:
      "An all-inclusive lodge inside Torres del Paine, guided hikes graded to your legs, and a boat across Grey Lake to the face of the glacier. Wild, but beautifully looked after.",
    highlights: ["Lodge inside the national park", "Base of the Towers hike", "Grey Glacier by boat", "Estancia lamb asado"],
    bestTime: "Nov–Mar",
    priceFrom: 4290,
    nights: 10,
    credit: { name: "Marc Thunis", username: "cyrus_smith" },
  },
  {
    slug: "reykjavik",
    name: "Reykjavík",
    country: "Iceland",
    image: reykjavik,
    focus: "50% 50%",
    alt: "Grótta lighthouse in Reykjavík under green northern lights",
    line: "Lava fields, hot springs and the aurora overhead.",
    description:
      "A design hotel in the capital, then a glass-roofed lodge in the south for aurora watching from bed. Black-sand beaches, ice caves with a glaciologist, and geothermal pools without the queue.",
    highlights: ["Glass-roofed aurora lodge", "Ice cave with a glaciologist", "Private geothermal lagoon", "South coast by super-jeep"],
    bestTime: "Sep–Mar",
    priceFrom: 2490,
    nights: 6,
    credit: { name: "Kari Bjorn Photography", username: "karibjorn" },
  },
  {
    slug: "amalfi-coast",
    name: "Amalfi Coast",
    country: "Italy",
    image: amalfi,
    focus: "72% 50%",
    alt: "Pastel houses of Positano stacked above a beach and boats on the Amalfi Coast",
    line: "Lemon groves, cliff roads and long lunches by the sea.",
    description:
      "A terrace room above Positano, a wooden gozzo to hidden coves, and a cooking class in a lemon grove in Ravello. We handle the drivers so you never touch that coast road.",
    highlights: ["Terrace suite in Positano", "Private gozzo to Capri", "Lemon-grove cooking class", "Ravello garden concert"],
    bestTime: "May–Jun",
    priceFrom: 2890,
    nights: 7,
    credit: { name: "Letizia Agosta", username: "adnonda" },
  },
  {
    slug: "cappadocia",
    name: "Cappadocia",
    country: "Türkiye",
    image: cappadocia,
    focus: "50% 40%",
    alt: "Hot-air balloons drifting over the rock valleys of Göreme, Cappadocia, at sunrise",
    line: "Sunrise balloons over fairy chimneys and cave hotels.",
    description:
      "A cave hotel in Uçhisar, a dawn balloon flight over the valleys, and a walk through underground cities with an archaeologist. Evenings belong to Anatolian wine and very slow dinners.",
    highlights: ["Cave suite in Uçhisar", "Sunrise balloon flight", "Underground city with an archaeologist", "Vineyard dinner"],
    bestTime: "Apr–Jun",
    priceFrom: 1990,
    nights: 6,
    credit: { name: "Alex Azabache", username: "alexazabache" },
  },
];
