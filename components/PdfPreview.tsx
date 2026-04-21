"use client";

import type { Order } from "@/lib/types";

/**
 * Aperçu d'un BDC — PDF via <object>, image via <img>.
 * Si l'ordre est mocké (file_data_url null), affiche une vignette placeholder
 * qui ressemble à un BDC papier pour que la démo reste crédible.
 */
export default function PdfPreview({ order }: { order: Order | null }) {
  return (
    <section className="flex-1 border-r border-fit-border bg-[#2A3345] flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 bg-white border-b border-fit-border flex items-center justify-between px-5 shrink-0">
        <div className="font-bold text-fit-ink text-sm tracking-wider uppercase">
          Aperçu du document
        </div>
        {order && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center bg-fit-red-light text-fit-red-dark text-xs font-semibold px-2 py-1 rounded">
              {order.mime_type.includes("pdf") ? "PDF" : "IMAGE"}
            </span>
            {order.extraction && (
              <span className="inline-flex items-center bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded">
                {Math.round(order.extraction.overall_confidence * 100)}%
                fiabilité
              </span>
            )}
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6">
        {!order && (
          <div className="text-white/60 text-sm mt-16">
            Sélectionne un BDC à gauche
          </div>
        )}

        {order && order.file_data_url && order.mime_type.includes("pdf") && (
          <object
            data={order.file_data_url}
            type="application/pdf"
            className="w-full h-full min-h-[600px] rounded-lg shadow-xl bg-white"
          >
            <div className="bg-white p-4 text-sm text-fit-muted text-center">
              Aperçu indisponible — <a href={order.file_data_url} className="text-fit-red underline" target="_blank" rel="noreferrer">ouvrir le fichier</a>
            </div>
          </object>
        )}

        {order && order.file_data_url && !order.mime_type.includes("pdf") && (
          <img
            src={order.file_data_url}
            alt={order.filename}
            className="max-w-full h-auto rounded-lg shadow-xl bg-white"
          />
        )}

        {order && !order.file_data_url && (
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[640px] aspect-[1/1.2] p-10 flex flex-col gap-4 text-[11px]">
            {/* Faux BDC stylisé pour données mockées */}
            <div className="flex items-start justify-between">
              <div>
                <div className="w-24 h-7 bg-fit-red rounded" />
                <div className="mt-1 text-fit-muted text-[9px]">
                  {order.display_name}
                </div>
              </div>
              <div className="text-right">
                <div className="border border-fit-ink px-2 py-1 inline-block font-bold">
                  BON DE COMMANDE
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="border border-slate-300 p-3">
                <div className="text-slate-500 text-[9px] uppercase">
                  Émetteur
                </div>
                <div className="font-semibold">{order.display_name}</div>
                <div className="text-slate-500 mt-1">
                  {order.filename}
                </div>
              </div>
              <div className="border border-slate-300 p-3">
                <div className="text-slate-500 text-[9px] uppercase">
                  Destinataire
                </div>
                <div className="font-semibold">FIT — TIGERY</div>
                <div className="text-slate-500 mt-1">
                  91250 Tigery, France
                </div>
              </div>
            </div>

            <div className="mt-4 border border-slate-300 rounded overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-100 text-[9px] uppercase font-semibold text-slate-600 px-3 py-2">
                <div className="col-span-6">Désignation</div>
                <div className="col-span-2">Qté</div>
                <div className="col-span-2">PU HT</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {order.extraction?.line_items.slice(0, 3).map((li, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 px-3 py-2 border-t border-slate-200"
                >
                  <div className="col-span-6">
                    {li.designation.value || li.model.value || "—"}
                  </div>
                  <div className="col-span-2">{li.quantity.value ?? "—"}</div>
                  <div className="col-span-2">
                    {li.unit_price.value != null
                      ? `${li.unit_price.value.toLocaleString("fr-FR")} €`
                      : "—"}
                  </div>
                  <div className="col-span-2 text-right">
                    {li.total_price.value != null
                      ? `${li.total_price.value.toLocaleString("fr-FR")} €`
                      : "—"}
                  </div>
                </div>
              )) ?? (
                <div className="px-3 py-6 text-center text-slate-400 text-[10px]">
                  (Aucun article — document non analysé)
                </div>
              )}
            </div>

            {order.extraction && (
              <div className="mt-auto flex justify-end">
                <div className="border border-fit-ink p-3 min-w-[220px]">
                  <div className="flex justify-between">
                    <span>Total HT</span>
                    <span className="font-semibold">
                      {order.extraction.totals.subtotal_ht.value?.toLocaleString(
                        "fr-FR"
                      )}{" "}
                      €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA 20%</span>
                    <span className="font-semibold">
                      {order.extraction.totals.vat.value?.toLocaleString(
                        "fr-FR"
                      )}{" "}
                      €
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-fit-ink mt-1 pt-1 font-bold">
                    <span>Total TTC</span>
                    <span>
                      {order.extraction.totals.total_ttc.value?.toLocaleString(
                        "fr-FR"
                      )}{" "}
                      €
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
