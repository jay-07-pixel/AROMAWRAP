import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { canSendEmail, sendPasswordResetOtpEmail } from "../lib/email.js";

const OTP_SALT_ROUNDS = 10;
const PASSWORD_SALT_ROUNDS = 12;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

/** Wrong guesses per active code, keyed by OTP record id. Cleared when the code is used or burned. */
const failedAttempts = new Map<string, number>();

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists for this email, you will receive a password reset code shortly.";

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function requestPasswordResetOtp(email: string): Promise<string> {
  if (!canSendEmail()) {
    throw new PasswordResetError("Password reset is temporarily unavailable. Please contact support.", 503);
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!user) {
    return GENERIC_FORGOT_PASSWORD_MESSAGE;
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.$transaction([
    prisma.passwordResetOtp.updateMany({
      where: {
        email: normalizedEmail,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.passwordResetOtp.create({
      data: {
        email: normalizedEmail,
        otpHash,
        expiresAt,
      },
    }),
  ]);

  await sendPasswordResetOtpEmail(normalizedEmail, otp);

  return GENERIC_FORGOT_PASSWORD_MESSAGE;
}

export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  password: string
): Promise<void> {
  const normalizedEmail = normalizeEmail(email);

  const record = await prisma.passwordResetOtp.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new PasswordResetError("Invalid or expired reset code");
  }

  const isValidOtp = await bcrypt.compare(otp, record.otpHash);
  if (!isValidOtp) {
    const attempts = (failedAttempts.get(record.id) ?? 0) + 1;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      failedAttempts.delete(record.id);
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });
      throw new PasswordResetError("Too many wrong codes. Please request a new reset code.");
    }
    failedAttempts.set(record.id, attempts);
    throw new PasswordResetError("Invalid or expired reset code");
  }
  failedAttempts.delete(record.id);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!user) {
    throw new PasswordResetError("Invalid or expired reset code");
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetOtp.updateMany({
      where: {
        email: normalizedEmail,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);
}

export class PasswordResetError extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "PasswordResetError";
  }
}
