import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecentOrders } from "@/lib/admin/orders-queries";
import { isDatabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "訂單／購買紀錄",
};

function formatTwd(n: number) {
  return `NT$${Math.round(n).toLocaleString("zh-TW")}`;
}

export default async function AdminOrdersPage() {
  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">請先設定 DATABASE_URL。</p>
    );
  }

  let rows;
  try {
    rows = await getRecentOrders(50);
  } catch {
    return (
      <p className="text-sm text-destructive">無法讀取訂單資料。</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">最新訂單</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          顯示最近 50 筆 <strong className="font-medium">Enrollment</strong>
          （購買紀錄），金額為課程目前特價／定價估算。
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/admin/dashboard"
            className="text-primary underline-offset-4 hover:underline"
          >
            ← 返回儀表板
          </Link>
        </p>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>時間</TableHead>
              <TableHead>學員</TableHead>
              <TableHead>課程</TableHead>
              <TableHead className="text-right">金額（估）</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  尚無購買紀錄
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("zh-TW")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.userName}</div>
                    {r.userEmail ? (
                      <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-sm">
                    {r.courseTitle}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-medium">
                    {formatTwd(r.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
