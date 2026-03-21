/** 全方位課程：多層級導覽（主分類 → 子分類連結） */
export type NavCourseChild = { label: string; href: string };
export type NavCourseGroup = {
  label: string;
  href: string;
  children: NavCourseChild[];
};

export const navCourseCategories: NavCourseGroup[] = [
  {
    label: "資訊科技",
    href: "/courses",
    children: [
      { label: "程式與開發", href: "/courses" },
      { label: "雲端與 DevOps", href: "/courses" },
      { label: "資料與 AI", href: "/courses" },
      { label: "資安與網路", href: "/courses" },
    ],
  },
  {
    label: "設計與創意",
    href: "/courses",
    children: [
      { label: "UI／UX 設計", href: "/courses" },
      { label: "視覺與品牌", href: "/courses" },
      { label: "影音與動畫", href: "/courses" },
      { label: "3D 與遊戲", href: "/courses" },
    ],
  },
  {
    label: "行銷與商務",
    href: "/courses",
    children: [
      { label: "數位行銷", href: "/courses" },
      { label: "社群與內容", href: "/courses" },
      { label: "電商與營運", href: "/courses" },
      { label: "專案與產品", href: "/courses" },
    ],
  },
  {
    label: "職場與語言",
    href: "/courses",
    children: [
      { label: "簡報與溝通", href: "/courses" },
      { label: "領導與管理", href: "/courses" },
      { label: "外語進修", href: "/courses" },
      { label: "證照與進修", href: "/courses" },
    ],
  },
];
