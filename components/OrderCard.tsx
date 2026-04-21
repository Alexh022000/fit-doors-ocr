"use client";

import type { Order, OrderStatus } from "@/lib/types";

function StatusPill({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, { label: string; cls: string }> = {
    pending: { label: "En attente", cls: "bg-slate-100 text-slate-600" },
    processing: { label: "Analyse…", cls: "bg-amber-50 text-amber-700" },
    success: { label: "Extrait", cls: "bg-emerald-50 text-emerald-700" },
    error: { label: "Erreur", cls: "bg-red-50 text-red-600" }
  };
  const s = styles[status];
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-md ${s.cls} shrink-0`}>
      {s.label}
    </span>
  );
}

export default function OrderCard({
  order,
  selected,
  onClick
}: {
  order: Order;
  selected: boolean;
  onClick: () => void;
}) {
  const articleCount = order.extraction?.line_items.length ?? null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border transition-all px-3 py-3 flex items-start gap-3 ${
        selected
          ? "bg-fit-red-light border-fit-red shadow-sm"
          : "bg-white border-fit-border hover:border-fit-red/40 hover:bg-fit-red-light/30"
      }`}
    >
      {/* Badge PDF ou check */}
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-bold tracking-wide shrink-0 ${
          order.status === "success"
            ? "bg-emerald-100 text-emerald-700"
            : selected
            ? "bg-white text-fit-red border border-fit-red/30"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {order.status === "success" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          "PDF"
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-fit-ink text-sm truncate">
            {order.display_name}
          </div>
          <StatusPill status={order.status} />
        </div>
        <div className="text-xs text-fit-muted mt-0.5 truncate">
          <span className="inline-flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            {order.filename.length > 24
              ? order.filename.slice(0, 24) + "…"
              : order.filename}
          </span>
          {articleCount != null && (
            <>
              <span className="mx-1.5">·</span>
              <span>{articleCount} art.</span>
            </>
          )}
          <span className="mx-1.5">·</span>
          <span>{order.uploaded_at_short}</span>
        </div>
      </div>
    </button>
  );
}
