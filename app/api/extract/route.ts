import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Pipeline d'extraction FIT Doors — 100% Mistral (IA française, souveraine).
 *
 * Étape 1 : mistral-ocr-latest → extrait texte + layout du PDF / image en markdown structuré.
 * Étape 2 : mistral-large-latest → transforme le markdown en JSON strict avec confiance par champ.
 *
 * Pourquoi ce découpage :
 *  - L'endpoint OCR de Mistral est optimisé pour la reconnaissance de documents
 *    (tables, entêtes, logos) et produit un markdown propre, plus facile à parser
 *    qu'une image pour un modèle texte.
 *  - Le modèle Large se charge uniquement du raisonnement structuré
 *    (interprétation métier des lignes, détection gamme FIT, confiance par champ).
 */

const STRUCTURE_PROMPT = `Tu es un agent de structuration documentaire spécialisé pour FIT Doors (fit-doors.fr), fabricant français de portes relevantes pour véhicules industriels (camions, remorques, semi-remorques, VUL, véhicules spéciaux).

Tu reçois le markdown d'un BON DE COMMANDE déjà OCRisé par Mistral OCR.

Ta mission : extraire toutes les informations pertinentes et retourner UNIQUEMENT un objet JSON STRICTEMENT conforme au schéma ci-dessous. Pas de texte avant/après, pas de balise Markdown.

Gamme produits FIT à reconnaître :
- Porte bois standard
- Husky (porte isotherme)
- Forty (porte aluminium)
- Rail Route (porte aluminium spécifique multimodal)
Motorisations / options :
- FITMATIC (100% électrique)
- FITPNEUMATIC, FITCLEVER (pneumatique)
- FITSECU (sécurité télécommande)
- Manuelle

Chaque champ extrait doit être accompagné d'une confiance (0 à 1) que TU estimes : fiabilité haute (0.9+) pour un champ clairement lisible et sans ambiguïté dans le markdown OCR, moyenne (0.6-0.85) pour un champ partiellement lisible ou déductible du contexte, faible (0-0.5) pour un champ absent ou très incertain.

Schéma JSON attendu :
{
  "customer": {
    "name": {"value": string|null, "confidence": number},
    "contact": {"value": string|null, "confidence": number},
    "email": {"value": string|null, "confidence": number},
    "phone": {"value": string|null, "confidence": number},
    "address": {"value": string|null, "confidence": number},
    "account_number": {"value": string|null, "confidence": number}
  },
  "order": {
    "number": {"value": string|null, "confidence": number},
    "date": {"value": string|null, "confidence": number},
    "client_reference": {"value": string|null, "confidence": number},
    "delivery_conditions": {"value": string|null, "confidence": number},
    "delivery_date": {"value": string|null, "confidence": number}
  },
  "line_items": [
    {
      "reference": {"value": string|null, "confidence": number},
      "designation": {"value": string|null, "confidence": number},
      "model": {"value": string|null, "confidence": number},
      "dimensions": {"value": string|null, "confidence": number},
      "motorization": {"value": string|null, "confidence": number},
      "options": {"value": string[], "confidence": number},
      "target_vehicle": {"value": string|null, "confidence": number},
      "quantity": {"value": number|null, "confidence": number},
      "unit_price": {"value": number|null, "confidence": number},
      "total_price": {"value": number|null, "confidence": number}
    }
  ],
  "totals": {
    "subtotal_ht": {"value": number|null, "confidence": number},
    "vat": {"value": number|null, "confidence": number},
    "total_ttc": {"value": number|null, "confidence": number}
  },
  "currency": "EUR",
  "notes": {"value": string|null, "confidence": number},
  "overall_confidence": number
}

RÈGLES :
1. Si un champ est absent : value=null et confidence=0 (pas "N/A" ni "inconnu").
2. Pour les montants : nombres décimaux (ex: 1299.50), pas de string.
3. Pour les options : tableau vide [] si aucune (mais confidence reste haute si tu en es sûr qu'il n'y en a pas).
4. Pour les dates : format ISO "YYYY-MM-DD" si possible.
5. overall_confidence = ta confiance globale sur la qualité de l'extraction (moyenne pondérée mentalement des champs critiques).
6. NE JAMAIS inventer. Si doute, value=null.
7. Réponse en JSON pur, parsable directement par JSON.parse().`;

type AnyExtraction = Record<string, any>;

function safeParseJson(text: string): AnyExtraction | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Defensive field normalizer — garantit la forme {value, confidence}
function cf<T>(
  raw: any,
  defaultValue: T,
  defaultConfidence = 0
): { value: T; confidence: number } {
  if (raw && typeof raw === "object" && "value" in raw) {
    return {
      value: (raw.value ?? defaultValue) as T,
      confidence:
        typeof raw.confidence === "number"
          ? Math.max(0, Math.min(1, raw.confidence))
          : defaultConfidence
    };
  }
  if (raw !== undefined && raw !== null) {
    return { value: raw as T, confidence: 0.7 };
  }
  return { value: defaultValue, confidence: defaultConfidence };
}

function normalize(parsed: AnyExtraction) {
  const c = parsed.customer ?? {};
  const o = parsed.order ?? {};
  const t = parsed.totals ?? {};
  const lines = Array.isArray(parsed.line_items) ? parsed.line_items : [];

  return {
    customer: {
      name: cf<string | null>(c.name, null),
      contact: cf<string | null>(c.contact, null),
      email: cf<string | null>(c.email, null),
      phone: cf<string | null>(c.phone, null),
      address: cf<string | null>(c.address, null),
      account_number: cf<string | null>(c.account_number, null)
    },
    order: {
      number: cf<string | null>(o.number, null),
      date: cf<string | null>(o.date, null),
      client_reference: cf<string | null>(o.client_reference, null),
      delivery_conditions: cf<string | null>(o.delivery_conditions, null),
      delivery_date: cf<string | null>(o.delivery_date, null)
    },
    line_items: lines.map((li: any) => ({
      reference: cf<string | null>(li?.reference, null),
      designation: cf<string | null>(li?.designation, null),
      model: cf<string | null>(li?.model, null),
      dimensions: cf<string | null>(li?.dimensions, null),
      motorization: cf<string | null>(li?.motorization, null),
      options: cf<string[]>(li?.options, []),
      target_vehicle: cf<string | null>(li?.target_vehicle, null),
      quantity: cf<number | null>(li?.quantity, null),
      unit_price: cf<number | null>(li?.unit_price, null),
      total_price: cf<number | null>(li?.total_price, null)
    })),
    totals: {
      subtotal_ht: cf<number | null>(t.subtotal_ht, null),
      vat: cf<number | null>(t.vat, null),
      total_ttc: cf<number | null>(t.total_ttc, null)
    },
    currency: typeof parsed.currency === "string" ? parsed.currency : "EUR",
    notes: cf<string | null>(parsed.notes, null),
    overall_confidence:
      typeof parsed.overall_confidence === "number"
        ? Math.max(0, Math.min(1, parsed.overall_confidence))
        : 0.75
  };
}

const MISTRAL_BASE = "https://api.mistral.ai/v1";

async function mistralOcr(
  apiKey: string,
  ocrModel: string,
  mediaType: string,
  b64: string,
  isPdf: boolean
): Promise<string> {
  const dataUrl = `data:${mediaType};base64,${b64}`;
  const body = isPdf
    ? {
        model: ocrModel,
        document: { type: "document_url", document_url: dataUrl },
        include_image_base64: false
      }
    : {
        model: ocrModel,
        document: { type: "image_url", image_url: dataUrl },
        include_image_base64: false
      };

  const res = await fetch(`${MISTRAL_BASE}/ocr`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Mistral OCR ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const pages: any[] = Array.isArray(data?.pages) ? data.pages : [];
  const markdown = pages
    .map((p: any, i: number) =>
      `## Page ${p.index ?? i + 1}\n\n${p.markdown ?? p.text ?? ""}`
    )
    .join("\n\n---\n\n");

  if (!markdown.trim()) {
    throw new Error("Mistral OCR n'a rien renvoyé (document vide ou illisible).");
  }
  return markdown;
}

async function mistralStructure(
  apiKey: string,
  chatModel: string,
  markdown: string
): Promise<AnyExtraction | null> {
  const res = await fetch(`${MISTRAL_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: chatModel,
      temperature: 0,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: STRUCTURE_PROMPT },
        {
          role: "user",
          content: `Voici le markdown issu de Mistral OCR. Structure-le selon le schéma demandé.\n\n---\n\n${markdown}`
        }
      ]
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Mistral chat ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return safeParseJson(content);
}

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "MISTRAL_API_KEY manquante côté serveur. Ajoute la variable d'environnement dans Vercel (https://console.mistral.ai)."
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString("base64");

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    const mediaType = isPdf ? "application/pdf" : file.type || "image/jpeg";

    const ocrModel = process.env.MISTRAL_OCR_MODEL || "mistral-ocr-latest";
    const chatModel = process.env.MISTRAL_MODEL || "mistral-large-latest";

    // Étape 1 — OCR
    const markdown = await mistralOcr(apiKey, ocrModel, mediaType, b64, isPdf);

    // Étape 2 — Structuration JSON
    const parsed = await mistralStructure(apiKey, chatModel, markdown);

    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Mistral Large a répondu dans un format inattendu. Réessaie avec une image de meilleure qualité.",
          debug_markdown: markdown.slice(0, 500)
        },
        { status: 502 }
      );
    }

    const extraction = normalize(parsed);

    return NextResponse.json({
      extraction,
      raw_model: `${ocrModel} → ${chatModel}`,
      processing_ms: Date.now() - started
    });
  } catch (err: any) {
    console.error("[extract] error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Erreur lors de l'extraction. Vérifie le format du document et la clé API Mistral."
      },
      { status: 500 }
    );
  }
}
