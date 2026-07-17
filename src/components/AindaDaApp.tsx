"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CheckForm } from "@/components/CheckForm";
import { HelpSheet } from "@/components/HelpSheet";
import { NotFound } from "@/components/NotFound";
import { ResultCard } from "@/components/ResultCard";
import { ShareCard } from "@/components/ShareCard";
import { SoftUpsell } from "@/components/SoftUpsell";
import { SuggestionChips } from "@/components/SuggestionChips";
import { checkItem, popularItems } from "@/lib/match";
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
  const popular = useMemo(() => popularItems(), []);

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
      names: [query.toLowerCase(), ...query.toLowerCase().split(" ")],
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
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-8 pt-1">
      <AppHeader
        onHelp={() => setHelpOpen(true)}
        showBack={screen.name === "result"}
        onBack={() => reset()}
      />

      {screen.name === "idle" && (
        <main className="flex flex-1 flex-col gap-6 pt-6 motion-safe:animate-fadeIn">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-ink">
              Ainda da pra usar?
            </h1>
            <p className="mt-2 text-sm text-muted">
              Comida vencida, cosmetico abandonado, remedio esquecido. Descobre em 3 segundos se ainda presta.
            </p>
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
        </main>
      )}

      {screen.name === "result" && (
        <main className="flex flex-1 flex-col gap-4 pt-2 motion-safe:animate-fadeIn">
          {screen.outcome.kind === "hit" ? (
            <>
              <ResultCard
                result={screen.outcome}
                openedDate={screen.openedDate}
                expiryDate={screen.expiryDate}
              />

              <ShareCard result={screen.outcome} />
              {showUpsell && (
                <div className="motion-safe:animate-fadeInUp delay-2">
                  <SoftUpsell onDismiss={() => setUpsellDismissed(true)} />
                </div>
              )}
              <button
                type="button"
                onClick={() => reset()}
                className="pressable motion-safe:animate-fadeInUp delay-3 h-11 w-full cursor-pointer text-sm font-medium text-muted hover:text-ink"
              >
                Checar outro item
              </button>
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
        </main>
      )}

      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
