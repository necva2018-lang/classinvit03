import { Footer } from "@/components/Footer";
import { NavbarShell } from "@/components/navbar/NavbarShell";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { auth } from "@/auth";
import type { Session } from "next-auth";

/** 前台區段 ISR：每小時重新驗證；後台儲存後會 revalidatePath 即時刷新 */
export const revalidate = 3600;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch (err) {
    // 正式站若 AUTH_SECRET 變更、cookie 損毀或 Auth 設定異常，auth() 可能 throw 導致整頁白屏
    console.error("[site/layout] auth() 失敗，以訪客 Session 繼續渲染", err);
  }
  return (
    <AuthSessionProvider session={session}>
      <NavbarShell />
      <main
        id="main-content"
        className="flex flex-1 flex-col scroll-mt-14 focus:outline-none focus-visible:ring-2 focus-visible:ring-necva-primary/35 focus-visible:ring-offset-2 sm:scroll-mt-16"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
    </AuthSessionProvider>
  );
}
