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
import type { CheckOutcome, DateMode } from "@/lib/types";

type Screen =
  | { name: "idle"; prefill?: string }
  | { name: "result"; outcome: CheckOutcome; date: string; mode: DateMode };

export function AindaDaApp() {
  const [screen, setScreen] = useState<Screen>({ name: "idle" });
  const [helpOpen, setHelpOpen] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const popular = useMemo(() => popularItems(), []);

  function runCheck(payload: { query: string; date: string; mode: DateMode }) {
    const outcome = checkItem(payload);
    setCheckCount((c) => c + 1);
    setScreen({
      name: "result",
      outcome,
      date: payload.date,
      mode: payload.mode,
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
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-10 pt-2">
      <AppHeader
        onHelp={() => setHelpOpen(true)}
        showBack={screen.name === "result"}
        onBack={() => reset()}
      />

      {screen.name === "idle" && (
        <main className="flex flex-1 flex-col gap-8 pt-4 motion-safe:animate-fadeIn">
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink">
              Ainda dá pra usar?
            </h1>
            <p className="mt-2 text-base text-muted">
              Item + data. Resposta na hora.
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

          <section className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-ink">Como funciona</h2>
            <ol className="mt-2 space-y-1.5 text-sm text-muted">
              <li>1. Digita o item</li>
              <li>2. Coloca a data de abertura ou validade</li>
              <li>3. Vê o semáforo e as dicas</li>
            </ol>
          </section>

          <p className="text-center text-xs text-muted">
            Referência geral — rótulo e bom senso mandam.
          </p>
        </main>
      )}

      {screen.name === "result" && (
        <main className="flex flex-1 flex-col gap-5 pt-2 motion-safe:animate-fadeIn">
          {screen.outcome.kind === "hit" ? (
            <>
              <ResultCard
                result={screen.outcome}
                date={screen.date}
                mode={screen.mode}
              />
              <ShareCard result={screen.outcome} />
              <button
                type="button"
                onClick={() => reset()}
                className="h-11 cursor-pointer text-sm font-medium text-muted hover:text-ink"
              >
                Checar outro item
              </button>
              {showUpsell && (
                <SoftUpsell onDismiss={() => setUpsellDismissed(true)} />
              )}
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
