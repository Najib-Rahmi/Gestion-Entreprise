"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Building2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Carte, EntetePage, Chargement, EtatVide } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import Modale from "@/components/ui/Modale";
import { useList, useListWithTotal, useDeleteModal } from "@/lib/hooks";
import { formaterMontant, formaterDate } from "@/lib/utils";
import { ChampTexte, ChampZoneTexte } from "@/components/ui/Champs";

interface ClientItem {
  _id: string;
  nom: string;
  adresse: string;
  tva: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientFormData {
  nom: string;
  adresse: string;
  tva: string;
}

export default function PageClients() {
  const { data: clients, loading, error, refresh, total, searchParams, setSearchParams } = useListWithTotal<ClientItem>({
    endpoint: "/api/clients",
    searchParams: { search: "" },
    debounceMs: 300,
  });

  const { open: openDelete, close: closeDelete, isOpen: deleteOpen, itemToDelete, deleting } = useDeleteModal();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [editFormData, setEditFormData] = useState<ClientFormData>({
    nom: "",
    adresse: "",
    tva: "",
  });

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/clients/${itemToDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      refresh();
      closeDelete();
    } catch {
      // Error handled by useDeleteModal toast
    }
  }

  function openEditModal(client: ClientItem) {
    setEditingClient(client);
    setEditFormData({
      nom: client.nom,
      adresse: client.adresse,
      tva: client.tva,
    });
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingClient(null);
    setEditFormData({ nom: "", adresse: "", tva: "" });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClient) return;
    if (!editFormData.nom || !editFormData.adresse) {
      toast.error("Nom et adresse sont requis");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${editingClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur serveur");
      }
      toast.success("Client mis à jour");
      refresh();
      closeEditModal();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la modification");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!editFormData.nom || !editFormData.adresse) {
      toast.error("Nom et adresse sont requis");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur serveur");
      }
      toast.success("Client créé");
      refresh();
      closeEditModal();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div>
      <EntetePage
        titre="Clients"
        description={`Total : ${total}`}>
        <Bouton
          onClick={() => {
            setEditFormData({ nom: "", adresse: "", tva: "" });
            setEditingClient(null);
            setEditModalOpen(true);
          }}>
          <Plus size={16} />
          Nouveau client
       </Bouton>
     </EntetePage>

      {/* Filtres */}
      <Carte className="mb-4 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchParams.search || ""}
              onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
              placeholder="Rechercher un client..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
      </Carte>

      {/* Tableau des clients */}
      <Carte>
        {loading ? (
          <Chargement libelle="Chargement des clients..." />
        ) : error ? (
          <EtatVide titre="Erreur de chargement" description="Impossible de charger les clients.">
            <Bouton onClick={refresh}>Réessayer</Bouton>
          </EtatVide>
        ) : clients.length === 0 ? (
          <EtatVide titre="Aucun client trouvé" description="Ajoutez un premier client ou modifiez votre recherche.">
            <Bouton
              taille="sm"
              onClick={() => {
                setEditFormData({ nom: "", adresse: "", tva: "" });
                setEditingClient(null);
                setEditModalOpen(true);
              }}>
              <Plus size={14} />
              Nouveau client
           </Bouton>
          </EtatVide>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Adresse</th>
                  <th className="px-5 py-3">N° TVA</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {clients.map((client) => (
                  <tr key={client._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{client.nom}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 max-w-48 truncate">{client.adresse}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">{client.tva}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(client)}
                          title="Modifier"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => openDelete({ _id: client._id, label: client.nom })}
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
      <Modale ouverte={deleteOpen} onFermer={closeDelete} titre="Supprimer le client">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Êtes-vous sûr de vouloir supprimer <strong>{itemToDelete?.label}</strong> ? Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Bouton variante="secondaire" onClick={closeDelete}>Annuler</Bouton>
          <Bouton variante="danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Suppression..." : "Supprimer"}</Bouton>
        </div>
      </Modale>

      {/* Modale d'édition/création de client */}
      <Modale ouverte={editModalOpen} onFermer={closeEditModal} titre={editingClient ? "Modifier le client" : "Nouveau client"} largeur="lg">
        <form onSubmit={editingClient ? handleEditSubmit : handleCreate} className="space-y-4">
          <ChampTexte
            libelle="Nom"
            required
            value={editFormData.nom}
            onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
            placeholder="Nom du client"
            autoFocus
          />
          <ChampZoneTexte
            libelle="Adresse"
            required
            value={editFormData.adresse}
            onChange={(e) => setEditFormData({ ...editFormData, adresse: e.target.value })}
            placeholder="Adresse complète"
            lignes={3}
          />
          <ChampTexte
            libelle="N° TVA"
            value={editFormData.tva}
            onChange={(e) => setEditFormData({ ...editFormData, tva: e.target.value })}
            placeholder="BE0123456789"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Bouton
              type="button"
              variante="secondaire"
              onClick={closeEditModal}>
              Annuler
            </Bouton>
            <Bouton
              type="submit"
              disabled={editSubmitting}>
              {editSubmitting ? (editingClient ? "Sauvegarde..." : "Création...") : (editingClient ? "Enregistrer" : "Créer le client")}
            </Bouton>
          </div>
        </form>
      </Modale>
    </div>
  );
}