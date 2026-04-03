/**
 * 啟動時環境變數檢查（供根 layout 呼叫）。
 *
 * - 開發：缺少必要項會 throw，Next 錯誤覆蓋層明顯顯示。
 * - 正式：同樣 throw，由 app/global-error.tsx 顯示友善頁（根 layout 錯誤須用 global-error）。
 *
 * 本機若暫無資料庫：開發模式預設已不強制 DATABASE_URL（整站可開；需 DB 的頁面仍要設定 .env）。
 * 若要與正式相同嚴格檢查：設 REQUIRE_DATABASE_URL_IN_DEV=1。完全略過檢查：SKIP_ENV_CHECK=1（勿上線）。
 */

function isLikelyNextBuildPhase(): boolean {
  if (process.env.npm_lifecycle_event === "build") return true;
  /** 子程序（靜態產生頁）可能未繼承 npm_lifecycle_event */
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  const joined = process.argv.join(" ");
  return /\bnext\s+build\b/.test(joined);
}

export class EnvConfigurationError extends Error {
  readonly missing: readonly string[];

  constructor(missing: readonly string[]) {
    const list = missing.join("\n  • ");
    super(
      `[環境變數] 缺少或為空：\n  • ${list}\n請參考 lib/env-check.ts 的 ZEABUR_ENV_VARIABLES 或 .env.example。`,
    );
    this.name = "EnvConfigurationError";
    this.missing = missing;
  }
}

/** Zeabur 控制台手動新增 Variables 時的參考清單（與實際檢查規則一致） */
export const ZEABUR_ENV_VARIABLES = [
  {
    name: "DATABASE_URL",
    required: true,
    note: "PostgreSQL 連線字串。Zeabur 同專案部署時用 Web 綁定 DB 後的 Internal DATABASE_URL；本機連雲端才需 Public 連線字串。",
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    required: false,
    note: "正式網址，例如 https://xxx.zeabur.app（metadataBase、OG 用）。未設則建置時可能 fallback localhost。",
  },
  {
    name: "NEXTAUTH_URL",
    required: false,
    note: "NextAuth v4 正式網址，需與瀏覽器造訪網域一致。若已設定，下列 OAuth／Secret 會一併強制檢查。",
  },
  {
    name: "NEXTAUTH_SECRET",
    required: false,
    note: "NextAuth v4 加密用密鑰；或改用 Auth.js v5 的 AUTH_SECRET（二擇一即可）。openssl rand -base64 32",
  },
  {
    name: "AUTH_SECRET",
    required: false,
    note: "Auth.js v5 用；與 NEXTAUTH_SECRET 擇一。若已設定 NEXTAUTH_URL，須與 OAuth 變數一併存在。",
  },
  {
    name: "GOOGLE_CLIENT_ID",
    required: false,
    note: "Google OAuth Client ID。僅在啟用 NEXTAUTH_URL 且使用 Google 登入時為必要。",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
    note: "Google OAuth Client Secret。同上。",
  },
] as const;

function wantsAuth(): boolean {
  return Boolean(process.env.NEXTAUTH_URL?.trim());
}

/**
 * 回傳目前缺少的「必要」變數說明字串（空陣列表示通過）。
 */
export function getMissingRequiredEnv(): string[] {
  /** 建置時 layout 仍會執行；若平台未注入 DATABASE_URL 至 build 環境，略過避免誤擋（執行 next start 仍會檢查） */
  if (isLikelyNextBuildPhase()) {
    return [];
  }

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.SKIP_ENV_CHECK === "1"
  ) {
    return [];
  }

  const missing: string[] = [];

  if (!process.env.DATABASE_URL?.trim()) {
    /** 本機 `npm run dev` 未放 .env 時，不應整站白屏；正式 `next start` 仍強制要有。 */
    const lenientDevDb =
      process.env.NODE_ENV !== "production" &&
      process.env.REQUIRE_DATABASE_URL_IN_DEV !== "1";
    if (!lenientDevDb) {
      missing.push("DATABASE_URL");
    }
  }

  /** 前台會員（Auth.js）正式站須設定，與是否啟用 OAuth 無關 */
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.AUTH_SECRET?.trim() &&
    !process.env.NEXTAUTH_SECRET?.trim()
  ) {
    missing.push("AUTH_SECRET 或 NEXTAUTH_SECRET（會員 Session 加密）");
  }

  if (wantsAuth()) {
    if (
      !process.env.NEXTAUTH_SECRET?.trim() &&
      !process.env.AUTH_SECRET?.trim()
    ) {
      missing.push("NEXTAUTH_SECRET 或 AUTH_SECRET（擇一）");
    }
    if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
      missing.push("GOOGLE_CLIENT_ID");
    }
    if (!process.env.GOOGLE_CLIENT_SECRET?.trim()) {
      missing.push("GOOGLE_CLIENT_SECRET");
    }
  }

  return missing;
}

/**
 * 通過則 no-op；失敗則 throw EnvConfigurationError（開發／正式皆然，由 UI 層差異呈現）。
 */
export function assertAppEnv(): void {
  const missing = getMissingRequiredEnv();
  if (missing.length > 0) {
    throw new EnvConfigurationError(missing);
  }
}

export function isEnvConfigurationError(e: unknown): e is EnvConfigurationError {
  return e instanceof EnvConfigurationError;
}
