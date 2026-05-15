import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, subject, body, type } = await request.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Premium HTML Template
    const htmlTemplate = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #05070a; color: #f8fafc; padding: 40px; border-radius: 20px; max-width: 600px; margin: auto; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px;">Nila Dashboard</h1>
          <p style="color: #94a3b8; margin-top: 5px;">Secure Notification Service</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h2 style="margin-top: 0; color: #fff;">${subject}</h2>
          <p style="line-height: 1.6; color: #cbd5e1;">${body}</p>
          
          ${type === 'approval' ? `
            <div style="margin-top: 30px; text-align: center;">
              <a href="#" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Approve Action</a>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #64748b;">
          <p>This is an automated notification from Nila Admin System.</p>
          <p>&copy; 2024 Nila Dashboard. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Nila Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `Email successfully sent to ${to}`,
    });
  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
