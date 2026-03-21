/**
 * 僅檢查 DATABASE_URL 格式，不輸出連線字串內容。
 * 使用：node scripts/validate-database-url-format.mjs
 */
import fs from "node:fs";
import path from "node:path";

function loadDatabaseUrl() {
  const envPath = path.join(process.cwd(), ".env");
  let text;
  try {
    text = fs.readFileSync(envPath, "utf8");
  } catch {
    return { error: "找不到專案根目錄的 .env 檔" };
  }

  const line = text.split(/\r?\n/).find((l) => /^DATABASE_URL\s*=/i.test(l));
  if (!line) return { error: ".env 內沒有 DATABASE_URL= 這一行" };

  let raw = line.replace(/^DATABASE_URL\s*=\s*/i, "").trim();
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1);
  }
  const hash = raw.indexOf(" #");
  if (hash !== -1) raw = raw.slice(0, hash).trim();

  if (!raw) return { error: "DATABASE_URL= 後方為空（請貼上 Zeabur 連線字串）" };

  return { url: raw };
}

function validatePostgresUrl(s) {
  if (!/^postgres(ql)?:\/\//i.test(s)) {
    return { ok: false, reason: "必須以 postgresql:// 或 postgres:// 開頭" };
  }

  try {
    const u = new URL(s);
    if (!u.hostname) {
      return { ok: false, reason: "缺少主機名稱（hostname）" };
    }
    const db = u.pathname?.replace(/^\//, "")?.split("?")[0];
    if (!db) {
      return { ok: false, reason: "路徑中缺少資料庫名稱（例如 /postgres）" };
    }
    return {
      ok: true,
      host: u.hostname,
      port: u.port || "5432（預設）",
      database: db.split("/")[0],
      hasUserinfo: Boolean(u.username),
      hasQuery: Boolean(u.search),
    };
  } catch {
    return {
      ok: false,
      reason:
        "無法解析為 URL。若密碼含 @ : / ? # 等字元，請在 Zeabur 複製「已編碼」的連線字串，或自行做 URL encode",
    };
  }
}

const loaded = loadDatabaseUrl();
if ("error" in loaded && loaded.error) {
  console.log("❌ " + loaded.error);
  process.exit(1);
}

const result = validatePostgresUrl(loaded.url);
if (!result.ok) {
  console.log("❌ DATABASE_URL 格式有誤：" + result.reason);
  process.exit(1);
}

console.log("✅ DATABASE_URL 格式看起來正確（postgresql URL 可解析）");
console.log("   主機：" + result.host);
console.log("   埠：" + result.port);
console.log("   資料庫名稱：" + result.database);
console.log("   是否含帳號：" + (result.hasUserinfo ? "是" : "否（建議檢查連線字串是否完整）"));
if (result.hasQuery) {
  console.log("   含查詢參數（常見 sslmode=require）：是");
}
process.exit(0);
