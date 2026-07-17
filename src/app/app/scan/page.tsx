"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Scanner } from "@/components/Scanner";
import { ScannerResult } from "@/components/ScannerResult";
import { RegistroOverlay } from "@/components/RegistroOverlay";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { getProduct, createProduct } from "@/lib/products";
import { addToPantry } from "@/lib/pantry-db";
import type { OFFProduct } from "@/lib/openfoodfacts";
import type { Category } from "@/lib/types";

type ScanScreen =
  | { name: "scanner" }
  | { name: "registering"; product: OFFProduct; xp: number }
  | { name: "result"; product: OFFProduct }
  | { name: "done" };

export default function ScanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [screen, setScreen] = useState<ScanScreen>({ name: "scanner" });
  const [showAuth, setShowAuth] = useState(false);

  const goBack = useCallback(() => router.push("/app"), [router]);

  const handleProduct = useCallback(
    async (product: OFFProduct) => {
      const existing = await getProduct(product.barcode);
      if (existing) {
        // Already in global registry → show result directly
        setScreen({ name: "result", product });
      } else {
        // New product → auto-register with OFF data
        await createProduct(product.barcode, product, user?.id);
        setScreen({ name: "registering", product, xp: 25 });
      }
    },
    [user],
  );

  const handleConfirm = useCallback(
    (data: {
      name: string;
      category: Category;
      afterOpenDays: number;
      openedDate?: string;
      expiryDate?: string;
    }) => {
      if (!user) {
        setShowAuth(true);
        return;
      }

      const current = screen;
      if (current.name !== "result" && current.name !== "done") return;

      const product =
        current.name === "result"
          ? current.product
          : null;
      if (!product) return;

      addToPantry({
        barcode: product.barcode,
        openedDate: data.openedDate,
        expiryDate: data.expiryDate,
        afterOpenDays: data.afterOpenDays,
      });
      setScreen({ name: "done" });
    },
    [user, screen],
  );

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col overflow-x-hidden">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {screen.name === "scanner" && (
        <Scanner onProduct={handleProduct} onBack={goBack} />
      )}

      {screen.name === "registering" && (
        <RegistroOverlay
          productName={screen.product.name}
          xp={screen.xp}
          onDone={() => {
            if (screen.name === "registering") {
              setScreen({ name: "result", product: screen.product });
            }
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {screen.name === "result" && (
          <div key="result" className="flex flex-1 flex-col">
            <ScannerResult
              product={screen.product}
              onConfirm={handleConfirm}
              onRetry={() => setScreen({ name: "scanner" })}
              onBack={() => setScreen({ name: "scanner" })}
            />
          </div>
        )}

        {screen.name === "done" && (
          <div
            key="done"
            className="flex flex-1 flex-col items-center justify-center gap-6 px-4"
          >
            <div className="border border-ok bg-ok-soft px-8 py-6 text-center">
              <p className="text-4xl font-extrabold text-ok">Feito!</p>
              <p className="mt-2 text-xs text-ok">
                Item adicionado a dispensa.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => setScreen({ name: "scanner" })}
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
