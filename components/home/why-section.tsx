import { BadgeCheck, BookOpen, Headphones, Trophy } from "lucide-react";

const items = [
  {
    title: "業界師資",
    desc: "具實務經驗的講師，帶你對齊職場需求。",
    icon: BadgeCheck,
  },
  {
    title: "系統化教材",
    desc: "章節清楚、練習完整，學習節奏自己掌握。",
    icon: BookOpen,
  },
  {
    title: "學習支援",
    desc: "討論與問答機制，遇到卡關有人一起想。",
    icon: Headphones,
  },
  {
    title: "完課認證",
    desc: "完成指定進度即可申請完課證明，履歷加分。",
    icon: Trophy,
  },
] as const;

export function WhySection() {
  return (
    <section
      id="why-necva"
      className="scroll-mt-20 bg-white py-14 sm:scroll-mt-24 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-zinc-900">
          為什麼選擇我們
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-600">
          從選課到完課，每個環節都為「學得會、用得上」而設計
        </p>
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, desc, icon: Icon }) => (
            <li key={title} className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-necva-primary/10 text-necva-primary">
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
