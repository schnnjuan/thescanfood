"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { checkItem } from "@/lib/match";
import type { OFFProduct } from "@/lib/openfoodfacts";
import type { Category, CheckOutcome } from "@/lib/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "food", label: "Comida" },
  { value: "cosmetic", label: "Cosmetico" },
  { value: "medicine", label: "Farmacia" },
  { value: "cleaning", label: "Limpeza" },
  { value: "other", label: "Outro" },
];

const OPEN_PRESETS = [
  { label: "Hoje", offset: 0 },
  { label: "Ontem", offset: -1 },
  { label: "Semana", offset: -7 },
  { label: "Mes", offset: -30 },
];

const EXPIRY_PRESETS = [
  { label: "1 mes", offset: 30 },
  { label: "3 meses", offset: 90 },
  { label: "6 meses", offset: 180 },
  { label: "1 ano", offset: 365 },
];

const DAY_MS = 86400000;

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  product: OFFProduct;
  onConfirm: (data: {
    name: string;
    category: Category;
    afterOpenDays: number;
    openedDate?: string;
    expiryDate?: string;
  }) => void;
  onRetry: () => void;
  onBack: () => void;
};

const stripColor: Record<string, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
};

export function ScannerResult({ product, onConfirm, onRetry, onBack }: Props) {
  const { user } = useAuth();
  const [cat, setCat] = useState<Category>(product.category as Category || "food");
  const [days, setDays] = useState("7");
  const [openedDate, setOpenedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const now = new Date();

  const preview: CheckOutcome | null = useMemo(() => {
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) return null;
    if (!openedDate && !expiryDate) return null;
    return checkItem({ query: product.name, openedDate: openedDate || undefined, expiryDate: expiryDate || undefined });
  }, [product.name, days, openedDate, expiryDate]);

  function handleConfirm() {
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) return;
    onConfirm({ name: product.name, category: cat, afterOpenDays: d, openedDate: openedDate || undefined, expiryDate: expiryDate || undefined });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="pressable cursor-pointer text-sm font-bold text-ink"
        >
          ← Voltar
        </button>
        <span className="text-sm font-bold text-ink">Confirmar</span>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        {/* product info */}
        <div className="flex items-center gap-3 border border-border bg-white px-4 py-3">
          {product.imageUrl && (
            <img src={product.imageUrl} alt="" className="h-10 w-10 border border-border object-cover shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink text-sm">{product.name}</p>
            {product.brand && <p className="text-xs text-muted">{product.brand}</p>}
          </div>
        </div>

        {/* categoria */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-ink">Categoria</label>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCat(c.value)}
                className={`pressable h-8 px-3 text-xs font-bold ${
                  cat === c.value
                    ? "bg-ink text-white"
                    : "border border-border bg-white text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* dias apos abrir */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-ink">Dias apos abrir</label>
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="h-11 border border-border bg-white px-3 text-sm text-ink"
          />
        </div>

        {/* data abertura */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-ink">
            Data de abertura <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input
            type="date"
            value={openedDate}
            onChange={(e) => setOpenedDate(e.target.value)}
            className="h-11 border border-border bg-white px-3 text-sm text-ink"
          />
          <div className="grid grid-cols-4 gap-1">
            {OPEN_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setOpenedDate(iso(new Date(now.getTime() + p.offset * DAY_MS)))}
className={`pressable h-8 text-xs font-bold ${
                openedDate === iso(new Date(now.getTime() + p.offset * DAY_MS))
                    ? "bg-ink text-white"
                    : "border border-border bg-white text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* validade */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-ink">
            Validade <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="h-11 border border-border bg-white px-3 text-sm text-ink"
          />
          <div className="grid grid-cols-4 gap-1">
            {EXPIRY_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setExpiryDate(iso(new Date(now.getTime() + p.offset * DAY_MS)))}
className={`pressable h-8 text-xs font-bold ${
                expiryDate === iso(new Date(now.getTime() + p.offset * DAY_MS))
                    ? "bg-ink text-white"
                    : "border border-border bg-white text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* preview com left strip */}
        {preview && preview.kind === "hit" && (
          <div className="relative flex border border-border bg-white">
            <div className={`w-[3px] shrink-0 ${stripColor[preview.status]}`} />
            <div className="flex flex-1 items-center px-3 py-3">
              <p className="text-sm font-bold text-ink">
                {preview.statusLabel} — {preview.daysLabel}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!openedDate && !expiryDate}
          className="pressable mt-1 h-11 border border-ink bg-ink text-sm font-bold text-white disabled:opacity-40"
        >
          {user ? "Adicionar a dispensa" : "Entrar para adicionar"}
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="pressable h-11 border border-ink bg-white text-sm font-bold text-ink"
        >
          Escanear outro
        </button>
      </div>
    </div>
  );
}
