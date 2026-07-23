"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LogoIcon } from "@/components/brand/logo";
import { saveProfile } from "@/lib/storage";
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

/** Map the budget slider to the College Scorecard income brackets for net-price lookups. */
function bracketForBudget(budget: number): IncomeBracket {
  if (budget <= 15000) return "0-30000";
  if (budget <= 30000) return "30001-48000";
  if (budget <= 45000) return "48001-75000";
  if (budget <= 60000) return "75001-110000";
  return "110001-plus";
}

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<StudentProfile>(EMPTY_PROFILE);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const finish = () => {
    saveProfile({
      ...draft,
      incomeBracket:
        draft.budgetCeiling != null ? bracketForBudget(draft.budgetCeiling) : null,
      completedOnboarding: true,
    });
    router.push("/discover");
  };

  const skip = () => {
    saveProfile({ ...EMPTY_PROFILE, completedOnboarding: true });
    router.push("/discover");
  };

  const toggleRegion = (region: string) => {
    setDraft((d) => ({
      ...d,
      regions: d.regions.includes(region)
        ? d.regions.filter((r) => r !== region)
        : [...d.regions, region],
    }));
  };

  return (
    <div className="flex min-h-dvh justify-center bg-surface sm:items-center sm:bg-[#E7EDFB] sm:p-6">
      <div className="flex h-dvh w-full flex-col overflow-y-auto bg-surface px-6 pb-8 pt-10 sm:h-[860px] sm:max-h-[92vh] sm:w-[400px] sm:rounded-[40px] sm:border sm:border-hairline sm:shadow-card-hover">
        {/* Header: brand + progress */}
        <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon size={28} priority />
          <span className="font-heading text-lg font-extrabold lowercase text-navy">
            yieldly
          </span>
        </div>
        <button
          onClick={skip}
          className="rounded-md text-sm font-heading font-semibold text-muted-foreground transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Skip
        </button>
      </div>

      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Steps */}
      <div className="relative mt-8 flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            {step === 0 && (
              <StepShell
                eyebrow="Your stats"
                title="What are your numbers?"
                sub="We use these to estimate your admission odds — your 'risk' on each school. Skip any you don't have."
              >
                <div className="space-y-5">
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
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          gpa: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
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
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          satScore: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Out of 1600. Leave blank if you&apos;re test-optional.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ib">IB score</Label>
                    <Input
                      id="ib"
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min="0"
                      max="45"
                      placeholder="e.g. 38"
                      value={draft.ibScore ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          ibScore: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Out of 45 (predicted or final). Leave blank if you&apos;re not on the IB Diploma track.
                    </p>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 1 && (
              <StepShell
                eyebrow="Your budget"
                title="What can you spend a year?"
                sub="Net price — what you'd actually pay after aid, not the sticker. This anchors every ROI estimate."
              >
                <div className="rounded-card border border-hairline bg-surface-card p-5 shadow-card">
                  <div className="mb-4 text-center">
                    <span className="tabular font-heading text-3xl font-extrabold text-yieldly-blue">
                      {draft.budgetCeiling != null
                        ? formatUSD(draft.budgetCeiling)
                        : "$35,000"}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">/ year</span>
                  </div>
                  <Slider
                    value={[draft.budgetCeiling ?? 35000]}
                    min={0}
                    max={90000}
                    step={2500}
                    onValueChange={([v]) =>
                      setDraft((d) => ({ ...d, budgetCeiling: v }))
                    }
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$90k+</span>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                eyebrow="Your regions"
                title="Where do you want to be?"
                sub="Pick any that appeal — we'll weight your deck toward them. Choose none for the whole country."
              >
                <div className="flex flex-wrap gap-2">
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
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                eyebrow="Your major"
                title="What are you into?"
                sub="Drives your scholarship matches and the earnings side of ROI. You can change it anytime."
              >
                <div className="grid grid-cols-2 gap-2">
                  {MAJORS.map((major) => {
                    const active = draft.majorInterest === major;
                    return (
                      <button
                        key={major}
                        onClick={() =>
                          setDraft((d) => ({ ...d, majorInterest: major }))
                        }
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
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <Button variant="outline" size="icon" onClick={() => go(step - 1)}>
            <ArrowLeft />
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button variant="gradient" className="flex-1" onClick={() => go(step + 1)}>
            Continue
            <ArrowRight />
          </Button>
        ) : (
          <Button variant="gradient" className="flex-1" onClick={finish}>
            <TrendingUp />
            Build my portfolio
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 overflow-hidden rounded-pill bg-secondary"
        >
          <motion.div
            className="h-full rounded-pill bg-yieldly-blue"
            initial={false}
            animate={{ width: i <= step ? "100%" : "0%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      ))}
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="font-heading text-xs font-bold uppercase tracking-wide text-yieldly-coralText">
        {eyebrow}
      </span>
      <h1 className="mt-1 text-2xl font-extrabold text-navy">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
