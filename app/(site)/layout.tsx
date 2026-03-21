import { Footer } from "@/components/Footer";
import { NavbarShell } from "@/components/navbar/NavbarShell";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarShell />
      <main
        id="main-content"
        className="flex flex-1 flex-col scroll-mt-14 focus:outline-none focus-visible:ring-2 focus-visible:ring-necva-primary/35 focus-visible:ring-offset-2 sm:scroll-mt-16"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
