import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 避免 Turbopack 打包到過期／不完整的 Prisma Client，導致 prisma.banner 等 delegate 為 undefined
  serverExternalPackages: ["@prisma/client", "prisma"],
  // next/image 遠端圖需白名單；種子／課程封面使用 Unsplash；後台若貼其他 HTTPS 網址請補 hostname
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
