"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { springs, distance } from "@/lib/motion-tokens";
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

export function ScannerResult({ product, onConfirm, onRetry, onBack }: Props) {
  const [cat, setCat] = useState<Category>(product.category as Category || "food");
  const [days, setDays] = useState("7");
  const [openedDate, setOpenedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const now = new Date();

  // preview da checagem
  const preview: CheckOutcome | null = useMemo(() => {
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) return null;
    if (!openedDate && !expiryDate) return null;
    return checkItem({
      query: product.name,
      openedDate: openedDate || undefined,
      expiryDate: expiryDate || undefined,
    });
  }, [product.name, days, openedDate, expiryDate]);

  function handleConfirm() {
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) return;
    onConfirm({
      name: product.name,
      category: cat,
      afterOpenDays: d,
      openedDate: openedDate || undefined,
      expiryDate: expiryDate || undefined,
    });
  }

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
        <span className="text-sm font-semibold text-ink">Confirmar</span>
        <div className="w-14" />
      </div>

      <motion.div
        className="flex flex-col gap-5 rounded-2xl border border-border bg-surface px-5 py-5"
        initial={{ opacity: 0, y: distance.md }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.gentle}
      >
        {/* product info */}
        <div className="flex items-center gap-3">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt=""
              className="h-14 w-14 rounded-lg border border-border object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{product.name}</p>
            {product.brand && (
              <p className="text-xs text-muted">{product.brand}</p>
            )}
          </div>
        </div>

        {/* categoria */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Categoria</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCat(c.value)}
                className={`pressable h-8 cursor-pointer rounded-lg px-3 text-xs font-medium ${
                  cat === c.value
                    ? "bg-ink text-cta-on"
                    : "border border-border bg-surface text-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* dias apos abrir */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Dias apos abrir</label>
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* data abertura */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">
            Data de abertura <span className="text-muted/70">(opcional)</span>
          </label>
          <input
            type="date"
            value={openedDate}
            onChange={(e) => setOpenedDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="grid grid-cols-4 gap-1.5">
            {OPEN_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setOpenedDate(iso(new Date(now.getTime() + p.offset * DAY_MS)))}
                className={`pressable h-8 w-full cursor-pointer rounded-lg px-1 text-xs font-medium ${
                  openedDate === iso(new Date(now.getTime() + p.offset * DAY_MS))
                    ? "bg-ink text-cta-on"
                    : "border border-border bg-surface text-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* validade */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">
            Validade <span className="text-muted/70">(opcional)</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="grid grid-cols-4 gap-1.5">
            {EXPIRY_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setExpiryDate(iso(new Date(now.getTime() + p.offset * DAY_MS)))}
                className={`pressable h-8 w-full cursor-pointer rounded-lg px-1 text-xs font-medium ${
                  expiryDate === iso(new Date(now.getTime() + p.offset * DAY_MS))
                    ? "bg-ink text-cta-on"
                    : "border border-border bg-surface text-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* preview da checagem */}
        <AnimatePresence mode="wait">
          {preview && preview.kind === "hit" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springs.snappy}
              className="overflow-hidden"
            >
              <div className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                preview.status === "ok" ? "bg-ok-soft text-ok" :
                preview.status === "warn" ? "bg-warn-soft text-warn" :
                "bg-bad-soft text-bad"
              }`}>
                {preview.statusLabel} — {preview.daysLabel}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!openedDate && !expiryDate}
          className="pressable h-12 w-full cursor-pointer rounded-xl bg-cta text-base font-semibold text-cta-on disabled:opacity-40"
        >
          Adicionar à dispensa
        </button>
      </motion.div>

      <button
        type="button"
        onClick={onRetry}
        className="pressable h-11 w-full cursor-pointer rounded-xl border border-border bg-surface text-sm font-medium text-muted hover:text-ink"
      >
        Escanear outro
      </button>
    </div>
  );
}
