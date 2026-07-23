"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LogoIcon } from "@/components/brand/logo";
import { getProfile } from "@/lib/storage";

/**
 * First-time visitors go to onboarding (so their GPA/SAT/budget/major
 * personalize risk + ROI from the very first card); returning visitors go
 * straight to Discover. The check has to run client-side since the profile
 * lives in localStorage, not on the server — which is also why this lives in
 * its own client component rather than directly in app/page.tsx: a root
 * page.tsx with "use client" trips a Next.js 14.2 static-export bug
 * (PageNotFoundError: Cannot find module for page: /_document) that a plain
 * server page.tsx rendering this child component avoids.
 */
export function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const profile = getProfile();
    router.replace(profile.completedOnboarding ? "/discover" : "/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface">
      <LogoIcon size={56} priority />
    </div>
  );
}
