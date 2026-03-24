export type FeaturedCourse = {
  title: string;
  instructor: string;
  hours: string;
  level: string;
  tag: string;
  tint: string;
};

export const featuredCourses: FeaturedCourse[] = [
  {
    title: "Python 資料分析入門到實戰",
    instructor: "王講師",
    hours: "12 小時",
    level: "入門",
    tag: "熱銷",
    tint: "from-blue-500/20 to-necva-primary/30",
  },
  {
    title: "Figma UI 設計與元件系統",
    instructor: "李講師",
    hours: "8 小時",
    level: "初階",
    tag: "新課",
    tint: "from-orange-400/20 to-necva-accent/25",
  },
  {
    title: "Google Ads 與成效型廣告",
    instructor: "陳講師",
    hours: "10 小時",
    level: "進階",
    tag: "企業最愛",
    tint: "from-emerald-500/15 to-teal-500/25",
  },
  {
    title: "生成式 AI 工作流程實作",
    instructor: "林講師",
    hours: "6 小時",
    level: "入門",
    tag: "趨勢",
    tint: "from-violet-500/20 to-necva-primary/20",
  },
];
