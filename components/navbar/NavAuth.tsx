"use client";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

function AuthLoadingPlaceholder({ className }: { className?: string }) {
  return (
    <span
      className={className}
      aria-hidden
    >
      <span className="inline-block h-4 w-14 animate-pulse rounded bg-zinc-200" />
    </span>
  );
}

/** 桌面版：導覽列右側登入狀態 */
export function NavAuthDesktop() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <AuthLoadingPlaceholder />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href="/me/courses"
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-necva-primary"
        >
          我的課程
        </Link>
        <Link
          href="/me/account"
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-necva-primary"
        >
          帳號設定
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-zinc-300"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          登出
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link
        href="/login"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:text-necva-primary"
      >
        登入
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-necva-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-necva-accent/90"
      >
        註冊
      </Link>
    </div>
  );
}

/** 手機抽屜：會員按鈕（關閉抽屜於 onNavigate） */
export function NavAuthMobile({ onNavigate }: { onNavigate: () => void }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
        <div className="h-11 animate-pulse rounded-full bg-zinc-100" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
        <Link
          href="/me/courses"
          className="flex h-11 items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-800"
          onClick={onNavigate}
        >
          我的課程
        </Link>
        <Link
          href="/me/account"
          className="flex h-11 items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-800"
          onClick={onNavigate}
        >
          帳號設定
        </Link>
        <button
          type="button"
          className="flex h-11 items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-700"
          onClick={() => {
            onNavigate();
            void signOut({ callbackUrl: "/" });
          }}
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
      <Link
        href="/login"
        className="flex h-11 items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-800"
        onClick={onNavigate}
      >
        登入
      </Link>
      <Link
        href="/register"
        className="flex h-11 items-center justify-center rounded-full bg-necva-accent text-sm font-semibold text-white"
        onClick={onNavigate}
      >
        註冊
      </Link>
    </div>
  );
}
