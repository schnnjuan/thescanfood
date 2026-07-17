"use client";

type Props = {
  onDismiss: () => void;
};

export function SoftUpsell({ onDismiss }: Props) {
  return (
    <div className="border border-border bg-white px-4 py-4">
      <p className="text-sm font-bold text-ink">
        Salvar no armario virtual?
      </p>
      <p className="mt-1 text-xs text-muted">
        Historico, alertas e estatisticas. Pro (em breve).
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="pressable mt-3 h-9 w-full border border-border bg-white text-[11px] font-bold text-ink"
      >
        Dispensar
      </button>
    </div>
  );
}
