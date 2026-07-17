"use client";

import { useMemo } from "react";
import { pickPhrase } from "@/lib/phrases";
import type { CheckResult } from "@/lib/types";

type Props = {
  result: CheckResult;
  openedDate?: string;
  expiryDate?: string;
};

function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const stripColor: Record<string, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
};

const phraseColor: Record<string, string> = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
};

export function ResultCard({ result, openedDate, expiryDate }: Props) {
  const phrase = useMemo(
    () => pickPhrase(result.status, result.rule.category),
    [result.status, result.rule.category],
  );
  const decidingLabel = result.decidingMode === "opened" ? "abertura" : "validade";

  function dateLine(): string {
    const parts: string[] = [result.rule.label];
    if (openedDate) parts.push(`aberto ${formatDateBr(openedDate)}`);
    if (expiryDate) parts.push(`validade ${formatDateBr(expiryDate)}`);
    return parts.join(" · ");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* main card */}
      <div className="relative flex border border-border bg-white">
        <div className={`w-[3px] shrink-0 ${stripColor[result.status]}`} />

        <div className="flex flex-1 flex-col gap-2 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
              {result.status === "ok" ? "OK" : result.status === "warn" ? "ATENCAO" : "VENCIDO"}
            </span>
            <span className="text-[11px] text-muted">{result.rule.category}</span>
          </div>

          <p className="text-6xl font-extrabold leading-none text-ink">
            {result.daysRemaining < 0
              ? Math.abs(result.daysRemaining)
              : result.daysRemaining}
          </p>

          <p className="text-sm text-muted">
            {result.daysRemaining < 0
              ? Math.abs(result.daysRemaining) === 1 ? "dia vencido" : "dias vencidos"
              : result.daysRemaining === 0
                ? "usa hoje"
                : result.daysRemaining === 1
                  ? "dia restante"
                  : "dias restantes"}
          </p>

          <p className="text-xs text-muted">{dateLine()}</p>
          <p className="text-xs text-muted/50">Decisivo: {decidingLabel}</p>
        </div>
      </div>

      {/* phrase */}
      <p className={`border border-border bg-white px-4 py-3 text-sm leading-[1.6] font-bold ${phraseColor[result.status]}`}>
        {phrase}
      </p>

      {/* tips */}
      {result.rule.tips.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-ink">Dicas</p>
          <ul className="flex flex-col gap-1">
            {result.rule.tips.map((tip) => (
              <li key={tip} className="border border-border bg-white px-3 py-2 text-xs text-ink">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* disclaimer */}
      {(result.rule.category === "medicine" || result.rule.disclaimer) && (
        <p className="border border-bad bg-bad-soft px-3 py-2 text-xs text-bad">
          {result.rule.disclaimer ?? "Nao substitui orientacao medica."}
        </p>
      )}
    </div>
  );
}
