import { Facebook, GraduationCap, Instagram, Youtube } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "課程與學習",
    links: ["線上課程", "學習地圖", "免費講座", "完課認證"],
  },
  {
    title: "企業與合作",
    links: ["企業內訓", "教育夥伴", "徵才專區", "媒體素材"],
  },
  {
    title: "支援",
    links: ["常見問題", "聯絡我們", "服務條款", "隱私權政策"],
  },
] as const;

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t border-zinc-200 bg-zinc-900 text-zinc-300"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap
                className="size-8 text-necva-accent"
                aria-hidden
              />
              <span className="text-xl font-bold text-white">NECVA</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              致力提供與產業接軌的線上課程，協助學員與企業共同成長。
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <Link
                  key={label}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition hover:bg-necva-primary hover:text-white"
                  aria-label={label}
                >
                  <Icon className="size-5" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:max-w-2xl">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-zinc-400 transition hover:text-necva-accent"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-500 sm:text-left">
          © {new Date().getFullYear()} NECVA 示範專案。保留所有權利。
        </div>
      </div>
    </footer>
  );
}
