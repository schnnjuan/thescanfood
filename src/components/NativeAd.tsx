"use client";

import type { NativeAd as AdType } from "@/lib/ads";

type Props = {
  ad: AdType;
};

export function NativeAd({ ad }: Props) {
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="pressable group flex flex-col gap-1 rounded-xl border border-border/60 bg-surface px-4 py-3.5 transition-colors hover:border-accent/30 hover:bg-accent-soft/50"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink group-hover:text-accent-text">
          {ad.headline}
        </p>
        <span className="shrink-0 rounded-md border border-border/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted/60">
          Patrocinado
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted">{ad.body}</p>
      <span className="text-xs font-medium text-accent group-hover:underline">
        {ad.cta} &rarr;
      </span>
    </a>
  );
}
