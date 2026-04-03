"use client";

import { isEnvConfigurationError } from "@/lib/env-check";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  const envIssue = isEnvConfigurationError(error);

  return (
    <html lang="zh-TW">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 px-6 py-16 text-zinc-100">
        <div className="max-w-lg text-center">
          <h1 className="text-xl font-semibold text-white">
            {envIssue ? "環境變數未就緒" : "應用程式發生錯誤"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {envIssue
              ? "請確認專案根目錄有 .env 且含 DATABASE_URL（本機）或 Zeabur Web Variables（正式）。若本機暫無資料庫，可設 SKIP_ENV_CHECK=1 僅供開發。OAuth 相關變數須成對填寫。"
              : "請稍後再試，或聯絡管理員並提供錯誤摘要。"}
          </p>
          {error.digest ? (
            <p className="mt-4 text-xs text-zinc-500">
              除錯代碼（digest）：{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                {error.digest}
              </code>
            </p>
          ) : null}
          <pre className="mt-6 max-h-48 overflow-auto rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-left text-xs leading-relaxed whitespace-pre-wrap text-amber-200/90">
            {envIssue || process.env.NODE_ENV === "development"
              ? error.message
              : "正式環境已隱藏詳細錯誤訊息。"}
          </pre>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            重試
          </button>
        </div>
      </body>
    </html>
  );
}
