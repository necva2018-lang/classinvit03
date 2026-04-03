"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordAction,
  updateDisplayNameAction,
  type ProfileActionState,
} from "../actions";
import { useSession } from "next-auth/react";
import { useEffect, useActionState } from "react";

type Props = {
  email: string;
  initialName: string | null;
};

export function AccountSettingsForm({ email, initialName }: Props) {
  const { update } = useSession();

  const [nameState, nameAction, namePending] = useActionState(
    updateDisplayNameAction,
    undefined as ProfileActionState | undefined,
  );
  const [pwState, pwAction, pwPending] = useActionState(
    changePasswordAction,
    undefined as ProfileActionState | undefined,
  );

  useEffect(() => {
    if (nameState?.ok !== true || !("name" in nameState)) return;
    void update({ user: { name: nameState.name || null } });
  }, [nameState, update]);

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">基本資料</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Email 為登入帳號，無法在此變更。
        </p>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="email-readonly">Email</Label>
          <Input
            id="email-readonly"
            value={email}
            readOnly
            className="bg-zinc-50 text-zinc-600"
          />
        </div>
        <form action={nameAction} className="mt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="display-name">暱稱</Label>
            <Input
              id="display-name"
              name="name"
              type="text"
              key={initialName ?? "empty"}
              defaultValue={initialName ?? ""}
              placeholder="顯示名稱（選填）"
              maxLength={80}
              autoComplete="nickname"
            />
          </div>
          {nameState?.ok === false ? (
            <p className="text-sm text-destructive" role="alert">
              {nameState.message}
            </p>
          ) : null}
          {nameState?.ok ? (
            <p className="text-sm text-emerald-700" role="status">
              已儲存暱稱。
            </p>
          ) : null}
          <Button
            type="submit"
            className="bg-necva-primary hover:bg-necva-primary/90"
            disabled={namePending}
          >
            {namePending ? "儲存中…" : "儲存暱稱"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">變更密碼</h2>
        <p className="mt-1 text-sm text-zinc-500">
          請輸入目前密碼與新密碼（至少 8 字元）。
        </p>
        <form action={pwAction} className="mt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-pw">目前密碼</Label>
            <Input
              id="current-pw"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-pw">新密碼</Label>
            <Input
              id="new-pw"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-pw">確認新密碼</Label>
            <Input
              id="confirm-pw"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {pwState?.ok === false ? (
            <p className="text-sm text-destructive" role="alert">
              {pwState.message}
            </p>
          ) : null}
          {pwState?.ok ? (
            <p className="text-sm text-emerald-700" role="status">
              密碼已更新，請使用新密碼登入。
            </p>
          ) : null}
          <Button
            type="submit"
            variant="outline"
            className="border-necva-primary text-necva-primary hover:bg-necva-primary/5"
            disabled={pwPending}
          >
            {pwPending ? "更新中…" : "更新密碼"}
          </Button>
        </form>
      </section>
    </div>
  );
}
