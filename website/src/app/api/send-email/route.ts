import { NextRequest, NextResponse } from "next/server";

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();

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

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      // Fallback: Use mailto link approach (client-side will handle)
      // For now, return success as the modal will fallback to mailto
      console.warn("RESEND_API_KEY not configured, email sending skipped");
      
      // In production, you'd want to set up Resend or another email service
      // For now, we'll simulate success and let the client know to use mailto fallback
      return NextResponse.json(
        { 
          success: true, 
          fallback: true,
          message: "Email service not configured. Please copy the content manually." 
        },
        { status: 200 }
      );
    }

    // Send email via Resend
    // Use onboarding@resend.dev for testing, or your verified domain for production
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Aqala <onboarding@resend.dev>";
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to send email" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

