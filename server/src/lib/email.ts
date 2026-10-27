import nodemailer from "nodemailer";
import { env } from "./env.js";

type Transporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.smtpHost || !env.smtpFrom) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth:
        env.smtpUser && env.smtpPass
          ? { user: env.smtpUser, pass: env.smtpPass }
          : undefined,
    });
  }

  return transporter;
}

/** Outside local development, reset codes may only go out by email. */
export function canSendEmail(): boolean {
  return getTransporter() !== null || env.isDevelopment;
}

export async function sendPasswordResetOtpEmail(
  to: string,
  otp: string
): Promise<void> {
  const subject = "AromaWrap password reset code";
  const text = [
    "You requested a password reset for your AromaWrap account.",
    "",
    `Your verification code is: ${otp}`,
    "",
    "This code expires in 10 minutes.",
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>You requested a password reset for your AromaWrap account.</p>
    <p><strong>Your verification code is: ${otp}</strong></p>
    <p>This code expires in 10 minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const mailer = getTransporter();

  if (!mailer) {
    if (!env.isDevelopment) {
      throw new Error("SMTP is not configured");
    }
    console.info(
      `[email] Local development only, SMTP not configured. Password reset code for ${to}: ${otp}`
    );
    return;
  }

  await mailer.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html,
  });
}
