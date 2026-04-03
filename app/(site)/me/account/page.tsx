import { AccountSettingsForm } from "./account-settings-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "帳號設定",
  description: "管理暱稱與登入密碼。",
};

export default async function MeAccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login?callbackUrl=/me/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) {
    redirect("/login");
  }

  return (
    <>
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-sm text-zinc-500" aria-label="麵包屑">
            <Link href="/" className="hover:text-necva-primary">
              首頁
            </Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-800">帳號設定</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold text-necva-primary sm:text-3xl">
            帳號設定
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            更新暱稱或密碼。若需修改 Email，請日後洽客服（第一版未提供自助變更）。
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <AccountSettingsForm email={user.email} initialName={user.name} />
      </div>
    </>
  );
}
