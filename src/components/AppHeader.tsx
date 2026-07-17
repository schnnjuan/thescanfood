"use client";

type Props = {
  onHelp: () => void;
  showBack?: boolean;
  onBack?: () => void;
};

export function AppHeader({ onHelp, showBack, onBack }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="pressable cursor-pointer text-sm font-bold text-ink"
        >
          ← Voltar
        </button>
      ) : (
        <span className="text-sm font-bold text-ink">thescan.<span className="text-accent">food</span></span>
      )}
      <button
        type="button"
        onClick={onHelp}
        className="pressable cursor-pointer text-xs text-muted hover:text-ink"
      >
        (?) ajuda
      </button>
    </header>
  );
}
