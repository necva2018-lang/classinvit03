import {
  BarChart3,
  Brain,
  Code2,
  Megaphone,
  Palette,
  ShieldCheck,
} from "lucide-react";

const categories = [
  { label: "資訊科技", icon: Code2 },
  { label: "人工智慧", icon: Brain },
  { label: "設計創意", icon: Palette },
  { label: "行銷企劃", icon: Megaphone },
  { label: "數據分析", icon: BarChart3 },
  { label: "職場軟實力", icon: ShieldCheck },
] as const;

export function CategoryPills() {
  return (
    <section className="border-b border-zinc-100 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold text-zinc-900">
          探索學習領域
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-500">
          依職涯目標選擇主題，系統化安排學習路徑
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {categories.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-necva-primary/40 hover:bg-necva-primary/5 hover:text-necva-primary"
            >
              <Icon className="size-4 shrink-0 text-necva-primary" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
