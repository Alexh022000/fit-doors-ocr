"use client";

import { useCallback, useMemo, useState } from "react";
import type { Order, Extraction } from "@/lib/types";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import TopBar from "./TopBar";
import OrderList from "./OrderList";
import PdfPreview from "./PdfPreview";
import ExtractionPanel from "./ExtractionPanel";
import UploadModal from "./UploadModal";
import { GedView, StatsView } from "./SecondaryTabs";

type Tab = "traitement" | "ged" | "stats";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function AppShell() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedId, setSelectedId] = useState<string | null>(
    MOCK_ORDERS[0]?.id ?? null
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("traitement");

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  );

  const patchOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
    );
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const dataUrl = await readFileAsDataURL(file);
      const now = new Date();
      const short = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const newOrder: Order = {
        id: `up-${Date.now()}`,
        filename: file.name,
        display_name: file.name.replace(/\.[a-z0-9]+$/i, ""),
        file_data_url: dataUrl,
        mime_type: file.type,
        uploaded_at: now.toISOString(),
        uploaded_at_short: short,
        status: "pending",
        extraction: null,
        processing_ms: null,
        error_message: null,
        model_used: null
      };
      setOrders((prev) => [newOrder, ...prev]);
      setSelectedId(newOrder.id);
      setTab("traitement");
    },
    []
  );

  const handleExtract = useCallback(async () => {
    if (!selected) return;
    const id = selected.id;
    patchOrder(id, { status: "processing", error_message: null });

    // Si l'ordre n'a pas de fichier réel (données mockées), on simule une extraction
    if (!selected.file_data_url) {
      setTimeout(() => {
        patchOrder(id, {
          status: "success",
          processing_ms: 8400,
          model_used: "mistral-ocr-latest → mistral-large-latest",
          extraction: fakeExtractionFor(selected.display_name)
        });
      }, 1200);
      return;
    }

    try {
      // Reconstruire un File à partir de la data URL
      const res0 = await fetch(selected.file_data_url);
      const blob = await res0.blob();
      const file = new File([blob], selected.filename, { type: blob.type });

      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        throw new Error(p.error || `Erreur serveur (${res.status}).`);
      }
      const data = await res.json();
      patchOrder(id, {
        status: "success",
        processing_ms: data.processing_ms ?? null,
        model_used: data.raw_model ?? null,
        extraction: data.extraction as Extraction
      });
    } catch (e: any) {
      patchOrder(id, {
        status: "error",
        error_message: e?.message || "Erreur inconnue"
      });
    }
  }, [selected, patchOrder]);

  const handleValidate = useCallback(() => {
    if (!selected) return;
    // Démo : on affiche juste une notification via alert pour simuler le push ERP
    alert(
      `BDC ${selected.extraction?.order.number.value || selected.id} validé et poussé vers l'ERP (démo).`
    );
  }, [selected]);

  const handleDelete = useCallback(
    (id: string) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === id);
        const next = prev.filter((o) => o.id !== id);
        if (selectedId === id) {
          const newSelected = next[idx] ?? next[idx - 1] ?? next[0] ?? null;
          setSelectedId(newSelected?.id ?? null);
        }
        return next;
      });
    },
    [selectedId]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-fit-bg">
      <TopBar
        activeTab={tab}
        onTabChange={setTab}
        onDeposer={() => setUploadOpen(true)}
      />

      <div className="flex-1 flex min-h-0">
        {tab === "traitement" && (
          <>
            <OrderList
              orders={orders}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
            <PdfPreview order={selected} />
            <ExtractionPanel
              order={selected}
              onExtract={handleExtract}
              onRetry={handleExtract}
              onValidate={handleValidate}
            />
          </>
        )}
        {tab === "ged" && <GedView orders={orders} />}
        {tab === "stats" && <StatsView orders={orders} />}
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

/**
 * Génère une extraction plausible pour un BDC mocké, afin que le prospect
 * puisse cliquer sur "Lancer l'extraction IA" même sans document réel.
 */
function fakeExtractionFor(displayName: string): Extraction {
  const f = <T,>(v: T, c = 0.92) => ({ value: v, confidence: c });
  return {
    customer: {
      name: f(displayName.toUpperCase(), 0.95),
      contact: f("Responsable Achats", 0.7),
      email: f(
        `contact@${displayName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 20)}.fr`,
        0.75
      ),
      phone: f("+33(0)1 40 12 34 56", 0.78),
      address: f("12 rue de l'Industrie, 94000 Créteil", 0.88),
      account_number: f("CLI-" + Math.floor(Math.random() * 9000 + 1000), 0.82)
    },
    order: {
      number: f(
        "BC-2026-" + Math.floor(Math.random() * 9000 + 1000).toString(),
        0.95
      ),
      date: f("2026-04-21", 0.93),
      client_reference: f(null, 0),
      delivery_conditions: f("Franco", 0.7),
      delivery_date: f("2026-05-15", 0.78)
    },
    line_items: [
      {
        reference: f("HUSKY-2400-2500", 0.9),
        designation: f("Porte isotherme Husky", 0.92),
        model: f("Husky", 0.97),
        dimensions: f("2400 × 2500 mm", 0.91),
        motorization: f("FITMATIC", 0.93),
        options: f(["FITSECU"], 0.82),
        target_vehicle: f("Iveco Daily 35S", 0.85),
        quantity: f(1, 0.97),
        unit_price: f(3750, 0.88),
        total_price: f(3750, 0.9)
      }
    ],
    totals: {
      subtotal_ht: f(3750, 0.9),
      vat: f(750, 0.9),
      total_ttc: f(4500, 0.9)
    },
    currency: "EUR",
    notes: f(null, 0),
    overall_confidence: 0.87
  };
}
