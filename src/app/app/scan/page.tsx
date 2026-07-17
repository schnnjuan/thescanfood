"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
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
  const router = useRouter();
  const [screen, setScreen] = useState<ScanScreen>({ name: "scanner" });
  const [badges, setBadges] = useState<string[]>([]);

  const goBack = useCallback(() => router.push("/app"), [router]);
  const goToScanner = useCallback(() => setScreen({ name: "scanner" }), []);

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
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col overflow-x-hidden">
      {screen.name === "scanner" && (
        <Scanner onProduct={handleProduct} onBack={goBack} />
      )}

      <AnimatePresence mode="wait">
        {screen.name === "result" && (
          <div key="result" className="flex flex-1 flex-col">
            <ScannerResult
              product={screen.product}
              onConfirm={handleConfirm}
              onRetry={goToScanner}
              onBack={goToScanner}
            />
          </div>
        )}

        {screen.name === "done" && (
          <div key="done" className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
            <div className="border border-ok bg-ok-soft px-8 py-6 text-center">
              <p className="text-4xl font-extrabold text-ok">Feito!</p>
              <p className="mt-2 text-xs text-ok">Item adicionado a dispensa.</p>
            </div>
            {badges.length > 0 && (
              <div className="border border-border bg-white px-5 py-4 text-center">
                <p className="text-[11px] font-bold text-ink">Novas conquistas</p>
                {badges.map((b) => (
                  <p key={b} className="mt-1 text-xs text-muted">{b}</p>
                ))}
              </div>
            )}
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => { setScreen({ name: "scanner" }); setBadges([]); }}
                className="pressable h-11 w-full border border-ink bg-ink text-sm font-bold text-white"
              >
                Escanear outro
              </button>
              <button
                type="button"
                onClick={goBack}
                className="pressable h-11 w-full border border-ink bg-white text-sm font-bold text-ink"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
