"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminCourseTableRow = {
  id: string;
  title: string;
  categoryName: string;
  ctaKind: "CART" | "SUBSIDY";
  price: number | null;
  discountedPrice: number | null;
  isPublished: boolean;
  updatedAt: string;
};

function formatMoney(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `NT$${Math.round(n).toLocaleString("zh-TW")}`;
}

export function CoursesDataTable({ data }: { data: AdminCourseTableRow[] }) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<AdminCourseTableRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: "課程名稱",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "分類",
      },
      {
        id: "price",
        header: "價格",
        cell: ({ row }) => {
          const r = row.original;
          if (r.ctaKind === "SUBSIDY") {
            return (
              <span className="text-sm text-muted-foreground">補助課（不適用）</span>
            );
          }
          const sale = r.discountedPrice ?? r.price;
          const showStrike =
            r.discountedPrice != null &&
            r.price != null &&
            r.discountedPrice < r.price;
          return (
            <div className="tabular-nums text-sm">
              {showStrike && (
                <span className="mr-2 text-muted-foreground line-through">
                  {formatMoney(r.price)}
                </span>
              )}
              <span className="font-medium">{formatMoney(sale)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "isPublished",
        header: "狀態",
        cell: ({ row }) => (
          <span
            className={
              row.original.isPublished
                ? "text-emerald-700"
                : "text-muted-foreground"
            }
          >
            {row.original.isPublished ? "已上架" : "草稿"}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "更新時間",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.original.updatedAt).toLocaleString("zh-TW")}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/admin/courses/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                尚無課程。請執行{" "}
                <code className="rounded bg-muted px-1 text-xs">prisma migrate</code>{" "}
                與 <code className="rounded bg-muted px-1 text-xs">db:seed</code>
                ，或點「新增課程」。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function NewCourseButton() {
  const router = useRouter();
  return (
    <Button type="button" onClick={() => router.push("/admin/courses/new")}>
      新增課程
    </Button>
  );
}
