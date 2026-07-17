"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { listPantry, removeFromPantry } from "@/lib/pantry-db";
import { getProduct } from "@/lib/products";
import { checkItem } from "@/lib/match";
import type { PantryItem as PantryItemType } from "@/lib/pantry-db";
import type { Product } from "@/lib/products";
import type { Category } from "@/lib/types";

const CATEGORY_LABELS: Record<Category, string> = {
  food: "Comida",
  cosmetic: "Cosmetico",
  medicine: "Farmacia",
  cleaning: "Limpeza",
  other: "Outros",
};

const CATEGORY_ICONS: Record<Category, string> = {
  food: "🍝",
  cosmetic: "🧴",
  medicine: "💊",
  cleaning: "🧹",
  other: "📦",
};

type ItemWithProduct = PantryItemType & { product?: Product | null };

function statusInfo(item: ItemWithProduct): {
  label: string;
  cls: string;
  days: string;
} {
  const d = item.after_open_days || 7;
  // Use checkItem for smart analysis
  const outcome = checkItem({
    query: item.product?.name || item.barcode,
    openedDate: item.opened_date || undefined,
    expiryDate: item.expiry_date || undefined,
  });
  if (outcome.kind === "hit") {
    return {
      label: outcome.statusLabel,
      cls:
        outcome.status === "ok"
          ? "text-ok"
          : outcome.status === "warn"
            ? "text-warn"
            : "text-bad",
      days: outcome.daysLabel,
    };
  }
  return { label: "Desconhecido", cls: "text-muted", days: "—" };
}

function daysUntilLabel(days: number | null): string {
  if (days === null) return "";
  if (days > 0) return `${days}d`;
  if (days === 0) return "hoje";
  return `-${Math.abs(days)}d`;
}

export default function PantryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    async function load() {
      const pantryItems = await listPantry();
      // Enrich with product data
      const enriched: ItemWithProduct[] = await Promise.all(
        pantryItems.map(async (pi) => {
          const p = await getProduct(pi.barcode).catch(() => null);
          return { ...pi, product: p };
        }),
      );
      setItems(enriched);
      setLoading(false);
    }
    load();
  }, [user, authLoading]);

  async function handleRemove(id: string) {
    await removeFromPantry(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  // Group by category
  const grouped = items.reduce<Record<string, ItemWithProduct[]>>(
    (acc, item) => {
      const cat = item.product?.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {},
  );

  const categoryOrder: Category[] = ["food", "cosmetic", "medicine", "cleaning", "other"];

  if (authLoading || loading) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-4">
        <p className="text-sm text-muted">Carregando dispensa...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-6 px-4">
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
        <div className="border border-border bg-white px-8 py-8 text-center">
          <p className="text-2xl font-extrabold text-ink">🍽️</p>
          <p className="mt-3 text-sm font-bold text-ink">
            Sua dispensa espera
          </p>
          <p className="mt-1 text-xs text-muted">
            Entre pra salvar e gerenciar seus produtos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAuth(true)}
          className="pressable h-11 w-full border border-ink bg-ink text-sm font-bold text-white"
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="pressable h-11 w-full border border-ink bg-white text-sm font-bold text-ink"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="pressable text-sm font-bold text-ink"
        >
          ← Voltar
        </button>
        <span className="text-sm font-bold text-ink">Dispensa</span>
        <span className="text-xs text-muted">{items.length} itens</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
          <p className="text-4xl">🧺</p>
          <p className="text-sm font-bold text-ink">Dispensa vazia</p>
          <p className="text-xs text-muted text-center">
            Escaneie produtos pra adicionar aqui.
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/scan")}
            className="pressable h-11 w-full border border-ink bg-ink text-sm font-bold text-white"
          >
            Escanear agora
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-6 px-4 pb-8 pt-5">
          {categoryOrder.map((cat) => {
            const catItems = grouped[cat];
            if (!catItems || catItems.length === 0) return null;
            return (
              <ShelfSection
                key={cat}
                icon={CATEGORY_ICONS[cat]}
                label={CATEGORY_LABELS[cat]}
                items={catItems}
                onRemove={handleRemove}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Shelf sub-component ──

function ShelfSection({
  icon,
  label,
  items,
  onRemove,
}: {
  icon: string;
  label: string;
  items: ItemWithProduct[];
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <p className="text-[11px] font-bold text-ink">{label}</p>
        <p className="text-[11px] text-muted">({items.length})</p>
      </div>

      {/* shelf surface */}
      <div className="border border-border bg-white">
        <div className="flex flex-col">
          {items.map((item) => {
            const info = statusInfo(item);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
              >
                {/* status dot */}
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    info.cls === "text-ok"
                      ? "bg-ok"
                      : info.cls === "text-warn"
                        ? "bg-warn"
                        : info.cls === "text-bad"
                          ? "bg-bad"
                          : "bg-border"
                  }`}
                />

                {/* product image or fallback */}
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt=""
                    className="h-8 w-8 shrink-0 border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-bg text-xs text-muted">
                    ?
                  </div>
                )}

                {/* name + status */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink truncate">
                    {item.product?.name || item.barcode}
                  </p>
                  <p className={`text-[11px] ${info.cls}`}>
                    {info.label} — {info.days}
                  </p>
                </div>

                {/* remove */}
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="pressable h-8 px-2 text-xs text-muted hover:text-bad"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* shelf shadow */}
      <div className="h-[3px] bg-border/50" />
    </div>
  );
}
