/**
 * Inquiry form contract, shared by the client form and the /api/inquiry route handler
 * so both sides validate with exactly the same rules and messages.
 */

export const DESTINATION_OPTIONS = [
  { value: "santorini", label: "Santorini, Greece" },
  { value: "kyoto", label: "Kyoto, Japan" },
  { value: "marrakech", label: "Marrakech, Morocco" },
  { value: "bali", label: "Bali, Indonesia" },
  { value: "patagonia", label: "Patagonia, Chile & Argentina" },
  { value: "reykjavik", label: "Reykjavík, Iceland" },
  { value: "amalfi-coast", label: "Amalfi Coast, Italy" },
  { value: "cappadocia", label: "Cappadocia, Türkiye" },
  { value: "undecided", label: "Not sure yet — inspire me" },
] as const;

export type InquiryInput = {
  name: string;
  email: string;
  destination: string;
  departure: string; // yyyy-mm-dd
  returnDate: string; // yyyy-mm-dd
  travelers: string;
  message: string;
  /** Honeypot: humans never see or fill this. */
  company: string;
};

export type InquiryField = Exclude<keyof InquiryInput, "company">;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const EMPTY_INQUIRY: InquiryInput = {
  name: "",
  email: "",
  destination: "",
  departure: "",
  returnDate: "",
  travelers: "2",
  message: "",
  company: "",
};

export const MESSAGE_MAX = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Local calendar date as yyyy-mm-dd. */
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * @param today yyyy-mm-dd. Omit it to skip the "in the future" check (e.g. while prerendering,
 *              where reading the clock isn't allowed).
 */
export function validateInquiry(v: InquiryInput, today?: string): InquiryErrors {
  const e: InquiryErrors = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = "Please tell us your name.";
  else if (name.length > 80) e.name = "That's a long name — please keep it under 80 characters.";

  if (!v.email.trim()) e.email = "We need your email to send your itinerary.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "That email doesn't look right — try name@example.com.";

  if (!DESTINATION_OPTIONS.some((o) => o.value === v.destination))
    e.destination = "Choose a destination — or “Not sure yet”.";

  if (!DATE_RE.test(v.departure)) e.departure = "Pick a departure date.";
  else if (today && v.departure < today) e.departure = "Your departure date needs to be in the future.";

  if (!DATE_RE.test(v.returnDate)) e.returnDate = "Pick a return date.";
  else if (DATE_RE.test(v.departure) && v.returnDate <= v.departure)
    e.returnDate = "Your return date needs to be after departure.";

  const travelers = Number(v.travelers);
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 12)
    e.travelers = "Between 1 and 12 travelers — for bigger groups, tell us in your message.";

  if (v.message.length > MESSAGE_MAX)
    e.message = `Please keep it under ${MESSAGE_MAX.toLocaleString("en-US")} characters (you're at ${v.message.length.toLocaleString("en-US")}).`;

  return e;
}

/** Coerces an unknown JSON body into the input shape (server side). */
export function toInquiryInput(body: unknown): InquiryInput {
  const src = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const str = (k: keyof InquiryInput) => (typeof src[k] === "string" || typeof src[k] === "number" ? String(src[k]) : "");
  return {
    name: str("name"),
    email: str("email"),
    destination: str("destination"),
    departure: str("departure"),
    returnDate: str("returnDate"),
    travelers: str("travelers"),
    message: str("message"),
    company: str("company"),
  };
}

export const isValidEmail = (email: string) => EMAIL_RE.test(email.trim());
