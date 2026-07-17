"use client";

import { useState } from "react";
import type { Category, ShelfRule } from "@/lib/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "food", label: "Comida" },
  { value: "cosmetic", label: "Cosmetico" },
  { value: "medicine", label: "Farmacia" },
  { value: "cleaning", label: "Limpeza" },
  { value: "other", label: "Outro" },
];

type Props = {
  query: string;
  suggestions: ShelfRule[];
  onPick: (label: string) => void;
  onReset: () => void;
  onManualAdd: (input: { category: Category; afterOpenDays: number; tips: string[] }) => void;
};

export function NotFound({ query, suggestions, onPick, onReset, onManualAdd }: Props) {
  const [showManual, setShowManual] = useState(false);
  const [cat, setCat] = useState<Category>("other");
  const [days, setDays] = useState("");
  const [tipsText, setTipsText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) return;
    const tips = tipsText.split("\n").map((t) => t.trim()).filter(Boolean);
    onManualAdd({ category: cat, afterOpenDays: d, tips });
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="border border-border bg-white px-4 py-4">
        <p className="font-bold text-ink">Nao achei &ldquo;{query}&rdquo;.</p>
        <p className="mt-1 text-xs text-muted">Tenta um nome mais simples ou adiciona manualmente.</p>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-ink">Sugestoes</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onPick(s.label)}
                className="pressable h-8 border border-border bg-white px-3 text-xs font-bold text-ink"
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
          className="pressable h-11 border border-ink bg-white text-sm font-bold text-ink"
        >
          + Adicionar manualmente
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-border bg-white px-4 py-4">
          <p className="text-sm font-bold text-ink">Adicionar &ldquo;{query}&rdquo;</p>

          <div className="grid grid-cols-3 gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCat(c.value)}
                className={`pressable h-8 text-xs font-bold ${
                  cat === c.value ? "bg-ink text-white" : "border border-border bg-white text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-ink">Dias apos abrir</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="ex: 7"
              className="h-11 border border-border bg-white px-3 text-sm text-ink"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-ink">Dicas (opcional)</label>
            <textarea
              value={tipsText}
              onChange={(e) => setTipsText(e.target.value)}
              placeholder="ex: Guardar na geladeira"
              rows={2}
              className="w-full resize-none border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="pressable h-11 flex-1 border border-ink bg-ink text-sm font-bold text-white disabled:opacity-40"
              disabled={!days || parseInt(days) < 1}
            >
              Adicionar e checar
            </button>
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="pressable h-11 border border-ink bg-white px-4 text-sm font-bold text-ink"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <button
        type="button"
        onClick={onReset}
        className="pressable h-11 border border-ink bg-white text-sm font-bold text-ink"
      >
        Tentar outra busca
      </button>
    </div>
  );
}
