import { Button } from "@/components/ui/button";
import { Megaphone, PlusCircle, Receipt } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    href: "/admin/courses/new",
    label: "快速上架新課程",
    description: "建立草稿並填寫課程資訊",
    icon: PlusCircle,
    variant: "default" as const,
  },
  {
    href: "/admin/orders",
    label: "查看最新訂單",
    description: "依購買時間瀏覽 Enrollment",
    icon: Receipt,
    variant: "secondary" as const,
  },
  {
    href: "/admin/settings",
    label: "修改首頁公告",
    description: "全站設定與頁尾／SEO 文案",
    icon: Megaphone,
    variant: "outline" as const,
  },
];

export function DashboardQuickActions() {
  return (
    <section aria-labelledby="dash-quick-actions">
      <h2
        id="dash-quick-actions"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        快捷操作
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {actions.map(({ href, label, description, icon: Icon, variant }) => (
          <Button
            key={href}
            variant={variant}
            size="lg"
            className="h-auto min-h-[5.5rem] flex-col gap-1 py-4 text-center shadow-sm"
            asChild
          >
            <Link href={href}>
              <Icon className="size-6 shrink-0 opacity-90" aria-hidden />
              <span className="text-sm font-semibold leading-tight">{label}</span>
              <span className="max-w-[14rem] text-xs font-normal text-muted-foreground">
                {description}
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
