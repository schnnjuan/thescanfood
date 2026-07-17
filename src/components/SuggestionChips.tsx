"use client";

import type { ShelfRule } from "@/lib/types";

type Props = {
  items: ShelfRule[];
  onPick: (label: string) => void;
};

export function SuggestionChips({ items, onPick }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted">Mais buscados</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item.label)}
            className="h-10 cursor-pointer rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft motion-safe:active:animate-press"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
