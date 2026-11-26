import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validateBody } from "../middleware/validate.js";

const announcementItemSchema = z.object({
  text: z.string().trim().min(1, "Announcement text cannot be empty").max(200),
  icon: z.enum(["bag", "truck", "sparkles", "percent"]).default("sparkles"),
  theme: z.enum(["crimson", "ocean", "purple", "amber"]).default("crimson"),
});

const updateAnnouncementSchema = z.object({
  enabled: z.boolean(),
  items: z.array(announcementItemSchema).max(10),
});

export type AnnouncementItem = z.infer<typeof announcementItemSchema>;

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    icon: "bag",
    text: "🎉 FESTIVE SALE: Explore Our Premium Incense Collection!",
    theme: "crimson",
  },
  {
    icon: "truck",
    text: "🚚 FREE Shipping on All Orders Above ₹499 | Pan India Delivery",
    theme: "ocean",
  },
  {
    icon: "bag",
    text: "✨ New Arrivals: Explore Our Latest Sandalwood Collection",
    theme: "purple",
  },
  {
    icon: "sparkles",
    text: "🌿 100% Natural & Eco-Friendly | Made with Love in India",
    theme: "amber",
  },
];

function parseStoredItems(raw: unknown): AnnouncementItem[] {
  const parsed = z.array(announcementItemSchema).safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_ANNOUNCEMENTS;
}

export const announcementsRouter = Router();

announcementsRouter.get("/", async (_req, res, next) => {
  try {
    const setting = await prisma.announcementSetting.findUnique({
      where: { id: "default" },
    });

    if (!setting) {
      res.json({
        success: true,
        data: {
          enabled: true,
          items: DEFAULT_ANNOUNCEMENTS,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        enabled: setting.enabled,
        items: parseStoredItems(setting.items),
      },
    });
  } catch (error) {
    next(error);
  }
});

announcementsRouter.put(
  "/",
  requireAdmin,
  writeLimiter,
  validateBody(updateAnnouncementSchema),
  async (req, res, next) => {
    try {
      const { enabled, items } = req.body as z.infer<typeof updateAnnouncementSchema>;

      const saved = await prisma.announcementSetting.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          enabled,
          items,
        },
        update: {
          enabled,
          items,
        },
      });

      res.json({
        success: true,
        data: {
          enabled: saved.enabled,
          items: parseStoredItems(saved.items),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
