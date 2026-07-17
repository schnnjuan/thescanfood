"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { fetchByBarcode } from "@/lib/openfoodfacts";
import type { OFFProduct } from "@/lib/openfoodfacts";

type Props = {
  onProduct: (product: OFFProduct) => void;
  onBack: () => void;
};

const SCANNER_ID = "aindada-scanner";

export function Scanner({ onProduct, onBack }: Props) {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          // barcode detected
          setScanning(false);
          try {
            await scanner.stop();
          } catch {}
          const product = await fetchByBarcode(decodedText);
          if (product) {
            onProduct(product);
          } else {
            // barcode reconhecido mas nao achou no OFF
            onProduct({
              barcode: decodedText,
              name: decodedText,
              category: "food",
            });
          }
        },
        () => {
          // scan in progress — ignora frames sem deteccao
        },
      )
      .catch((err) => {
        setError("Camera nao disponivel ou acesso negado.");
        console.error(err);
      });

    return () => {
      try {
        scanner.stop();
      } catch {}
    };
  }, [onProduct]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="pressable cursor-pointer text-sm font-medium text-ink hover:text-accent-text"
        >
          ← Voltar
        </button>
        <span className="text-sm font-semibold text-ink">Escanear</span>
        <div className="w-14" />
      </div>

      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad-text">
            {error}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="pressable h-11 cursor-pointer rounded-xl bg-cta px-6 text-sm font-semibold text-cta-on"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col items-center justify-center">
          <div
            id={SCANNER_ID}
            className="w-full max-w-sm overflow-hidden rounded-2xl"
          />
          {scanning && (
            <p className="mt-4 text-center text-sm text-muted">
              Aponte a câmera para o código de barras
            </p>
          )}
        </div>
      )}
    </div>
  );
}
