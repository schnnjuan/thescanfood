"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { StatusSemaphore } from "@/components/StatusSemaphore";
import { pickPhrase } from "@/lib/phrases";
import { springs, distance } from "@/lib/motion-tokens";
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
  openedDate?: string;
  expiryDate?: string;
};

function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const cardVariants = {
  hidden: { opacity: 0, y: distance.lg, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
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
    <motion.div
      className="flex flex-col gap-5"
      aria-live="polite"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={springs.gentle}
    >
      <div className={`flex flex-col items-center rounded-2xl px-6 py-8 text-center ${softBg[result.status]}`}>
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
          {dateLine()}
        </p>
        <p className="mt-0.5 text-xs text-muted/70">
          Decisivo: {decidingLabel}
        </p>

        <div className="mt-5 w-full border-t border-border/50 pt-4">
          <p className="text-sm font-bold leading-snug text-ink">
            {phrase}
          </p>
        </div>
      </div>

      {result.rule.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: distance.sm }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.snappy, delay: 0.1 }}
        >
          <h2 className="mb-2 text-sm font-semibold text-ink">Dicas</h2>
          <ul className="flex flex-col gap-2">
            {result.rule.tips.map((tip, i) => (
              <motion.li
                key={tip}
                initial={{ opacity: 0, x: -distance.sm }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springs.snappy, delay: 0.15 + i * 0.05 }}
                className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink"
              >
                {tip}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {(result.rule.category === "medicine" || result.rule.disclaimer) && (
        <motion.p
          initial={{ opacity: 0, y: distance.sm }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.snappy, delay: 0.25 }}
          className="rounded-xl border border-bad/30 bg-bad-soft px-3.5 py-3 text-xs leading-relaxed text-bad-text">
          {result.rule.disclaimer ??
            "Não substitui orientação médica ou o rótulo do produto."}
        </motion.p>
      )}
    </motion.div>
  );
}
