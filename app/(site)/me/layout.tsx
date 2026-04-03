import { MeSubnav } from "@/components/me/me-subnav";

export default function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <MeSubnav />
      {children}
    </div>
  );
}
