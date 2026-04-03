import { LoginForm } from "./login-form";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "登入",
  description: "使用 Email 與密碼登入 NECVA 會員帳號。",
};

function LoginFormFallback() {
  return (
    <div className="h-48 animate-pulse rounded-lg bg-zinc-100" aria-hidden />
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-sm text-zinc-500" aria-label="麵包屑">
            <Link href="/" className="hover:text-necva-primary">
              首頁
            </Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-800">登入</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold text-zinc-900">登入</h1>
          <p className="mt-2 text-sm text-zinc-600">
            使用註冊時的 Email 與密碼登入，登入後可前往「我的課程」。
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
