import {
  adminResetMemberPasswordAction,
  toggleMemberActiveAction,
  updateMemberRoleAction,
} from "@/lib/admin/member-actions";
import { getAdminMemberDetail } from "@/lib/admin/member-queries";
import { isDatabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "會員詳情",
};

function asPositiveInt(raw: string | undefined, fallback: number) {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

function detailHref(memberId: string, loginPage: number, viewPage: number) {
  const sp = new URLSearchParams();
  if (loginPage > 1) sp.set("lp", String(loginPage));
  if (viewPage > 1) sp.set("vp", String(viewPage));
  const q = sp.toString();
  return q ? `/admin/members/${memberId}?${q}` : `/admin/members/${memberId}`;
}

function truncateMiddle(v: string | null | undefined, size = 18) {
  if (!v) return "—";
  if (v.length <= size) return v;
  return `${v.slice(0, 8)}…${v.slice(-8)}`;
}

export default async function AdminMemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lp?: string; vp?: string }>;
}) {
  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">請先設定 DATABASE_URL。</p>;
  }

  const { id } = await params;
  const sp = await searchParams;
  const lp = asPositiveInt(sp.lp, 1);
  const vp = asPositiveInt(sp.vp, 1);

  const data = await getAdminMemberDetail({
    memberId: id,
    loginPage: lp,
    viewPage: vp,
    pageSize: 20,
  });
  if (!data) notFound();
  const { member, enrollments, loginRows, viewRows, loginPagination, viewPagination } = data;
  const returnTo = detailHref(member.id, loginPagination.page, viewPagination.page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/members" className="text-sm text-primary hover:underline">
            ← 返回會員列表
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            會員詳情
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {member.name?.trim() || "（未設定名稱）"} · {member.email ?? "（無 Email）"}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">角色：</span>
              <span className="ml-1 font-medium">{member.role}</span>
            </p>
            <p>
              <span className="text-muted-foreground">狀態：</span>
              <span className="ml-1 font-medium">{member.isActive ? "啟用中" : "已停用"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">建立：</span>
              <span className="ml-1">{new Date(member.createdAt).toLocaleString("zh-TW")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">更新：</span>
              <span className="ml-1">{new Date(member.updatedAt).toLocaleString("zh-TW")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">選課：</span>
              <span className="ml-1">{member._count.enrollments.toLocaleString("zh-TW")} 門</span>
            </p>
          </div>
          <div className="space-y-3">
            <form action={updateMemberRoleAction} className="flex items-center gap-2">
              <input type="hidden" name="memberId" value={member.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <select
                name="role"
                defaultValue={member.role}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="STUDENT">學員</option>
                <option value="INSTRUCTOR">講師</option>
                <option value="ADMIN">管理員</option>
              </select>
              <button type="submit" className="h-10 rounded-md border border-border px-3 text-sm">
                變更角色
              </button>
            </form>

            <form action={toggleMemberActiveAction}>
              <input type="hidden" name="memberId" value={member.id} />
              <input
                type="hidden"
                name="nextActive"
                value={member.isActive ? "false" : "true"}
              />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className="h-10 rounded-md border border-border px-3 text-sm">
                {member.isActive ? "停用帳號" : "啟用帳號"}
              </button>
            </form>

            <form action={adminResetMemberPasswordAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="memberId" value={member.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input
                type="password"
                name="password"
                required
                minLength={8}
                maxLength={128}
                placeholder="輸入新密碼（至少 8 碼）"
                className="h-10 min-w-[240px] rounded-md border border-input bg-background px-3 text-sm"
              />
              <button type="submit" className="h-10 rounded-md border border-border px-3 text-sm">
                重設密碼
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-base font-semibold text-foreground">最近選課（最多 20 筆）</h2>
        <div className="mt-3 space-y-2">
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">尚無選課紀錄。</p>
          ) : (
            enrollments.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
                <Link
                  href={`/admin/courses/${row.course.id}/edit`}
                  className="truncate text-primary hover:underline"
                >
                  {row.course.title}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString("zh-TW")}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-base font-semibold text-foreground">登入紀錄</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          第 {loginPagination.page} / {loginPagination.totalPages} 頁，共{" "}
          {loginPagination.total.toLocaleString("zh-TW")} 筆
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-1 text-left">時間</th>
                <th className="px-2 py-1 text-left">狀態</th>
                <th className="px-2 py-1 text-left">原因</th>
                <th className="px-2 py-1 text-left">Email</th>
                <th className="px-2 py-1 text-left">IP Hash</th>
              </tr>
            </thead>
            <tbody>
              {loginRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">
                    尚無登入紀錄。
                  </td>
                </tr>
              ) : (
                loginRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-2 py-1.5">
                      {new Date(row.createdAt).toLocaleString("zh-TW")}
                    </td>
                    <td className="px-2 py-1.5">
                      {row.status === "SUCCESS" ? "成功" : "失敗"}
                    </td>
                    <td className="px-2 py-1.5">{row.failureCode ?? "—"}</td>
                    <td className="px-2 py-1.5">{row.emailInput ?? "—"}</td>
                    <td className="px-2 py-1.5 font-mono">{truncateMiddle(row.ipHash)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-end gap-2 text-xs">
          <Link
            href={detailHref(member.id, Math.max(1, loginPagination.page - 1), viewPagination.page)}
            className={`rounded border px-2 py-1 ${
              loginPagination.page <= 1
                ? "pointer-events-none border-border/50 text-muted-foreground/50"
                : "border-border"
            }`}
          >
            上一頁
          </Link>
          <Link
            href={detailHref(
              member.id,
              Math.min(loginPagination.totalPages, loginPagination.page + 1),
              viewPagination.page,
            )}
            className={`rounded border px-2 py-1 ${
              loginPagination.page >= loginPagination.totalPages
                ? "pointer-events-none border-border/50 text-muted-foreground/50"
                : "border-border"
            }`}
          >
            下一頁
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-base font-semibold text-foreground">課程詳情頁瀏覽紀錄</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          第 {viewPagination.page} / {viewPagination.totalPages} 頁，共{" "}
          {viewPagination.total.toLocaleString("zh-TW")} 筆
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-1 text-left">時間</th>
                <th className="px-2 py-1 text-left">課程</th>
                <th className="px-2 py-1 text-left">visitorId</th>
                <th className="px-2 py-1 text-left">IP Hash</th>
              </tr>
            </thead>
            <tbody>
              {viewRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-muted-foreground">
                    尚無瀏覽紀錄。
                  </td>
                </tr>
              ) : (
                viewRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-2 py-1.5">
                      {new Date(row.createdAt).toLocaleString("zh-TW")}
                    </td>
                    <td className="px-2 py-1.5">
                      <Link
                        href={`/admin/courses/${row.course.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        {row.course.title}
                      </Link>
                    </td>
                    <td className="px-2 py-1.5 font-mono">
                      {truncateMiddle(row.visitorId)}
                    </td>
                    <td className="px-2 py-1.5 font-mono">
                      {truncateMiddle(row.ipHash)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-end gap-2 text-xs">
          <Link
            href={detailHref(member.id, loginPagination.page, Math.max(1, viewPagination.page - 1))}
            className={`rounded border px-2 py-1 ${
              viewPagination.page <= 1
                ? "pointer-events-none border-border/50 text-muted-foreground/50"
                : "border-border"
            }`}
          >
            上一頁
          </Link>
          <Link
            href={detailHref(
              member.id,
              loginPagination.page,
              Math.min(viewPagination.totalPages, viewPagination.page + 1),
            )}
            className={`rounded border px-2 py-1 ${
              viewPagination.page >= viewPagination.totalPages
                ? "pointer-events-none border-border/50 text-muted-foreground/50"
                : "border-border"
            }`}
          >
            下一頁
          </Link>
        </div>
      </section>
    </div>
  );
}
