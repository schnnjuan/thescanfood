"use client";

import { useCallback, useMemo, useRef } from "react";
import { toPng } from "html-to-image";
import { StatusSemaphore } from "@/components/StatusSemaphore";
import { pickPhrase } from "@/lib/phrases";
import type { CheckResult } from "@/lib/types";

const statusLabel: Record<string, string> = {
  ok: "AINDA DA",
  warn: "ATENCAO",
  bad: "NAO DA MAIS",
};

type Props = {
  result: CheckResult;
};

export function ShareCard({ result }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const label = statusLabel[result.status];
  const phrase = useMemo(() => pickPhrase(result.status), [result.status]);
  const num = result.daysRemaining < 0 ? Math.abs(result.daysRemaining) : result.daysRemaining;
  const unit =
    result.daysRemaining <= 0
      ? Math.abs(result.daysRemaining) === 1 ? "dia" : "dias"
      : result.daysRemaining === 1 ? "dia" : "dias";

  const share = useCallback(async () => {
    if (!ref.current) return;
    try {
      const blob = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const res = await fetch(blob);
      const buf = await res.arrayBuffer();
      const file = new File([buf], "thescan-food.png", { type: "image/png" });
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "thescan.food" });
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.download = "thescan-food.png";
        a.click();
      }
    } catch {}
  }, [result]);

  const el = (
    <div
      ref={ref}
      style={{
        width: 540,
        height: 960,
        background: "#f5f5f2",
        display: "flex",
        flexDirection: "column",
        padding: "32px 40px 24px",
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 11, color: "#6b6b6b", fontWeight: 500 }}>thescan.food</div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, marginTop: -40 }}>
        <StatusSemaphore status={result.status} size="lg" />

        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#6b6b6b", marginTop: 4 }}>
          {label}
        </div>

        <div style={{ fontSize: 160, fontWeight: 700, lineHeight: 1, color: "#171717" }}>
          {num}
        </div>

        <div style={{ fontSize: 14, color: "#6b6b6b", marginTop: -8 }}>
          {unit}
        </div>

        <div style={{ fontSize: 14, color: "#6b6b6b", marginTop: 6 }}>
          {result.rule.label}
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: "#171717", marginTop: 14, textAlign: "center", maxWidth: 400 }}>
          {phrase}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "#6b6b6b" }}>
        <span style={{ fontWeight: 700 }}>thescan.food</span>
        <span>thescan.food</span>
      </div>
    </div>
  );

  return (
    <div>
      <button
        type="button"
        onClick={share}
        className="pressable h-11 w-full border border-ink bg-white text-sm font-bold text-ink"
      >
        Compartilhar
      </button>
      <div className="sr-only" aria-hidden>
        {el}
      </div>
    </div>
  );
}
