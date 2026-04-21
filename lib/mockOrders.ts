import type { Order } from "./types";

// Helper pour générer un champ avec confiance
const f = <T,>(value: T, confidence = 0.95) => ({ value, confidence });

/**
 * BDC de démonstration chargés au démarrage de l'app.
 * Permet à la démo d'être visuellement "vivante" même avant le premier upload
 * — exactement comme le démo Sterling qui arrivait avec 13 BDC préchargés.
 */
export const MOCK_ORDERS: Order[] = [
  {
    id: "mock-trans-malherbe",
    filename: "trans-malherbe-bdc-2024-08-14.pdf",
    display_name: "TRANSPORTS MALHERBE",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T08:12:00Z",
    uploaded_at_short: "08:12",
    status: "success",
    processing_ms: 9200,
    model_used: "mistral-ocr-latest → mistral-large-latest",
    error_message: null,
    extraction: {
      customer: {
        name: f("TRANSPORTS MALHERBE SAS", 0.97),
        contact: f("Julien DUMONT", 0.85),
        email: f("achats@malherbe-transports.fr", 0.9),
        phone: f("+33(0)2 31 53 22 10", 0.88),
        address: f("ZA du Pont, 14123 Cuverville, France", 0.93),
        account_number: f("MAL-0088", 0.8)
      },
      order: {
        number: f("BC-2024-0812", 0.96),
        date: f("2024-08-14", 0.95),
        client_reference: f("PO-MALH-2024-0812", 0.6),
        delivery_conditions: f("Franco de port", 0.75),
        delivery_date: f("2024-09-10", 0.82)
      },
      line_items: [
        {
          reference: f("HUSKY-2500-2400", 0.92),
          designation: f("Porte relevante isotherme Husky", 0.95),
          model: f("Husky", 0.98),
          dimensions: f("2500 × 2400 mm", 0.94),
          motorization: f("FITMATIC", 0.93),
          options: f(["FITSECU", "Télécommande 2 canaux"], 0.85),
          target_vehicle: f("Renault Master L3H2", 0.9),
          quantity: f(2, 0.97),
          unit_price: f(3850, 0.93),
          total_price: f(7700, 0.95)
        },
        {
          reference: f("FORTY-3000-2600", 0.9),
          designation: f("Porte aluminium Forty", 0.93),
          model: f("Forty", 0.97),
          dimensions: f("3000 × 2600 mm", 0.91),
          motorization: f("FITPNEUMATIC", 0.88),
          options: f(["Anti-effraction"], 0.7),
          target_vehicle: f("Semi-remorque 38t", 0.85),
          quantity: f(1, 0.97),
          unit_price: f(4290, 0.9),
          total_price: f(4290, 0.9)
        }
      ],
      totals: {
        subtotal_ht: f(11990, 0.95),
        vat: f(2398, 0.93),
        total_ttc: f(14388, 0.95)
      },
      currency: "EUR",
      notes: f("Livraison sur le site de Cuverville — prévoir accès par l'entrée logistique.", 0.65),
      overall_confidence: 0.89
    }
  },
  {
    id: "mock-dupuis",
    filename: "dupuis-remorques-605.pdf",
    display_name: "DUPUIS REMORQUES",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T08:34:00Z",
    uploaded_at_short: "08:34",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-chromage",
    filename: "chromage-fret-803.pdf",
    display_name: "Chromage Dur France",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:01:00Z",
    uploaded_at_short: "09:01",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-carrosserie-lyon",
    filename: "carrosserie-lyon-1204.pdf",
    display_name: "Commande 1204",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:15:00Z",
    uploaded_at_short: "09:15",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-spb",
    filename: "spb-2172.pdf",
    display_name: "Commande 2172",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:28:00Z",
    uploaded_at_short: "09:28",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-lvi",
    filename: "lvi-2204.pdf",
    display_name: "Commande 2204",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:42:00Z",
    uploaded_at_short: "09:42",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-frigo",
    filename: "frigo-trans-2294.pdf",
    display_name: "Commande 2294",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:55:00Z",
    uploaded_at_short: "09:55",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-express",
    filename: "express-log-20571.pdf",
    display_name: "Commande 20571",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T10:08:00Z",
    uploaded_at_short: "10:08",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  }
];
