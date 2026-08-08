"use client";

import Link from "next/link";
import {
  Building2,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Carte } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import BasculeTheme from "@/components/ui/BasculeTheme";

/**
 * Page d'accueil publique (landing page).
 * Affiche une présentation de l'application et un bouton de connexion.
 */
export default function PageAccueil() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="verre border-b border-(--couleur-bordure)">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--couleur-primaire) text-(--couleur-primaire-texte) shadow-[0_4px_14px_rgba(245,165,36,0.4)]">
              <Building2 size={20} />
            </div>
            <div className="hidden sm:block">
              <p className="font-affichage text-sm font-bold text-(--couleur-texte)">
                Gestion Entreprise
              </p>
              <p className="text-xs text-(--couleur-texte-secondaire)">
                Factures · Clients
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <BasculeTheme />
            <Link href="/connexion">
              <Bouton taille="lg">
                Connexion{" "}
                <ArrowRight
                  size={16}
                  className="ml-2"
                />
              </Bouton>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
          <div className="text-center">
            <div className="mx-auto mb-8 flex items-center justify-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-(--couleur-primaire) text-(--couleur-primaire-texte) shadow-[0_8px_30px_rgba(245,165,36,0.45)]">
                <TrendingUp size={32} />
              </div>
              <h1 className="font-affichage text-4xl font-bold tracking-tight text-(--couleur-texte) sm:text-5xl">
                Gérez votre entreprise simplement
              </h1>
            </div>
            <p className="mx-auto max-w-2xl text-lg text-(--couleur-texte-secondaire)">
              Une application complète pour gérer vos factures et clients.
              Sécurisée, rapide et accessible partout.
            </p>

            {/* Features - moved before button */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
              <Carte className="w-full max-w-sm p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                  <FileText size={24} />
                </div>
                <h3 className="font-affichage mb-2 text-xl font-semibold text-(--couleur-texte)">
                  Factures
                </h3>
                <p className="text-(--couleur-texte-secondaire)">
                  Création, modification, génération PDF, timbre fiscal, TVA.
                </p>
              </Carte>

              <Carte className="w-full max-w-sm p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                  <Users size={24} />
                </div>
                <h3 className="font-affichage mb-2 text-xl font-semibold text-(--couleur-texte)">
                  Clients
                </h3>
                <p className="text-(--couleur-texte-secondaire)">
                  Gestion complète des clients avec adresse, numéro TVA,
                  historique des factures et totaux.
                </p>
              </Carte>
            </div>

            {/* Connect button */}
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/connexion">
                <Bouton
                  taille="lg"
                  className="w-48">
                  Se connecter{" "}
                  <ArrowRight
                    size={16}
                    className="ml-2"
                  />
                </Bouton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="verre border-t border-(--couleur-bordure)">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-4 lg:px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--couleur-primaire) text-(--couleur-primaire-texte)">
                <Building2 size={16} />
              </div>
              <p className="font-affichage text-sm font-bold text-(--couleur-texte)">
                Gestion Entreprise
              </p>
            </div>
            <p className="text-xs text-(--couleur-texte-secondaire)">
              © 2026 Gestion Entreprise - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
