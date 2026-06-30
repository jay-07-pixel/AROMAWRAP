import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { sendPasswordResetOtpEmail } from "../lib/email.js";

const OTP_SALT_ROUNDS = 10;
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists for this email, you will receive a password reset code shortly.";

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function requestPasswordResetOtp(email: string): Promise<string> {
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
    throw new PasswordResetError("Invalid or expired reset code");
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!user) {
    throw new PasswordResetError("Invalid or expired reset code");
  }

  const passwordHash = await bcrypt.hash(password, OTP_SALT_ROUNDS);

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
  constructor(message: string) {
    super(message);
    this.name = "PasswordResetError";
  }
}
