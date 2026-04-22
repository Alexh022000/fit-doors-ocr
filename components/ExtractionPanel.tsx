"use client";

import type { Order, LineItem } from "@/lib/types";
import FieldRow from "./FieldRow";
import Spinner from "./Spinner";

const euro = (n: number | null | undefined, currency = "EUR") =>
  n == null
    ? "—"
    : new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency
      }).format(n);

function LineItemCard({
  item,
  index,
  currency
}: {
  item: LineItem;
  index: number;
  currency: string;
}) {
  return (
    <div className="rounded-lg border border-fit-border bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-fit-red bg-fit-red-light px-2 py-0.5 rounded">
            Ligne {index + 1}
          </div>
          <div className="mt-1 text-base font-semibold text-fit-ink">
            {item.model.value || "Modèle non identifié"}
            {item.reference.value && (
              <span className="text-fit-muted font-normal ml-2 text-sm">
                · {item.reference.value}
              </span>
            )}
          </div>
          {item.designation.value && (
            <div className="text-sm text-fit-muted mt-0.5">
              {item.designation.value}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-fit-ink">
            {euro(item.total_price.value, currency)}
          </div>
          {item.quantity.value != null && item.unit_price.value != null && (
            <div className="text-xs text-fit-muted">
              {item.quantity.value} × {euro(item.unit_price.value, currency)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <FieldRow label="Dimensions" field={item.dimensions} compact />
        <FieldRow label="Motorisation" field={item.motorization} compact />
        <FieldRow label="Véhicule" field={item.target_vehicle} compact />
      </div>

      {item.options.value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.options.value.map((opt, i) => (
            <span
              key={i}
              className="text-xs bg-fit-red-light text-fit-red-dark px-2 py-1 rounded-md font-medium"
            >
              {opt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExtractionPanel({
  order,
  onExtract,
  onRetry,
  onValidate,
  width
}: {
  order: Order | null;
  onExtract: () => void;
  onRetry: () => void;
  onValidate: () => void;
  width?: number;
}) {
  return (
    <section
      style={width ? { width: `${width}px` } : undefined}
      className="shrink-0 bg-white flex flex-col min-w-0"
    >
      {/* ---------- Idle : aucun ordre sélectionné ---------- */}
      {!order && (
        <div className="flex-1 flex items-center justify-center text-center p-10">
          <div className="max-w-xs">
            <div className="w-16 h-16 rounded-full bg-fit-bg flex items-center justify-center mx-auto border border-fit-border">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2z" stroke="#E63026" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-4 text-fit-ink font-semibold">
              Aucun BDC sélectionné
            </div>
            <div className="text-sm text-fit-muted mt-1">
              Choisis un bon de commande dans la liste à gauche, ou dépose-en un
              nouveau.
            </div>
          </div>
        </div>
      )}

      {/* ---------- Pending : document pas encore analysé ---------- */}
      {order && order.status === "pending" && (
        <div className="flex-1 flex items-center justify-center text-center p-10">
          <div className="max-w-sm">
            <div className="w-16 h-16 rounded-full bg-fit-red-light flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#E63026" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="4" stroke="#E63026" strokeWidth="2" />
              </svg>
            </div>
            <div className="mt-4 font-mono text-fit-muted text-xs break-all">
              {order.filename}
            </div>
            <div className="mt-1 text-fit-ink">
              Ce bon de commande n'a pas encore été analysé
            </div>
            <button
              onClick={onExtract}
              className="mt-6 inline-flex items-center gap-2 bg-fit-red hover:bg-fit-red-dark text-white font-semibold px-5 py-3 rounded-lg shadow transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white" />
              </svg>
              Lancer l'extraction IA
            </button>
          </div>
        </div>
      )}

      {/* ---------- Processing ---------- */}
      {order && order.status === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-4">
          <Spinner />
          <div>
            <div className="font-semibold text-fit-ink">
              Analyse IA en cours…
            </div>
            <div className="text-sm text-fit-muted mt-1">
              Mistral OCR lit le document, puis Mistral Large structure les champs métier FIT Doors.
            </div>
          </div>
        </div>
      )}

      {/* ---------- Error ---------- */}
      {order && order.status === "error" && (
        <div className="flex-1 flex items-center justify-center text-center p-10">
          <div className="max-w-sm bg-red-50 border border-red-200 rounded-lg p-5">
            <div className="font-semibold text-red-700 mb-2">
              Erreur d'extraction
            </div>
            <div className="text-sm text-red-600 mb-4">
              {order.error_message || "Une erreur est survenue."}
            </div>
            <button
              onClick={onExtract}
              className="inline-flex items-center gap-2 text-red-700 text-sm font-medium underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* ---------- Success : fiche complète ---------- */}
      {order && order.status === "success" && order.extraction && (
        <>
          {/* En-tête fiche */}
          <div className="px-6 pt-5 pb-4 border-b border-fit-border shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-fit-ink text-lg truncate">
                {order.extraction.customer.name.value || order.display_name}
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                {Math.round(order.extraction.overall_confidence * 100)}%
              </span>
              <span className="text-xs text-fit-muted">Fiabilité IA</span>
              <div className="ml-auto text-xs text-fit-muted">
                Cmd {order.extraction.order.number.value || "—"}{" "}
                · {order.extraction.order.date.value || "—"} ·{" "}
                {order.extraction.line_items.length} article
                {order.extraction.line_items.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* EXPÉDITEUR */}
            <section>
              <h3 className="text-fit-red text-xs font-bold uppercase tracking-wider mb-3">
                Expéditeur
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <FieldRow
                  label="Société"
                  field={order.extraction.customer.name}
                />
                <FieldRow
                  label="Contact"
                  field={order.extraction.customer.contact}
                />
                <FieldRow
                  label="Email"
                  field={order.extraction.customer.email}
                />
                <FieldRow
                  label="Téléphone"
                  field={order.extraction.customer.phone}
                />
                <div className="col-span-2">
                  <FieldRow
                    label="Adresse livraison"
                    field={order.extraction.customer.address}
                  />
                </div>
                <FieldRow
                  label="N° compte client"
                  field={order.extraction.customer.account_number}
                />
              </div>
            </section>

            {/* COMMANDE */}
            <section>
              <h3 className="text-fit-red text-xs font-bold uppercase tracking-wider mb-3">
                Commande
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <FieldRow
                  label="N° commande"
                  field={order.extraction.order.number}
                />
                <FieldRow
                  label="Date commande"
                  field={order.extraction.order.date}
                />
                <FieldRow
                  label="Réf. client"
                  field={order.extraction.order.client_reference}
                />
                <FieldRow
                  label="Conditions livraison"
                  field={order.extraction.order.delivery_conditions}
                />
                <FieldRow
                  label="Délai"
                  field={order.extraction.order.delivery_date}
                />
              </div>
            </section>

            {/* LIGNES */}
            <section>
              <h3 className="text-fit-red text-xs font-bold uppercase tracking-wider mb-3">
                Lignes de commande ({order.extraction.line_items.length}{" "}
                article
                {order.extraction.line_items.length > 1 ? "s" : ""})
              </h3>
              <div className="space-y-3">
                {order.extraction.line_items.map((li, i) => (
                  <LineItemCard
                    key={i}
                    item={li}
                    index={i}
                    currency={order.extraction!.currency}
                  />
                ))}
              </div>
            </section>

            {/* TOTAUX */}
            <section className="bg-fit-red text-white rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="uppercase tracking-wider text-[10px] opacity-80 font-bold">
                    Sous-total HT
                  </div>
                  <div className="font-bold text-lg mt-0.5">
                    {euro(
                      order.extraction.totals.subtotal_ht.value,
                      order.extraction.currency
                    )}
                  </div>
                </div>
                <div>
                  <div className="uppercase tracking-wider text-[10px] opacity-80 font-bold">
                    TVA
                  </div>
                  <div className="font-bold text-lg mt-0.5">
                    {euro(
                      order.extraction.totals.vat.value,
                      order.extraction.currency
                    )}
                  </div>
                </div>
                <div>
                  <div className="uppercase tracking-wider text-[10px] opacity-80 font-bold">
                    Total TTC
                  </div>
                  <div className="font-bold text-lg mt-0.5">
                    {euro(
                      order.extraction.totals.total_ttc.value,
                      order.extraction.currency
                    )}
                  </div>
                </div>
              </div>
            </section>

            {order.extraction.notes.value && (
              <section>
                <h3 className="text-fit-red text-xs font-bold uppercase tracking-wider mb-2">
                  Notes
                </h3>
                <div className="text-sm text-fit-muted bg-fit-bg border border-fit-border rounded-lg p-3 whitespace-pre-wrap">
                  {order.extraction.notes.value}
                </div>
              </section>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-fit-border px-6 py-3 flex items-center gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-4 text-fit-muted">
              <span className="inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Extraction en{" "}
                {order.processing_ms
                  ? `${(order.processing_ms / 1000).toFixed(1)}s`
                  : "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Qualité :{" "}
                <span className="font-semibold text-fit-ink">
                  {order.extraction.overall_confidence >= 0.9
                    ? "excellente"
                    : order.extraction.overall_confidence >= 0.7
                    ? "haute"
                    : "à vérifier"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6M9 16h6M9 8h2M14 3h-4a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V9l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {order.extraction.line_items.length} lignes extraites
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-2 border border-fit-border rounded-md text-fit-ink hover:bg-fit-bg font-medium"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M23 4v6h-6M20.49 15A9 9 0 115.64 5.64L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Ré-extraire
              </button>
              <button
                onClick={onValidate}
                className="inline-flex items-center gap-1 px-4 py-2 bg-fit-red hover:bg-fit-red-dark text-white rounded-md font-semibold shadow"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Valider
              </button>
            </div>
          </div>

          {/* Bandeau technique */}
          <div className="border-t border-fit-border px-6 py-2 flex items-center gap-4 text-[10px] text-fit-muted shrink-0 bg-fit-bg/50 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-fit-red" /> Mistral OCR +
              Mistral Large (IA française)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-fit-red" /> Extraction
              documentaire
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-fit-red" /> API REST /
              Webhook ERP
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-fit-red" /> Human-in-the-loop
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" /> Cloud
              souverain UE
            </span>
          </div>
        </>
      )}
    </section>
  );
}
