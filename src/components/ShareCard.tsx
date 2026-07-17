"use client";

import { useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { AlertTriangle, Check, X } from "lucide-react";
import type { CheckResult } from "@/lib/types";

const statusConfig = {
  ok: {
    label: "AINDA DÁ",
    fill: "#10B981",
    Icon: Check,
  },
  warn: {
    label: "ATENÇÃO",
    fill: "#F59E0B",
    Icon: AlertTriangle,
  },
  bad: {
    label: "NÃO DÁ MAIS",
    fill: "#F43F5E",
    Icon: X,
  },
} as const;

type Props = {
  result: CheckResult;
};

export function ShareCard({ result }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const cfg = statusConfig[result.status];

  const generate = useCallback(async () => {
    if (!ref.current) return;
    const blob = await toPng(ref.current, {
      pixelRatio: 2,
      cacheBust: true,
    });
    const res = await fetch(blob);
    const buf = await res.arrayBuffer();
    const file = new File([buf], "aindada.png", { type: "image/png" });

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "AindaDá" });
    } else {
      const a = document.createElement("a");
      a.href = blob;
      a.download = "aindada.png";
      a.click();
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
        position: "relative",
      }}
    >
      <div style={{ fontSize: 12, color: "#5B6472", fontWeight: 500 }}>
        aindada.app
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, marginTop: -40 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: cfg.fill,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <cfg.Icon size={44} strokeWidth={2.5} color="white" />
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: cfg.fill, marginTop: 4 }}>
          {cfg.label}
        </div>

        <div style={{ fontSize: 160, fontWeight: 700, lineHeight: 1, color: "#131620", marginTop: 4, letterSpacing: "-0.04em" }}>
          {result.daysRemaining < 0 ? Math.abs(result.daysRemaining) : result.daysRemaining}
        </div>

        <div style={{ fontSize: 16, fontWeight: 500, color: "#5B6472", marginTop: -8 }}>
          {Math.abs(result.daysRemaining) === 1 && result.daysRemaining >= 0 ? "dia" : "dias"}
        </div>

        <div style={{ fontSize: 15, color: "#5B6472", marginTop: 12 }}>
          {result.rule.label}
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: "#131620", marginTop: 16, textAlign: "center" }}>
          {result.tone}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#5B6472" }}>
        <span style={{ fontWeight: 600 }}>AindaDá</span>
        <span>aindada.app</span>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={generate}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-semibold text-ink transition-colors hover:border-accent hover:bg-accent-soft"
      >
        Baixar card (Stories)
      </button>
      <div className="fixed -left-[9999px] top-0" aria-hidden>
        {el}
      </div>
    </>
  );
}
