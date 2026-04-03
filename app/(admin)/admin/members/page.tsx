import { toggleMemberActiveAction, updateMemberRoleAction } from "@/lib/admin/member-actions";
import {
  type MemberStatusFilter,
  getAdminMemberList,
} from "@/lib/admin/member-queries";
import { isDatabaseConfigured } from "@/lib/env";
import type { Role } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "會員管理",
};

const ROLE_OPTIONS: Array<{ value: Role | "all"; label: string }> = [
  { value: "all", label: "全部角色" },
  { value: "STUDENT", label: "學員" },
  { value: "INSTRUCTOR", label: "講師" },
  { value: "ADMIN", label: "管理員" },
];

const STATUS_OPTIONS: Array<{ value: MemberStatusFilter; label: string }> = [
  { value: "all", label: "全部狀態" },
  { value: "active", label: "啟用中" },
  { value: "inactive", label: "已停用" },
];

function asPositiveInt(raw: string | undefined, fallback: number) {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

function buildMembersHref(params: {
  q: string;
  role: Role | "all";
  status: MemberStatusFilter;
  page: number;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.role !== "all") sp.set("role", params.role);
  if (params.status !== "all") sp.set("status", params.status);
  if (params.page > 1) sp.set("page", String(params.page));
  const q = sp.toString();
  return q ? `/admin/members?${q}` : "/admin/members";
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}) {
  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        請先設定 DATABASE_URL。
      </p>
    );
  }

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const role = (ROLE_OPTIONS.some((o) => o.value === sp.role)
    ? (sp.role as Role | "all")
    : "all");
  const status = (STATUS_OPTIONS.some((o) => o.value === sp.status)
    ? (sp.status as MemberStatusFilter)
    : "all");
  const page = asPositiveInt(sp.page, 1);

  const { rows, pagination } = await getAdminMemberList({
    q,
    role,
    status,
    page,
    pageSize: 20,
  });
  const returnTo = buildMembersHref({ q, role, status, page: pagination.page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          會員管理
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          僅管理員可操作：改角色、停用／啟用，並可進入詳情頁查看登入與課程瀏覽紀錄。
        </p>
      </div>

      <form className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_180px_180px_auto] md:items-end">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="q">
              搜尋（姓名 / Email）
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="例如：alice@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="role">
              角色
            </label>
            <select
              id="role"
              name="role"
              defaultValue={role}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="status">
              狀態
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            篩選
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">會員</th>
              <th className="px-3 py-2 text-left font-medium">角色</th>
              <th className="px-3 py-2 text-left font-medium">狀態</th>
              <th className="px-3 py-2 text-right font-medium">登入紀錄</th>
              <th className="px-3 py-2 text-right font-medium">課程瀏覽</th>
              <th className="px-3 py-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                  查無符合條件的會員。
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-3 align-top">
                    <p className="font-medium text-foreground">
                      {row.name?.trim() || "（未設定名稱）"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.email ?? "（無 Email）"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      建立：{new Date(row.createdAt).toLocaleString("zh-TW")}
                    </p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <form action={updateMemberRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="memberId" value={row.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <select
                        name="role"
                        defaultValue={row.role}
                        className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="STUDENT">學員</option>
                        <option value="INSTRUCTOR">講師</option>
                        <option value="ADMIN">管理員</option>
                      </select>
                      <button
                        type="submit"
                        className="h-9 rounded-md border border-border px-2 text-xs"
                      >
                        變更
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        row.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {row.isActive ? "啟用中" : "已停用"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right align-top tabular-nums">
                    {row._count.loginLogs.toLocaleString("zh-TW")}
                  </td>
                  <td className="px-3 py-3 text-right align-top tabular-nums">
                    {row._count.courseViewLogs.toLocaleString("zh-TW")}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex justify-end gap-2">
                      <form action={toggleMemberActiveAction}>
                        <input type="hidden" name="memberId" value={row.id} />
                        <input
                          type="hidden"
                          name="nextActive"
                          value={row.isActive ? "false" : "true"}
                        />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <button
                          type="submit"
                          className="rounded-md border border-border px-2 py-1 text-xs"
                        >
                          {row.isActive ? "停用" : "啟用"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/members/${row.id}`}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        詳情
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          共 {pagination.total.toLocaleString("zh-TW")} 筆 / 第 {pagination.page} 頁（共{" "}
          {pagination.totalPages} 頁）
        </p>
        <div className="flex gap-2">
          <Link
            href={buildMembersHref({
              q,
              role,
              status,
              page: Math.max(1, pagination.page - 1),
            })}
            className={`rounded-md border px-3 py-1.5 ${
              pagination.page <= 1
                ? "pointer-events-none border-border/50 text-muted-foreground/50"
                : "border-border text-foreground"
            }`}
          >
            上一頁
          </Link>
          <Link
            href={buildMembersHref({
              q,
              role,
              status,
              page: Math.min(pagination.totalPages, pagination.page + 1),
            })}
            className={`rounded-md border px-3 py-1.5 ${
              pagination.page >= pagination.totalPages
                ? "pointer-events-none border-border/50 text-muted-foreground/50"
                : "border-border text-foreground"
            }`}
          >
            下一頁
          </Link>
        </div>
      </div>
    </div>
  );
}
