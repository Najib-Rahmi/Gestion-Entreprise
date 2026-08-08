"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Filter, Trash2, Download } from "lucide-react";
import { Carte, EntetePage, Chargement, EtatVide } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import Modale from "@/components/ui/Modale";
import { ChampTexte, ChampSelect } from "@/components/ui/Champs";
import { useList, useListWithTotal, useDeleteModal } from "@/lib/hooks";
import { formaterMontant, formaterDate, dateVersInput } from "@/lib/utils";
import { toast } from "sonner";

interface FactureItem {
  _id: string;
  numero: string;
  client: { _id: string; nom: string } | string;
  projet: string;
  date: string;
  timbre: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  createdAt: string;
  updatedAt: string;
}

interface ClientOption {
  _id: string;
  nom: string;
}

export default function PageFactures() {
  // Fetch clients for dropdown
  const [clients, setClients] = useState<ClientOption[]>([]);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((donnees) => {
        const liste = Array.isArray(donnees) ? donnees : donnees.clients;
        setClients(liste.map((c: any) => ({ _id: c._id, nom: c.nom })));
      })
      .catch(() => {
        /* error handled by UI */
      });
  }, []);

  const {
    data: factures,
    loading,
    error,
    refresh,
    total,
    searchParams,
    setSearchParams,
  } = useListWithTotal<FactureItem>({
    endpoint: "/api/factures",
    searchParams: { search: "", client: "" },
    debounceMs: 300,
  });

  const {
    open: openDelete,
    close: closeDelete,
    isOpen: deleteOpen,
    itemToDelete,
    deleting,
  } = useDeleteModal();

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/factures/${itemToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      refresh();
      closeDelete();
    } catch {
      // Error handled by useDeleteModal toast
    }
  }

  const clientOptions = clients.map((c) => ({ valeur: c._id, libelle: c.nom }));

  async function telechargerPDF(id: string, numero: string) {
    try {
      const res = await fetch(`/api/factures/${id}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur lors du téléchargement du PDF");
    }
  }

  return (
    <div>
      <EntetePage
        titre="Factures"
        description={`Total : ${formaterMontant(total)}`}>
        <Link href="/factures/nouvelle">
          <Bouton>
            <Plus size={16} />
            Nouvelle facture
          </Bouton>
        </Link>
      </EntetePage>

      {/* Filtres */}
      <Carte className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchParams.search || ""}
              onChange={(e) =>
                setSearchParams({ ...searchParams, search: e.target.value })
              }
              placeholder="Rechercher (numéro, projet)..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <ChampSelect
            libelle=""
            aria-label="Filtrer par client"
            value={searchParams.client || ""}
            onChange={(e) =>
              setSearchParams({ ...searchParams, client: e.target.value })
            }
            placeholder="Tous les clients"
            options={clientOptions}
          />
        </div>
      </Carte>

      {/* Tableau des factures */}
      <Carte>
        {loading ? (
          <Chargement libelle="Chargement des factures..." />
        ) : error ? (
          <EtatVide
            titre="Erreur de chargement"
            description="Impossible de charger les factures.">
            <Bouton onClick={refresh}>Réessayer</Bouton>
          </EtatVide>
        ) : factures.length === 0 ? (
          <EtatVide
            titre="Aucune facture trouvée"
            description="Créez une première facture ou modifiez vos filtres.">
            <Link href="/factures/nouvelle">
              <Bouton taille="sm">
                <Plus size={14} />
                Nouvelle facture
              </Bouton>
            </Link>
          </EtatVide>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="px-5 py-3">Numéro</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Projet</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Total TTC</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {factures.map((facture) => (
                  <tr
                    key={facture._id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-5 py-3 font-mono-donnees font-medium text-slate-900 dark:text-slate-100">
                      {facture.numero}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {typeof facture.client === "object"
                        ? facture.client.nom
                        : facture.client}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 max-w-36 truncate">
                      {facture.projet}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {formaterDate(facture.date)}
                    </td>
                    <td className="px-5 py-3 font-mono-donnees font-semibold text-slate-900 dark:text-slate-100">
                      {formaterMontant(facture.totalTTC)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => telechargerPDF(facture._id, facture.numero)}
                          title="Télécharger PDF"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700">
                          <Download size={16} />
                        </button>
                        <Link
                          href={`/factures/${facture._id}/edit`}
                          title="Modifier"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </Link>
                        <button
                          onClick={() =>
                            openDelete({
                              _id: facture._id,
                              label: facture.numero,
                            })
                          }
                          title="Supprimer"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20">
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

      {/* Modale de confirmation de suppression */}
      <Modale
        ouverte={deleteOpen}
        onFermer={closeDelete}
        titre="Supprimer la facture">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Êtes-vous sûr de vouloir supprimer{" "}
          <strong>{itemToDelete?.label}</strong> ? Cette action est
          irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-2">
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
