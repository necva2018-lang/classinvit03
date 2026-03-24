import { isDatabaseConfigured } from "@/lib/env";
import { siteOriginFromEnv, toAbsoluteUrl } from "@/lib/seo/absolute-url";
import { getSiteSettingsByKeys } from "@/lib/site-queries/site-settings";
import type { Metadata } from "next";

const KEYS = [
  "site_name",
  "site_tagline",
  "default_meta_title",
  "default_meta_description",
  "og_image_url",
] as const;

/** 首頁 generateMetadata：後台 SiteSetting + 合理預設（TibaMe 式標題／描述／OG） */
export async function buildHomeMetadata(): Promise<Metadata> {
  const origin = siteOriginFromEnv();

  const fallbackTitle = "線上實戰學習平台";
  const fallbackDesc =
    "資訊科技、設計、行銷與數據等實戰線上課程，由業師帶你從入門到進階，學會就能用。";

  if (!isDatabaseConfigured()) {
    return homeMetadataFromParts({
      origin,
      titleAbsolute: `NECVA｜${fallbackTitle}`,
      description: fallbackDesc,
      ogImage: null,
      siteName: "NECVA",
    });
  }

  try {
    const s = await getSiteSettingsByKeys([...KEYS]);
    const siteName = s.site_name?.trim() || "NECVA";
    const tagline = s.site_tagline?.trim() || fallbackTitle;
    const metaTitle = s.default_meta_title?.trim() || `${siteName}｜${tagline}`;
    const metaDesc =
      s.default_meta_description?.trim() ||
      s.site_tagline?.trim() ||
      fallbackDesc;
    const ogRaw = s.og_image_url?.trim() || null;

    return homeMetadataFromParts({
      origin,
      titleAbsolute: metaTitle,
      description: metaDesc,
      ogImage: ogRaw,
      siteName,
    });
  } catch {
    return homeMetadataFromParts({
      origin,
      titleAbsolute: `NECVA｜${fallbackTitle}`,
      description: fallbackDesc,
      ogImage: null,
      siteName: "NECVA",
    });
  }
}

function homeMetadataFromParts(opts: {
  origin: string;
  titleAbsolute: string;
  description: string;
  ogImage: string | null;
  siteName: string;
}): Metadata {
  const { origin, titleAbsolute, description, ogImage, siteName } = opts;
  const images =
    ogImage && ogImage.length > 0
      ? [
          {
            url: toAbsoluteUrl(ogImage, origin),
            width: 1200,
            height: 630,
            alt: siteName,
          },
        ]
      : undefined;

  return {
    title: { absolute: titleAbsolute },
    description,
    alternates: { canonical: `${origin}/` },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: `${origin}/`,
      siteName,
      title: titleAbsolute,
      description,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: titleAbsolute,
      description,
      images: images?.map((i) => i.url),
    },
    robots: { index: true, follow: true },
  };
}
