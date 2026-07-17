"use client";

import { motion, AnimatePresence } from "motion/react";

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
            className="fixed inset-0 z-50 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
          />
          <motion.div
            key="help-panel"
            className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.12 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md border border-border bg-white px-5 py-5">
              <h2 id="help-title" className="text-sm font-bold text-ink">
                O que e isso?
              </h2>
              <p className="mt-2 text-xs text-muted leading-[1.7]">
                Referencia geral. Rotulo e bom senso mandam.
              </p>
              <p className="mt-2 text-xs text-muted leading-[1.7]">
                Remedio? Medico ou farmaceutico. Nao inventa.
              </p>
              <p className="mt-2 text-xs text-muted leading-[1.7]">
                Duvidou? Cheira. Ta estranho? Joga fora.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="pressable mt-5 h-11 w-full border border-ink bg-ink text-sm font-bold text-white"
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
