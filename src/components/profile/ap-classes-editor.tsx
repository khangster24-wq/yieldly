"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AP_SCORE_OPTIONS, AP_SUBJECTS } from "@/lib/ap-subjects";
import type { ApClassEntry } from "@/lib/types";

/**
 * Add/remove list of AP classes + scores, shared by onboarding and the
 * profile settings screen. Feeds the course-rigor chancing signal in
 * src/lib/scoring.ts (see the comment there for the exact formula).
 */
export function ApClassesEditor({
  value,
  onChange,
}: {
  value: ApClassEntry[];
  onChange: (next: ApClassEntry[]) => void;
}) {
  const [subject, setSubject] = useState(AP_SUBJECTS[0]);
  const [score, setScore] = useState<ApClassEntry["score"]>(5);

  const add = () => {
    onChange([...value, { subject, score }]);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="AP subject"
          className="flex-1"
        >
          {AP_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={String(score)}
          onChange={(e) =>
            setScore(
              e.target.value === "pending" ? "pending" : (Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
            )
          }
          aria-label="AP score"
          className="w-[7.5rem] shrink-0"
        >
          {AP_SCORE_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={add}>
        <Plus className="size-4" />
        Add AP class
      </Button>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((ap, i) => (
            <li
              key={`${ap.subject}-${i}`}
              className="flex items-center justify-between gap-2 rounded-card border border-hairline bg-surface-card px-3.5 py-2.5 shadow-card"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-navy">
                {ap.subject}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="tabular font-heading text-sm font-bold text-yieldly-blue">
                  {ap.score === "pending" ? "Pending" : ap.score}
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${ap.subject}`}
                  className="grid size-7 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-yieldly-coral/10 hover:text-yieldly-coralText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
