import { NextResponse } from "next/server";
import * as postmark from "postmark";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json();
    const { to, subject, message, username, password } = body;

    // Basic authentication
    const expectedUsername = process.env.NEXT_PUBLIC_MAIL_USERNAME;
    const expectedPassword = process.env.NEXT_PUBLIC_MAIL_PASSWORD;

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { message: "To, subject, and message are required" },
        { status: 400 }
      );
    }

    // Create Postmark client
    const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

    // Send email using Postmark
    await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: message,
      MessageStream: "outbound"
    });

    return NextResponse.json({ 
      message: "Email sent successfully",
      success: true
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { 
        message: "Failed to send email. Please try again later.",
        error: error.message,
        success: false
      },
      { status: 500 }
    );
  }
} 