import crypto from "node:crypto";

export type AuditRequestMeta = {
  ipHash: string | null;
  userAgent: string | null;
};

function firstForwardedIp(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
}

function resolveIp(headers: Headers): string | null {
  return (
    firstForwardedIp(headers.get("x-forwarded-for")) ||
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-client-ip")?.trim() ||
    null
  );
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt =
    process.env.AUDIT_IP_HASH_SALT?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "classinvit03-ip-hash-dev-salt";
  return crypto
    .createHash("sha256")
    .update(`${salt}|${ip}`)
    .digest("hex");
}

/**
 * 紀錄用途：不保存明文 IP，僅存雜湊；UA 保留至 512 字內避免異常長字串。
 */
export function getAuditRequestMeta(
  request: Request | { headers: Headers },
): AuditRequestMeta {
  const ip = resolveIp(request.headers);
  const ua = request.headers.get("user-agent")?.trim() || null;
  return {
    ipHash: hashIp(ip),
    userAgent: ua ? ua.slice(0, 512) : null,
  };
}
