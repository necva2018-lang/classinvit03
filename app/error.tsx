"use client";

import { isEnvConfigurationError } from "@/lib/env-check";
import { useEffect } from "react";

/**
 * 捕捉子路由樹內錯誤（不含根 layout；根層級請見 global-error.tsx）。
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  const env = isEnvConfigurationError(error);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-foreground">
        {env ? "環境變數設定不完整" : "頁面載入失敗"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {env
          ? "請至 Zeabur Variables 或本機 .env 補齊必要項目後重新整理。"
          : "請稍後再試，或返回上一頁。"}
      </p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">
          除錯代碼（digest，可對照主機日誌）：{" "}
          <code className="rounded bg-muted px-1 py-0.5">{error.digest}</code>
        </p>
      ) : null}
      <pre className="max-h-40 w-full overflow-auto rounded-md border bg-muted/50 p-3 text-left text-xs whitespace-pre-wrap">
        {env || process.env.NODE_ENV === "development"
          ? error.message
          : "正式環境已隱藏詳細錯誤訊息。"}
      </pre>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
      >
        重試
      </button>
    </div>
  );
}
