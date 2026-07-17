"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CheckForm } from "@/components/CheckForm";
import { HelpSheet } from "@/components/HelpSheet";
import { NotFound } from "@/components/NotFound";
import { ResultCard } from "@/components/ResultCard";
import { ShareCard } from "@/components/ShareCard";
import { SoftUpsell } from "@/components/SoftUpsell";
import { SuggestionChips } from "@/components/SuggestionChips";
import { checkItem, popularItems } from "@/lib/match";
import type { CheckOutcome } from "@/lib/types";

type Screen =
  | { name: "idle"; prefill?: string }
  | { name: "result"; outcome: CheckOutcome; openedDate?: string; expiryDate?: string };

export function AindaDaApp() {
  const [screen, setScreen] = useState<Screen>({ name: "idle" });
  const [helpOpen, setHelpOpen] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const popular = useMemo(() => popularItems(), []);

  function runCheck(payload: { query: string; openedDate?: string; expiryDate?: string }) {
    const outcome = checkItem(payload);
    setCheckCount((c) => c + 1);
    setScreen({
      name: "result",
      outcome,
      openedDate: payload.openedDate,
      expiryDate: payload.expiryDate,
    });
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
            />
          )}
        </main>
      )}

      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
