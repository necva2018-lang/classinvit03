import {
  Facebook,
  GraduationCap,
  Instagram,
  Mail,
  Phone,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { getSiteSettingsByKeys } from "@/lib/site-queries/site-settings";
import { isDatabaseConfigured } from "@/lib/env";

const columns = [
  {
    title: "課程與學習",
    links: ["線上課程", "學習地圖", "免費講座", "完課認證"],
  },
  {
    title: "企業與合作",
    links: ["企業內訓", "教育夥伴", "徵才專區", "媒體素材"],
  },
  {
    title: "支援",
    links: ["常見問題", "聯絡我們", "服務條款", "隱私權政策"],
  },
] as const;

export async function Footer() {
  let siteName = "NECVA";
  let tagline =
    "致力提供與產業接軌的線上課程，協助學員與企業共同成長。";
  let footerCopy = `© ${new Date().getFullYear()} NECVA 示範專案。保留所有權利。`;
  let supportEmail: string | null = null;
  let contactPhone: string | null = null;
  let socialFacebook: string | null = null;
  let socialInstagram: string | null = null;
  let socialYoutube: string | null = null;

  if (isDatabaseConfigured()) {
    try {
      const s = await getSiteSettingsByKeys([
        "site_name",
        "site_tagline",
        "footer_copy",
        "support_email",
        "contact_phone",
        "social_facebook_url",
        "social_instagram_url",
        "social_youtube_url",
      ]);
      if (s.site_name?.trim()) siteName = s.site_name.trim();
      if (s.site_tagline?.trim()) tagline = s.site_tagline.trim();
      if (s.footer_copy?.trim()) footerCopy = s.footer_copy.trim();
      if (s.support_email?.trim()) supportEmail = s.support_email.trim();
      if (s.contact_phone?.trim()) contactPhone = s.contact_phone.trim();
      if (s.social_facebook_url?.trim())
        socialFacebook = s.social_facebook_url.trim();
      if (s.social_instagram_url?.trim())
        socialInstagram = s.social_instagram_url.trim();
      if (s.social_youtube_url?.trim())
        socialYoutube = s.social_youtube_url.trim();
    } catch {
      /* 資料表尚未建立等情況略過 */
    }
  }

  const socialLinks: { Icon: LucideIcon; label: string; url: string }[] = [];
  if (socialFacebook)
    socialLinks.push({
      Icon: Facebook,
      label: "Facebook",
      url: socialFacebook,
    });
  if (socialInstagram)
    socialLinks.push({
      Icon: Instagram,
      label: "Instagram",
      url: socialInstagram,
    });
  if (socialYoutube)
    socialLinks.push({ Icon: Youtube, label: "YouTube", url: socialYoutube });

  return (
    <footer
      id="site-footer"
      className="border-t border-zinc-200 bg-zinc-900 text-zinc-300"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap
                className="size-8 text-necva-accent"
                aria-hidden
              />
              <span className="text-xl font-bold text-white">{siteName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              {tagline}
            </p>
            {supportEmail ? (
              <p className="mt-3">
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-2 text-sm text-necva-accent transition hover:underline"
                >
                  <Mail className="size-4 shrink-0" aria-hidden />
                  {supportEmail}
                </a>
              </p>
            ) : null}
            {contactPhone ? (
              <p className="mt-2">
                <a
                  href={`tel:${contactPhone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-necva-accent"
                >
                  <Phone className="size-4 shrink-0" aria-hidden />
                  {contactPhone}
                </a>
              </p>
            ) : null}
            {socialLinks.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map(({ Icon, label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition hover:bg-necva-primary hover:text-white"
                    aria-label={label}
                  >
                    <Icon className="size-5" aria-hidden />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:max-w-2xl">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-zinc-400 transition hover:text-necva-accent"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-500 sm:text-left whitespace-pre-line">
          {footerCopy}
        </div>
      </div>
    </footer>
  );
}
