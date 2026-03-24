import type { ActivityFeedItem } from "@/lib/admin/dashboard-queries";
import { Clock, User } from "lucide-react";

type Props = { items: ActivityFeedItem[] };

export function DashboardRecentActivity({ items }: Props) {
  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-labelledby="dash-recent"
    >
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-primary" aria-hidden />
        <h2 id="dash-recent" className="text-sm font-semibold text-foreground">
          最新動態
        </h2>
        <span className="text-xs text-muted-foreground">（最近 10 分鐘）</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        新註冊帳號與新購課紀錄，依時間新到舊排列。
      </p>
      <ul className="mt-4 divide-y divide-border">
        {items.length === 0 ? (
          <li className="py-8 text-center text-sm text-muted-foreground">
            此時段尚無新註冊或購課
          </li>
        ) : (
          items.map((item, i) => (
            <li key={`${item.at}-${i}`} className="flex gap-3 py-3 first:pt-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {new Date(item.at).toLocaleString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
