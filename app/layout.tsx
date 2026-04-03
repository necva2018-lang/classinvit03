import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { EnvGate } from "@/components/env-gate";
import { SkipToMain } from "@/components/skip-to-main";
import { metadataBaseFromEnv } from "@/lib/site-url";
import "./globals.css";

const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: metadataBaseFromEnv(),
  title: {
    default: "NECVA｜線上實戰學習平台",
    template: "%s｜NECVA",
  },
  description:
    "資訊科技、設計、行銷與數據等實戰線上課程，由業師帶你從入門到進階，學會就能用。",
  keywords: ["線上課程", "職涯進修", "NECVA", "實戰課程", "數位學習"],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "NECVA",
    title: "NECVA｜線上實戰學習平台",
    description:
      "與產業接軌的實戰課程，隨時隨地精進技能、累積可展示的成果。",
  },
  twitter: {
    card: "summary_large_image",
    title: "NECVA｜線上實戰學習平台",
    description:
      "與產業接軌的實戰課程，隨時隨地精進技能、累積可展示的成果。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0056b3" },
    { media: "(prefers-color-scheme: dark)", color: "#004494" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${notoSansTc.variable} h-full scroll-smooth antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <EnvGate>
          <SkipToMain />
          {children}
        </EnvGate>
      </body>
    </html>
  );
}
