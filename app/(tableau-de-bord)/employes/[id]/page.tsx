"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Carte, Chargement, EtatVide } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import Badge from "@/components/ui/Badge";
import CalendrierPresence, {
  JourCalendrier,
} from "@/components/employe/CalendrierPresence";
import SectionAvances, {
  AvanceItem,
} from "@/components/employe/SectionAvances";
import { formaterMontant } from "@/lib/utils";
import { ResumePaie } from "@/lib/paie";

interface EmployeDetail {
  _id: string;
  nom: string;
  telephone: string;
  salaireJournalier: number;
  actif: boolean;
  jours: JourCalendrier[];
  avances: AvanceItem[];
  resume: ResumePaie;
}

export default function PageDetailEmploye() {
  const params = useParams<{ id: string }>();
  const [employe, setEmploye] = useState<EmployeDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const soldePrecedent = useRef<number | null>(null);

  const charger = useCallback(async () => {
    try {
      const res = await fetch(`/api/employes/${params.id}`);
      if (!res.ok) throw new Error();
      const donnees: EmployeDetail = await res.json();
      setEmploye(donnees);
      setErreur(false);

      const solde = donnees.resume.soldeDu;
      const precedent = soldePrecedent.current;
      // Alerte à chaque fois que le solde devient nul/négatif (ou au 1er chargement)
      if (solde <= 0 && (precedent === null || precedent > 0)) {
        toast.error(
          `${donnees.nom} n'a plus d'argent à recevoir (solde dû : ${formaterMontant(solde)}).`,
        );
      }
      soldePrecedent.current = solde;
    } catch {
      setErreur(true);
    } finally {
      setChargement(false);
    }
  }, [params.id]);

  useEffect(() => {
    charger();
  }, [charger]);

  if (chargement) {
    return <Chargement libelle="Chargement de l'employé..." />;
  }

  if (erreur || !employe) {
    return (
      <EtatVide
        titre="Employé introuvable"
        description="Impossible de charger cet employé.">
        <Link href="/employes">
          <Bouton>Retour à la liste</Bouton>
        </Link>
      </EtatVide>
    );
  }

  const { resume } = employe;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/employes"
            title="Retour aux employés"
            aria-label="Retour aux employés"
            className="rounded-xl p-2 text-[var(--couleur-texte-secondaire)] transition-colors hover:bg-[var(--couleur-primaire-doux)] hover:text-[var(--couleur-primaire)]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-affichage text-2xl font-bold tracking-tight text-[var(--couleur-texte)]">
            {employe.nom}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            statut={employe.actif ? "actif" : "inactif"}
            libelle={employe.actif ? "Actif" : "Inactif"}
          />
          <Link href={`/employes/${employe._id}/edit`}>
            <Bouton variante="secondaire">
              <Pencil size={15} />
              Modifier
            </Bouton>
          </Link>
        </div>
      </div>

      {/* Infos */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-[var(--couleur-texte-secondaire)]">
        {employe.telephone && (
          <span className="flex items-center gap-1.5">
            <Phone size={14} />
            {employe.telephone}
          </span>
        )}
        <span className="font-mono-donnees">
          {formaterMontant(employe.salaireJournalier)} / jour
        </span>
      </div>

      {/* Résumé de paie */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Carte className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--couleur-texte-secondaire)]">
            Jours travaillés
          </p>
          <p className="mt-1 font-mono-donnees text-xl font-bold text-[var(--couleur-texte)]">
            {resume.joursTravailles}
          </p>
          <p className="mt-0.5 text-xs text-[var(--couleur-texte-secondaire)]">
            dont {resume.joursPayes} payés
          </p>
        </Carte>
        <Carte className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--couleur-texte-secondaire)]">
            Total gagné
          </p>
          <p className="mt-1 font-mono-donnees text-xl font-bold text-[var(--couleur-texte)]">
            {formaterMontant(resume.totalGagne)}
          </p>
        </Carte>
        <Carte className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--couleur-texte-secondaire)]">
            Avances
          </p>
          <p className="mt-1 font-mono-donnees text-xl font-bold text-[var(--couleur-texte)]">
            {formaterMontant(resume.totalAvances)}
          </p>
        </Carte>
        <Carte className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--couleur-texte-secondaire)]">
            Déjà payé
          </p>
          <p className="mt-1 font-mono-donnees text-xl font-bold text-[var(--couleur-texte)]">
            {formaterMontant(resume.totalPaye)}
          </p>
        </Carte>
        <Carte className="p-4 ring-1 ring-[var(--couleur-primaire)]/30">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--couleur-texte-secondaire)]">
            Solde dû
          </p>
          <p className="mt-1 font-mono-donnees text-xl font-bold text-[var(--couleur-primaire)]">
            {formaterMontant(resume.soldeDu)}
          </p>
        </Carte>
      </div>

      {/* Calendrier + Avances */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Carte className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-center font-affichage text-base font-semibold text-[var(--couleur-texte)]">
            Calendrier de présence
          </h3>
          <CalendrierPresence
            idEmploye={employe._id}
            jours={employe.jours}
            soldeDu={resume.soldeDu}
            salaireJournalier={employe.salaireJournalier}
            onChangement={charger}
          />
        </Carte>
        <Carte className="p-5">
          <SectionAvances
            idEmploye={employe._id}
            avances={employe.avances}
            soldeDu={resume.soldeDu}
            salaireJournalier={employe.salaireJournalier}
            onChangement={charger}
          />
        </Carte>
      </div>
    </div>
  );
}
