import { getMissingRequiredEnv, ZEABUR_ENV_VARIABLES } from "@/lib/env-check";

/**
 * 在根 layout 內檢查環境變數，**不 throw**，避免正式站把訊息序列化到 global-error 時被清空，
 * 使用者只看到 digest 而無法排查。
 */
export function EnvGate({ children }: { children: React.ReactNode }) {
  const missing = getMissingRequiredEnv();
  if (missing.length === 0) {
    return children;
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-6 px-6 py-16 text-zinc-800">
      <div>
        <h1 className="text-xl font-semibold text-necva-primary">
          環境變數未就緒
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          伺服器缺少下列變數（或為空字串）。請在 Zeabur → Web 服務 →
          Variables 補齊後重新部署。
        </p>
      </div>
      <ul className="list-inside list-disc space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        {missing.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-700">
        <p className="font-medium text-zinc-900">變數說明（Zeabur／本機對照）</p>
        <ul className="mt-2 space-y-2">
          {ZEABUR_ENV_VARIABLES.map((row) => (
            <li key={row.name}>
              <span className="font-mono text-zinc-900">{row.name}</span>
              {row.required ? (
                <span className="text-red-600">（建議必填）</span>
              ) : null}
              ：{row.note}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-zinc-600">
          詳見專案根目錄 <code className="rounded bg-white px-1">.env.example</code>
          。
        </p>
      </div>
    </div>
  );
}
