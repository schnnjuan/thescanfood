"use client";

import type { ShelfRule } from "@/lib/types";

type Props = {
  query: string;
  suggestions: ShelfRule[];
  onPick: (label: string) => void;
  onReset: () => void;
};

export function NotFound({ query, suggestions, onPick, onReset }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="motion-safe:animate-fadeInUp rounded-2xl border border-border bg-surface px-5 py-6">
        <h2 className="text-lg font-semibold text-ink">
          Não achei “{query}”.
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tenta um nome mais simples ou escolhe uma sugestão.
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="motion-safe:animate-fadeInUp delay-1 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted">Sugestões</p>
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
