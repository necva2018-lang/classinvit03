"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseFloatOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

export async function createCourse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("請填寫課程標題");
  }

  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const cat = String(formData.get("categoryId") ?? "").trim();
  const categoryId = cat === "" ? null : cat;
  const price = parseFloatOrNull(formData.get("price"));
  const discountedPrice = parseFloatOrNull(formData.get("discountedPrice"));
  const isPublished = formData.get("isPublished") === "on";

  const created = await prisma.course.create({
    data: {
      title,
      subtitle,
      description,
      imageUrl,
      price,
      discountedPrice,
      isPublished,
      categoryId,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${created.id}`);
  redirect("/admin/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("請填寫課程標題");
  }

  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const cat = String(formData.get("categoryId") ?? "").trim();
  const categoryId = cat === "" ? null : cat;
  const price = parseFloatOrNull(formData.get("price"));
  const discountedPrice = parseFloatOrNull(formData.get("discountedPrice"));
  const isPublished = formData.get("isPublished") === "on";

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      subtitle,
      description,
      imageUrl,
      price,
      discountedPrice,
      isPublished,
      categoryId,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}
