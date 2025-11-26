import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "./i18n/locale";

export const runtime = "nodejs";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
});

export const config = {
  matcher: [
    "/",
    "/(en|zh)/:path*",
  ],
};
