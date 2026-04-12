"use client";

import type { Category } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/categories";

interface CategoryPillsProps {
  categories: Category[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => {
        const colors = CATEGORY_COLORS[cat];
        return (
          <span
            key={cat}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {CATEGORY_LABELS[cat]}
          </span>
        );
      })}
    </div>
  );
}
