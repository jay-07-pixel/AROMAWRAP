import session, { type SessionData } from "express-session";
import { prisma } from "./prisma.js";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const PRUNE_INTERVAL_MS = 1000 * 60 * 15;

function getExpiresAt(sess: SessionData): Date {
  const raw = sess.cookie?.expires;
  if (raw) {
    const parsed = raw instanceof Date ? raw : new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  const maxAge =
    typeof sess.cookie?.originalMaxAge === "number" && sess.cookie.originalMaxAge > 0
      ? sess.cookie.originalMaxAge
      : DEFAULT_TTL_MS;
  return new Date(Date.now() + maxAge);
}

/**
 * MySQL-backed Express session store using Prisma.
 * Stores userId alongside the serialized session so password resets
 * can revoke every active session belonging to that user.
 */
export class PrismaSessionStore extends session.Store {
  private pruneTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    this.pruneTimer = setInterval(() => {
      void this.pruneExpired();
    }, PRUNE_INTERVAL_MS);
    this.pruneTimer.unref?.();
  }

  private async pruneExpired(): Promise<void> {
    try {
      await prisma.session.deleteMany({
        where: { expiresAt: { lte: new Date() } },
      });
    } catch {
      /* ignore transient prune errors */
    }
  }

  override get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void
  ): void {
    prisma.session
      .findUnique({ where: { sid } })
      .then((record) => {
        if (!record) {
          callback(null, null);
          return;
        }
        if (record.expiresAt.getTime() <= Date.now()) {
          void prisma.session.delete({ where: { sid } }).catch(() => undefined);
          callback(null, null);
          return;
        }
        try {
          const parsed = JSON.parse(record.data) as SessionData;
          callback(null, parsed);
        } catch (parseErr) {
          void prisma.session.delete({ where: { sid } }).catch(() => undefined);
          callback(parseErr);
        }
      })
      .catch((err) => callback(err));
  }

  override set(
    sid: string,
    sess: SessionData,
    callback?: (err?: unknown) => void
  ): void {
    const expiresAt = getExpiresAt(sess);
    const userId =
      typeof (sess as SessionData & { userId?: unknown }).userId === "string"
        ? (sess as SessionData & { userId?: string }).userId ?? null
        : null;
    const data = JSON.stringify(sess);

    prisma.session
      .upsert({
        where: { sid },
        create: { sid, userId, data, expiresAt },
        update: { userId, data, expiresAt },
      })
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }

  override destroy(sid: string, callback?: (err?: unknown) => void): void {
    prisma.session
      .deleteMany({ where: { sid } })
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }

  override touch(
    sid: string,
    sess: SessionData,
    callback?: (err?: unknown) => void
  ): void {
    const expiresAt = getExpiresAt(sess);
    prisma.session
      .updateMany({
        where: { sid },
        data: { expiresAt },
      })
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }
}

/** Revoke every active login session for a user (e.g. after password reset). */
export async function revokeUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
