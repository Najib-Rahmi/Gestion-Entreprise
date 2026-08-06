"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EntetePage, Chargement, EtatVide } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import FormulaireEmploye, {
  DonneesEmploye,
} from "@/components/employe/FormulaireEmploye";

export default function PageEditEmploye() {
  const params = useParams<{ id: string }>();
  const [initiales, setInitiales] = useState<Partial<DonneesEmploye> | null>(
    null,
  );
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch(`/api/employes/${params.id}`);
        if (!res.ok) throw new Error();
        const employe = await res.json();
        setInitiales({
          nom: employe.nom,
          telephone: employe.telephone,
          salaireJournalier: employe.salaireJournalier,
          actif: employe.actif,
        });
      } catch {
        setErreur(true);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [params.id]);

  return (
    <div className="mx-auto max-w-2xl">
      <EntetePage
        titre="Modifier l'employé"
        description="Mettez à jour les informations de l'employé."
      />
      {chargement ? (
        <Chargement libelle="Chargement de l'employé..." />
      ) : erreur || !initiales ? (
        <EtatVide
          titre="Employé introuvable"
          description="Impossible de charger cet employé.">
          <Bouton onClick={() => window.history.back()}>Retour</Bouton>
        </EtatVide>
      ) : (
        <FormulaireEmploye
          initiales={initiales}
          idEmploye={params.id}
        />
      )}
    </div>
  );
}
