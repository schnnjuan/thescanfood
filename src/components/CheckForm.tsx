"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    if (!query.trim()) { setHits([]); return; }
    const t = setTimeout(() => { setHits(searchItems(query, 6, customRules)); }, 150);
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
    onSubmit({ query: q, openedDate: openedDate || undefined, expiryDate: expiryDate || undefined });
  }

  const now = new Date();
  const canSubmit = query.trim() && (openedDate || expiryDate);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* item */}
      <div className="relative flex flex-col gap-1">
        <label htmlFor={itemId} className="text-[11px] font-bold text-ink">
          O que e?
        </label>
        <input
          id={itemId}
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpenList(true); }}
          onFocus={() => setOpenList(true)}
          onBlur={() => setTimeout(() => setOpenList(false), 120)}
          placeholder="Ex: ketchup, rimel, dipirona..."
          className="h-11 w-full border border-border bg-white px-3 text-sm text-ink outline-none placeholder:text-muted/50"
        />
        <AnimatePresence>
          {openList && hits.length > 0 && (
            <motion.ul
              ref={listRef}
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto border border-border bg-white"
              role="listbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {hits.map((rule) => (
                <li key={rule.id}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-accent-soft"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(rule)}
                  >
                    <span className="font-bold text-ink">{rule.label}</span>
                    <span className="text-xs text-muted">{CATEGORY_LABEL[rule.category]}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* data de abertura */}
      <div className="flex flex-col gap-1">
        <label htmlFor={openId} className="text-[11px] font-bold text-ink">
          Data de abertura <span className="font-normal text-muted">(opcional)</span>
        </label>
        <input
          id={openId}
          type="date"
          value={openedDate}
          onChange={(e) => setOpenedDate(e.target.value)}
          className="h-11 w-full border border-border bg-white px-3 text-sm text-ink"
        />
        <div className="grid grid-cols-4 gap-1">
          {openPresets.map((p) => (
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
        <label htmlFor={expId} className="text-[11px] font-bold text-ink">
          Validade <span className="font-normal text-muted">(opcional)</span>
        </label>
        <input
          id={expId}
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="h-11 w-full border border-border bg-white px-3 text-sm text-ink"
        />
        <div className="grid grid-cols-4 gap-1">
          {expiryPresets.map((p) => (
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

      <button
        type="submit"
        className="pressable mt-1 h-11 border border-ink bg-ink text-sm font-bold text-white disabled:opacity-40"
        disabled={!canSubmit}
      >
        Checar se ainda da
      </button>
    </form>
  );
}
