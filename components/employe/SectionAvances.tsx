"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Bouton from "@/components/ui/Bouton";
import Modale from "@/components/ui/Modale";
import { ChampNombre, ChampTexte } from "@/components/ui/Champs";
import { formaterMontant, formaterDate } from "@/lib/utils";

export interface AvanceItem {
  _id: string;
  montant: number;
  date: string;
  note: string;
}

interface SectionAvancesProps {
  idEmploye: string;
  avances: AvanceItem[];
  soldeDu: number;
  salaireJournalier: number;
  onChangement: () => void;
}

export default function SectionAvances({
  idEmploye,
  avances,
  soldeDu,
  salaireJournalier,
  onChangement,
}: SectionAvancesProps) {
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [confirmationOuverte, setConfirmationOuverte] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [montant, setMontant] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  function dateAujourdhui() {
    const d = new Date();
    const mois = String(d.getMonth() + 1).padStart(2, "0");
    const jour = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mois}-${jour}`;
  }

  function ouvrirModale() {
    setMontant("");
    setDate(dateAujourdhui());
    setNote("");
    setModaleOuverte(true);
  }

  function soumettreAvance(e: React.FormEvent) {
    e.preventDefault();
    if (montant === "" || Number(montant) <= 0) {
      toast.error("Le montant doit être supérieur à zéro");
      return;
    }

    if (!date) {
      toast.error("La date est requise");
      return;
    }

    // Si le solde est inférieur ou égal au salaire journalier,
    // demander confirmation avant d'ajouter l'avance.
    if (soldeDu <= salaireJournalier) {
      setConfirmationOuverte(true);
      return;
    }
    ajouterAvance();
  }

  async function ajouterAvance() {
    setEnvoi(true);
    try {
      const res = await fetch(`/api/employes/${idEmploye}/avances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montant: Number(montant),
          date,
          note: note.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur serveur");
      }
      toast.success("Avance ajoutée");
      setModaleOuverte(false);
      onChangement();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur";
      toast.error(message);
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimerAvance(avanceId: string) {
    try {
      const res = await fetch(`/api/employes/${idEmploye}/avances`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avanceId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Avance supprimée");
      onChangement();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-affichage text-base font-semibold text-[var(--couleur-texte)]">
          Avances (frais)
        </h3>
        <Bouton
          taille="sm"
          onClick={ouvrirModale}>
          <Plus size={14} />
          Ajouter
        </Bouton>
      </div>

      {avances.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--couleur-texte-secondaire)]">
          Aucune avance enregistrée.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--couleur-bordure)]">
          {avances.map((avance) => (
            <li
              key={avance._id}
              className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono-donnees text-sm font-semibold text-[var(--couleur-texte)]">
                  {formaterMontant(avance.montant)}
                </p>
                <p className="truncate text-xs text-[var(--couleur-texte-secondaire)]">
                  {formaterDate(avance.date)}
                  {avance.note ? ` · ${avance.note}` : ""}
                </p>
              </div>
              <button
                onClick={() => supprimerAvance(avance._id)}
                title="Supprimer"
                className="rounded-lg p-2 text-[var(--couleur-texte-secondaire)] transition-colors hover:bg-red-500/10 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modale d'ajout */}
      <Modale
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
        titre="Nouvelle avance">
        <form
          onSubmit={soumettreAvance}
          className="space-y-4">
          <ChampNombre
            libelle="Montant (DT)"
            value={montant}
            onChange={(e) =>
              setMontant(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Ex : 100"
            min={0}
            step="0.001"
            required
          />
          <ChampTexte
            libelle="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <ChampTexte
            libelle="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optionnel"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Bouton
              type="button"
              variante="secondaire"
              onClick={() => setModaleOuverte(false)}>
              Annuler
            </Bouton>
            <Bouton
              type="submit"
              disabled={envoi}>
              {envoi ? "Ajout..." : "Ajouter"}
            </Bouton>
          </div>
        </form>
      </Modale>

      {/* Confirmation avance quand le solde est nul */}
      <Modale
        ouverte={confirmationOuverte}
        onFermer={() => setConfirmationOuverte(false)}
        titre="Confirmer l'avance">
        <p className="text-sm text-[var(--couleur-texte)]">
          Êtes-vous sûr de vouloir donner une avance à cet employé ? Son solde
          dû est de{" "}
          <span className="font-mono-donnees font-semibold">
            {formaterMontant(soldeDu)}
          </span>{" "}
          et il deviendra{" "}
          <span className="font-mono-donnees font-semibold text-red-500">
            {formaterMontant(soldeDu - Number(montant || 0))}
          </span>
          .
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Bouton
            variante="secondaire"
            onClick={() => setConfirmationOuverte(false)}>
            Annuler
          </Bouton>
          <Bouton
            disabled={envoi}
            onClick={() => {
              setConfirmationOuverte(false);
              ajouterAvance();
            }}>
            Confirmer
          </Bouton>
        </div>
      </Modale>
    </div>
  );
}
