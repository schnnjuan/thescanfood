"use client";

import { motion } from "motion/react";
import { springs, scale as scaleVal } from "@/lib/motion-tokens";

type Props = {
  onDismiss: () => void;
};

export function SoftUpsell({ onDismiss }: Props) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-accent-soft px-4 py-4">
      <p className="text-sm font-semibold text-accent-text">
        Salvar no armário virtual?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Histórico + alertas no Pro. Em breve.
      </p>
      <motion.button
        type="button"
        onClick={onDismiss}
        className="pressable mt-3 h-10 w-full cursor-pointer rounded-lg text-sm font-medium text-muted hover:text-ink"
        whileTap={{ scale: scaleVal.press }}
        transition={springs.instant}
      >
        Dispensar
      </motion.button>
    </div>
  );
}
