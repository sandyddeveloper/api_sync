import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  return NextResponse.json({ status: "ready" });
}

export async function POST() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const approvalUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/vault/approve?token=nila-eternal-2026`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "🚨 [IvaruNila] Sanctuary Vault Access Requested",
    html: `
      <div style="font-family: serif; padding: 40px; background: #050000; color: #fff; border: 2px solid #7f1d1d; border-radius: 12px; max-width: 500px; margin: auto;">
        <h1 style="color: #ef4444; text-align: center; font-size: 24px; text-transform: uppercase; letter-spacing: 3px;">Sanctuary Access Request</h1>
        <p style="text-align: center; font-style: italic; color: #94a3b8; margin-bottom: 30px;">"Someone is knocking at the door of the Eternal Heart."</p>
        
        <div style="margin: 40px 0; text-align: center;">
          <a href="${approvalUrl}" style="background: #ef4444; color: #fff; padding: 18px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #ff0000; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);">
            Approve Access
          </a>
        </div>
        
        <p style="font-size: 11px; color: #444; text-align: center; margin-top: 40px;">If this wasn't you, ignore this message. The vault remains sealed.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Request sent" });
  } catch (error: any) {
    console.error("Mail error:", error);
    return NextResponse.json({ error: "Failed to send request", detail: error.message }, { status: 500 });
  }
}
