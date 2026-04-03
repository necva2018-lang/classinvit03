"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUserAction } from "./actions";
import { signIn } from "next-auth/react";
import { useEffect, useActionState, useRef } from "react";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerUserAction, undefined);
  const autoSignInRef = useRef(false);

  useEffect(() => {
    if (!state?.ok || autoSignInRef.current) return;
    autoSignInRef.current = true;
    const form = document.getElementById("register-form") as HTMLFormElement | null;
    if (!form) return;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(fd.get("password") ?? "");
    void signIn("credentials", {
      email,
      password,
      callbackUrl: "/me/courses",
    });
  }, [state]);

  return (
    <form id="register-form" action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">暱稱（選填）</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="nickname"
          placeholder="顯示名稱"
        />
        {state?.ok === false && state.fieldErrors?.name?.[0] ? (
          <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
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
        {state?.ok === false && state.fieldErrors?.email?.[0] ? (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">密碼</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="至少 8 個字元"
        />
        {state?.ok === false && state.fieldErrors?.password?.[0] ? (
          <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm">確認密碼</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
        {state?.ok === false && state.fieldErrors?.confirm?.[0] ? (
          <p className="text-xs text-destructive">{state.fieldErrors.confirm[0]}</p>
        ) : null}
      </div>

      {state?.ok === false && state.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full bg-necva-primary hover:bg-necva-primary/90"
        disabled={pending}
      >
        {pending ? "送出中…" : "註冊"}
      </Button>
    </form>
  );
}
