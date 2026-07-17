"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchItems } from "@/lib/match";
import type { DateMode, ShelfRule } from "@/lib/types";

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

export function CheckForm({ onSubmit, initialQuery = "" }: Props) {
  const itemId = useId();
  const dateId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [date, setDate] = useState(todayIso());
  const [mode, setMode] = useState<DateMode>("opened");
  const [hits, setHits] = useState<ShelfRule[]>([]);
  const [openList, setOpenList] = useState(false);
  const [loading, setLoading] = useState(false);
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

  function pick(rule: ShelfRule) {
    setQuery(rule.label);
    setOpenList(false);
    setHits([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || !date || loading) return;
    setOpenList(false);
    setLoading(true);
    // Use microtask so the UI paints the loading state before sync work
    queueMicrotask(() => {
      onSubmit({ query: q, date, mode });
      setLoading(false);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="relative flex flex-col gap-1.5">
        <label htmlFor={itemId} className="text-sm font-medium text-ink">
          O que é?
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
            // delay so click on list registers
            setTimeout(() => setOpenList(false), 120);
          }}
          placeholder="Ex: ketchup aberto, rímel…"
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {openList && hits.length > 0 && (
          <ul
            ref={listRef}
            className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-surface shadow-sm"
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
                  <span className="text-xs capitalize text-muted">
                    {rule.category === "food"
                      ? "comida"
                      : rule.category === "cosmetic"
                        ? "cosmético"
                        : rule.category === "medicine"
                          ? "farmácia"
                          : rule.category === "cleaning"
                            ? "limpeza"
                            : rule.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Tipo de data</legend>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1">
          {(
            [
              ["opened", "Data de abertura"],
              ["expiry", "Validade"],
            ] as const
          ).map(([value, label]) => {
            const active = mode === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`h-10 cursor-pointer rounded-lg text-sm font-medium transition-colors ${
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
      </fieldset>

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
        <p className="text-xs text-muted">
          {mode === "opened"
            ? "Dia que abriu a embalagem"
            : "Data impressa na embalagem"}
        </p>
      </div>

      <button
        type="submit"
        className="h-12 w-full cursor-pointer rounded-xl bg-cta text-base font-semibold text-cta-on transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
        disabled={!query.trim() || !date || loading}
      >
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-[pulse_800ms_ease-in-out_infinite]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-[pulse_800ms_ease-in-out_200ms_infinite]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-[pulse_800ms_ease-in-out_400ms_infinite]" />
          </span>
        ) : (
          "Checar se ainda dá"
        )}
      </button>
    </form>
  );
}
