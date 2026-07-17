"use client";

import { CircleHelp } from "lucide-react";

type Props = {
  onHelp: () => void;
  showBack?: boolean;
  onBack?: () => void;
};

export function AppHeader({ onHelp, showBack, onBack }: Props) {
  return (
    <header className="flex items-center justify-between py-3">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="pressable cursor-pointer text-sm font-medium text-ink hover:text-accent-text"
        >
          ← Nova busca
        </button>
      ) : (
        <span className="text-base font-semibold tracking-tight text-ink">
          AindaDa
        </span>
      )}
      {showBack ? (
        <span className="text-sm font-semibold text-ink">AindaDa</span>
      ) : (
        <button
          type="button"
          onClick={onHelp}
          aria-label="Ajuda e disclaimer"
          className="pressable flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
        >
          <CircleHelp className="h-5 w-5" strokeWidth={1.75} />
        </button>
      )}
    </header>
  );
}
