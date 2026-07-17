"use client";

import { useEffect, useRef, useState } from "react";
import { fetchByBarcode, type OFFProduct } from "@/lib/openfoodfacts";

type Props = {
  onProduct: (product: OFFProduct) => void;
  onBack: () => void;
};

type State = "idle" | "requesting" | "live" | "decoding" | "error";

export function Scanner({ onProduct, onBack }: Props) {
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState("");
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef(false);
  const decodedRef = useRef(false);

  useEffect(() => {
    return () => {
      loopRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  async function start() {
    setErr("");
    setState("requesting");

    try {
      // getUserMedia FIRST — synchronous call in user gesture context
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      // Transition to live
      setState("live");

      // Wait for video element to render (state update → DOM update)
      await new Promise((r) => setTimeout(r, 100));

      const video = videoRef.current;
      if (!video) throw new Error("no video");

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      // Start scanning loop
      loopRef.current = true;
      decodedRef.current = false;
      scanLoop();
    } catch (e: any) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const msg =
        e.name === "NotAllowedError"
          ? "Permissao da camera negada."
          : e.name === "NotFoundError"
            ? "Camera nao encontrada."
            : e.message?.includes("HTTPS") || e.message?.includes("secure")
              ? "Camera requer HTTPS."
              : e.message || "Camera indisponivel.";
      setErr(msg);
      setState("error");
    }
  }

  function stop() {
    loopRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState("idle");
  }

  // ── live scanning ──

  async function scanLoop() {
    // try native BarcodeDetector first (best for video frames)
    const hasNative = typeof window !== "undefined" && "BarcodeDetector" in window;
    let useNative = false;

    if (hasNative) {
      try {
        const BD = (window as any).BarcodeDetector;
        const test = new BD({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"] });
        await test.detect(new ImageData(1, 1));
        useNative = true;
      } catch (_e) {
        // BarcodeDetector exists but doesn't support formats
      }
    }

    // fallback: load html5-qrcode decoder
    let h5Decoder: any = null;
    if (!useNative) {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        h5Decoder = new Html5Qrcode("scan-frame");
      } catch (_e) {
        // no decoder available — camera shows but user needs manual input
        return;
      }
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const nativeDetector = useNative
      ? new (window as any).BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "code_93", "qr_code"],
        })
      : null;

    let lastScan = 0;

    const tick = async () => {
      if (!loopRef.current || decodedRef.current) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        requestAnimationFrame(tick);
        return;
      }

      // scan every 600ms
      const now = Date.now();
      if (now - lastScan < 600) {
        requestAnimationFrame(tick);
        return;
      }
      lastScan = now;

      // capture frame at full video resolution
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0);

      try {
        let code: string | null = null;

        if (nativeDetector) {
          const barcodes = await nativeDetector.detect(canvas);
          if (barcodes.length > 0) code = barcodes[0].rawValue;
        } else if (h5Decoder) {
          const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
          if (blob) {
            const file = new File([blob], "frame.jpg", { type: "image/jpeg" });
            try { code = await h5Decoder.scanFile(file, false); } catch {}
          }
        }

        if (code && code.length >= 3) {
          decodedRef.current = true;
          loopRef.current = false;
          stop();
          const p = await fetchByBarcode(code);
          onProduct(p ?? { barcode: code, name: code, category: "food" });
          return;
        }
      } catch (_e) {
        // no barcode in this frame — continue
      }

      requestAnimationFrame(tick);
    };

    tick();
  }

  async function handleManual(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    setState("requesting");
    setErr("");
    try {
      const p = await fetchByBarcode(code);
      onProduct(p ?? { barcode: code, name: code, category: "food" });
    } catch {
      setErr("Erro ao buscar codigo.");
      setState("error");
    }
  }

  const showCam = state === "live" || state === "requesting";

  return (
    <div className="flex flex-1 flex-col">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button type="button" onClick={onBack} className="pressable text-sm font-bold text-ink">
          ← Voltar
        </button>
        <span className="text-sm font-bold text-ink">Escanear</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-8">
        {state === "idle" && (
          <div className="flex w-full flex-col items-center gap-5">
            <div className="w-full border border-border bg-white px-5 py-8 text-center">
              <p className="text-sm font-bold text-ink">Pronto pra escanear?</p>
              <p className="mt-1 text-xs text-muted">Aponta o celular pro codigo de barras.</p>
            </div>

            <p className="text-xs text-muted">
              Aponte o codigo para a camera.
            </p>

            <button
              type="button"
              onClick={start}
              className="pressable flex w-full items-center justify-center gap-2 border border-ink bg-ink text-sm font-bold text-white"
              style={{ minHeight: 52 }}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-accent motion-safe:animate-beat" />
              Iniciar camera
            </button>

            <div className="flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleManual} className="flex w-full gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Digitar codigo de barras"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="h-11 flex-1 border border-border bg-white px-3 text-sm text-ink"
              />
              <button
                type="submit"
                className="pressable h-11 border border-ink bg-ink px-4 text-sm font-bold text-white"
              >
                Buscar
              </button>
            </form>
          </div>
        )}

        {showCam && (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="relative w-full border border-border bg-black" style={{ minHeight: 300 }}>
              {/* hidden container for html5-qrcode decoder */}
              <div id="scan-frame" className="hidden" />
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ minHeight: 300 }}
              />
              {state === "live" && (
                <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-center">
                  <div className="motion-safe:animate-laser mt-[35%] h-[1px] w-3/4 bg-accent shadow-[0_0_6px_#ff3b30,0_0_12px_#ff3b30]" />
                </div>
              )}
            </div>
            {state === "requesting" && <p className="text-xs text-muted">Inicializando camera...</p>}
            {state === "live" && (
              <>
                <p className="text-xs text-muted">Escaneando...</p>
                <button
                  type="button"
                  onClick={stop}
                  className="pressable border border-border bg-white px-4 text-xs font-bold text-muted"
                  style={{ height: 40 }}
                >
                  Parar camera
                </button>
              </>
            )}
          </div>
        )}

        {state === "error" && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="w-full border border-bad bg-bad-soft px-4 py-3 text-sm text-bad">{err}</div>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="pressable h-11 w-full border border-ink bg-white text-sm font-bold text-ink"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
