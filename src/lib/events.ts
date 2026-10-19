/** Ask the destinations story to bring a destination card into view. Detail: destination slug. */
export const JOURNEY_EVENT = "meridian:journey";

export const goToJourney = (slug: string) => window.dispatchEvent(new CustomEvent(JOURNEY_EVENT, { detail: slug }));
