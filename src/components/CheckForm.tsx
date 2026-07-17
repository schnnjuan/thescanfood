"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchItems } from "@/lib/match";
import type { Category, ShelfRule } from "@/lib/types";

type Props = {
  onSubmit: (payload: { query: string; openedDate?: string; expiryDate?: string }) => void;
  initialQuery?: string;
  customRules?: ShelfRule[];
};

const DAY_MS = 86400000;

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CATEGORY_LABEL: Record<Category, string> = {
  food: "comida",
  cosmetic: "cosmetico",
  medicine: "farmacia",
  cleaning: "limpeza",
  other: "outro",
};

const modeHintsInfinite: Record<Category, string> = {
  food: "",
  cosmetic: "Dica: cosmetico geralmente usa data de abertura",
  medicine: "Dica: remedio sempre usa validade",
  cleaning: "",
  other: "",
};

const openPresets = [
  { label: "Hoje", offset: 0 },
  { label: "Ontem", offset: -1 },
  { label: "Semana", offset: -7 },
  { label: "Mes", offset: -30 },
];

const expiryPresets = [
  { label: "1 mes", offset: 30 },
  { label: "3 meses", offset: 90 },
  { label: "6 meses", offset: 180 },
  { label: "1 ano", offset: 365 },
];

export function CheckForm({ onSubmit, initialQuery = "", customRules = [] }: Props) {
  const itemId = useId();
  const openId = useId();
  const expId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [openedDate, setOpenedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
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
      setHits(searchItems(query, 6, customRules));
    }, 150);
    return () => clearTimeout(t);
  }, [query, customRules]);

  function pick(rule: ShelfRule) {
    setQuery(rule.label);
    setPickedCategory(rule.category);
    setOpenList(false);
    setHits([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (!openedDate && !expiryDate) return;
    setOpenList(false);
    onSubmit({
      query: q,
      openedDate: openedDate || undefined,
      expiryDate: expiryDate || undefined,
    });
  }

  const now = new Date();
  const canSubmit = query.trim() && (openedDate || expiryDate);
  const hint = pickedCategory ? modeHintsInfinite[pickedCategory] : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* item */}
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
          onBlur={() => setTimeout(() => setOpenList(false), 120)}
          placeholder="Ex: ketchup, rimel, dipirona..."
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {hint && !openList && (
          <p className="text-xs text-muted">{hint}</p>
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

      {/* data de abertura */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={openId} className="text-sm font-medium text-ink">
          Data de abertura <span className="text-xs text-muted">(opcional)</span>
        </label>
        <input
          id={openId}
          type="date"
          value={openedDate}
          onChange={(e) => setOpenedDate(e.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex flex-wrap gap-1.5">
          {openPresets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setOpenedDate(iso(new Date(now.getTime() + p.offset * DAY_MS)))}
              className={`pressable h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium ${
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
        <label htmlFor={expId} className="text-sm font-medium text-ink">
          Validade <span className="text-xs text-muted">(opcional)</span>
        </label>
        <input
          id={expId}
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex flex-wrap gap-1.5">
          {expiryPresets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setExpiryDate(iso(new Date(now.getTime() + p.offset * DAY_MS)))}
              className={`pressable h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium ${
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

      <button
        type="submit"
        className="pressable h-12 w-full cursor-pointer rounded-xl bg-cta text-base font-semibold text-cta-on hover:opacity-90 disabled:opacity-40"
        disabled={!canSubmit}
      >
        Checar se ainda da
      </button>
    </form>
  );
}
