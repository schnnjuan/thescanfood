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
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="pressable h-10 flex-1 cursor-pointer rounded-lg bg-accent text-sm font-semibold text-white"
          onClick={onDismiss}
        >
          Quero
        </button>
        <button
          type="button"
          className="pressable h-10 flex-1 cursor-pointer rounded-lg text-sm font-medium text-muted hover:text-ink"
          onClick={onDismiss}
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
