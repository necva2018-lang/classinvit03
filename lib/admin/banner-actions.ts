"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function revalidateBanners() {
  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  await prisma.banner.update({
    where: { id },
    data: { isActive },
  });
  revalidateBanners();
}

export async function moveBanner(id: string, direction: "up" | "down") {
  const list = await prisma.banner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  const i = list.findIndex((b) => b.id === id);
  if (i < 0) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;

  const reordered = [...list];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];

  await prisma.$transaction(
    reordered.map((b, idx) =>
      prisma.banner.update({
        where: { id: b.id },
        data: { order: idx },
      }),
    ),
  );
  revalidateBanners();
}

export async function saveBanner(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("請填寫標題");

  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!imageUrl) throw new Error("請設定圖片（上傳或貼上 URL）");

  const linkUrl = String(formData.get("linkUrl") ?? "").trim() || null;
  const linkLabel = String(formData.get("linkLabel") ?? "").trim() || null;
  const orderRaw = String(formData.get("order") ?? "").trim();
  const order = orderRaw === "" ? 0 : Number.parseInt(orderRaw, 10);
  if (!Number.isFinite(order)) throw new Error("排序請填整數");

  const isActive = formData.get("isActive") === "on";

  if (id) {
    await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        linkLabel,
        order,
        isActive,
      },
    });
  } else {
    await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        linkLabel,
        order,
        isActive,
      },
    });
  }

  revalidateBanners();
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({ where: { id } });
  revalidateBanners();
}
