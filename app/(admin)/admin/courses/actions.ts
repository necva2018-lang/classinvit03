"use server";

import { randomUUID } from "node:crypto";

import { slugifyTitle } from "@/lib/slug";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseIntSafe(v: FormDataEntryValue | null, fallback = 0) {
  if (v == null || v === "") return fallback;
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseDecimal(v: FormDataEntryValue | null) {
  if (v == null || v === "") return new Prisma.Decimal("0");
  const n = Number.parseFloat(String(v));
  if (!Number.isFinite(n) || n < 0) return new Prisma.Decimal("0");
  if (n > 5) return new Prisma.Decimal("5");
  return new Prisma.Decimal(n.toFixed(1));
}

export async function createCourse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const instructorName = String(formData.get("instructorName") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  if (!title || !categoryId || !instructorName || !coverImageUrl) {
    throw new Error("請填寫標題、分類、講師與封面圖 URL");
  }

  const description =
    String(formData.get("description") ?? "").trim() || null;
  const price = parseIntSafe(formData.get("price"), 0);
  const priceOriginalRaw = formData.get("priceOriginal");
  const priceOriginal =
    priceOriginalRaw == null || priceOriginalRaw === ""
      ? null
      : parseIntSafe(priceOriginalRaw, 0);
  const reviewCount = parseIntSafe(formData.get("reviewCount"), 0);
  const slugInput = String(formData.get("slug") ?? "").trim();
  const base = slugInput || slugifyTitle(title);
  const slug = `${base}-${randomUUID().slice(0, 8)}`;

  await prisma.course.create({
    data: {
      title,
      description,
      price,
      priceOriginal,
      coverImageUrl,
      instructorName,
      rating: parseDecimal(formData.get("rating")),
      reviewCount,
      slug,
      filterTags: [],
      categoryId,
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const instructorName = String(formData.get("instructorName") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  if (!title || !categoryId || !instructorName || !coverImageUrl) {
    throw new Error("請填寫標題、分類、講師與封面圖 URL");
  }

  const description =
    String(formData.get("description") ?? "").trim() || null;
  const price = parseIntSafe(formData.get("price"), 0);
  const priceOriginalRaw = formData.get("priceOriginal");
  const priceOriginal =
    priceOriginalRaw == null || priceOriginalRaw === ""
      ? null
      : parseIntSafe(priceOriginalRaw, 0);
  const reviewCount = parseIntSafe(formData.get("reviewCount"), 0);
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugifyTitle(title);

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      description,
      price,
      priceOriginal,
      coverImageUrl,
      instructorName,
      rating: parseDecimal(formData.get("rating")),
      reviewCount,
      slug,
      categoryId,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}
