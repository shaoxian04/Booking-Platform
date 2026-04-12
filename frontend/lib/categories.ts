import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  "FITNESS",
  "BEAUTY",
  "HEALTH",
  "HOME_SERVICES",
  "EDUCATION",
  "FOOD",
  "PETS",
  "WELLNESS",
  "TECH",
  "OTHER",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  FITNESS: "Fitness",
  BEAUTY: "Beauty",
  HEALTH: "Health",
  HOME_SERVICES: "Home Services",
  EDUCATION: "Education",
  FOOD: "Food",
  PETS: "Pets",
  WELLNESS: "Wellness",
  TECH: "Tech",
  OTHER: "Other",
};

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> = {
  FITNESS: { bg: "bg-emerald-100", text: "text-emerald-700" },
  BEAUTY: { bg: "bg-pink-100", text: "text-pink-700" },
  HEALTH: { bg: "bg-rose-100", text: "text-rose-700" },
  HOME_SERVICES: { bg: "bg-amber-100", text: "text-amber-700" },
  EDUCATION: { bg: "bg-sky-100", text: "text-sky-700" },
  FOOD: { bg: "bg-orange-100", text: "text-orange-700" },
  PETS: { bg: "bg-lime-100", text: "text-lime-700" },
  WELLNESS: { bg: "bg-teal-100", text: "text-teal-700" },
  TECH: { bg: "bg-indigo-100", text: "text-indigo-700" },
  OTHER: { bg: "bg-slate-100", text: "text-slate-700" },
};
