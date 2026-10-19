import raw from "./trips.json";
import { PLACES, type Place } from "./places";
import { STORY_IMAGES } from "./story";

export const TRAVEL_STYLES = ["Beach", "Culture", "Adventure", "Wellness"] as const;
export type TravelStyle = (typeof TRAVEL_STYLES)[number];

export type ItineraryStop = { day: string; title: string; text: string };

export type Trip = {
  id: string;
  title: string;
  place: string;
  styles: TravelStyle[];
  nights: number;
  price: number;
  summary: string;
  itinerary: ItineraryStop[];
  included: string[];
  notIncluded: string[];
};

/** Every Meridian journey includes these; trip-specific items are listed first. */
const ALWAYS_INCLUDED = ["Private airport transfers", "Daily breakfast", "A named travel designer and 24/7 support"];
const NEVER_INCLUDED = ["International flights", "Travel insurance"];

export const TRIPS: Trip[] = (raw as Trip[]).map((t) => ({
  ...t,
  included: [...t.included, ...ALWAYS_INCLUDED],
  notIncluded: [...NEVER_INCLUDED, ...t.notIncluded],
}));

export const getTrip = (id: string) => TRIPS.find((t) => t.id === id);

export const placeOf = (trip: Trip): Place => {
  const place = PLACES.find((p) => p.slug === trip.place);
  if (!place) throw new Error(`Unknown place "${trip.place}" for trip ${trip.id}`);
  return place;
};

/** The entry-level journey for a place — the one its "from" price refers to. */
export const flagshipTrip = (placeSlug: string) =>
  TRIPS.filter((t) => t.place === placeSlug).sort((a, b) => a.price - b.price)[0];

/** Photo for a trip: the place's photo, or its alternate story photo for a second trip to the same place. */
export const tripImage = (trip: Trip) => {
  const place = placeOf(trip);
  const alt = STORY_IMAGES[trip.place];
  if (alt && flagshipTrip(trip.place).id !== trip.id) return { image: alt.image, alt: alt.alt, focus: alt.focus };
  return { image: place.image, alt: place.alt, focus: place.focus };
};

export const PRICE_MIN = Math.floor(Math.min(...TRIPS.map((t) => t.price)) / 500) * 500;
export const PRICE_MAX = Math.ceil(Math.max(...TRIPS.map((t) => t.price)) / 500) * 500;
