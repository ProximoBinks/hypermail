import { NextResponse } from "next/server";
import * as postmark from "postmark";

export const runtime = "nodejs";

export async function POST(request) {
  console.log("📧 Email send request received");
  const startTime = Date.now();
  
  try {
    // Get the request body
    const body = await request.json();
    const { to, subject, message, username, password, senderName } = body;
    
    console.log(`📧 Processing email request to: ${to}`);
    console.log(`📧 Subject: ${subject.substring(0, 30)}${subject.length > 30 ? '...' : ''}`);
    
    // Basic authentication
    const expectedUsername = process.env.NEXT_PUBLIC_MAIL_USERNAME;
    const expectedPassword = process.env.NEXT_PUBLIC_MAIL_PASSWORD;

    if (username !== expectedUsername || password !== expectedPassword) {
      console.error("❌ Authentication failed");
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!to || !subject || !message) {
      console.error("❌ Missing required fields", { 
        hasTo: !!to, 
        hasSubject: !!subject, 
        hasMessage: !!message 
      });
      return NextResponse.json(
        { message: "To, subject, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error(`❌ Invalid email format: ${to}`);
      return NextResponse.json(
        { message: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Create Postmark client
    console.log("📧 Creating Postmark client");
    const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

    // Format the From field with sender name if provided
    const fromEmail = process.env.POSTMARK_FROM_EMAIL;
    const from = senderName ? `${senderName} <${fromEmail}>` : fromEmail;
    console.log(`📧 From: ${from}`);

    // Send email using Postmark
    console.log("📧 Sending email via Postmark...");
    const emailResponse = await client.sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: message,
      MessageStream: "outbound"
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Email sent successfully in ${processingTime}ms`);
    console.log(`✅ Postmark MessageID: ${emailResponse.MessageID}`);

    return NextResponse.json({ 
      message: "Email sent successfully",
      success: true,
      details: {
        messageId: emailResponse.MessageID,
        to: to,
        from: from,
        subject: subject,
        processingTimeMs: processingTime
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Email sending error (${processingTime}ms):`, error);
    
    // Determine if it's a Postmark API error
    let errorMessage = "Failed to send email. Please try again later.";
    let errorDetails = {};
    
    if (error.code && error.message) {
      console.error(`❌ Postmark API error: [${error.code}] ${error.message}`);
      errorMessage = `Email service error: ${error.message}`;
      errorDetails = {
        code: error.code,
        apiMessage: error.message
      };
    }
    
    return NextResponse.json(
      { 
        message: errorMessage,
        error: error.message,
        details: errorDetails,
        success: false,
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
} 