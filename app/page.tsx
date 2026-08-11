"use client";

import Link from "next/link";
import {
  Building2,
  FileText,
  Users,
  ArrowRight,
  CalendarCheck,
  Wallet,
  FileDown,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { Carte } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import BasculeTheme from "@/components/ui/BasculeTheme";

/**
 * Page d'accueil publique (landing page).
 * Présente les trois modules : Factures, Clients et Employés.
 */
export default function PageAccueil() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="verre sticky top-0 z-10 border-b border-(--couleur-bordure)">
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
                Factures · Clients · Employés
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
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-24">
          <div className="text-center">
            <span className="verre inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-(--couleur-texte-secondaire)">
              <TrendingUp
                size={14}
                className="text-(--couleur-primaire)"
              />
              Gestion d'entreprise tout-en-un
            </span>
            <h1 className="font-affichage mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-(--couleur-texte) sm:text-6xl">
              Gérez votre entreprise{" "}
              <span className="text-(--couleur-primaire)">simplement</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-(--couleur-texte-secondaire)">
              Factures, clients et paie des employés réunis dans une seule
              application. Sécurisée, rapide et accessible partout.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/connexion">
                <Bouton
                  taille="lg"
                  className="w-52">
                  Commencer{" "}
                  <ArrowRight
                    size={16}
                    className="ml-2"
                  />
                </Bouton>
              </Link>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Carte className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                <FileText size={24} />
              </div>
              <h3 className="font-affichage mb-2 text-xl font-semibold text-(--couleur-texte)">
                Factures
              </h3>
              <p className="text-(--couleur-texte-secondaire)">
                Création, modification, génération PDF, timbre fiscal et TVA.
              </p>
            </Carte>

            <Carte className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                <Users size={24} />
              </div>
              <h3 className="font-affichage mb-2 text-xl font-semibold text-(--couleur-texte)">
                Clients
              </h3>
              <p className="text-(--couleur-texte-secondaire)">
                Base de clients complète avec adresse, numéro TVA et historique
                des factures.
              </p>
            </Carte>

            <Carte className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                <CalendarCheck size={24} />
              </div>
              <h3 className="font-affichage mb-2 text-xl font-semibold text-(--couleur-texte)">
                Employés
              </h3>
              <p className="text-(--couleur-texte-secondaire)">
                Suivi de présence, avances et calcul automatique de la paie.
              </p>
            </Carte>
          </div>
        </section>

        {/* Points forts */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="font-affichage mb-10 text-center text-2xl font-bold text-(--couleur-texte) sm:text-3xl">
            Conçue pour le quotidien
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icone: FileDown,
                titre: "PDF en un clic",
                texte:
                  "Générez des factures PDF professionnelles instantanément.",
              },
              {
                icone: Wallet,
                titre: "Paie maîtrisée",
                texte:
                  "Solde dû calculé en temps réel à partir des présences et avances.",
              },
              {
                icone: ShieldCheck,
                titre: "Sécurisée",
                texte:
                  "Sessions chiffrées et données protégées par authentification.",
              },
              {
                icone: Smartphone,
                titre: "Partout",
                texte:
                  "Interface responsive, utilisable sur mobile comme sur ordinateur.",
              },
            ].map(({ icone: Icone, titre, texte }) => (
              <div
                key={titre}
                className="text-center">
                <div className="verre mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-(--couleur-primaire)">
                  <Icone size={22} />
                </div>
                <h3 className="font-affichage mb-1 font-semibold text-(--couleur-texte)">
                  {titre}
                </h3>
                <p className="text-sm text-(--couleur-texte-secondaire)">
                  {texte}
                </p>
              </div>
            ))}
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
