"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { springs, distance } from "@/lib/motion-tokens";
import { Scanner } from "@/components/Scanner";
import { ScannerResult } from "@/components/ScannerResult";
import { addItem } from "@/lib/pantry";
import { recordScan } from "@/lib/game";
import type { OFFProduct } from "@/lib/openfoodfacts";
import type { Category } from "@/lib/types";

type ScanScreen =
  | { name: "scanner" }
  | { name: "result"; product: OFFProduct }
  | { name: "done" };

export default function ScanPage() {
  const [screen, setScreen] = useState<ScanScreen>({ name: "scanner" });
  const [badges, setBadges] = useState<string[]>([]);

  const handleProduct = useCallback((product: OFFProduct) => {
    setScreen({ name: "result", product });
  }, []);

  const handleConfirm = useCallback(
    (data: {
      name: string;
      category: Category;
      afterOpenDays: number;
      openedDate?: string;
      expiryDate?: string;
    }) => {
      const current = screen;
      if (current.name !== "result") return;

      addItem({
        barcode: current.product.barcode,
        name: data.name,
        category: data.category,
        afterOpenDays: data.afterOpenDays,
        openedDate: data.openedDate,
        expiryDate: data.expiryDate,
        source: "scan",
        imageUrl: current.product.imageUrl,
        brand: current.product.brand,
      });

      const { newBadges } = recordScan("scan");
      if (newBadges.length > 0) setBadges(newBadges);
      setScreen({ name: "done" });
    },
    [screen],
  );

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col overflow-x-hidden px-4 pb-8 pt-1">
      <AnimatePresence mode="wait">
        {screen.name === "scanner" && (
          <motion.div
            key="scanner"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, y: distance.sm }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -distance.sm }}
            transition={springs.gentle}
          >
            <Scanner
              onProduct={handleProduct}
              onBack={() => window.history.back()}
            />
          </motion.div>
        )}

        {screen.name === "result" && (
          <motion.div
            key="result"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, y: distance.md }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -distance.md }}
            transition={springs.gentle}
          >
            <ScannerResult
              product={screen.product}
              onConfirm={handleConfirm}
              onRetry={() => setScreen({ name: "scanner" })}
              onBack={() => setScreen({ name: "scanner" })}
            />
          </motion.div>
        )}

        {screen.name === "done" && (
          <motion.div
            key="done"
            className="flex flex-1 flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springs.gentle}
          >
            <div className="rounded-2xl bg-ok-soft px-8 py-8 text-center">
              <p className="text-5xl">✅</p>
              <p className="mt-4 text-lg font-bold text-ok">Adicionado à dispensa!</p>
            </div>

            {badges.length > 0 && (
              <div className="rounded-2xl bg-accent-soft px-6 py-4 text-center">
                <p className="text-sm font-semibold text-accent-text">
                  Novas conquistas!
                </p>
                {badges.map((b) => (
                  <p key={b} className="mt-1 text-sm text-muted">{b}</p>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => { setScreen({ name: "scanner" }); setBadges([]); }}
                className="pressable h-12 w-full cursor-pointer rounded-xl bg-cta text-base font-semibold text-cta-on"
              >
                Escanear outro
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="pressable h-11 w-full cursor-pointer rounded-xl border border-border bg-surface text-sm font-medium text-muted hover:text-ink"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
