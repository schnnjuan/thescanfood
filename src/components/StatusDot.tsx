"use client";

import type { Status } from "@/lib/types";

type Props = {
  status: Status;
  size?: "sm" | "md";
};

const config: Record<Status, { label: string; dot: string }> = {
  ok:   { label: "OK",      dot: "bg-ok" },
  warn: { label: "Atencao", dot: "bg-warn" },
  bad:  { label: "Vencido", dot: "bg-bad" },
};

const sizes = {
  sm: { dot: "w-1.5 h-1.5", text: "text-[10px]" },
  md: { dot: "w-2 h-2", text: "text-xs" },
};

export function StatusDot({ status, size = "md" }: Props) {
  const c = config[status];
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center gap-1.5 ${s.text} font-bold text-ink`}>
      <span className={`${s.dot} rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
