"use client";

import { Mail } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="bg-necva-primary py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/20 bg-white/10 px-6 py-8 backdrop-blur-sm sm:flex-row sm:px-10">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              訂閱電子報，掌握開課與限時優惠
            </h2>
            <p className="mt-2 text-sm text-white/80">
              不寄垃圾信，只分享對學習有幫助的內容。
            </p>
          </div>
          <form
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="cta-email" className="sr-only">
              電子郵件
            </label>
            <input
              id="cta-email"
              type="email"
              placeholder="請輸入 Email"
              className="min-h-11 flex-1 rounded-lg border border-white/30 bg-white/95 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-necva-accent focus:outline-none focus:ring-2 focus:ring-necva-accent/40"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-necva-accent px-5 text-sm font-semibold text-white transition hover:bg-necva-accent/90"
            >
              <Mail className="size-4" aria-hidden />
              訂閱
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
