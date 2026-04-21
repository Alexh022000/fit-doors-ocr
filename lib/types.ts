// Types partagés front ↔ back pour le démonstrateur FIT Doors.
// Chaque champ extrait embarque sa propre confiance (0..1) pour l'affichage
// de type "Sterling" (pastille verte/orange/rouge + % par champ).

export type ConfidenceField<T> = {
  value: T;
  confidence: number; // 0..1
};

export type LineItem = {
  reference: ConfidenceField<string | null>;
  designation: ConfidenceField<string | null>; // descriptif libre
  model: ConfidenceField<string | null>; // Husky, Forty, Rail Route, Bois
  dimensions: ConfidenceField<string | null>;
  motorization: ConfidenceField<string | null>;
  options: ConfidenceField<string[]>;
  target_vehicle: ConfidenceField<string | null>;
  quantity: ConfidenceField<number | null>;
  unit_price: ConfidenceField<number | null>;
  total_price: ConfidenceField<number | null>;
};

export type Extraction = {
  customer: {
    name: ConfidenceField<string | null>;
    contact: ConfidenceField<string | null>;
    email: ConfidenceField<string | null>;
    phone: ConfidenceField<string | null>;
    address: ConfidenceField<string | null>;
    account_number: ConfidenceField<string | null>;
  };
  order: {
    number: ConfidenceField<string | null>;
    date: ConfidenceField<string | null>;
    client_reference: ConfidenceField<string | null>;
    delivery_conditions: ConfidenceField<string | null>;
    delivery_date: ConfidenceField<string | null>;
  };
  line_items: LineItem[];
  totals: {
    subtotal_ht: ConfidenceField<number | null>;
    vat: ConfidenceField<number | null>;
    total_ttc: ConfidenceField<number | null>;
  };
  currency: string;
  notes: ConfidenceField<string | null>;
  overall_confidence: number;
};

export type OrderStatus = "pending" | "processing" | "success" | "error";

export type Order = {
  id: string;
  filename: string;
  /** Nom affiché dans la liste ; extrait de la société si disponible, sinon filename */
  display_name: string;
  /** data: URL pour l'aperçu — null pour les BDC mockés qui n'ont pas de fichier réel */
  file_data_url: string | null;
  mime_type: string;
  uploaded_at: string; // ISO
  uploaded_at_short: string; // "08:12"
  status: OrderStatus;
  extraction: Extraction | null;
  processing_ms: number | null;
  error_message: string | null;
  model_used: string | null;
};
