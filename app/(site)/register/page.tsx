import { RegisterForm } from "./register-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "註冊",
  description: "建立 NECVA 會員帳號（Email 與密碼）。",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-sm text-zinc-500" aria-label="麵包屑">
            <Link href="/" className="hover:text-necva-primary">
              首頁
            </Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-800">註冊</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold text-zinc-900">建立帳號</h1>
          <p className="mt-2 text-sm text-zinc-600">
            註冊完成後將自動登入，並可前往「我的課程」（尚無課程時會顯示引導）。
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-zinc-600">
            已有帳號？{" "}
            <Link href="/login" className="font-medium text-necva-primary hover:underline">
              登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
