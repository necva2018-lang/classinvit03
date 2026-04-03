"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrlRaw = searchParams.get("callbackUrl");
  const callbackUrl =
    callbackUrlRaw && callbackUrlRaw.startsWith("/") ? callbackUrlRaw : "/me/courses";

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "")
      .trim()
      .toLowerCase();
    /** 避免複製貼上或輸入法帶入首尾空白；若密碼刻意含空白請勿用 trim */
    const password = String(fd.get("password") ?? "").trim();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("帳號或密碼錯誤，或此帳號尚未設定密碼登入。");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">密碼</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        className="w-full bg-necva-primary hover:bg-necva-primary/90"
        disabled={pending}
      >
        {pending ? "登入中…" : "登入"}
      </Button>
      <p className="text-center text-sm text-zinc-600">
        還沒有帳號？{" "}
        <Link href="/register" className="font-medium text-necva-primary hover:underline">
          註冊
        </Link>
      </p>
    </form>
  );
}
