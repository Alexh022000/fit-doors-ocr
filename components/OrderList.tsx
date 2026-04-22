"use client";

import type { Order } from "@/lib/types";
import OrderCard from "./OrderCard";

export default function OrderList({
  orders,
  selectedId,
  onSelect,
  onDelete,
  width
}: {
  orders: Order[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  width?: number;
}) {
  return (
    <aside
      style={width ? { width: `${width}px` } : undefined}
      className="shrink-0 bg-white flex flex-col min-w-0"
    >
      {/* Header */}
      <div className="px-4 h-14 flex items-center justify-between border-b border-fit-border shrink-0">
        <div className="font-bold text-fit-ink text-sm tracking-wider uppercase">
          BDC reçus
        </div>
        <span className="text-xs text-fit-muted bg-fit-bg px-2 py-0.5 rounded-full">
          {orders.length} reçus
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {orders.length === 0 && (
          <div className="text-center text-sm text-fit-muted mt-8 px-4">
            Aucun BDC pour le moment. Utilise le bouton{" "}
            <span className="text-fit-red font-medium">Déposer un BDC</span>{" "}
            pour commencer.
          </div>
        )}
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            selected={o.id === selectedId}
            onClick={() => onSelect(o.id)}
            onDelete={onDelete ? () => onDelete(o.id) : undefined}
          />
        ))}
      </div>

      {/* Footer pagination (statique pour démo) */}
      <div className="border-t border-fit-border p-3 flex items-center justify-between text-xs shrink-0">
        <button className="px-3 py-1.5 rounded-md border border-fit-border text-fit-muted hover:bg-fit-bg">
          ← Préc.
        </button>
        <span className="text-fit-muted">1 / 1</span>
        <button className="px-3 py-1.5 rounded-md border border-fit-border text-fit-muted hover:bg-fit-bg">
          Suiv. →
        </button>
      </div>
    </aside>
  );
}
