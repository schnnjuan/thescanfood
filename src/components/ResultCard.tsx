"use client";

import { useMemo } from "react";
import { StatusSemaphore } from "@/components/StatusSemaphore";
import { pickPhrase } from "@/lib/phrases";
import type { CheckResult } from "@/lib/types";

const softBg: Record<string, string> = {
  ok: "bg-ok-soft",
  warn: "bg-warn-soft",
  bad: "bg-bad-soft",
};

const textColor: Record<string, string> = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
};

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
      <div className={`flex flex-col items-center rounded-2xl px-6 py-8 text-center motion-safe:animate-fadeInUp ${softBg[result.status]}`}>
        <StatusSemaphore status={result.status} size="md" />

        <p className={`mt-4 text-lg font-bold tracking-tight ${textColor[result.status]}`}>
          {result.statusLabel}
        </p>

        <p className="mt-2 font-mono text-6xl font-extrabold tabular-nums leading-none text-ink">
          {result.daysRemaining < 0
            ? Math.abs(result.daysRemaining)
            : result.daysRemaining}
        </p>

        <p className="mt-1 text-sm font-medium text-muted">
          {result.daysRemaining < 0
            ? Math.abs(result.daysRemaining) === 1
              ? "dia vencido"
              : "dias vencidos"
            : result.daysRemaining === 0
              ? "usa hoje"
              : result.daysRemaining === 1
                ? "dia restante"
                : "dias restantes"}
        </p>

        <p className="mt-3 text-sm text-muted">
          {result.rule.label} &middot; {modeLabel} {formatDateBr(date)}
        </p>

        <div className="mt-5 w-full border-t border-border/50 pt-4">
          <p className="text-sm font-bold leading-snug text-ink">
            {phrase}
          </p>
        </div>
      </div>

      {result.rule.tips.length > 0 && (
        <div className="motion-safe:animate-fadeInUp delay-1">
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
        <p className="motion-safe:animate-fadeInUp delay-2 rounded-xl border border-bad/30 bg-bad-soft px-3.5 py-3 text-xs leading-relaxed text-bad-text">
          {result.rule.disclaimer ??
            "Não substitui orientação médica ou o rótulo do produto."}
        </p>
      )}
    </div>
  );
}
