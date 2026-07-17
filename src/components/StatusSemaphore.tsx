"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import type { Status } from "@/lib/types";

type Props = {
  status: Status;
  size?: "md" | "lg";
};

const config: Record<Status, { icon: typeof Check; fill: string; dim: string }> = {
  ok:   { icon: Check, fill: "#10B981", dim: "#D1FAE5" },
  warn: { icon: AlertTriangle, fill: "#F59E0B", dim: "#FEF3C7" },
  bad:  { icon: X, fill: "#F43F5E", dim: "#FEE2E2" },
};

const sizes = {
  md: { light: 40, icon: 18, gap: 6, container: 60 },
  lg: { light: 56, icon: 26, gap: 8, container: 84 },
};

export function StatusSemaphore({ status, size = "lg" }: Props) {
  const s = sizes[size];
  const lights: Status[] = ["bad", "warn", "ok"];

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: s.gap, width: s.container }}
      aria-label={`Semáforo: ${status}`}
    >
      {lights.map((light) => {
        const c = config[light];
        const active = light === status;
        const IconComp = c.icon;
        return (
          <div
            key={light}
            className="flex items-center justify-center rounded-full transition-all duration-300 motion-safe:animate-[pop_200ms_ease-out]"
            style={{
              width: s.light,
              height: s.light,
              background: active ? c.fill : c.dim,
              opacity: active ? 1 : 0.35,
              boxShadow: active
                ? `0 0 12px ${c.fill}40, 0 0 24px ${c.fill}20`
                : "none",
            }}
          >
            {active && (
              <IconComp
                size={s.icon}
                strokeWidth={2.5}
                color="white"
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
