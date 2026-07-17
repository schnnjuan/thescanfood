"use client";

import type { Status } from "@/lib/types";

type Props = {
  status: Status;
  size?: "sm" | "md" | "lg";
};

const config: Record<Status, { fill: string }> = {
  ok:   { fill: "#059669" },
  warn: { fill: "#d97706" },
  bad:  { fill: "#dc2626" },
};

const sizes = {
  sm: { light: 10, gap: 3 },
  md: { light: 14, gap: 4 },
  lg: { light: 20, gap: 6 },
};

export function StatusSemaphore({ status, size = "md" }: Props) {
  const s = sizes[size];
  const lights: Status[] = ["bad", "warn", "ok"];

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: s.gap }}
      aria-label={`Status: ${status}`}
    >
      {lights.map((light) => {
        const c = config[light];
        const active = light === status;
        return (
          <div
            key={light}
            className="rounded-full"
            style={{
              width: s.light,
              height: s.light,
              background: active ? c.fill : "#e5e5e5",
              opacity: active ? 1 : 0.35,
            }}
          />
        );
      })}
    </div>
  );
}
