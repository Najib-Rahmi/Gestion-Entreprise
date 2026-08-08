import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const policeAffichage = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const policeCorps = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const policeMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestion Entreprise",
  description:
    "Application de gestion d'entreprise : factures, employés et clients",
};

/**
 * Layout racine de l'application.
 * - ThemeProvider : gère le basculement clair/sombre via la classe .dark
 * - Toaster : notifications globales (sonner)
 * - Polices : Sora (affichage), Inter (corps), JetBrains Mono (données)
 */
export default function LayoutRacine({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning>
      <body
        className={`min-h-screen antialiased ${policeAffichage.variable} ${policeCorps.variable} ${policeMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem>
          <div
            className="lueur-ambiante"
            aria-hidden="true"
          />
          {children}
          <Toaster
            richColors
            position="top-right"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
