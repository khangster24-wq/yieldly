import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Shell shared by the four MVP sections. Mobile-first: full-screen flex column
 * (header · scrollable content · bottom nav). On larger screens the same column
 * is capped into a centered phone-sized frame so the mobile-first UI stays
 * proportioned instead of stretching across a wide desktop window.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-surface sm:items-center sm:bg-[#E7EDFB] sm:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-surface sm:h-[860px] sm:max-h-[92vh] sm:w-[400px] sm:rounded-[40px] sm:border sm:border-hairline sm:shadow-card-hover">
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
