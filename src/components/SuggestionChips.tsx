"use client";

import { motion } from "motion/react";
import { springs, scale as scaleVal } from "@/lib/motion-tokens";
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
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onPick(item.label)}
            className="h-10 max-w-[180px] cursor-pointer truncate rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft"
            whileHover={{ scale: scaleVal.pop, borderColor: "#4f46e5" }}
            whileTap={{ scale: scaleVal.press }}
            transition={springs.snappy}
            title={item.label}
          >
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
