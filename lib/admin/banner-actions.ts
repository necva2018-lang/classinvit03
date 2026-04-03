"use server";

import { prisma } from "@/lib/db";
import { isYoutubeUrl } from "@/lib/media/youtube";
import { syncEntityMediaUsages } from "@/lib/media/usage";
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
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  if (!imageUrl && !videoUrl) {
    throw new Error("請設定圖片 URL 或影片 URL（至少一項）");
  }
  // 若資料庫尚未套用 imageUrl DROP NOT NULL，不可寫 SQL NULL；有影片而無圖時改存空字串（UI 以 trim 視同無圖）
  const imageUrlForDb = imageUrl ?? (videoUrl ? "" : null);
  if (videoUrl && !isYoutubeUrl(videoUrl)) {
    throw new Error("影片網址僅接受 YouTube 連結");
  }

  const linkUrl = String(formData.get("linkUrl") ?? "").trim() || null;
  const linkLabel = String(formData.get("linkLabel") ?? "").trim() || null;
  const orderRaw = String(formData.get("order") ?? "").trim();
  const order = orderRaw === "" ? 0 : Number.parseInt(orderRaw, 10);
  if (!Number.isFinite(order)) throw new Error("排序請填整數");

  const isActive = formData.get("isActive") === "on";

  let targetId = id;
  if (id) {
    await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        imageUrl: imageUrlForDb,
        videoUrl,
        linkUrl,
        linkLabel,
        order,
        isActive,
      },
    });
  } else {
    const created = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl: imageUrlForDb,
        videoUrl,
        linkUrl,
        linkLabel,
        order,
        isActive,
      },
    });
    targetId = created.id;
  }

  if (targetId) {
    await syncEntityMediaUsages({
      entityType: "BANNER",
      entityId: targetId,
      fields: [
        { fieldPath: "imageUrl", url: imageUrlForDb },
        { fieldPath: "videoUrl", url: videoUrl },
      ],
    });
  }

  revalidateBanners();
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({ where: { id } });
  revalidateBanners();
}
