import { isValidEmail } from "@/lib/inquiry";

/** Newsletter sign-ups. Logged for the demo — swap in Resend Audiences, Mailchimp, etc. (see README). */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }

  console.log("[newsletter] new subscriber", { email, receivedAt: new Date().toISOString() });
  return Response.json({ ok: true });
}
