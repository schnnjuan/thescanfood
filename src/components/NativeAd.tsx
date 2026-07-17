"use client";

import { useEffect, useId, useRef } from "react";
import { ADSENSE } from "@/lib/ads";

type Props = {
  slot: "lp" | "result";
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Anuncio nativo do AdSense (in-feed / in-article).
 * O script do AdSense e carregado no layout raiz com strategy="lazyOnload".
 */
export function NativeAd({ slot }: Props) {
  const insId = useId();
  const pushed = useRef(false);
  const dataAdSlot = slot === "lp" ? ADSENSE.slotLP : ADSENSE.slotResult;

  useEffect(() => {
    if (pushed.current) return;
    if (!ADSENSE.client) return; // sem config, nao ativa
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // silencioso — bloqueador ou rede lenta
    }
  }, []);

  if (!ADSENSE.client) {
    // fallback visivel so em dev — avisa que falta config
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="border-2 border-dashed border-warn/40 bg-warn-soft px-4 py-3 text-xs text-warn-text">
          Anuncio AdSense — configurar NEXT_PUBLIC_ADSENSE_CLIENT
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-[100px]">
      <ins
        id={insId}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE.client}
        data-ad-slot={dataAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
