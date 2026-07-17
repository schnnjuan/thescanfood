"use client";

type Props = {
  onDismiss: () => void;
};

export function SoftUpsell({ onDismiss }: Props) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-accent-soft px-4 py-4">
      <p className="text-sm font-semibold text-accent-text">
        Salvar no armário virtual?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Histórico + alertas no Pro. Em breve.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="pressable mt-3 h-10 w-full cursor-pointer rounded-lg text-sm font-medium text-muted hover:text-ink"
      >
        Dispensar
      </button>
    </div>
  );
}
