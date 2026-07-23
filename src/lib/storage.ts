"use client";

import { EMPTY_PROFILE, type StudentProfile, type College } from "@/lib/types";

/**
 * Client-side persistence. For this MVP the student's profile and portfolio
 * live in localStorage (single-device, no accounts needed for a demo). These
 * helpers are the single access point so a future swap to a real backend
 * touches one file.
 */

const PROFILE_KEY = "yieldly.profile.v1";
const PORTFOLIO_KEY = "yieldly.portfolio.v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): StudentProfile {
  return readJSON<StudentProfile>(PROFILE_KEY, EMPTY_PROFILE);
}

export function saveProfile(profile: StudentProfile) {
  writeJSON(PROFILE_KEY, profile);
}

export function getPortfolio(): College[] {
  return readJSON<College[]>(PORTFOLIO_KEY, []);
}

export function savePortfolio(colleges: College[]) {
  writeJSON(PORTFOLIO_KEY, colleges);
}

export function isInPortfolio(id: number): boolean {
  return getPortfolio().some((c) => c.id === id);
}

/** Add a school to the portfolio (right swipe). No-op if already saved. */
export function addToPortfolio(college: College): College[] {
  const current = getPortfolio();
  if (current.some((c) => c.id === college.id)) return current;
  const next = [...current, college];
  savePortfolio(next);
  return next;
}

/** Remove a school (e.g. an undo). */
export function removeFromPortfolio(id: number): College[] {
  const next = getPortfolio().filter((c) => c.id !== id);
  savePortfolio(next);
  return next;
}
