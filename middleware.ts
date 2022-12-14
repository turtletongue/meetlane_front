import { NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";

import { FALLBACK_LANGUAGE, languages } from "./i18n";

acceptLanguage.languages(languages as unknown as string[]);

export const config = {
  matcher: "/:lng*",
};

const cookieName = "i18next";

export function middleware(req: NextRequest) {
  const lang = req.cookies.has(cookieName)
    ? acceptLanguage.get(req.cookies.get(cookieName)?.value)
    : acceptLanguage.get(req.headers.get("Accept-Language")) ??
      FALLBACK_LANGUAGE;

  // Redirect if lang in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith("/_next")
  ) {
    return NextResponse.redirect(
      new URL(`/${lang}${req.nextUrl.pathname}`, req.url)
    );
  }

  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer")!);

    const langInReferer = languages.find((language) =>
      refererUrl.pathname.startsWith(`/${language}`)
    );

    const response = NextResponse.next();

    if (langInReferer) {
      response.cookies.set(cookieName, langInReferer);
    }

    return response;
  }

  return NextResponse.next();
}
