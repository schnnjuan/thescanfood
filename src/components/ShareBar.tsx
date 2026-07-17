"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type { CheckResult } from "@/lib/types";

type Props = {
  result: CheckResult;
};

function emoji(status: CheckResult["status"]): string {
  if (status === "ok") return "🟢";
  if (status === "warn") return "🟡";
  return "🔴";
}

export function ShareBar({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const text = `AindaDá: ${emoji(result.status)} ${result.rule.label} — ${result.statusLabel.toLowerCase()} · ${result.daysLabel}. ${result.rule.tips[0] ?? ""} aindada.app`.trim();

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "AindaDá", text });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-semibold text-ink transition-colors hover:border-accent hover:bg-accent-soft"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-ok" strokeWidth={2} />
          Copiado
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          Compartilhar resultado
        </>
      )}
    </button>
  );
}
