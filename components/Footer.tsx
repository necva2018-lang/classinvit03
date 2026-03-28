import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Rss,
  Twitter,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { getSiteSettingsByKeys } from "@/lib/site-queries/site-settings";
import {
  footerLanguageSwitcherOn,
  parseFooterLinkLines,
} from "@/lib/footer-nav";
import { isDatabaseConfigured } from "@/lib/env";
import { SITE_SETTING_GROUPS } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const FALLBACK_COL1: { label: string; href: string }[] = [
  { label: "線上課程", href: "/courses" },
  { label: "學習地圖", href: "#" },
  { label: "免費講座", href: "#" },
  { label: "完課認證", href: "#" },
];
const FALLBACK_COL2: { label: string; href: string }[] = [
  { label: "企業內訓", href: "#" },
  { label: "教育夥伴", href: "#" },
  { label: "徵才專區", href: "#" },
  { label: "媒體素材", href: "#" },
];
const FALLBACK_COL3: { label: string; href: string }[] = [
  { label: "常見問題", href: "#" },
  { label: "聯絡我們", href: "#" },
  { label: "服務條款", href: "#" },
  { label: "隱私權政策", href: "#" },
];

function FooterNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function PressSlot({
  logoUrl,
  quote,
}: {
  logoUrl: string | null;
  quote: string | null;
}) {
  if (!logoUrl?.trim() && !quote?.trim()) return null;
  const src = logoUrl?.trim();
  const showImg = src && /^https:\/\//i.test(src);
  return (
    <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="max-h-10 w-auto max-w-[200px] object-contain object-center md:object-left"
        />
      ) : null}
      {quote?.trim() ? (
        <p className="text-sm leading-relaxed text-zinc-500">{quote.trim()}</p>
      ) : null}
    </div>
  );
}

export async function Footer() {
  const footerKeys = SITE_SETTING_GROUPS.footer.map((f) => f.key);
  const baseKeys = [
    "site_name",
    "site_tagline",
    "footer_copy",
    "support_email",
    "contact_phone",
    "social_facebook_url",
    "social_instagram_url",
    "social_youtube_url",
    "social_twitter_url",
    "social_linkedin_url",
    "social_blog_url",
    ...footerKeys,
  ];

  let siteName = "NECVA";
  let tagline =
    "致力提供與產業接軌的線上課程，協助學員與企業共同成長。";
  let footerCopy = `© ${new Date().getFullYear()} NECVA 示範專案。保留所有權利。`;
  let supportEmail: string | null = null;
  let contactPhone: string | null = null;
  const s: Partial<Record<string, string>> = {};

  if (isDatabaseConfigured()) {
    try {
      Object.assign(s, await getSiteSettingsByKeys([...baseKeys]));
      if (s.site_name?.trim()) siteName = s.site_name.trim();
      if (s.site_tagline?.trim()) tagline = s.site_tagline.trim();
      if (s.footer_copy?.trim()) footerCopy = s.footer_copy.trim();
      if (s.support_email?.trim()) supportEmail = s.support_email.trim();
      if (s.contact_phone?.trim()) contactPhone = s.contact_phone.trim();
    } catch {
      /* ignore */
    }
  }

  const pressSlots = [
    {
      logoUrl: s.footer_press_1_logo_url?.trim() || null,
      quote: s.footer_press_1_quote?.trim() || null,
    },
    {
      logoUrl: s.footer_press_2_logo_url?.trim() || null,
      quote: s.footer_press_2_quote?.trim() || null,
    },
    {
      logoUrl: s.footer_press_3_logo_url?.trim() || null,
      quote: s.footer_press_3_quote?.trim() || null,
    },
  ];
  const showPressStrip = pressSlots.some((p) => p.logoUrl || p.quote);

  const col1Title =
    s.footer_nav_col1_title?.trim() || "課程與學習";
  const col2Title =
    s.footer_nav_col2_title?.trim() || "企業與合作";
  const col3Title = s.footer_nav_col3_title?.trim() || "支援";
  const col4Title =
    s.footer_nav_col4_title?.trim() || "與我們連結";

  const parsed1 = parseFooterLinkLines(s.footer_nav_col1_links);
  const parsed2 = parseFooterLinkLines(s.footer_nav_col2_links);
  const parsed3 = parseFooterLinkLines(s.footer_nav_col3_links);
  const col1Links = parsed1.length > 0 ? parsed1 : FALLBACK_COL1;
  const col2Links = parsed2.length > 0 ? parsed2 : FALLBACK_COL2;
  const col3Links = parsed3.length > 0 ? parsed3 : FALLBACK_COL3;

  const legalLinks = parseFooterLinkLines(s.footer_legal_links);
  const showLang = footerLanguageSwitcherOn(s.footer_show_language_switcher);

  type SocialEntry = {
    url: string;
    Icon: LucideIcon;
    label: string;
    bg: string;
  };
  const socials: SocialEntry[] = [];
  const add = (url: string | undefined, rest: Omit<SocialEntry, "url">) => {
    const u = url?.trim();
    if (u && /^https:\/\//i.test(u)) socials.push({ url: u, ...rest });
  };
  add(s.social_facebook_url, {
    Icon: Facebook,
    label: "Facebook",
    bg: "bg-[#1877f2] hover:bg-[#1877f2]/90",
  });
  add(s.social_linkedin_url, {
    Icon: Linkedin,
    label: "LinkedIn",
    bg: "bg-[#0a66c2] hover:bg-[#0a66c2]/90",
  });
  add(s.social_instagram_url, {
    Icon: Instagram,
    label: "Instagram",
    bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:opacity-95",
  });
  add(s.social_twitter_url, {
    Icon: Twitter,
    label: "X（Twitter）",
    bg: "bg-[#1d9bf0] hover:bg-[#1d9bf0]/90",
  });
  add(s.social_youtube_url, {
    Icon: Youtube,
    label: "YouTube",
    bg: "bg-[#ff0000] hover:bg-red-600",
  });
  add(s.social_blog_url, {
    Icon: Rss,
    label: "部落格",
    bg: "bg-[#ea580c] hover:bg-[#ea580c]/90",
  });

  const showSocialCol = socials.length > 0;
  const showBrandRow =
    !showSocialCol &&
    Boolean(tagline.trim() || supportEmail || contactPhone);

  return (
    <footer id="site-footer" className="border-t border-zinc-200">
      {showPressStrip ? (
        <section
          aria-label="媒體與推薦"
          className="border-b border-zinc-200 bg-white"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
            {pressSlots.map((slot, i) => (
              <PressSlot key={i} logoUrl={slot.logoUrl} quote={slot.quote} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-black text-zinc-400">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div
            className={cn(
              "grid gap-10 sm:gap-12",
              showSocialCol ? "lg:grid-cols-4" : "lg:grid-cols-3",
            )}
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                {col1Title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col1Links.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <FooterNavLink
                      href={item.href}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      {item.label}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                {col2Title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col2Links.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <FooterNavLink
                      href={item.href}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      {item.label}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                {col3Title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col3Links.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <FooterNavLink
                      href={item.href}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      {item.label}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            </div>

            {showSocialCol ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  {col4Title}
                </h3>
                <div className="mt-4 max-w-[220px]">
                  <div className="grid grid-cols-2 gap-3">
                    {socials.map(({ url, Icon, label, bg }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex size-11 items-center justify-center rounded-full text-white shadow-sm transition",
                          bg,
                        )}
                        aria-label={label}
                      >
                        <Icon className="size-5" aria-hidden />
                      </a>
                    ))}
                  </div>
                </div>
                {supportEmail || contactPhone ? (
                  <div className="mt-6 space-y-2 border-t border-zinc-800 pt-6 text-sm">
                    {supportEmail ? (
                      <p>
                        <a
                          href={`mailto:${supportEmail}`}
                          className="inline-flex items-center gap-2 text-zinc-400 transition hover:text-white"
                        >
                          <Mail className="size-4 shrink-0" aria-hidden />
                          {supportEmail}
                        </a>
                      </p>
                    ) : null}
                    {contactPhone ? (
                      <p>
                        <a
                          href={`tel:${contactPhone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-2 text-zinc-400 transition hover:text-white"
                        >
                          <Phone className="size-4 shrink-0" aria-hidden />
                          {contactPhone}
                        </a>
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                  {tagline}
                </p>
              </div>
            ) : null}
          </div>

          {showBrandRow ? (
            <div className="mt-10 border-t border-zinc-800 pt-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                {siteName}
              </h3>
              {tagline.trim() ? (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
                  {tagline}
                </p>
              ) : null}
              {supportEmail ? (
                <p className="mt-3">
                  <a
                    href={`mailto:${supportEmail}`}
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
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
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                  >
                    <Phone className="size-4 shrink-0" aria-hidden />
                    {contactPhone}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-12 border-t border-zinc-800 pt-6">
            <div className="flex flex-col gap-4 text-xs text-zinc-500 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:gap-y-2">
              <p className="whitespace-pre-line text-zinc-500">{footerCopy}</p>
              {legalLinks.length > 0 ? (
                <nav
                  className="flex flex-wrap items-center gap-x-1 gap-y-1 text-zinc-500"
                  aria-label="法律與導覽"
                >
                  {legalLinks.map((item, idx) => (
                    <span key={`${item.label}-${item.href}`} className="inline-flex items-center">
                      {idx > 0 ? (
                        <span className="mx-1.5 text-zinc-600" aria-hidden>
                          ·
                        </span>
                      ) : null}
                      <FooterNavLink
                        href={item.href}
                        className="transition hover:text-zinc-300"
                      >
                        {item.label}
                      </FooterNavLink>
                    </span>
                  ))}
                </nav>
              ) : null}
              {showLang ? (
                <div className="flex flex-col items-start gap-1 md:items-end">
                  <label className="sr-only" htmlFor="footer-lang-select">
                    介面語言
                  </label>
                  <select
                    id="footer-lang-select"
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300"
                    defaultValue="zh-TW"
                  >
                    <option value="zh-TW">繁體中文</option>
                    <option value="en">English</option>
                  </select>
                  <span className="text-[10px] text-zinc-600">
                    語言選單為版型示意
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
