"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchItems } from "@/lib/match";
import type { Category, DateMode, ShelfRule } from "@/lib/types";

type Props = {
  onSubmit: (payload: { query: string; date: string; mode: DateMode }) => void;
  initialQuery?: string;
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MODE_HINTS: Record<Category, string> = {
  food: "Ambos servem. Validade se tiver na embalagem.",
  cosmetic: "Geralmente data de abertura (6-12 meses).",
  medicine: "Sempre validade impressa na caixa.",
  cleaning: "Ambos servem. Validade se tiver no rotulo.",
  other: "Use validade se tiver data, senao data de abertura.",
};

const CATEGORY_LABEL: Record<Category, string> = {
  food: "comida",
  cosmetic: "cosmetico",
  medicine: "farmacia",
  cleaning: "limpeza",
  other: "outro",
};

export function CheckForm({ onSubmit, initialQuery = "" }: Props) {
  const itemId = useId();
  const dateId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [date, setDate] = useState(todayIso());
  const [mode, setMode] = useState<DateMode>("opened");
  const [hits, setHits] = useState<ShelfRule[]>([]);
  const [openList, setOpenList] = useState(false);
  const [pickedCategory, setPickedCategory] = useState<Category | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      setHits(searchItems(query, 6));
    }, 150);
    return () => clearTimeout(t);
  }, [query]);

  const presets = useMemo(() => {
    const today = new Date();
    if (mode === "opened") {
      return [
        { label: "Hoje", date: fmt(today) },
        { label: "Ontem", date: fmt(new Date(today.getTime() - 86400000)) },
        { label: "Semana", date: fmt(new Date(today.getTime() - 7 * 86400000)) },
        { label: "Mes", date: fmt(new Date(today.getTime() - 30 * 86400000)) },
      ];
    }
    return [
      { label: "1 mes", date: fmt(new Date(today.getTime() + 30 * 86400000)) },
      { label: "3 meses", date: fmt(new Date(today.getTime() + 90 * 86400000)) },
      { label: "6 meses", date: fmt(new Date(today.getTime() + 180 * 86400000)) },
      { label: "1 ano", date: fmt(new Date(today.getTime() + 365 * 86400000)) },
    ];
  }, [mode]);

  function pick(rule: ShelfRule) {
    setQuery(rule.label);
    setPickedCategory(rule.category);
    setOpenList(false);
    setHits([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || !date) return;
    setOpenList(false);
    onSubmit({ query: q, date, mode });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* item input */}
      <div className="relative flex flex-col gap-1.5">
        <label htmlFor={itemId} className="text-sm font-medium text-ink">
          O que e?
        </label>
        <input
          id={itemId}
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenList(true);
          }}
          onFocus={() => setOpenList(true)}
          onBlur={() => {
            setTimeout(() => setOpenList(false), 120);
          }}
          placeholder="Ex: ketchup, rimel, dipirona..."
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {pickedCategory && !openList && (
          <p className="text-xs text-muted">{MODE_HINTS[pickedCategory]}</p>
        )}
        {openList && hits.length > 0 && (
          <ul
            ref={listRef}
            className="absolute top-full z-20 mt-1 max-h-56 w-full origin-top overflow-auto rounded-xl border border-border bg-surface shadow-sm motion-safe:animate-pop"
            role="listbox"
          >
            {hits.map((rule) => (
              <li key={rule.id}>
                <button
                  type="button"
                  role="option"
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm hover:bg-accent-soft"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(rule)}
                >
                  <span className="font-medium text-ink">{rule.label}</span>
                  <span className="text-xs text-muted">
                    {CATEGORY_LABEL[rule.category]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* mode toggle + date */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-ink">Tipo de data</legend>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1">
          {(
            [
              ["opened", "Abertura"],
              ["expiry", "Validade"],
            ] as const
          ).map(([value, label]) => {
            const active = mode === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`pressable h-10 cursor-pointer rounded-lg text-sm font-medium ${
                  active
                    ? "bg-ink text-cta-on"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={dateId} className="text-sm font-medium text-ink">
            {mode === "opened" ? "Quando abriu?" : "Qual a validade?"}
          </label>
          <input
            id={dateId}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setDate(p.date)}
                className={`pressable h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium ${
                  date === p.date
                    ? "bg-ink text-cta-on"
                    : "border border-border bg-surface text-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        className="pressable h-12 w-full cursor-pointer rounded-xl bg-cta text-base font-semibold text-cta-on hover:opacity-90 disabled:opacity-40"
        disabled={!query.trim() || !date}
      >
        Checar se ainda da
      </button>
    </form>
  );
}
