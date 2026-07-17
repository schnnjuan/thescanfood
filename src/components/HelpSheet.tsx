"use client";

import { motion, AnimatePresence } from "motion/react";
import { springs, distance } from "@/lib/motion-tokens";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HelpSheet({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="help-backdrop"
            className="fixed inset-0 z-50 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="help-panel"
            className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            initial={{ opacity: 0, y: distance.xl, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: distance.xl, scale: 0.95 }}
            transition={springs.gentle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-lg">
              <h2 id="help-title" className="text-lg font-semibold text-ink">
                Antes de confiar cegamente
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Referência geral. Rótulo e bom senso mandam. Remédio: médico ou
                farmacêutico. Quando em dúvida, cheiro, textura e descarte.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 h-11 w-full cursor-pointer rounded-xl bg-cta text-sm font-semibold text-cta-on"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
