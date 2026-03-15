import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Lazy init to avoid build-time env errors
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, html } = await request.json();

    // Validate input
    if (!to || !isValidEmail(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!subject || !body) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    const resend = getResend();

    if (!resend) {
      console.warn("RESEND_API_KEY not configured, email sending skipped");
      return NextResponse.json(
        {
          success: true,
          fallback: true,
          message: "Email service not configured. Please copy the content manually.",
        },
        { status: 200 }
      );
    }

    // Send from aqala.org domain (verify domain in Resend dashboard first)
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Aqala <noreply@aqala.org>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      text: body,
      ...(html && { html }),
    });

    if (error) {
      console.error("Resend API error:", error);
      let errorMessage = error.message || "Failed to send email";
      if (
        typeof errorMessage === "string" &&
        errorMessage.toLowerCase().includes("you can only send testing emails")
      ) {
        errorMessage =
          "To send to other addresses, verify aqala.org at resend.com. For now, use your own email address.";
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Email send error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

