"use client";

import Link from "next/link";
import { FileText, Building2, Users, Wallet, ArrowRight } from "lucide-react";
import { Carte, EntetePage, Chargement, EtatVide } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import { useFetch } from "@/lib/useFetch";
import { formaterMontant } from "@/lib/utils";

interface Statistiques {
  nbClients: number;
  nbFactures: number;
  nbEmployes: number;
  chiffreAffaires: number;
  masseSalarialeDue: number;
}

/**
 * Tableau de bord principal.
 * Affiche les indicateurs clés : clients, factures, chiffre d'affaires,
 * employés actifs et masse salariale due.
 */
export default function PageTableauDeBord() {
  const {
    donnees: stats,
    chargement,
    erreur,
    recharger,
  } = useFetch<Statistiques>("/api/statistiques", {
    messageErreur: "Impossible de charger les statistiques",
  });

  return (
    <div>
      <EntetePage
        titre="Tableau de bord"
        description="Vue d'ensemble de votre activité."
      />

      {chargement ? (
        <Chargement libelle="Chargement des statistiques..." />
      ) : erreur || !stats ? (
        <Carte>
          <EtatVide
            titre="Erreur de chargement"
            description="Impossible de charger les statistiques.">
            <Bouton onClick={recharger}>Réessayer</Bouton>
          </EtatVide>
        </Carte>
      ) : (
        <>
          {/* Indicateurs chiffrés */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Carte className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-(--couleur-texte-secondaire)">
                  Chiffre d'affaires
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                  <FileText size={18} />
                </div>
              </div>
              <p className="mt-2 font-mono-donnees text-2xl font-bold text-(--couleur-texte)">
                {formaterMontant(stats.chiffreAffaires)}
              </p>
              <p className="mt-1 text-xs text-(--couleur-texte-secondaire)">
                {stats.nbFactures} facture{stats.nbFactures > 1 ? "s" : ""}
              </p>
            </Carte>

            <Carte className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-(--couleur-texte-secondaire)">
                  Clients
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                  <Building2 size={18} />
                </div>
              </div>
              <p className="mt-2 font-mono-donnees text-2xl font-bold text-(--couleur-texte)">
                {stats.nbClients}
              </p>
              <Link
                href="/clients"
                className="mt-1 inline-flex items-center gap-1 text-xs text-(--couleur-primaire) hover:underline">
                Voir les clients
                <ArrowRight size={12} />
              </Link>
            </Carte>

            <Carte className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-(--couleur-texte-secondaire)">
                  Employés actifs
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                  <Users size={18} />
                </div>
              </div>
              <p className="mt-2 font-mono-donnees text-2xl font-bold text-(--couleur-texte)">
                {stats.nbEmployes}
              </p>
              <Link
                href="/employes"
                className="mt-1 inline-flex items-center gap-1 text-xs text-(--couleur-primaire) hover:underline">
                Voir les employés
                <ArrowRight size={12} />
              </Link>
            </Carte>

            <Carte className="p-5 ring-1 ring-(--couleur-primaire)/30">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-(--couleur-texte-secondaire)">
                  Masse salariale due
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--couleur-primaire-doux) text-(--couleur-primaire)">
                  <Wallet size={18} />
                </div>
              </div>
              <p className="mt-2 font-mono-donnees text-2xl font-bold text-(--couleur-primaire)">
                {formaterMontant(stats.masseSalarialeDue)}
              </p>
              <p className="mt-1 text-xs text-(--couleur-texte-secondaire)">
                Solde à payer aux employés actifs
              </p>
            </Carte>
          </div>

          {/* Accès rapides */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Carte className="p-5">
              <h3 className="font-affichage mb-1 text-base font-semibold text-(--couleur-texte)">
                Factures
              </h3>
              <p className="mb-4 text-sm text-(--couleur-texte-secondaire)">
                Créez et gérez vos factures, générez des PDF.
              </p>
              <Link href="/factures">
                <Bouton
                  variante="secondaire"
                  taille="sm">
                  Accéder
                  <ArrowRight size={14} />
                </Bouton>
              </Link>
            </Carte>

            <Carte className="p-5">
              <h3 className="font-affichage mb-1 text-base font-semibold text-(--couleur-texte)">
                Clients
              </h3>
              <p className="mb-4 text-sm text-(--couleur-texte-secondaire)">
                Gérez votre base de clients et leur historique.
              </p>
              <Link href="/clients">
                <Bouton
                  variante="secondaire"
                  taille="sm">
                  Accéder
                  <ArrowRight size={14} />
                </Bouton>
              </Link>
            </Carte>

            <Carte className="p-5">
              <h3 className="font-affichage mb-1 text-base font-semibold text-(--couleur-texte)">
                Employés
              </h3>
              <p className="mb-4 text-sm text-(--couleur-texte-secondaire)">
                Suivez la présence, les avances et la paie.
              </p>
              <Link href="/employes">
                <Bouton
                  variante="secondaire"
                  taille="sm">
                  Accéder
                  <ArrowRight size={14} />
                </Bouton>
              </Link>
            </Carte>
          </div>
        </>
      )}
    </div>
  );
}
