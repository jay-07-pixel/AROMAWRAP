import { apiFetch } from "@/lib/api";

export type AnnouncementIcon = "bag" | "truck" | "sparkles" | "percent";
export type AnnouncementTheme = "crimson" | "ocean" | "purple" | "amber";

export interface AnnouncementItem {
  text: string;
  icon: AnnouncementIcon;
  theme: AnnouncementTheme;
}

export interface AnnouncementSettings {
  enabled: boolean;
  items: AnnouncementItem[];
}

export const ANNOUNCEMENT_THEMES: Record<
  AnnouncementTheme,
  { label: string; bgClass: string }
> = {
  crimson: {
    label: "Crimson Red",
    bgClass: "bg-gradient-to-r from-[#DC143C] to-[#FF6B6B]",
  },
  ocean: {
    label: "Ocean Blue",
    bgClass: "bg-gradient-to-r from-[#00BFFF] to-[#40E0D0]",
  },
  purple: {
    label: "Royal Purple",
    bgClass: "bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]",
  },
  amber: {
    label: "Warm Amber",
    bgClass: "bg-gradient-to-r from-[#F57C00] to-[#FF9800]",
  },
};

type AnnouncementResponse = {
  success: true;
  data: AnnouncementSettings;
};

export async function getAnnouncementSettings(): Promise<AnnouncementSettings> {
  const response = await apiFetch<AnnouncementResponse>("/api/announcements");
  return response.data;
}

export async function updateAnnouncementSettings(
  settings: AnnouncementSettings
): Promise<AnnouncementSettings> {
  const response = await apiFetch<AnnouncementResponse>("/api/announcements", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  return response.data;
}
