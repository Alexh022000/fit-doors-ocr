# FIT Doors — Démonstrateur OCR Bons de Commande

> Démonstrateur propulsé par **JUWA** (juwa.co) pour le prospect **FIT Doors** (fit-doors.fr).
> Déposez un bon de commande (PDF ou image), **Mistral** (IA française, souveraine) extrait automatiquement les champs métier (modèle de porte relevante, véhicule cible, dimensions, motorisation, options, totaux) avec une confiance par champ.

---

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** avec la palette FIT Doors (`#FFFFFF` / `#E63026`)
- **Mistral AI** — IA souveraine française :
  - `mistral-ocr-latest` pour l'OCR natif des PDF et images
  - `mistral-large-latest` pour la structuration JSON + confiance par champ
- **Vercel** pour l'hébergement (serverless functions, 60 s max)

## Démarrage local

```bash
# 1. Cloner
git clone <ton-repo> && cd fit-doors-ocr

# 2. Installer
npm install

# 3. Variables d'environnement
cp .env.local.example .env.local
# puis édite .env.local et ajoute ta clé MISTRAL_API_KEY
# (https://console.mistral.ai/api-keys)

# 4. Démarrer
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Déploiement Vercel (1 minute)

1. Pousse le repo sur GitHub.
2. Sur [vercel.com](https://vercel.com) → **New Project** → importe le repo.
3. Dans **Environment Variables**, ajoute :
   - `MISTRAL_API_KEY` = ta clé (obligatoire)
   - `MISTRAL_OCR_MODEL` = `mistral-ocr-latest` (optionnel, valeur par défaut)
   - `MISTRAL_MODEL` = `mistral-large-latest` (optionnel, valeur par défaut)
4. Deploy. L'URL publique est prête.

> ⚠️ La fonction d'extraction peut durer jusqu'à ~20-40 s pour un PDF multi-pages (2 appels Mistral enchaînés). Vercel Hobby autorise 60 s, c'est donc OK pour une démo.

## Architecture

```
fit-doors-ocr/
├── app/
│   ├── api/extract/route.ts   # Pipeline Mistral OCR → Mistral Large
│   ├── layout.tsx
│   ├── page.tsx               # Monte AppShell
│   └── globals.css
├── components/
│   ├── AppShell.tsx           # Orchestration 3 colonnes + upload + état
│   ├── TopBar.tsx             # Bandeau sombre + tabs Traitement/GED/Stats
│   ├── OrderList.tsx          # Colonne gauche — liste des BDC
│   ├── OrderCard.tsx          # Card BDC avec status pill
│   ├── PdfPreview.tsx         # Colonne centre — preview PDF/image
│   ├── ExtractionPanel.tsx    # Colonne droite — résultats + confiance
│   ├── FieldRow.tsx           # Ligne champ avec pastille de confiance
│   ├── UploadModal.tsx        # Modal drag-drop
│   ├── SecondaryTabs.tsx      # Vues GED + Statistiques
│   └── Spinner.tsx
├── lib/
│   ├── types.ts               # Types (ConfidenceField, Extraction, Order)
│   └── mockOrders.ts          # 8 BDC mockés pour une démo vivante
├── public/favicon.svg
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## Pourquoi Mistral (argument commercial FIT Doors)

- **Souveraineté française** : Mistral est une entreprise française (Paris), l'IA est hébergée en Europe
- **RGPD-native** : aucun transfert de données hors UE, conforme par conception
- **Coût** : `mistral-ocr-latest` à ~1 €/1000 pages + Large en volume modéré
- **Qualité OCR** : Mistral OCR est spécifiquement optimisé pour l'extraction structurée de documents (tables, entêtes, mise en page)

## Personnalisation métier

Le prompt de structuration et le schéma JSON sont centralisés dans `app/api/extract/route.ts` (constante `STRUCTURE_PROMPT`). Pour ajouter ou retirer des champs :

1. Édite le schéma JSON attendu dans le prompt.
2. Ajuste le type `Extraction` dans `lib/types.ts`.
3. Ajuste l'affichage dans `components/ExtractionPanel.tsx`.

Modèles FIT reconnus dans le prompt : `Bois standard`, `Husky`, `Forty`, `Rail Route`. Motorisations : `FITMATIC`, `FITPNEUMATIC`, `FITCLEVER`, `FITSECU`, `Manuelle`. Adapter si de nouveaux modèles apparaissent dans la gamme.

## Palette de couleurs (charte FIT Doors)

| Rôle | Valeur |
|------|--------|
| Rouge principal | `#E63026` |
| Rouge foncé (hover) | `#C0261E` |
| Rouge clair (fond) | `#FDEBEA` |
| Blanc | `#FFFFFF` |
| Gris fond | `#FAFAFA` |
| Encre | `#1A1A1A` |
| Topbar sombre | `#0F1727` |

## Points d'attention pour la démo prospect

- **Confidentialité** : aucun document n'est persisté ; les appels à Mistral sont directs, zéro stockage côté Vercel.
- **Qualité OCR** : pour de meilleurs résultats, privilégier des PDF vectoriels ou des photos bien cadrées (>150 DPI).
- **Extensible** : brancher Supabase (comme le démo SES Sterling) pour historiser les extractions + croiser avec le catalogue FIT. Structure à prévoir : `orders(id, file_name, extracted_json, confidence, created_at)`.
- **ROI démo** : 3-5 min par bon de commande saisi manuellement → <30 s en automatique, soit ~90 % de réduction du temps de saisie.

---

_Propulsé par [JUWA](https://juwa.co) — Agence IA pour TPE/PME._
