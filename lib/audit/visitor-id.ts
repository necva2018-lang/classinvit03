import crypto from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const VISITOR_ID_COOKIE = "cv_visitor_id";
const VISITOR_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 365 天

export function resolveVisitorId(request: NextRequest): {
  visitorId: string;
  needsSetCookie: boolean;
} {
  const existing = request.cookies.get(VISITOR_ID_COOKIE)?.value?.trim();
  if (existing) {
    return { visitorId: existing.slice(0, 128), needsSetCookie: false };
  }
  return { visitorId: crypto.randomUUID(), needsSetCookie: true };
}

export function attachVisitorCookie(
  response: NextResponse,
  visitorId: string,
): void {
  response.cookies.set({
    name: VISITOR_ID_COOKIE,
    value: visitorId,
    maxAge: VISITOR_COOKIE_MAX_AGE_SEC,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
