"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { motion } from "motion/react";
import { springs } from "@/lib/motion-tokens";
import type { Status } from "@/lib/types";

type Props = {
  status: Status;
  size?: "sm" | "md" | "lg";
};

const config: Record<Status, { icon: typeof Check; fill: string; dim: string }> = {
  ok:   { icon: Check, fill: "#10B981", dim: "#D1FAE5" },
  warn: { icon: AlertTriangle, fill: "#F59E0B", dim: "#FEF3C7" },
  bad:  { icon: X, fill: "#F43F5E", dim: "#FEE2E2" },
};

const sizes = {
  sm: { light: 28, icon: 12, gap: 4, container: 40 },
  md: { light: 36, icon: 16, gap: 5, container: 52 },
  lg: { light: 48, icon: 22, gap: 6, container: 68 },
};

export function StatusSemaphore({ status, size = "md" }: Props) {
  const s = sizes[size];
  const lights: Status[] = ["bad", "warn", "ok"];

  return (
    <div
      className="flex flex-col items-center rounded-xl bg-surface/50 px-3 py-2"
      style={{ gap: s.gap }}
      aria-label={`Status: ${status}`}
    >
      {lights.map((light) => {
        const c = config[light];
        const active = light === status;
        const IconComp = c.icon;
        return (
          <motion.div
            key={light}
            className="flex items-center justify-center rounded-full"
            animate={{
              background: active ? c.fill : c.dim,
              opacity: active ? 1 : 0.3,
              scale: active ? 1 : 0.85,
              boxShadow: active
                ? `0 0 8px ${c.fill}30, 0 0 16px ${c.fill}15`
                : "0px 0px 0px rgba(0,0,0,0)",
            }}
            transition={springs.bouncy}
            style={{ width: s.light, height: s.light }}
          >
            {active && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={springs.snappy}
              >
                <IconComp
                  size={s.icon}
                  strokeWidth={2.5}
                  color="white"
                  aria-hidden
                />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
