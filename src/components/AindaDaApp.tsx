"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AppHeader } from "@/components/AppHeader";
import { CheckForm } from "@/components/CheckForm";
import { HelpSheet } from "@/components/HelpSheet";
import { NotFound } from "@/components/NotFound";
import { ResultCard } from "@/components/ResultCard";
import { ShareCard } from "@/components/ShareCard";
import { SoftUpsell } from "@/components/SoftUpsell";
import { SuggestionChips } from "@/components/SuggestionChips";
import { checkItem, popularItems } from "@/lib/match";
import { getGame } from "@/lib/game";
import { pantryCount } from "@/lib/pantry";
import type { Category, CheckOutcome, ShelfRule } from "@/lib/types";

const CUSTOM_RULES_KEY = "aindada-custom-rules";

type Screen =
  | { name: "idle"; prefill?: string }
  | { name: "result"; outcome: CheckOutcome; openedDate?: string; expiryDate?: string };

export function AindaDaApp() {
  const [screen, setScreen] = useState<Screen>({ name: "idle" });
  const [helpOpen, setHelpOpen] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [customRules, setCustomRules] = useState<ShelfRule[]>([]);
  const [mounted, setMounted] = useState(false);
  const popular = useMemo(() => popularItems(), []);

  const [scanCount, setScanCount] = useState(0);
  const [pantryItems, setPantryItems] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_RULES_KEY);
      if (saved) setCustomRules(JSON.parse(saved));
    } catch {}
  }, []);

  // Real dynamic stats
  useEffect(() => {
    setScanCount(getGame().totalScanned);
    setPantryItems(pantryCount());
  }, [screen]);

  function runCheck(payload: { query: string; openedDate?: string; expiryDate?: string }) {
    const outcome = checkItem(payload, customRules);
    setCheckCount((c) => c + 1);
    setScreen({ name: "result", outcome, openedDate: payload.openedDate, expiryDate: payload.expiryDate });
  }

  function handleManualAdd(input: {
    category: Category;
    afterOpenDays: number;
    tips: string[];
  }) {
    if (screen.name !== "result" || screen.outcome.kind !== "not_found") return;
    const query = screen.outcome.query;
    const newRule: ShelfRule = {
      id: `manual-${Date.now()}`,
      names: [query.toLowerCase()],
      label: query,
      category: input.category,
      afterOpenDays: input.afterOpenDays,
      tips: input.tips,
    };
    const updated = [newRule, ...customRules];
    try { localStorage.setItem(CUSTOM_RULES_KEY, JSON.stringify(updated)); } catch {}
    setCustomRules(updated);
    const outcome = checkItem({ query, openedDate: screen.openedDate, expiryDate: screen.expiryDate }, updated);
    setScreen({ name: "result", outcome, openedDate: screen.openedDate, expiryDate: screen.expiryDate });
  }

  function reset(prefill?: string) {
    setScreen({ name: "idle", prefill });
    setFormKey((k) => k + 1);
  }

  const showUpsell =
    checkCount >= 2 && !upsellDismissed && screen.name === "result" && screen.outcome.kind === "hit";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col overflow-x-hidden">
      <AppHeader
        onHelp={() => setHelpOpen(true)}
        showBack={screen.name === "result"}
        onBack={() => reset()}
      />

      {/* real stat bar — visible on idle */}
      {screen.name === "idle" && (
        <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-xs text-muted">
          <span>{scanCount} itens escaneados</span>
          <span className="text-border">|</span>
          <span>{pantryItems} na dispensa</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen.name === "idle" && (
          <motion.main
            key="idle"
            className="flex flex-1 flex-col px-4 pb-8"
            initial={mounted ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <section className="flex flex-col gap-3 pt-6 pb-5">
              <h1 className="text-3xl font-extrabold leading-[1.1] text-ink">
                Ainda da pra usar?
              </h1>
              <p className="text-sm text-muted">
                Digita o item. Escolhe a data. Descobre na hora.<br />
                Sem conta, sem cadastro, sem frescura.
              </p>
            </section>

            <div className="flex flex-col gap-4">
              <Link
                href="/app/scan"
                className="pressable flex h-11 items-center justify-center gap-2 border border-ink bg-white text-sm font-bold text-ink"
              >
                <span className="text-accent text-base leading-none">●</span>
                Escanear codigo de barras
              </Link>

              <CheckForm
                key={formKey}
                initialQuery={screen.prefill}
                customRules={customRules}
                onSubmit={runCheck}
              />
            </div>

            <SuggestionChips items={popular} onPick={(label) => reset(label)} />

            <p className="mt-auto pt-6 text-center text-xs text-muted/60">
              Referencia geral — duvidou? cheira.
            </p>
          </motion.main>
        )}

        {screen.name === "result" && (
          <motion.main
            key="result"
            className="flex flex-1 flex-col px-4 pb-8"
            initial={mounted ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {screen.outcome.kind === "hit" ? (
              <div className="flex flex-col gap-3 pt-4">
                <ResultCard
                  result={screen.outcome}
                  openedDate={screen.openedDate}
                  expiryDate={screen.expiryDate}
                />
                <ShareCard result={screen.outcome} />
                <AnimatePresence>
                  {showUpsell && (
                    <motion.div
                      key="upsell"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <SoftUpsell onDismiss={() => setUpsellDismissed(true)} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={() => reset()}
                  className="pressable mt-1 h-11 border border-ink bg-white text-sm font-bold text-ink"
                >
                  Checar outro item
                </button>
              </div>
            ) : (
              <NotFound
                query={screen.outcome.query}
                suggestions={screen.outcome.suggestions}
                onPick={(label) => reset(label)}
                onReset={() => reset()}
                onManualAdd={handleManualAdd}
              />
            )}
          </motion.main>
        )}
      </AnimatePresence>

      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
