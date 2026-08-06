"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { cn, formaterMontant } from "@/lib/utils";
import { cleJour } from "@/lib/paie";
import Bouton from "@/components/ui/Bouton";
import Modale from "@/components/ui/Modale";

export interface JourCalendrier {
  date: string;
  paye: boolean;
}

interface CalendrierPresenceProps {
  idEmploye: string;
  jours: JourCalendrier[];
  soldeDu: number;
  salaireJournalier: number;
  onChangement: () => void;
}

const JOURS_SEMAINE = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

/**
 * Calendrier mensuel de présence.
 * Clic gauche : bascule le jour travaillé.
 * Clic droit (ou bouton paye) : bascule le statut payé d'un jour travaillé.
 */
export default function CalendrierPresence({
  idEmploye,
  jours,
  soldeDu,
  salaireJournalier,
  onChangement,
}: CalendrierPresenceProps) {
  const aujourdhui = new Date();
  const [moisAffiche, setMoisAffiche] = useState(
    new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1),
  );
  const [chargement, setChargement] = useState<string | null>(null);
  const [confirmationPaye, setConfirmationPaye] = useState<Date | null>(null);

  // Détection du double-tap (mobile) pour basculer le statut payé
  const dernierTap = useRef<{ cle: string; temps: number } | null>(null);
  const minuteurTap = useRef<ReturnType<typeof setTimeout> | null>(null);

  function gererTap(date: Date) {
    const cle = cleJour(date);
    const maintenant = Date.now();
    const precedent = dernierTap.current;

    if (
      precedent &&
      precedent.cle === cle &&
      maintenant - precedent.temps < 300
    ) {
      // Double-tap : basculer payé
      if (minuteurTap.current) {
        clearTimeout(minuteurTap.current);
        minuteurTap.current = null;
      }
      dernierTap.current = null;
      basculerPaye(date);
      return;
    }

    // Premier tap : attendre un éventuel second tap avant de basculer travaillé
    dernierTap.current = { cle, temps: maintenant };
    if (minuteurTap.current) clearTimeout(minuteurTap.current);
    minuteurTap.current = setTimeout(() => {
      minuteurTap.current = null;
      dernierTap.current = null;
      basculerJour(date);
    }, 300);
  }

  // Index des jours travaillés par clé AAAA-MM-JJ
  const indexJours = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const j of jours) {
      map.set(cleJour(j.date), j.paye);
    }
    return map;
  }, [jours]);

  // Construction de la grille du mois (semaines commençant lundi)
  const grille = useMemo(() => {
    const annee = moisAffiche.getFullYear();
    const mois = moisAffiche.getMonth();
    const premierJour = new Date(annee, mois, 1);
    const nbJours = new Date(annee, mois + 1, 0).getDate();

    // Décalage : lundi = 0
    let decalage = premierJour.getDay() - 1;
    if (decalage < 0) decalage = 6;

    const cellules: (Date | null)[] = [];
    for (let i = 0; i < decalage; i++) cellules.push(null);
    for (let j = 1; j <= nbJours; j++) cellules.push(new Date(annee, mois, j));
    return cellules;
  }, [moisAffiche]);

  function moisPrecedent() {
    setMoisAffiche(
      new Date(moisAffiche.getFullYear(), moisAffiche.getMonth() - 1, 1),
    );
  }

  function moisSuivant() {
    setMoisAffiche(
      new Date(moisAffiche.getFullYear(), moisAffiche.getMonth() + 1, 1),
    );
  }

  async function basculerJour(date: Date) {
    const cle = cleJour(date);
    setChargement(cle);
    try {
      const res = await fetch(`/api/employes/${idEmploye}/jours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: cle }),
      });
      if (!res.ok) throw new Error();
      onChangement();
    } catch {
      toast.error("Erreur lors de la bascule du jour");
    } finally {
      setChargement(null);
    }
  }

  async function executerBasculerPaye(date: Date) {
    const cle = cleJour(date);
    const paye = indexJours.get(cle);
    if (paye === undefined) return; // jour non travaillé

    setChargement(cle);
    try {
      const res = await fetch(`/api/employes/${idEmploye}/jours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: cle, paye: !paye }),
      });
      if (!res.ok) throw new Error();
      onChangement();
    } catch {
      toast.error("Erreur lors du changement de statut");
    } finally {
      setChargement(null);
    }
  }

  function basculerPaye(date: Date) {
    const cle = cleJour(date);
    const paye = indexJours.get(cle);
    if (paye === undefined) return; // jour non travaillé

    // Si on marque payé alors que le solde est inférieur au salaire journalier,
    // demander confirmation (le solde deviendrait négatif).
    if (!paye && soldeDu < salaireJournalier) {
      setConfirmationPaye(date);
      return;
    }
    executerBasculerPaye(date);
  }

  const cleAujourdhui = cleJour(aujourdhui);

  return (
    <div>
      {/* En-tête du calendrier */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={moisPrecedent}
          className="rounded-lg p-2 text-[var(--couleur-texte-secondaire)] transition-colors hover:bg-[var(--couleur-primaire-doux)] hover:text-[var(--couleur-primaire)]"
          title="Mois précédent">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-affichage text-base font-semibold text-[var(--couleur-texte)]">
          {MOIS[moisAffiche.getMonth()]} {moisAffiche.getFullYear()}
        </h3>
        <button
          onClick={moisSuivant}
          className="rounded-lg p-2 text-[var(--couleur-texte-secondaire)] transition-colors hover:bg-[var(--couleur-primaire-doux)] hover:text-[var(--couleur-primaire)]"
          title="Mois suivant">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {JOURS_SEMAINE.map((j) => (
          <div
            key={j}
            className="py-1 text-center text-xs font-semibold uppercase tracking-wide text-[var(--couleur-texte-secondaire)]">
            {j}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {grille.map((date, i) => {
          if (!date) {
            return (
              <div
                key={`vide-${i}`}
                className="aspect-square"
              />
            );
          }

          const cle = cleJour(date);
          const travaille = indexJours.has(cle);
          const paye = indexJours.get(cle) === true;
          const estAujourdhui = cle === cleAujourdhui;
          const enChargement = chargement === cle;

          return (
            <button
              key={cle}
              onClick={() => gererTap(date)}
              onContextMenu={(e) => {
                e.preventDefault();
                basculerPaye(date);
              }}
              disabled={enChargement}
              title={
                travaille
                  ? paye
                    ? "Travaillé et payé : double-tap ou clic droit pour marquer non payé"
                    : "Travaillé, non payé : double-tap ou clic droit pour marquer payé"
                  : "Cliquer pour marquer travaillé"
              }
              className={cn(
                "relative aspect-square rounded-lg text-sm font-medium transition-all",
                "border border-transparent",
                travaille
                  ? paye
                    ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300"
                    : "bg-[var(--couleur-primaire-doux)] text-[var(--couleur-primaire-texte)] ring-1 ring-[var(--couleur-primaire)]/30"
                  : "text-[var(--couleur-texte-secondaire)] hover:border-[var(--couleur-bordure)] hover:bg-[var(--couleur-primaire-doux)]/50",
                estAujourdhui && "ring-2 ring-[var(--couleur-primaire)]",
                enChargement && "opacity-50",
              )}>
              {date.getDate()}
              {paye && (
                <Check
                  size={10}
                  className="absolute right-0.5 top-0.5 text-emerald-600 dark:text-emerald-400"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--couleur-texte-secondaire)]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[var(--couleur-primaire-doux)] ring-1 ring-[var(--couleur-primaire)]/30" />
          Travaillé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-500/15 ring-1 ring-emerald-500/30" />
          Payé
        </span>
        <span className="italic">Double-tap ou clic droit = basculer payé</span>
      </div>

      {/* Confirmation paiement quand le solde est insuffisant */}
      <Modale
        ouverte={confirmationPaye !== null}
        onFermer={() => setConfirmationPaye(null)}
        titre="Confirmer le paiement">
        <p className="text-sm text-[var(--couleur-texte)]">
          Êtes-vous sûr de vouloir payer cet employé ? Son solde dû est de{" "}
          <span className="font-mono-donnees font-semibold">
            {formaterMontant(soldeDu)}
          </span>{" "}
          et il deviendra{" "}
          <span className="font-mono-donnees font-semibold text-red-500">
            {formaterMontant(soldeDu - salaireJournalier)}
          </span>
          .
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Bouton
            variante="secondaire"
            onClick={() => setConfirmationPaye(null)}>
            Annuler
          </Bouton>
          <Bouton
            onClick={() => {
              if (confirmationPaye) executerBasculerPaye(confirmationPaye);
              setConfirmationPaye(null);
            }}>
            Confirmer
          </Bouton>
        </div>
      </Modale>
    </div>
  );
}
