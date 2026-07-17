"use client";

import type { ShelfRule } from "@/lib/types";

type Props = {
  items: ShelfRule[];
  onPick: (label: string) => void;
};

export function SuggestionChips({ items, onPick }: Props) {
  return (
    <div className="flex flex-col gap-2 pt-5">
      <p className="text-[11px] font-bold text-ink">Mais buscados</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item.label)}
            className="pressable h-8 border border-border bg-white px-3 text-xs font-bold text-ink"
            title={item.label}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
