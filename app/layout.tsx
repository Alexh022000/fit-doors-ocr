import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIT Doors — Démonstrateur OCR Bons de Commande",
  description:
    "Dépôt intelligent de bons de commande FIT Doors : extraction automatique des références, modèles de portes relevantes, dimensions et motorisations grâce à l'IA.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
