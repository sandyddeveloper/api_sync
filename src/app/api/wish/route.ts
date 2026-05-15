import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { kv } from "@vercel/kv";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wish, timestamp, name, recipient } = body;

    // 1. Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const targetEmail = recipient || process.env.EMAIL_USER;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: targetEmail,
      subject: `✨ [IvaruNila] New Wish Transmitted: ${name || 'A Soul'}`,
      html: `
        <div style="font-family: serif; padding: 40px; background: #030000; color: #fff; border: 1px solid #164e63; text-align: center; border-radius: 20px;">
          <div style="margin-bottom: 30px;">
            <span style="font-size: 40px;">✨</span>
          </div>
          <h1 style="color: #22d3ee; font-style: italic; font-weight: 300;">A Wish from the Ether</h1>
          <div style="margin: 40px 0; padding: 30px; background: rgba(34, 211, 238, 0.05); border-radius: 20px; border: 1px dashed rgba(34, 211, 238, 0.2);">
            <p style="font-size: 24px; line-height: 1.6; font-style: italic; color: #fff;">
              "${wish}"
            </p>
          </div>
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
            Transmitted at ${timestamp || new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 2. Save to Vercel KV (Redis List)
    await kv.lpush("wishes", { wish, name, timestamp });

    return NextResponse.json({ 
      success: true, 
      message: "Wish transmitted and stored in KV" 
    });
  } catch (error: any) {
    console.error("Wish transmission error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Transmission Failed" 
    }, { status: 500 });
  }
}
