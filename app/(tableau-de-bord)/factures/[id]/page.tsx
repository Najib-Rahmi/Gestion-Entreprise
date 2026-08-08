"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Download, Pencil, Trash2, Send, Plus } from "lucide-react";
import { toast } from "sonner";
import { Carte, Chargement, EtatVide } from "@/components/ui/Carte";
import Bouton from "@/components/ui/Bouton";
import Modale from "@/components/ui/Modale";
import { ChampTexte, ChampSelect, ChampZoneTexte, ChampNombre } from "@/components/ui/Champs";
import { formaterMontant, formaterDate, dateVersInput } from "@/lib/utils";

interface Facture {
  _id: string;
  numero: string;
  client: { _id: string; nom: string; adresse: string; tva: string } | string;
  projet: string;
  date: string;
  timbre: number;
  lignes: {
    designation: string;
    unite: string;
    quantite: number;
    prixUnitaire: number;
    tva: number;
  }[];
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

const UNITES = ["m²", "m³", "ml", "kg", "unité", "heure", "jour", "forfait"];

export default function PageDetailFacture() {
  const params = useParams();
  const routeur = useRouter();
  const id = params.id as string;

  const [facture, setFacture] = useState<Facture | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modification, setModification] = useState(false);
  const [soumission, setSoumission] = useState(false);
  const [modalSupprimer, setModalSupprimer] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    projet: "",
    date: "",
    timbre: 1,
    lignes: [] as {
      designation: string;
      unite: string;
      quantite: number;
      prixUnitaire: number;
      tva: number;
    }[],
  });

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((donnees) => {
        const liste = Array.isArray(donnees) ? donnees : donnees.clients;
        setClients(liste.map((c: any) => ({ _id: c._id, nom: c.nom })));
      })
      .catch(() => { /* error handled by UI */ });
  }, []);

  const chargerFacture = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch(`/api/factures/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFacture(data);
      setFormData({
        client: typeof data.client === "object" ? data.client._id : data.client,
        projet: data.projet,
        date: dateVersInput(data.date),
        timbre: data.timbre,
        lignes: data.lignes,
      });
    } catch {
      toast.error("Erreur lors du chargement de la facture");
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    chargerFacture();
  }, [chargerFacture]);

  function calculerTotaux() {
    let totalHT = 0;
    let totalTVA = 0;
    for (const ligne of formData.lignes) {
      const montantLigne = ligne.quantite * ligne.prixUnitaire;
      totalHT += montantLigne;
      totalTVA += (montantLigne * ligne.tva) / 100;
    }
    const totalTTC = totalHT + totalTVA + formData.timbre;
    return { totalHT: Math.round(totalHT * 100) / 100, totalTVA: Math.round(totalTVA * 100) / 100, totalTTC: Math.round(totalTTC * 100) / 100 };
  }

  function ajouterLigne() {
    setFormData((prev) => ({ ...prev, lignes: [...prev.lignes, { designation: "", unite: "m²", quantite: 1, prixUnitaire: 0, tva: 19 }] }));
  }

  function supprimerLigne(index: number) {
    if (formData.lignes.length <= 1) return;
    setFormData((prev) => ({ ...prev, lignes: prev.lignes.filter((_, i) => i !== index) }));
  }

  function mettreAJourLigne(index: number, champ: string, valeur: any) {
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)),
    }));
  }

  async function telechargerPDF() {
    try {
      const res = await fetch(`/api/factures/${id}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${facture?.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur lors du téléchargement du PDF");
    }
  }

  async function sauvegarder() {
    if (!formData.client || !formData.projet) {
      toast.error("Client et projet sont requis");
      return;
    }
    if (formData.lignes.some((l) => !l.designation || l.quantite <= 0 || l.prixUnitaire < 0)) {
      toast.error("Toutes les lignes doivent avoir une désignation, quantité > 0 et prix ≥ 0");
      return;
    }

    setSoumission(true);
    try {
      const { totalHT, totalTVA, totalTTC } = calculerTotaux();
      const res = await fetch(`/api/factures/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, totalHT, totalTVA, totalTTC }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur serveur");
      }
      toast.success("Facture mise à jour");
      routeur.push("/factures");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSoumission(false);
    }
  }

  async function supprimer() {
    try {
      const res = await fetch(`/api/factures/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Facture supprimée");
      routeur.push("/factures");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  if (chargement) {
    return <Carte><Chargement libelle="Chargement de la facture..." /></Carte>;
  }

  if (!facture) {
    return (
      <Carte>
        <EtatVide
          titre="Facture introuvable"
          description="Cette facture n'existe pas ou a été supprimée.">
          <Bouton
            taille="sm"
            onClick={() => routeur.push("/factures")}>
            <ArrowLeft size={14} />
            Retour à la liste
          </Bouton>
        </EtatVide>
      </Carte>
    );
  }

  const client = typeof facture.client === "object" ? facture.client : null;
  const { totalHT, totalTVA, totalTTC } = calculerTotaux();

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Bouton
            taille="sm"
            variante="secondaire"
            onClick={() => routeur.push("/factures")}>
            <ArrowLeft size={16} />
            Retour
          </Bouton>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {facture.numero}
            </h1>
            <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              du {formaterDate(facture.date)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Bouton onClick={telechargerPDF} variante="secondaire">
            <Download size={16} />
            PDF
          </Bouton>
          <Bouton onClick={() => setModification(true)} variante="secondaire">
            <Pencil size={16} />
            Modifier
          </Bouton>
          <Bouton onClick={() => setModalSupprimer(true)} variante="danger">
            <Trash2 size={16} />
            Supprimer
          </Bouton>
        </div>
      </div>

      {/* Infos facture */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <Carte>
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Client</h3>
          {client ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Nom</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{client.nom}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Adresse</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{client.adresse}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">N° TVA</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100 font-mono text-xs">{client.tva}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Client non trouvé</p>
          )}
        </Carte>

        <Carte>
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Projet</h3>
          <p className="text-slate-900 dark:text-slate-100">{facture.projet}</p>
        </Carte>
      </div>

      {/* Lignes de facturation */}
      <Carte className="mb-6">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Lignes de facturation</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-5 py-3">Désignation</th>
                <th className="px-5 py-3">Unité</th>
                <th className="px-5 py-3 text-right">Quantité</th>
                <th className="px-5 py-3 text-right">Prix unitaire</th>
                <th className="px-5 py-3 text-right">TVA</th>
                <th className="px-5 py-3 text-right">Total HT</th>
                <th className="px-5 py-3 text-right">TVA</th>
                <th className="px-5 py-3 text-right">Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {facture.lignes.map((ligne, index) => {
                const montantLigne = ligne.quantite * ligne.prixUnitaire;
                const tvaLigne = (montantLigne * ligne.tva) / 100;
                return (
                  <tr key={index} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{ligne.designation}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{ligne.unite}</td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{ligne.quantite}</td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{formaterMontant(ligne.prixUnitaire)}</td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{ligne.tva}%</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-slate-100">{formaterMontant(montantLigne)}</td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{formaterMontant(tvaLigne)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">{formaterMontant(montantLigne + tvaLigne)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Carte>

      {/* Totaux */}
      <Carte className="max-w-md mx-auto lg:mx-0 lg:ml-auto">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Totaux</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Total HT</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{formaterMontant(totalHT)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Total TVA</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{formaterMontant(totalTVA)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Timbre</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{formaterMontant(facture.timbre)}</dd>
          </div>
          <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
            <div className="flex justify-between text-lg font-bold">
              <dt className="text-slate-900 dark:text-slate-100">Total TTC</dt>
              <dd className="text-blue-600 dark:text-blue-400">{formaterMontant(totalTTC)}</dd>
            </div>
          </div>
        </dl>
      </Carte>

      {/* Modale de modification */}
      <Modale ouverte={modification} onFermer={() => { setModification(false); chargerFacture(); }} titre="Modifier la facture" largeur="xl">
        <form onSubmit={(e) => { e.preventDefault(); sauvegarder(); }} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ChampSelect
              libelle="Client"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="Sélectionner un client"
              options={clients.map((c) => ({ valeur: c._id, libelle: c.nom }))}
            />
            <ChampTexte
              libelle="Projet / Chantier"
              required
              value={formData.projet}
              onChange={(e) => setFormData({ ...formData, projet: e.target.value })}
              placeholder="Nom du projet"
            />
            <ChampTexte
              libelle="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <ChampNombre
              libelle="Timbre fiscal (€)"
              min={0}
              step={0.01}
              value={formData.timbre}
              onChange={(e) => setFormData({ ...formData, timbre: Number(e.target.value) })}
            />
          </div>

          <div>
            <h4 className="mb-3 font-medium text-slate-900 dark:text-slate-100">Lignes de facturation</h4>
            <div className="space-y-3">
              {formData.lignes.map((ligne, index) => (
                <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <ChampTexte
                      libelle="Désignation"
                      value={ligne.designation}
                      onChange={(e) => mettreAJourLigne(index, "designation", e.target.value)}
                      placeholder="Description de la prestation"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <ChampSelect
                      libelle="Unité"
                      value={ligne.unite}
                      onChange={(e) => mettreAJourLigne(index, "unite", e.target.value)}
                      options={UNITES.map((u) => ({ valeur: u, libelle: u }))}
                    />
                    <ChampNombre
                      libelle="Quantité"
                      min={0}
                      step={0.01}
                      value={ligne.quantite}
                      onChange={(e) => mettreAJourLigne(index, "quantite", Number(e.target.value))}
                    />
                    <ChampNombre
                      libelle="Prix unitaire (€)"
                      min={0}
                      step={0.01}
                      value={ligne.prixUnitaire}
                      onChange={(e) => mettreAJourLigne(index, "prixUnitaire", Number(e.target.value))}
                    />
                    <ChampNombre
                      libelle="TVA (%)"
                      min={0}
                      max={100}
                      value={ligne.tva}
                      onChange={(e) => mettreAJourLigne(index, "tva", Number(e.target.value))}
                    />
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => supprimerLigne(index)}
                        disabled={formData.lignes.length <= 1}
                        className="w-full h-10 rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer la ligne">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Bouton type="button" onClick={ajouterLigne} variante="secondaire" className="mt-2">
              <Plus size={14} />
              Ajouter une ligne
            </Bouton>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Bouton type="button" variante="secondaire" onClick={() => { setModification(false); chargerFacture(); }}>Annuler</Bouton>
            <Bouton type="submit" disabled={soumission}>{soumission ? "Sauvegarde..." : "Enregistrer les modifications"}</Bouton>
          </div>
        </form>
      </Modale>

      {/* Modale de confirmation de suppression */}
      <Modale ouverte={modalSupprimer} onFermer={() => setModalSupprimer(false)} titre="Supprimer la facture" largeur="md">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Êtes-vous sûr de vouloir supprimer <strong>{facture.numero}</strong> ? Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Bouton variante="secondaire" onClick={() => setModalSupprimer(false)}>Annuler</Bouton>
          <Bouton variante="danger" onClick={supprimer}>Supprimer</Bouton>
        </div>
      </Modale>
    </div>
  );
}