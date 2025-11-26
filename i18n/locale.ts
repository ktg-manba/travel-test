import { Pathnames } from "next-intl/routing";

export const locales = ["en", "zh"] as const;

export const localeNames: Record<(typeof locales)[number], string> = {
  en: "English",
  zh: "中文",
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

// Disable locale detection for consistent routing on Edge runtime
export const localeDetection = false;

export const pathnames = {
  "/": "/",
  "/traveltang": "/traveltang",
  "/privacy-policy": "/privacy-policy",
  "/terms-of-service": "/terms-of-service",
} satisfies Pathnames<typeof locales>;
