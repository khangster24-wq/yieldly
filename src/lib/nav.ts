import {
  LayoutGrid,
  PieChart,
  Sparkles,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

/** The four MVP pillars — the app's only top-level destinations (scope discipline). */
export type NavSection = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short tagline used on empty-state hero copy. */
  blurb: string;
};

export const NAV_SECTIONS: NavSection[] = [
  {
    href: "/discover",
    label: "Discover",
    icon: LayoutGrid,
    blurb: "Swipe through real schools, priced and risk-rated at a glance.",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: PieChart,
    blurb: "Your college list as a balanced risk/return portfolio.",
  },
  {
    href: "/scholarships",
    label: "Scholarships",
    icon: Sparkles,
    blurb: "Real scholarships ranked by expected value, not alphabetically.",
  },
  {
    href: "/advisor",
    label: "Advisor",
    icon: MessagesSquare,
    blurb: "An AI counselor that leads with money, aid, and ROI strategy.",
  },
];
