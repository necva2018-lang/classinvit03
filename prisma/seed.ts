import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoryRows = [
  {
    id: "bbbbbbbb-0001-4000-8000-000000000001",
    name: "資訊科技",
    slug: "it",
  },
  {
    id: "bbbbbbbb-0001-4000-8000-000000000002",
    name: "設計創意",
    slug: "design",
  },
  {
    id: "bbbbbbbb-0001-4000-8000-000000000003",
    name: "行銷企劃",
    slug: "marketing",
  },
  {
    id: "bbbbbbbb-0001-4000-8000-000000000004",
    name: "人工智慧",
    slug: "ai",
  },
  {
    id: "bbbbbbbb-0001-4000-8000-000000000005",
    name: "數據分析",
    slug: "data",
  },
  {
    id: "bbbbbbbb-0001-4000-8000-000000000006",
    name: "職場軟實力",
    slug: "career",
  },
] as const;

type CatName = (typeof categoryRows)[number]["name"];

async function main() {
  for (const c of categoryRows) {
    await prisma.category.upsert({
      where: { id: c.id },
      create: { id: c.id, name: c.name, slug: c.slug },
      update: { name: c.name, slug: c.slug },
    });
  }

  const catId = Object.fromEntries(
    categoryRows.map((c) => [c.name, c.id]),
  ) as Record<CatName, string>;

  const courses: (Omit<
    Prisma.CourseUncheckedCreateInput,
    "categoryId"
  > & { categoryName: CatName })[] = [
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      categoryName: "資訊科技",
      title: "Python 資料分析入門到實戰",
      description:
        "從 pandas 基礎到視覺化與小型專題，適合想用資料說話的初學者與轉職者。",
      price: 2880,
      priceOriginal: 4800,
      coverImageUrl:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      instructorName: "王育成",
      rating: new Prisma.Decimal("4.8"),
      reviewCount: 428,
      slug: "python-data-analysis",
      filterTags: ["data", "ai"],
    },
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
      categoryName: "設計創意",
      title: "Figma UI 設計與元件系統實作班",
      description:
        "建立可重複使用的元件庫與設計規格，讓交付與協作更順暢。",
      price: 2180,
      priceOriginal: 3600,
      coverImageUrl:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
      instructorName: "李宜庭",
      rating: new Prisma.Decimal("4.9"),
      reviewCount: 312,
      slug: "figma-ui-system",
      filterTags: ["design", "frontend"],
    },
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
      categoryName: "行銷企劃",
      title: "Google Ads 與成效型廣告策略",
      description:
        "從帳戶架構到轉換追蹤，掌握搜尋與多媒體廣告的優化節奏。",
      price: 2520,
      priceOriginal: 4200,
      coverImageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      instructorName: "陳柏翰",
      rating: new Prisma.Decimal("4.7"),
      reviewCount: 189,
      slug: "google-ads-performance",
      filterTags: ["marketing"],
    },
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
      categoryName: "人工智慧",
      title: "生成式 AI 工作流程與提示工程",
      description:
        "把 ChatGPT／影像工具串進日常流程，建立可複製的提示模板與品質控管。",
      price: 3280,
      priceOriginal: 5200,
      coverImageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      instructorName: "林若辰",
      rating: new Prisma.Decimal("4.9"),
      reviewCount: 601,
      slug: "gen-ai-workflow",
      filterTags: ["ai"],
    },
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
      categoryName: "數據分析",
      title: "Excel 進階與 Power BI 視覺化儀表板",
      description:
        "資料清理、DAX 入門到互動式儀表板，讓報表一次到位。",
      price: 2340,
      priceOriginal: 3900,
      coverImageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      instructorName: "張維哲",
      rating: new Prisma.Decimal("4.6"),
      reviewCount: 256,
      slug: "excel-powerbi",
      filterTags: ["data"],
    },
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
      categoryName: "資訊科技",
      title: "Node.js 後端 API 與資料庫整合",
      description:
        "REST 設計、驗證、ORM 與部署流程，完成可上線的 API 服務。",
      price: 3480,
      priceOriginal: 5500,
      coverImageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      instructorName: "周子揚",
      rating: new Prisma.Decimal("4.8"),
      reviewCount: 174,
      slug: "nodejs-backend",
      filterTags: ["frontend", "data"],
    },
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
      categoryName: "行銷企劃",
      title: "品牌故事力：內容行銷與腳本企劃",
      description:
        "從受眾洞察到腳本結構，產出能打動人的內容與提案素材。",
      price: 1880,
      priceOriginal: 3200,
      coverImageUrl:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
      instructorName: "吳采潔",
      rating: new Prisma.Decimal("4.7"),
      reviewCount: 98,
      slug: "brand-storytelling",
      filterTags: ["marketing", "design"],
    },
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
      categoryName: "職場軟實力",
      title: "敏捷專案管理與產品路線圖實戰",
      description:
        "以敏捷思維拆解需求、排程與利害關係人溝通，適合 PM 與團隊領導者。",
      price: 2680,
      priceOriginal: 4500,
      coverImageUrl:
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
      instructorName: "鄭凱元",
      rating: new Prisma.Decimal("4.8"),
      reviewCount: 223,
      slug: "pm-agile",
      filterTags: ["career", "marketing"],
    },
  ];

  for (const row of courses) {
    const { categoryName, ...rest } = row;
    const payload: Prisma.CourseUncheckedCreateInput = {
      ...rest,
      categoryId: catId[categoryName],
    };
    await prisma.course.upsert({
      where: { id: row.id },
      create: payload,
      update: {
        title: payload.title,
        description: payload.description,
        price: payload.price,
        priceOriginal: payload.priceOriginal,
        coverImageUrl: payload.coverImageUrl,
        instructorName: payload.instructorName,
        rating: payload.rating,
        reviewCount: payload.reviewCount,
        slug: payload.slug,
        filterTags: payload.filterTags,
        categoryId: payload.categoryId,
      },
    });
  }

  const demoCourseId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01";
  const chapterSeeds = [
    {
      id: "c0000001-0000-4000-8000-000000000001",
      title: "環境建置與 pandas 入門",
      sortOrder: 0,
      summary: "本機環境、Notebook 與第一筆 DataFrame。",
      isPreviewFree: true,
    },
    {
      id: "c0000001-0000-4000-8000-000000000002",
      title: "資料清理與匯出",
      sortOrder: 1,
      summary: "缺值、型別與輸出報表。",
      isPreviewFree: false,
    },
    {
      id: "c0000001-0000-4000-8000-000000000003",
      title: "視覺化與小型專題",
      sortOrder: 2,
      summary: "圖表選擇與簡易分析專題。",
      isPreviewFree: false,
    },
  ] as const;

  for (const ch of chapterSeeds) {
    await prisma.chapter.upsert({
      where: { id: ch.id },
      create: {
        id: ch.id,
        courseId: demoCourseId,
        title: ch.title,
        sortOrder: ch.sortOrder,
        summary: ch.summary,
        isPreviewFree: ch.isPreviewFree,
      },
      update: {
        title: ch.title,
        sortOrder: ch.sortOrder,
        summary: ch.summary,
        isPreviewFree: ch.isPreviewFree,
      },
    });
  }
}

main()
  .then(() => {
    console.info("Seed completed.");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
