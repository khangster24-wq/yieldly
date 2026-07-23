import { redirect } from "next/navigation";

// Root sends users into the app. Onboarding gating is handled client-side once
// student profile collection is wired end to end; for now Discover is home.
export default function Home() {
  redirect("/discover");
}
