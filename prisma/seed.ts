import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COURSE_FILTER_OPTIONS } from "../lib/course-filters";

const prisma = new PrismaClient();

const IMG = (path: string) =>
  `https://images.unsplash.com${path}?auto=format&fit=crop&w=800&q=80`;

const HERO_IMG = (path: string) =>
  `https://images.unsplash.com${path}?auto=format&fit=crop&w=1920&q=80`;

async function main() {
  const siteSettingDefaults: [string, string][] = [
    ["site_name", "NECVA"],
    ["site_tagline", "線上實戰學習平台"],
    [
      "footer_copy",
      `© ${new Date().getFullYear()} NECVA 示範專案。保留所有權利。`,
    ],
    ["support_email", "support@necva.local"],
    ["default_meta_title", "NECVA｜線上實戰學習平台"],
    [
      "default_meta_description",
      "資訊科技、設計、行銷與數據等實戰線上課程，由業師帶你從入門到進階。",
    ],
    ["og_image_url", ""],
    ["canonical_base_url", ""],
    ["contact_phone", ""],
    ["social_facebook_url", ""],
    ["social_instagram_url", ""],
    ["social_youtube_url", ""],
  ];

  for (const [key, value] of siteSettingDefaults) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }

  await prisma.banner.upsert({
    where: { id: "cm0seedbanner001" },
    create: {
      id: "cm0seedbanner001",
      title: "線上實戰學習，即刻累積可展示成果",
      subtitle: "資訊科技、設計、行銷與數據等主題，搭配業師案例與演練。",
      imageUrl: HERO_IMG("/photo-1526374965328-7f61d4dc18c5"),
      linkUrl: "/courses",
      linkLabel: "探索課程",
      order: 0,
      isActive: true,
    },
    update: {},
  });

  await prisma.banner.upsert({
    where: { id: "cm0seedbanner002" },
    create: {
      id: "cm0seedbanner002",
      title: "生成式 AI 與資料思維",
      subtitle: "把工具變成日常戰力，與產業需求同步。",
      imageUrl: HERO_IMG("/photo-1677442136019-21780ecad995"),
      linkUrl: "/search?q=AI",
      linkLabel: "搜尋 AI 課程",
      order: 1,
      isActive: true,
    },
    update: {},
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@necva.local" },
    create: {
      id: "cm0seeduseradmin1",
      email: "admin@necva.local",
      name: "管理員",
      role: "ADMIN",
    },
    update: { name: "管理員", role: "ADMIN" },
  });

  const demoStudentPasswordHash = await bcrypt.hash("demo1234", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@necva.local" },
    create: {
      id: "cm0seeduserstudent1",
      email: "student@necva.local",
      name: "示範學員",
      role: "STUDENT",
      passwordHash: demoStudentPasswordHash,
    },
    update: {
      name: "示範學員",
      passwordHash: demoStudentPasswordHash,
    },
  });

  const categoryIds: Record<string, string> = {};
  for (let i = 0; i < COURSE_FILTER_OPTIONS.length; i++) {
    const opt = COURSE_FILTER_OPTIONS[i];
    const id = `cm0seedcat${String(i + 1).padStart(2, "0")}`;
    // update 留空：避免日後再跑 seed 時覆寫後台已調整的類別名稱／排序
    const row = await prisma.category.upsert({
      where: { id },
      create: { id, name: opt.label, sortOrder: i },
      update: {},
    });
    categoryIds[opt.id] = row.id;
  }

  const coursePython = await prisma.course.upsert({
    where: { id: "cm0seedcoursepy001" },
    create: {
      id: "cm0seedcoursepy001",
      title: "Python 資料分析入門到實戰",
      subtitle: "pandas、視覺化與小型專題",
      description:
        "從 pandas 基礎到視覺化與小型專題，適合想用資料說話的初學者與轉職者。",
      imageUrl: IMG("/photo-1526374965328-7f61d4dc18c5"),
      price: 4800,
      discountedPrice: 2880,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.data }] },
    },
    update: {
      title: "Python 資料分析入門到實戰",
      isPublished: true,
      categories: { set: [{ id: categoryIds.data }] },
    },
  });

  await prisma.course.upsert({
    where: { id: "cm0seedcoursefig1" },
    create: {
      id: "cm0seedcoursefig1",
      title: "Figma UI 設計與元件系統實作班",
      subtitle: "元件庫與設計規格交付",
      description: "建立可重複使用的元件庫與設計規格，讓交付與協作更順暢。",
      imageUrl: IMG("/photo-1561070791-2526d30994b5"),
      price: 3600,
      discountedPrice: 2180,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.design }] },
    },
    update: {
      isPublished: true,
      categories: { set: [{ id: categoryIds.design }] },
    },
  });

  await prisma.course.upsert({
    where: { id: "cm0seedcourseads1" },
    create: {
      id: "cm0seedcourseads1",
      title: "Google Ads 與成效型廣告策略",
      subtitle: "帳戶架構與轉換追蹤",
      description: "從帳戶架構到轉換追蹤，掌握搜尋與多媒體廣告的優化節奏。",
      imageUrl: IMG("/photo-1460925895917-afdab827c52f"),
      price: 4200,
      discountedPrice: 2520,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.marketing }] },
    },
    update: {
      isPublished: true,
      categories: { set: [{ id: categoryIds.marketing }] },
    },
  });

  await prisma.course.upsert({
    where: { id: "cm0seedcourseai01" },
    create: {
      id: "cm0seedcourseai01",
      title: "生成式 AI 工作流程與提示工程",
      subtitle: "把 AI 工具串進日常流程",
      description:
        "把 ChatGPT／影像工具串進日常流程，建立可複製的提示模板與品質控管。",
      imageUrl: IMG("/photo-1677442136019-21780ecad995"),
      price: 5200,
      discountedPrice: 3280,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.ai }] },
    },
    update: {
      isPublished: true,
      categories: { set: [{ id: categoryIds.ai }] },
    },
  });

  await prisma.course.upsert({
    where: { id: "cm0seedcoursefe01" },
    create: {
      id: "cm0seedcoursefe01",
      title: "Next.js 14 App Router 全端實作班",
      subtitle: "Server Actions、RSC 與部署流程",
      description:
        "從路由與資料取得到表單與驗證，建立可上線的現代全端專案並理解渲染策略。",
      imageUrl: IMG("/photo-1633356122544-f134324a6cee"),
      price: 5800,
      discountedPrice: 3980,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.frontend }] },
    },
    update: {
      isPublished: true,
      categories: { set: [{ id: categoryIds.frontend }] },
    },
  });

  await prisma.course.upsert({
    where: { id: "cm0seedcoursecr01" },
    create: {
      id: "cm0seedcoursecr01",
      title: "高效簡報與利害關係人溝通",
      subtitle: "結構、視覺與說服節奏",
      description:
        "從聽眾分析到故事線設計，搭配簡報視覺原則，讓提案與彙報更有影響力。",
      imageUrl: IMG("/photo-1542744173-8e7e53415bb0"),
      price: 2800,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.career }] },
    },
    update: {
      isPublished: true,
      categories: { set: [{ id: categoryIds.career }] },
    },
  });

  await prisma.course.upsert({
    where: { id: "cm0seedcourseda02" },
    create: {
      id: "cm0seedcourseda02",
      title: "SQL 與商業儀表板實作工作坊",
      subtitle: "查詢、彙總到視覺化決策",
      description:
        "以真實商業情境練習 JOIN、視窗函數與儀表板指標設計，銜接營運與產品分析。",
      imageUrl: IMG("/photo-1551288049-bebda4e38f71"),
      price: 4500,
      discountedPrice: 3200,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.data }] },
    },
    update: {
      isPublished: true,
      categories: { set: [{ id: categoryIds.data }] },
    },
  });

  await prisma.course.upsert({
    where: { id: "cm0seedcoursedes2" },
    create: {
      id: "cm0seedcoursedes2",
      title: "動態影像與品牌短片剪輯實戰",
      subtitle: "Premiere 流程與節奏設計",
      description:
        "從素材整理、粗剪到調色與字幕，完成一支可上架的品牌或社群短片。",
      imageUrl: IMG("/photo-1574717024653-61fd2cf4d44d"),
      price: 3900,
      discountedPrice: 2680,
      isPublished: true,
      categories: { connect: [{ id: categoryIds.design }] },
    },
    update: {
      isPublished: true,
      categories: { set: [{ id: categoryIds.design }] },
    },
  });

  const sec1 = await prisma.section.upsert({
    where: { id: "cm0seedsectpy001" },
    create: {
      id: "cm0seedsectpy001",
      title: "第一章：環境與資料基礎",
      order: 0,
      courseId: coursePython.id,
    },
    update: { title: "第一章：環境與資料基礎", order: 0 },
  });

  const sec2 = await prisma.section.upsert({
    where: { id: "cm0seedsectpy002" },
    create: {
      id: "cm0seedsectpy002",
      title: "第二章：視覺化與專題",
      order: 1,
      courseId: coursePython.id,
    },
    update: { title: "第二章：視覺化與專題", order: 1 },
  });

  await prisma.lesson.upsert({
    where: { id: "cm0seedlespy00101" },
    create: {
      id: "cm0seedlespy00101",
      title: "1-1 安裝 Python 與 Jupyter",
      videoUrl: null,
      duration: 600,
      order: 0,
      sectionId: sec1.id,
    },
    update: {},
  });

  await prisma.lesson.upsert({
    where: { id: "cm0seedlespy00102" },
    create: {
      id: "cm0seedlespy00102",
      title: "1-2 第一筆 DataFrame",
      videoUrl: null,
      duration: 900,
      order: 1,
      sectionId: sec1.id,
    },
    update: {},
  });

  await prisma.lesson.upsert({
    where: { id: "cm0seedlespy00201" },
    create: {
      id: "cm0seedlespy00201",
      title: "2-1 圖表選擇與 matplotlib",
      videoUrl: null,
      duration: 1200,
      order: 0,
      sectionId: sec2.id,
    },
    update: {},
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: coursePython.id },
    },
    create: {
      id: "cm0seedenroll0001",
      userId: student.id,
      courseId: coursePython.id,
    },
    update: {},
  });

  void admin;
}

main()
  .then(() => console.info("Seed completed."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
