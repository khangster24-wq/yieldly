"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getProfile, saveProfile } from "@/lib/storage";
import { REGIONS } from "@/lib/regions";
import { EMPTY_PROFILE, type IncomeBracket, type StudentProfile } from "@/lib/types";
import { cn, formatUSD } from "@/lib/utils";

const MAJORS = [
  "Business / Finance",
  "Computer Science",
  "Engineering",
  "Biology / Pre-Med",
  "Economics",
  "Undecided",
];

/** Same mapping onboarding uses, kept in sync so edits here feed the same net-price lookups. */
function bracketForBudget(budget: number): IncomeBracket {
  if (budget <= 15000) return "0-30000";
  if (budget <= 30000) return "30001-48000";
  if (budget <= 45000) return "48001-75000";
  if (budget <= 60000) return "75001-110000";
  return "110001-plus";
}

/**
 * Edit-profile screen — the "corner where you can change your stats" the
 * onboarding flow promises. Same fields and components as onboarding, but as
 * one page instead of a step wizard, since editing existing answers doesn't
 * need the first-time-setup pacing.
 */
export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<StudentProfile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(getProfile());
    setMounted(true);
  }, []);

  const toggleRegion = (region: string) => {
    setDraft((d) => ({
      ...d,
      regions: d.regions.includes(region)
        ? d.regions.filter((r) => r !== region)
        : [...d.regions, region],
    }));
    setSaved(false);
  };

  const save = () => {
    saveProfile({
      ...draft,
      incomeBracket:
        draft.budgetCeiling != null ? bracketForBudget(draft.budgetCeiling) : null,
      completedOnboarding: true,
    });
    setSaved(true);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-dvh justify-center bg-surface sm:items-center sm:bg-[#E7EDFB] sm:p-6">
      <div className="flex h-dvh w-full flex-col overflow-y-auto bg-surface px-6 pb-8 pt-10 sm:h-[860px] sm:max-h-[92vh] sm:w-[400px] sm:rounded-[40px] sm:border sm:border-hairline sm:shadow-card-hover">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="grid size-9 shrink-0 place-items-center rounded-pill border border-hairline bg-surface-card text-navy transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-navy">Your profile</h1>
            <p className="text-xs text-muted-foreground">
              Update your stats, budget, and interests anytime.
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-7">
          <section>
            <SectionLabel>Your stats</SectionLabel>
            <div className="mt-3 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gpa">Unweighted GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="e.g. 3.8"
                  value={draft.gpa ?? ""}
                  onChange={(e) => {
                    setDraft((d) => ({
                      ...d,
                      gpa: e.target.value ? Number(e.target.value) : null,
                    }));
                    setSaved(false);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sat">SAT score</Label>
                <Input
                  id="sat"
                  type="number"
                  inputMode="numeric"
                  step="10"
                  min="400"
                  max="1600"
                  placeholder="e.g. 1380"
                  value={draft.satScore ?? ""}
                  onChange={(e) => {
                    setDraft((d) => ({
                      ...d,
                      satScore: e.target.value ? Number(e.target.value) : null,
                    }));
                    setSaved(false);
                  }}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionLabel>Your budget</SectionLabel>
            <div className="mt-3 rounded-card border border-hairline bg-surface-card p-5 shadow-card">
              <div className="mb-4 text-center">
                <span className="tabular font-heading text-3xl font-extrabold text-yieldly-blue">
                  {draft.budgetCeiling != null ? formatUSD(draft.budgetCeiling) : "$35,000"}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">/ year</span>
              </div>
              <Slider
                value={[draft.budgetCeiling ?? 35000]}
                min={0}
                max={90000}
                step={2500}
                onValueChange={([v]) => {
                  setDraft((d) => ({ ...d, budgetCeiling: v }));
                  setSaved(false);
                }}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$90k+</span>
              </div>
            </div>
          </section>

          <section>
            <SectionLabel>Your regions</SectionLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {REGIONS.map((region) => {
                const active = draft.regions.includes(region);
                return (
                  <button
                    key={region}
                    onClick={() => toggleRegion(region)}
                    className={cn(
                      "rounded-pill border px-4 py-2 font-heading text-sm font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                      active
                        ? "border-transparent bg-yieldly-blue text-white shadow-card"
                        : "border-hairline bg-surface-card text-navy hover:border-yieldly-blue/40"
                    )}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <SectionLabel>Your major</SectionLabel>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MAJORS.map((major) => {
                const active = draft.majorInterest === major;
                return (
                  <button
                    key={major}
                    onClick={() => {
                      setDraft((d) => ({ ...d, majorInterest: major }));
                      setSaved(false);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-card border px-4 py-3 text-left font-heading text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                      active
                        ? "border-yieldly-blue bg-yieldly-blue/8 text-yieldly-blue shadow-card"
                        : "border-hairline bg-surface-card text-navy hover:border-yieldly-blue/40"
                    )}
                  >
                    {major}
                    {active && <Check className="size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-8">
          <Button variant="gradient" className="w-full" onClick={save}>
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="size-4" />
                Saved
              </motion.span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-heading text-xs font-bold uppercase tracking-wide text-yieldly-coralText">
      {children}
    </span>
  );
}
