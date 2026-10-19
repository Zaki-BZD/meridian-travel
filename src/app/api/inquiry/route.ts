import { isoDate, toInquiryInput, validateInquiry } from "@/lib/inquiry";

/**
 * Receives trip inquiries. For this demo it validates and logs them (visible in the
 * terminal locally, and in Vercel → Project → Logs in production).
 * See README → "Connecting the inquiry form" to deliver them by email via Resend or Formspree.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const input = toInquiryInput(body);
  const { company: honeypot, ...inquiry } = input;

  // Honeypot filled in: almost certainly a bot. Pretend it worked, store nothing.
  if (honeypot) return Response.json({ ok: true });

  // Allow one day of slack for visitors in time zones ahead of the server.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const errors = validateInquiry(input, isoDate(yesterday));
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  console.log("[inquiry] new trip inquiry", { ...inquiry, receivedAt: new Date().toISOString() });

  // → Deliver it: e.g. `await resend.emails.send({ ... })` — see README.

  return Response.json({ ok: true });
}
