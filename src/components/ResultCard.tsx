"use client";

import { useMemo } from "react";
import { StatusSemaphore } from "@/components/StatusSemaphore";
import { pickPhrase } from "@/lib/phrases";
import type { CheckResult } from "@/lib/types";

type Props = {
  result: CheckResult;
  date: string;
  mode: "opened" | "expiry";
};

function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function ResultCard({ result, date, mode }: Props) {
  const phrase = useMemo(
    () => pickPhrase(result.status, result.rule.category),
    [result.status, result.rule.category],
  );
  const modeLabel = mode === "opened" ? "aberto" : "validade";

  return (
    <div className="flex flex-col gap-5" aria-live="polite">
      <div className="flex flex-col items-center rounded-2xl px-6 py-8 text-center">
        <StatusSemaphore status={result.status} size="lg" />

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {result.statusLabel}
        </p>

        <p
          className={`mt-2 font-mono text-5xl font-semibold tabular-nums leading-none ${
            result.status === "ok"
              ? "text-ok"
              : result.status === "warn"
                ? "text-warn"
                : "text-bad"
          }`}
        >
          {result.daysRemaining < 0
            ? Math.abs(result.daysRemaining)
            : result.daysRemaining}
        </p>

        <p className="mt-1 text-sm font-medium text-muted">
          {result.daysRemaining < 0
            ? Math.abs(result.daysRemaining) === 1
              ? "dia — venceu"
              : "dias — venceu"
            : result.daysRemaining === 0
              ? "usa hoje"
              : result.daysRemaining === 1
                ? "dia restante"
                : "dias restantes"}
        </p>

        <p className="mt-3 text-sm text-muted">
          {result.rule.label} · {modeLabel} {formatDateBr(date)}
        </p>

        <p className="mt-4 text-base font-bold text-ink">{phrase}</p>
      </div>

      {result.rule.tips.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-ink">Dicas</h2>
          <ul className="flex flex-col gap-2">
            {result.rule.tips.map((tip) => (
              <li
                key={tip}
                className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(result.rule.category === "medicine" || result.rule.disclaimer) && (
        <p className="rounded-xl border border-bad/30 bg-bad-soft px-3.5 py-3 text-xs leading-relaxed text-bad-text">
          {result.rule.disclaimer ??
            "Não substitui orientação médica ou o rótulo do produto."}
        </p>
      )}
    </div>
  );
}
