import type { StaticImageData } from "next/image";
import bali from "../../public/images/journeys/bali.jpg";
import kyoto from "../../public/images/journeys/kyoto.jpg";
import marrakech from "../../public/images/journeys/marrakech.jpg";
import patagonia from "../../public/images/journeys/patagonia.jpg";
import reykjavik from "../../public/images/journeys/reykjavik.jpg";
import santorini from "../../public/images/journeys/santorini.jpg";

/** Full-bleed photography for the destinations scroll story, keyed by destination slug. */
export const STORY_IMAGES: Record<
  string,
  { image: StaticImageData; alt: string; focus: string; credit: { name: string; username: string } }
> = {
  santorini: {
    image: santorini,
    alt: "A blue-domed church above the Aegean Sea in Fira, Santorini, with sailing boats below",
    focus: "70% 60%",
    credit: { name: "Albert Canite", username: "albert_canite" },
  },
  kyoto: {
    image: kyoto,
    alt: "A tunnel of vermilion torii gates at Fushimi Inari shrine, Kyoto",
    focus: "50% 45%",
    credit: { name: "Martijn Baudoin", username: "martijnbaudoin" },
  },
  marrakech: {
    image: marrakech,
    alt: "A camel caravan crossing orange Sahara dunes near Merzouga, Morocco",
    focus: "60% 50%",
    credit: { name: "Duane Storey", username: "duanestorey" },
  },
  bali: {
    image: bali,
    alt: "Pura Ulun Danu Bratan temple reflected in a misty mountain lake, Bali",
    focus: "35% 55%",
    credit: { name: "Guillaume Marques", username: "mrqs_g" },
  },
  patagonia: {
    image: patagonia,
    alt: "The granite spires of Mount Fitz Roy glowing pink at sunrise, Patagonia",
    focus: "55% 45%",
    credit: { name: "Andrew Svk", username: "andrew_svk" },
  },
  reykjavik: {
    image: reykjavik,
    alt: "Black-sand beach and basalt sea stacks at Reynisfjara near Vík, Iceland",
    focus: "45% 50%",
    credit: { name: "Owen Roth", username: "owenroth_v1" },
  },
};
