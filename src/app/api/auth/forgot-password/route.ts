import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 for security reasons, so users can't enumerate emails
      return NextResponse.json({ message: "If a user with that email exists, we've sent a link to reset your password." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>You're receiving this email because a password reset was requested for your account.</p>
        <p>Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 10px; font-size: 11px; color: #999;">
          &copy; ${new Date().getFullYear()} Tickets. All rights reserved.
        </div>
      </div>
    `;

    const previewUrl = await sendEmail(user.email, "Password Reset Request", htmlContent);

    return NextResponse.json({ 
      message: "If a user with that email exists, we've sent a link to reset your password.",
      previewUrl // Return previewUrl for local testing if needed
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "An error occurred while processing your request" }, { status: 500 });
  }
}
