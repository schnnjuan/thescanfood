"use client";

import { useState } from "react";
import type { Category, ShelfRule } from "@/lib/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "food", label: "Comida/bebida" },
  { value: "cosmetic", label: "Cosmetico/higiene" },
  { value: "medicine", label: "Farmacia/remedio" },
  { value: "cleaning", label: "Limpeza" },
  { value: "other", label: "Outro" },
];

type Props = {
  query: string;
  suggestions: ShelfRule[];
  onPick: (label: string) => void;
  onReset: () => void;
  onManualAdd: (input: {
    category: Category;
    afterOpenDays: number;
    tips: string[];
  }) => void;
};

export function NotFound({
  query,
  suggestions,
  onPick,
  onReset,
  onManualAdd,
}: Props) {
  const [showManual, setShowManual] = useState(false);
  const [cat, setCat] = useState<Category>("other");
  const [days, setDays] = useState("");
  const [tips, setTips] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) return;
    onManualAdd({ category: cat, afterOpenDays: d, tips: tips ? [tips] : [] });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="motion-safe:animate-fadeInUp rounded-2xl border border-border bg-surface px-5 py-6">
        <h2 className="text-lg font-semibold text-ink">
          Nao achei &quot;{query}&quot;.
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tenta um nome mais simples ou adiciona manualmente.
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="motion-safe:animate-fadeInUp delay-1 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted">Sugestoes</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onPick(s.label)}
                className="pressable h-10 cursor-pointer rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-ink hover:border-accent hover:bg-accent-soft"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showManual ? (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="pressable motion-safe:animate-fadeInUp delay-2 h-11 w-full cursor-pointer rounded-xl border border-dashed border-border bg-surface text-sm font-medium text-accent hover:bg-accent-soft"
        >
          + Adicionar manualmente
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="motion-safe:animate-fadeInUp delay-2 flex flex-col gap-4 rounded-2xl border border-border bg-surface px-5 py-5"
        >
          <p className="text-sm font-semibold text-ink">
            Adicionar &quot;{query}&quot;
          </p>

          <div className="flex flex-wrap gap-2">
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Dias apos abrir
            </label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="ex: 7"
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Dica (opcional)
            </label>
            <input
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="ex: Guardar na geladeira"
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="pressable h-11 flex-1 cursor-pointer rounded-xl bg-cta text-sm font-semibold text-cta-on disabled:opacity-40"
              disabled={!days || parseInt(days) < 1}
            >
              Adicionar e checar
            </button>
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="pressable h-11 cursor-pointer rounded-xl border border-border bg-surface px-4 text-sm font-medium text-muted hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <button
        type="button"
        onClick={onReset}
        className="pressable h-12 cursor-pointer rounded-xl border border-border bg-surface text-sm font-semibold text-ink hover:bg-accent-soft"
      >
        Tentar outra busca
      </button>
    </div>
  );
}
