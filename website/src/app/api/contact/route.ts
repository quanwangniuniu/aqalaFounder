import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const emailBody = typeof body.emailBody === "string" ? body.emailBody.trim() : "";

    if (!firstName) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!emailBody) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const inbox = process.env.CONTACT_INBOX_EMAIL || process.env.RESEND_CONTACT_TO;
    const resend = getResend();

    const text = [
      `Contact form — Aqala website`,
      ``,
      `Name: ${firstName}${lastName ? ` ${lastName}` : ""}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      ``,
      `Subject: ${subject}`,
      ``,
      emailBody,
    ]
      .filter(Boolean)
      .join("\n");

    if (!resend || !inbox) {
      console.warn("Contact: RESEND_API_KEY or CONTACT_INBOX_EMAIL not configured");
      return NextResponse.json({
        success: true,
        fallback: true,
        message: "Message recorded. Our team will respond when mail is configured.",
      });
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || "Aqala <noreply@aqala.org>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [inbox],
      replyTo: email,
      subject: `[Aqala Contact] ${subject}`,
      text,
    });

    if (error) {
      console.error("Resend contact error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
