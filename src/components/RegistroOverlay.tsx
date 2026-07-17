"use client";

import { useEffect, useRef } from "react";

type Props = {
  productName: string;
  xp: number;
  onDone: () => void;
};

export function RegistroOverlay({ productName, xp, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // confetti
    let cleanup = false;
    async function fire() {
      const confetti = (await import("canvas-confetti")).default;
      if (cleanup) return;

      const end = Date.now() + 1500;

      function frame() {
        if (cleanup) return;
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#ff3b30", "#ff9500", "#ffcc00", "#34c759"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#ff3b30", "#ff9500", "#ffcc00", "#34c759"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      }
      frame();
    }
    fire();

    // auto close after 2.5s
    const timer = setTimeout(onDone, 2500);

    return () => {
      cleanup = true;
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xs border border-border bg-white px-6 py-8 text-center shadow-lg">
        <p className="text-lg font-bold text-ink">Registrado!</p>
        <p className="mt-1 text-xs text-muted line-clamp-2">{productName}</p>

        {/* XP bar */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="relative h-3 w-full overflow-hidden border border-border bg-bg">
            <div
              className="h-full bg-accent transition-all duration-[2000ms] ease-out"
              style={{ width: "100%" }}
            />
          </div>
          <p className="text-sm font-bold text-accent">+{xp} XP</p>
        </div>
      </div>
    </div>
  );
}
