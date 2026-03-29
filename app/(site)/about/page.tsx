import {
  Award,
  Building2,
  GraduationCap,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "關於我們",
  description:
    "南投縣技職教育協會 NECVA：政府補助職業訓練、企業媒合與即戰力人才培育，埔里與草屯雙據點服務。",
};

const pillars = [
  {
    num: "01",
    title: "實務為核心，人才即上手",
    Icon: GraduationCap,
    body: [
      "數位影音行銷與辦公室實務班：結合行銷技能與辦公室行政訓練，培養影音製作、社群經營與基礎行政能力。",
      "創意甜點與烘焙實作班：對接烘焙與餐飲業需求，熟練甜點與麵包製作，並輔導相關證照。",
      "餐飲實務與職場應用班：強化食材處理、製程與行銷包裝等實務能力，輔導考取證照，培養餐飲即戰力。",
    ],
  },
  {
    num: "02",
    title: "找人才不費力，政府補助減輕負擔",
    Icon: Users,
    body: [
      "訓練課程由勞動部補助，符合資格者免學費，企業推薦人才亦可受惠。",
      "配合企業培訓需求，提供彈性時段與專案規劃，降低人力培育門檻。",
      "提供徵才與媒合管道，協助媒合具實務能力與證照的學員。",
    ],
  },
  {
    num: "03",
    title: "專業創新卓越，品質驗證有保障",
    Icon: Award,
    body: [
      "連續十年榮獲訓練機構「A 級」最高評等。",
      "通過 TTQS 訓練品質系統認證，制度完備。",
      "自有訓練基地與專業教室、實作設備，貼近職場情境。",
      "導師具產業實務與教學經驗，課程結合趨勢與企業需求。",
    ],
  },
] as const;

const locations = [
  {
    name: "埔里教室",
    address: "南投縣埔里鎮隆生路 99 號（玻璃屋教室）",
  },
  {
    name: "草屯教室",
    address: "南投縣草屯鎮中正路 864 號 4 樓（左側電梯直達）",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-sm text-zinc-500" aria-label="麵包屑">
            <Link href="/" className="hover:text-necva-primary">
              首頁
            </Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-800">關於我們</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            關於我們
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            認識南投縣技職教育協會（NECVA）— 連結政府資源、產業與學員，打造可立即上工的專業人才。
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-necva-primary via-[#004494] to-[#003a7a] text-white">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            NECVA
          </p>
          <h2 className="mt-2 max-w-3xl text-2xl font-bold leading-snug sm:text-3xl">
            南投縣技職教育協會
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
            我們是南投地區企業尋找人才的重要夥伴，專注培養與產業需求接軌的即戰力人才。透過專業師資、實作導向課程與訓練基地，協助企業媒合具備證照與實務經驗的優質人力。
          </p>
          <ul className="mt-8 flex flex-wrap gap-3 text-xs sm:text-sm">
            <li className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="size-4 shrink-0 text-necva-accent" aria-hidden />
              政府補助職業訓練
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
              <Building2 className="size-4 shrink-0 text-necva-accent" aria-hidden />
              埔里 · 草屯雙據點
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
              <Award className="size-4 shrink-0 text-necva-accent" aria-hidden />
              A 級訓練機構 · TTQS
            </li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="about-pillars-heading"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="text-center">
          <h2
            id="about-pillars-heading"
            className="text-xl font-bold text-zinc-900 sm:text-2xl"
          >
            協助企業打造即戰力人才的三大關鍵
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600">
            從課程設計到媒合支援，我們與企業並肩，讓培訓投資看得見成果。
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {pillars.map(({ num, title, Icon, body }) => (
            <article
              key={num}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-necva-primary/25 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl font-black tabular-nums text-necva-primary/20">
                  {num}
                </span>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-necva-primary/10 text-necva-primary">
                  <Icon className="size-6" aria-hidden />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                {title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-600">
                {body.map((line, i) => (
                  <li key={`${num}-${i}`} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-necva-accent" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-bold text-zinc-900 sm:text-2xl">
            熱門培訓方向
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600">
            課程內容接軌產業，涵蓋行銷、辦公室行政、餐飲與烘焙等職缺需求。
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            <li className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-5 py-6 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                數位影音行銷與辦公行政
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                影音製作、社群經營與行政實務並重
              </p>
            </li>
            <li className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-5 py-6 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                創意甜點烘焙與證照輔導
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                對接烘焙餐飲業實務與取證需求
              </p>
            </li>
            <li className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-5 py-6 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                餐飲實務與職場應用
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                食材、製程、包裝與職場即戰力
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          教室據點
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {locations.map(({ name, address }) => (
            <li
              key={name}
              className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-necva-primary/10 text-necva-primary">
                <MapPin className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">{name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {address}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-900 text-zinc-300">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              歡迎企業與我們攜手合作
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              推薦員工進修、共辦企業專屬訓練班，或洽談徵才與媒合—用對的人，創造更大的價值。
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <a
                href="tel:0492903412"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              >
                <Phone className="size-4" aria-hidden />
                049-2903412
              </a>
              <p className="text-sm text-zinc-400">
                聯絡窗口：陳小姐 / 林小姐
                <br />
                <span className="text-zinc-500">
                  週一至週五 08:30–17:00
                </span>
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
              <a
                href="https://ijob.tw/1cgui"
                target="_blank"
                rel="noopener noreferrer"
                className="text-necva-accent transition hover:underline"
              >
                官方網站（ijob.tw）
              </a>
              <span className="hidden text-zinc-600 sm:inline" aria-hidden>
                ·
              </span>
              <a
                href="https://www.instagram.com/necva2016"
                target="_blank"
                rel="noopener noreferrer"
                className="text-necva-accent transition hover:underline"
              >
                Instagram @necva2016
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
