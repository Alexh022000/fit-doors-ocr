"use client";

import type { Order } from "@/lib/types";

/**
 * Vues "GED" et "Statistiques" simplifiées pour la démo — montrent au prospect
 * que l'application est une vraie plateforme de traitement, pas un simple POC.
 */

export function GedView({ orders }: { orders: Order[] }) {
  const processed = orders.filter((o) => o.status === "success");
  return (
    <div className="flex-1 overflow-auto p-8 bg-fit-bg">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-fit-ink mb-1">
          Gestion Électronique de Documents
        </h2>
        <p className="text-fit-muted mb-6">
          Historique complet des bons de commande traités — accessible à tout
          moment, exportable vers votre ERP.
        </p>

        <div className="bg-white border border-fit-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-fit-bg border-b border-fit-border">
              <tr className="text-left text-xs uppercase tracking-wider text-fit-muted">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">N° commande</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Articles</th>
                <th className="px-4 py-3 font-semibold text-right">Total HT</th>
                <th className="px-4 py-3 font-semibold text-right">
                  Fiabilité
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fit-border">
              {processed.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-fit-muted"
                  >
                    Aucun BDC traité pour le moment.
                  </td>
                </tr>
              )}
              {processed.map((o) => (
                <tr key={o.id} className="hover:bg-fit-bg/50">
                  <td className="px-4 py-3 font-medium text-fit-ink">
                    {o.extraction?.customer.name.value || o.display_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {o.extraction?.order.number.value || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {o.extraction?.order.date.value || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {o.extraction?.line_items.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {o.extraction?.totals.subtotal_ht.value?.toLocaleString(
                      "fr-FR",
                      { style: "currency", currency: "EUR" }
                    ) || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        (o.extraction?.overall_confidence ?? 0) >= 0.85
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {Math.round(
                        (o.extraction?.overall_confidence ?? 0) * 100
                      )}
                      %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatsView({ orders }: { orders: Order[] }) {
  const processed = orders.filter((o) => o.status === "success");
  const total = orders.length;
  const successRate = total > 0 ? processed.length / total : 0;
  const avgMs =
    processed.length > 0
      ? processed.reduce((s, o) => s + (o.processing_ms || 0), 0) /
        processed.length
      : 0;
  const avgConfidence =
    processed.length > 0
      ? processed.reduce(
          (s, o) => s + (o.extraction?.overall_confidence || 0),
          0
        ) / processed.length
      : 0;

  // Hypothèse : 8 min de saisie manuelle économisés par BDC
  const hoursSaved = ((processed.length * 8) / 60).toFixed(1);

  const kpis = [
    {
      label: "BDC traités",
      value: String(processed.length),
      sub: `sur ${total} reçus`
    },
    {
      label: "Taux de succès",
      value: `${Math.round(successRate * 100)}%`,
      sub: "extractions valides"
    },
    {
      label: "Temps moyen",
      value: `${(avgMs / 1000).toFixed(1)}s`,
      sub: "par document"
    },
    {
      label: "Fiabilité moyenne",
      value: `${Math.round(avgConfidence * 100)}%`,
      sub: "confiance IA"
    },
    {
      label: "Gain estimé",
      value: `${hoursSaved}h`,
      sub: "temps de saisie évité"
    },
    {
      label: "Modèles détectés",
      value: String(
        new Set(
          processed.flatMap(
            (o) => o.extraction?.line_items.map((li) => li.model.value) || []
          )
        ).size
      ),
      sub: "références uniques"
    }
  ];

  return (
    <div className="flex-1 overflow-auto p-8 bg-fit-bg">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-fit-ink mb-1">Statistiques</h2>
        <p className="text-fit-muted mb-6">
          Performance de l'extraction IA sur les bons de commande FIT Doors.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="bg-white border border-fit-border rounded-xl p-5 shadow-sm"
            >
              <div className="text-xs uppercase tracking-wider text-fit-muted font-semibold">
                {k.label}
              </div>
              <div className="mt-2 text-3xl font-bold text-fit-ink">
                {k.value}
              </div>
              <div className="text-xs text-fit-muted mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border border-fit-border rounded-xl p-5 shadow-sm">
          <div className="text-sm font-semibold text-fit-ink mb-3">
            Répartition par modèle FIT
          </div>
          <ModelBreakdown orders={processed} />
        </div>
      </div>
    </div>
  );
}

function ModelBreakdown({ orders }: { orders: Order[] }) {
  const counts: Record<string, number> = {};
  orders.forEach((o) =>
    o.extraction?.line_items.forEach((li) => {
      const m = li.model.value || "Inconnu";
      counts[m] = (counts[m] || 0) + (li.quantity.value || 1);
    })
  );
  const items = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...items.map(([, v]) => v));

  if (items.length === 0) {
    return (
      <div className="text-sm text-fit-muted italic">
        Aucune donnée — traite au moins un BDC pour voir les statistiques.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(([model, count]) => (
        <div key={model} className="flex items-center gap-3 text-sm">
          <div className="w-28 font-medium text-fit-ink shrink-0">{model}</div>
          <div className="flex-1 bg-fit-bg rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-fit-red rounded-full flex items-center px-3 text-xs font-semibold text-white"
              style={{ width: `${(count / max) * 100}%` }}
            >
              {count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
