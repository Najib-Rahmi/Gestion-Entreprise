"use client";

import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  Trash2,
  Pencil,
  CalendarDays,
} from "lucide-react";
import { Carte, EntetePage, Chargement, EtatVide } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import Modale from "@/components/ui/Modale";
import Badge from "@/components/ui/Badge";
import { useList, useDeleteModal } from "@/lib/hooks";
import { formaterMontant } from "@/lib/utils";
import { ResumePaie } from "@/lib/paie";

interface EmployeItem {
  _id: string;
  nom: string;
  telephone: string;
  salaireJournalier: number;
  actif: boolean;
  resume: ResumePaie;
}

export default function PageEmployes() {
  const {
    data: employes,
    loading,
    error,
    refresh,
    searchParams,
    setSearchParams,
  } = useList<EmployeItem>({
    endpoint: "/api/employes",
    searchParams: { recherche: "" },
    debounceMs: 300,
  });

  const {
    open: openDelete,
    close: closeDelete,
    isOpen: deleteOpen,
    itemToDelete,
    confirmDelete,
    deleting,
  } = useDeleteModal();

  async function handleDelete() {
    await confirmDelete(async () => {
      if (!itemToDelete) return;
      const res = await fetch(`/api/employes/${itemToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      refresh();
    });
  }

  return (
    <div>
      <EntetePage
        titre="Employés"
        description={`Total : ${employes.length}`}>
        <Link href="/employes/nouvelle-employe">
          <Bouton>
            <Plus size={16} />
            Nouvel employé
          </Bouton>
        </Link>
      </EntetePage>

      {/* Filtre */}
      <Carte className="mb-4 p-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--couleur-texte-secondaire)]"
            size={18}
          />
          <input
            type="text"
            value={searchParams.recherche || ""}
            onChange={(e) =>
              setSearchParams({ ...searchParams, recherche: e.target.value })
            }
            placeholder="Rechercher un employé..."
            className="w-full rounded-xl border border-[var(--couleur-bordure)] bg-[var(--couleur-carte)] py-2 pl-10 pr-4 text-sm text-[var(--couleur-texte)] placeholder-[var(--couleur-texte-secondaire)] backdrop-blur-sm transition-colors focus:border-[var(--couleur-primaire)] focus:outline-none focus:ring-2 focus:ring-[var(--couleur-primaire)]/20"
          />
        </div>
      </Carte>

      {/* Tableau des employés */}
      <Carte>
        {loading ? (
          <Chargement libelle="Chargement des employés..." />
        ) : error ? (
          <EtatVide
            titre="Erreur de chargement"
            description="Impossible de charger les employés.">
            <Bouton onClick={refresh}>Réessayer</Bouton>
          </EtatVide>
        ) : employes.length === 0 ? (
          <EtatVide
            titre="Aucun employé trouvé"
            description="Ajoutez un premier employé ou modifiez votre recherche.">
            <Link href="/employes/nouvelle-employe">
              <Bouton taille="sm">
                <Plus size={14} />
                Nouvel employé
              </Bouton>
            </Link>
          </EtatVide>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--couleur-bordure)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--couleur-texte-secondaire)]">
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Salaire / jour</th>
                  <th className="px-5 py-3">Jours</th>
                  <th className="px-5 py-3">Solde dû</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--couleur-bordure)]">
                {employes.map((employe) => (
                  <tr
                    key={employe._id}
                    className="transition-colors hover:bg-[var(--couleur-primaire-doux)]">
                    <td className="px-5 py-3 font-medium text-[var(--couleur-texte)]">
                      <Link
                        href={`/employes/${employe._id}`}
                        className="hover:text-[var(--couleur-primaire)] hover:underline">
                        {employe.nom}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono-donnees text-[var(--couleur-texte)]">
                      {formaterMontant(employe.salaireJournalier)}
                    </td>
                    <td className="px-5 py-3 font-mono-donnees text-[var(--couleur-texte)]">
                      {employe.resume?.joursTravailles ?? 0}
                    </td>
                    <td className="px-5 py-3 font-mono-donnees font-semibold text-[var(--couleur-primaire)]">
                      {formaterMontant(employe.resume?.soldeDu ?? 0)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        statut={employe.actif ? "actif" : "inactif"}
                        libelle={employe.actif ? "Actif" : "Inactif"}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/employes/${employe._id}`}
                          title="Présence & paie"
                          className="rounded-lg p-2 text-[var(--couleur-texte-secondaire)] transition-colors hover:bg-[var(--couleur-primaire-doux)] hover:text-[var(--couleur-primaire)]">
                          <CalendarDays size={16} />
                        </Link>
                        <Link
                          href={`/employes/${employe._id}/edit`}
                          title="Modifier"
                          className="rounded-lg p-2 text-[var(--couleur-texte-secondaire)] transition-colors hover:bg-[var(--couleur-primaire-doux)] hover:text-[var(--couleur-primaire)]">
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            openDelete({ _id: employe._id, label: employe.nom })
                          }
                          title="Supprimer"
                          className="rounded-lg p-2 text-[var(--couleur-texte-secondaire)] transition-colors hover:bg-red-500/10 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Carte>

      {/* Modale de suppression */}
      <Modale
        ouverte={deleteOpen}
        onFermer={closeDelete}
        titre="Supprimer l'employé">
        <p className="text-sm text-[var(--couleur-texte-secondaire)]">
          Êtes-vous sûr de vouloir supprimer{" "}
          <span className="font-semibold text-[var(--couleur-texte)]">
            {itemToDelete?.label}
          </span>
          ? Ses jours travaillés et avances seront également supprimés.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Bouton
            variante="secondaire"
            onClick={closeDelete}>
            Annuler
          </Bouton>
          <Bouton
            variante="danger"
            onClick={handleDelete}
            disabled={deleting}>
            {deleting ? "Suppression..." : "Supprimer"}
          </Bouton>
        </div>
      </Modale>
    </div>
  );
}
