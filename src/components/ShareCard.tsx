"use client";

import { useCallback, useMemo, useRef } from "react";
import { toPng } from "html-to-image";
import { Share2 } from "lucide-react";
import { StatusSemaphore } from "@/components/StatusSemaphore";
import { pickPhrase } from "@/lib/phrases";
import type { CheckResult } from "@/lib/types";

const statusLabel: Record<string, string> = {
  ok: "AINDA DÁ",
  warn: "ATENÇÃO",
  bad: "NÃO DÁ MAIS",
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
      ? Math.abs(result.daysRemaining) === 1
        ? "dia"
        : "dias"
      : result.daysRemaining === 1
        ? "dia"
        : "dias";

  const share = useCallback(async () => {
    if (!ref.current) return;
    try {
      const blob = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const res = await fetch(blob);
      const buf = await res.arrayBuffer();
      const file = new File([buf], "aindada.png", { type: "image/png" });

      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "AindaDá" });
      }
      // no fallback — mobile share é o unico caminho
    } catch {
      // user cancelled or share failed — silent
    }
  }, [result]);

  const el = (
    <div
      ref={ref}
      style={{
        width: 540,
        height: 960,
        background: "#FAF9F5",
        display: "flex",
        flexDirection: "column",
        padding: "32px 40px 24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 12, color: "#5B6472", fontWeight: 500 }}>aindada.app</div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginTop: -40,
        }}
      >
        <StatusSemaphore status={result.status} size="lg" />

        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#5B6472", marginTop: 4 }}>
          {label}
        </div>

        <div style={{ fontSize: 160, fontWeight: 700, lineHeight: 1, color: "#131620", letterSpacing: "-0.04em" }}>
          {num}
        </div>

        <div style={{ fontSize: 16, fontWeight: 500, color: "#5B6472", marginTop: -8 }}>
          {unit}
        </div>

        <div style={{ fontSize: 15, color: "#5B6472", marginTop: 8 }}>
          {result.rule.label}
        </div>

        <div style={{ fontSize: 17, fontWeight: 700, color: "#131620", marginTop: 16, textAlign: "center", maxWidth: 400 }}>
          {phrase}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#5B6472" }}>
        <span style={{ fontWeight: 600 }}>AindaDá</span>
        <span>aindada.app</span>
      </div>
    </div>
  );

  return (
    <div className="motion-safe:animate-fadeInUp delay-1">
      <button
        type="button"
        onClick={share}
        className="pressable flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta text-sm font-semibold text-cta-on hover:opacity-90"
      >
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        Compartilhar no Instagram
      </button>
      <div className="sr-only" aria-hidden>
        {el}
      </div>
    </div>
  );
}
