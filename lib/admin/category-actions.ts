"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

function revalidateCategoryRelated() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/courses", "layout");
  revalidatePath("/");
  revalidatePath("/courses");
}

function parseSortOrder(formData: FormData): number {
  const raw = String(formData.get("sortOrder") ?? "").trim();
  if (raw === "") return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) throw new Error("排序請填整數");
  return n;
}

export async function saveCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("請填寫類別名稱");
  const sortOrder = parseSortOrder(formData);

  try {
    if (id) {
      await prisma.category.update({
        where: { id },
        data: { name, sortOrder },
      });
    } else {
      await prisma.category.create({ data: { name, sortOrder } });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("此類別名稱已存在，請使用其他名稱");
    }
    throw e;
  }

  revalidateCategoryRelated();
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidateCategoryRelated();
}

/** 與列表順序一致：交換相鄰項目並重新編號 sortOrder（0…n-1） */
export async function moveCategory(id: string, direction: "up" | "down") {
  const list = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const i = list.findIndex((c) => c.id === id);
  if (i < 0) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;

  const reordered = [...list];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];

  await prisma.$transaction(
    reordered.map((c, idx) =>
      prisma.category.update({
        where: { id: c.id },
        data: { sortOrder: idx },
      }),
    ),
  );
  revalidateCategoryRelated();
}
