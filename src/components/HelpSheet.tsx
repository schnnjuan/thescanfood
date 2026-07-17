"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HelpSheet({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-lg motion-safe:animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="help-title" className="text-lg font-semibold text-ink">
          Antes de confiar cegamente
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Referência geral. Rótulo e bom senso mandam. Remédio: médico ou
          farmacêutico. Quando em dúvida, cheiro, textura e descarte.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 h-11 w-full cursor-pointer rounded-xl bg-cta text-sm font-semibold text-cta-on"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
