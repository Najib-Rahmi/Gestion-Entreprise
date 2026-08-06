"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Carte } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import Modale from "@/components/ui/Modale";
import { ChampTexte, ChampNombre } from "@/components/ui/Champs";

export interface DonneesEmploye {
  nom: string;
  telephone: string;
  salaireJournalier: number | "";
  actif: boolean;
}

interface FormulaireEmployeProps {
  initiales?: Partial<DonneesEmploye>;
  idEmploye?: string;
}

export default function FormulaireEmploye({
  initiales,
  idEmploye,
}: FormulaireEmployeProps) {
  const router = useRouter();
  const edition = Boolean(idEmploye);
  const [envoi, setEnvoi] = useState(false);
  const [modalRetour, setModalRetour] = useState(false);
  const [donnees, setDonnees] = useState<DonneesEmploye>({
    nom: initiales?.nom ?? "",
    telephone: initiales?.telephone ?? "",
    salaireJournalier: initiales?.salaireJournalier ?? "",
    actif: initiales?.actif ?? true,
  });

  function maj(champ: keyof DonneesEmploye, valeur: string | number | boolean) {
    setDonnees((d) => ({ ...d, [champ]: valeur }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!donnees.nom.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (
      donnees.salaireJournalier === "" ||
      Number(donnees.salaireJournalier) < 0
    ) {
      toast.error("Le salaire journalier est requis");
      return;
    }

    setEnvoi(true);
    try {
      const corps = {
        nom: donnees.nom.trim(),
        telephone: donnees.telephone.trim(),
        salaireJournalier: Number(donnees.salaireJournalier),
        actif: donnees.actif,
      };

      const res = await fetch(
        edition ? `/api/employes/${idEmploye}` : "/api/employes",
        {
          method: edition ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corps),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur serveur");
      }

      const employe = await res.json();
      toast.success(edition ? "Employé mis à jour" : "Employé créé");
      router.push(`/employes/${employe._id ?? idEmploye}`);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      toast.error(message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Carte className="p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-5">
        <ChampTexte
          libelle="Nom complet"
          value={donnees.nom}
          onChange={(e) => maj("nom", e.target.value)}
          placeholder="Ex : Ahmed Ben Salah"
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <ChampTexte
            libelle="Téléphone"
            value={donnees.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
            placeholder="Ex : 98 123 456"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ChampNombre
            libelle="Salaire journalier (DT)"
            value={donnees.salaireJournalier}
            onChange={(e) =>
              maj(
                "salaireJournalier",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Ex : 50"
            min={0}
            step="0.001"
            required
          />
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--couleur-texte)]">
              <input
                type="checkbox"
                checked={donnees.actif}
                onChange={(e) => maj("actif", e.target.checked)}
                className="h-4 w-4 rounded border-[var(--couleur-bordure)] accent-[var(--couleur-primaire)]"
              />
              Employé actif
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Bouton
            type="button"
            variante="secondaire"
            onClick={() => (edition ? setModalRetour(true) : router.back())}>
            Annuler
          </Bouton>
          <Bouton
            type="submit"
            disabled={envoi}>
            {envoi
              ? "Enregistrement..."
              : edition
                ? "Mettre à jour"
                : "Créer l'employé"}
          </Bouton>
        </div>
      </form>

      {/* Confirmation de sortie en édition (perte des modifications) */}
      <Modale
        ouverte={modalRetour}
        onFermer={() => setModalRetour(false)}
        titre="Quitter sans enregistrer">
        <p className="text-sm text-[var(--couleur-texte)]">
          Vous avez des modifications non enregistrées. Si vous quittez, elles
          seront perdues. Voulez-vous vraiment revenir à la page précédente ?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Bouton
            variante="secondaire"
            onClick={() => setModalRetour(false)}>
            Rester
          </Bouton>
          <Bouton
            variante="danger"
            onClick={() => router.back()}>
            Quitter
          </Bouton>
        </div>
      </Modale>
    </Carte>
  );
}
