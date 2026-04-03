import { getToken } from "next-auth/jwt";
import { resolveAuthSecret } from "@/lib/auth-secret";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Edge 不可 import `auth.ts`（會連到 Prisma／createRequire）；改以 JWT cookie 判斷是否登入。 */
export async function middleware(request: NextRequest) {
  const secret = resolveAuthSecret();
  if (!secret) {
    return NextResponse.next();
  }

  const secureCookie = request.nextUrl.protocol === "https:";
  const token = await getToken({
    req: request,
    secret,
    secureCookie,
  });

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/me/:path*"],
};
