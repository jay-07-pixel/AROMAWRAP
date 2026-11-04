import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

const userSelect = {
  id: true,
  email: true,
  displayName: true,
  phone: true,
  photoUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  photoUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
};

export class GoogleAuthError extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "GoogleAuthError";
  }
}

function getClient(): OAuth2Client {
  if (!env.googleClientId) {
    throw new GoogleAuthError("Google Sign-In is not configured on this server.", 503);
  }
  return new OAuth2Client(env.googleClientId);
}

export async function verifyGoogleIdToken(credential: string): Promise<{
  googleId: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  emailVerified: boolean;
}> {
  const client = getClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new GoogleAuthError("Google sign-in did not return a usable account.");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    displayName: (payload.name || payload.email.split("@")[0] || "Customer").trim(),
    photoUrl: payload.picture ?? null,
    emailVerified: payload.email_verified === true,
  };
}

export async function signInOrRegisterWithGoogle(credential: string): Promise<{
  user: AuthUser;
  isNewUser: boolean;
}> {
  const google = await verifyGoogleIdToken(credential);

  if (!google.emailVerified) {
    throw new GoogleAuthError("Please verify your Google email address, then try again.");
  }

  const byGoogleId = await prisma.user.findUnique({
    where: { googleId: google.googleId },
    select: userSelect,
  });

  if (byGoogleId) {
    const user = await prisma.user.update({
      where: { id: byGoogleId.id },
      data: {
        displayName: byGoogleId.displayName || google.displayName,
        photoUrl: google.photoUrl ?? byGoogleId.photoUrl,
      },
      select: userSelect,
    });
    return { user, isNewUser: false };
  }

  const byEmail = await prisma.user.findUnique({
    where: { email: google.email },
    select: { ...userSelect, googleId: true },
  });

  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== google.googleId) {
      throw new GoogleAuthError("This email is already linked to a different Google account.");
    }

    const user = await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: google.googleId,
        displayName: byEmail.displayName || google.displayName,
        photoUrl: google.photoUrl ?? byEmail.photoUrl,
      },
      select: userSelect,
    });
    return { user, isNewUser: false };
  }

  const user = await prisma.user.create({
    data: {
      email: google.email,
      googleId: google.googleId,
      displayName: google.displayName,
      photoUrl: google.photoUrl,
      passwordHash: null,
    },
    select: userSelect,
  });

  return { user, isNewUser: true };
}
