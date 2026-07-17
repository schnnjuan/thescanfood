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
import { springs, distance } from "@/lib/motion-tokens";
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

  // SSR guard: marca como montado pra animacoes so no client
  useEffect(() => {
    setMounted(true);
  }, []);

  // load custom rules from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_RULES_KEY);
      if (saved) setCustomRules(JSON.parse(saved));
    } catch {}
  }, []);

  function runCheck(payload: { query: string; openedDate?: string; expiryDate?: string }) {
    const outcome = checkItem(payload, customRules);
    setCheckCount((c) => c + 1);
    setScreen({
      name: "result",
      outcome,
      openedDate: payload.openedDate,
      expiryDate: payload.expiryDate,
    });
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
    try {
      localStorage.setItem(CUSTOM_RULES_KEY, JSON.stringify(updated));
    } catch {}
    setCustomRules(updated);

    // re-check with same dates + new rule
    const outcome = checkItem(
      {
        query,
        openedDate: screen.openedDate,
        expiryDate: screen.expiryDate,
      },
      updated,
    );
    setScreen({ name: "result", outcome, openedDate: screen.openedDate, expiryDate: screen.expiryDate });
  }

  function reset(prefill?: string) {
    setScreen({ name: "idle", prefill });
    setFormKey((k) => k + 1);
  }

  const showUpsell =
    checkCount >= 2 &&
    !upsellDismissed &&
    screen.name === "result" &&
    screen.outcome.kind === "hit";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col overflow-x-hidden px-4 pb-8 pt-1">
      <AppHeader
        onHelp={() => setHelpOpen(true)}
        showBack={screen.name === "result"}
        onBack={() => reset()}
      />

      <AnimatePresence mode="wait">
        {screen.name === "idle" && (
          <motion.main
            key="idle"
            className="flex flex-1 flex-col gap-6 pt-6"
            initial={mounted ? { opacity: 0, y: distance.sm } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -distance.sm }}
            transition={springs.gentle}
          >
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-ink">
                Ainda da pra usar?
              </h1>
              <p className="mt-2 text-sm text-muted">
                Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda presta.
              </p>
              <Link
                href="/app/scan"
                className="pressable mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-accent/30 bg-accent-soft text-sm font-medium text-accent-text hover:bg-accent hover:text-white"
              >
                📸 Escanear código de barras
              </Link>
            </div>

            <CheckForm
              key={formKey}
              initialQuery={screen.prefill}
              customRules={customRules}
              onSubmit={runCheck}
            />

            <SuggestionChips
              items={popular}
              onPick={(label) => reset(label)}
            />

            <p className="text-center text-xs text-muted">
              AindaDa — quando nao tem certeza, cheira. Referencia geral, rotulo e bom senso mandam.
            </p>
          </motion.main>
        )}

        {screen.name === "result" && (
          <motion.main
            key="result"
            className="flex flex-1 flex-col gap-4 pt-2"
            initial={mounted ? { opacity: 0, y: distance.lg } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -distance.lg }}
            transition={springs.gentle}
          >
            {screen.outcome.kind === "hit" ? (
              <>
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
                      initial={{ opacity: 0, y: distance.md, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -distance.sm, scale: 0.95 }}
                      transition={springs.snappy}
                    >
                      <SoftUpsell onDismiss={() => setUpsellDismissed(true)} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  type="button"
                  onClick={() => reset()}
                  className="pressable h-11 w-full cursor-pointer text-sm font-medium text-muted hover:text-ink"
                  initial={{ opacity: 0, y: distance.sm }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springs.snappy, delay: 0.15 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Checar outro item
                </motion.button>
              </>
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
