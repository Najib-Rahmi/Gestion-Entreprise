"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Bouton from "@/components/ui/Bouton";
import { ChampTexte, ChampSelect, ChampNombre } from "@/components/ui/Champs";
import { formaterMontant, dateVersInput } from "@/lib/utils";

interface Facture {
  _id: string;
  numero: string;
  client: { _id: string; nom: string } | string;
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

interface LigneFacture {
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire: number;
  tva: number;
}

const TVA_FIXE = 19;
const UNITES = ["m²", "m³", "ml", "kg", "unité", "heure", "jour", "forfait"];

export default function PageEditFacture() {
  const params = useParams();
  const routeur = useRouter();
  const id = params.id as string;

  const [facture, setFacture] = useState<Facture | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [chargement, setChargement] = useState(true);
  const [soumission, setSoumission] = useState(false);
  const [modalSupprimer, setModalSupprimer] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    projet: "",
    date: dateVersInput(new Date()),
    timbre: 1,
    lignes: [{ designation: "", unite: "m²", quantite: 1, prixUnitaire: 0, tva: TVA_FIXE }] as LigneFacture[],
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
        lignes: data.lignes.map((l: any) => ({
          designation: l.designation,
          unite: l.unite,
          quantite: l.quantite,
          prixUnitaire: l.prixUnitaire,
          tva: l.tva ?? TVA_FIXE,
        })),
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

  function calculerTVALigne(ligne: LigneFacture): number {
    const montantLigne = ligne.quantite * ligne.prixUnitaire;
    return Math.round((montantLigne * ligne.tva) / 100 * 100) / 100;
  }

  function ajouterLigne() {
    setFormData((prev) => ({ ...prev, lignes: [...prev.lignes, { designation: "", unite: "m²", quantite: 1, prixUnitaire: 0, tva: TVA_FIXE }] }));
  }

  function supprimerLigne(index: number) {
    if (formData.lignes.length <= 1) return;
    setFormData((prev) => ({ ...prev, lignes: prev.lignes.filter((_, i) => i !== index) }));
  }

  function mettreAJourLigne(index: number, champ: keyof LigneFacture, valeur: any) {
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)),
    }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
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
    return (
      <div className="flex min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-4xl mx-auto text-center text-slate-500 dark:text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Facture introuvable</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Cette facture n'existe pas ou a été supprimée.</p>
          <Bouton taille="sm" onClick={() => routeur.push("/factures")}>
            <ArrowLeft size={14} />
            Retour à la liste
          </Bouton>
        </div>
      </div>
    );
  }

  const { totalHT, totalTVA, totalTTC } = calculerTotaux();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] px-4 py-12">
      <form onSubmit={soumettre} className="w-full max-w-4xl mx-auto space-y-8">
        <div className="mb-8 text-center">
          <Bouton
            taille="sm"
            variante="secondaire"
            onClick={() => routeur.push(`/factures/${id}`)}>
            <ArrowLeft size={16} />
            Retour
          </Bouton>
          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Modifier la facture
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {facture.numero}
          </p>
        </div>

        {/* Informations générales */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 text-center mb-6">
            Informations générales
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              libelle="Timbre fiscal (DT)"
              min={0}
              step={0.01}
              value={formData.timbre}
              onChange={(e) => setFormData({ ...formData, timbre: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Lignes de facturation */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Lignes de facturation</h2>
            <Bouton taille="sm" onClick={ajouterLigne} variante="secondaire">
              <Plus size={14} />
              Ajouter une ligne
            </Bouton>
          </div>
          <div className="space-y-4">
            {formData.lignes.map((ligne, index) => {
              const tvaLigne = calculerTVALigne(ligne);
              return (
                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <ChampTexte
                    libelle="Désignation"
                    value={ligne.designation}
                    onChange={(e) => mettreAJourLigne(index, "designation", e.target.value)}
                    placeholder="Description de la prestation"
                  />
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                    <ChampSelect
                      libelle="Unité"
                      value={ligne.unite}
                      onChange={(e) => mettreAJourLigne(index, "unite", e.target.value)}
                      options={UNITES.map((u) => ({ valeur: u, libelle: u }))}
                      className="w-full sm:w-32"
                    />
                    <ChampNombre
                      libelle="Quantité"
                      min={0}
                      step={0.01}
                      value={ligne.quantite}
                      onChange={(e) => mettreAJourLigne(index, "quantite", Number(e.target.value))}
                      className="w-full sm:w-28"
                    />
                    <ChampNombre
                      libelle="Prix unitaire (DT)"
                      min={0}
                      step={0.01}
                      value={ligne.prixUnitaire}
                      onChange={(e) => mettreAJourLigne(index, "prixUnitaire", Number(e.target.value))}
                      className="w-full sm:w-36"
                    />
                    <ChampNombre
                      libelle="TVA (%)"
                      min={0}
                      max={100}
                      value={ligne.tva}
                      onChange={(e) => mettreAJourLigne(index, "tva", Number(e.target.value))}
                      className="w-full sm:w-24"
                    />
                    <div className="flex flex-col gap-1.5 sm:w-36">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">TVA</label>
                      <div className="w-full h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center px-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formaterMontant(calculerTVALigne(ligne))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:w-36">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Prix HT</label>
                      <div className="w-full h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center px-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formaterMontant(ligne.quantite * ligne.prixUnitaire)}
                      </div>
                    </div>
                    <button
                      onClick={() => supprimerLigne(index)}
                      disabled={formData.lignes.length <= 1}
                      className="h-10 rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed self-end sm:self-center"
                      title="Supprimer la ligne">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Récapitulatif totaux */}
        <div className="p-6 bg-blue-600 rounded-2xl text-white">
          <h2 className="text-xl font-semibold text-center mb-6">Récapitulatif</h2>
          <dl className="space-y-4 text-sm max-w-md mx-auto">
            <div className="flex justify-between">
              <dt className="text-blue-100">Total HT</dt>
              <dd className="font-medium">{formaterMontant(totalHT)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-100">Total TVA</dt>
              <dd className="font-medium">{formaterMontant(totalTVA)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-100">Timbre</dt>
              <dd className="font-medium">{formaterMontant(formData.timbre)}</dd>
            </div>
            <div className="border-t border-blue-400 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <dt>Total TTC</dt>
                <dd>{formaterMontant(totalTTC)}</dd>
              </div>
            </div>
          </dl>
          <div className="mt-8 flex gap-3">
            <Bouton
              type="button"
              onClick={() => setModalSupprimer(true)}
              variante="secondaire"
              className="flex-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <Trash2 size={16} className="mr-2" />
              Supprimer
            </Bouton>
            <Bouton type="submit" disabled={soumission} className="flex-1" taille="lg" style={{ backgroundColor: 'white', color: '#f5a524' }}>
              {soumission ? "Sauvegarde..." : "Enregistrer les modifications"}
            </Bouton>
          </div>
        </div>
      </form>

      {/* Modale de confirmation de suppression */}
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ display: modalSupprimer ? 'flex' : 'none' }}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setModalSupprimer(false)} />
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Supprimer la facture</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Êtes-vous sûr de vouloir supprimer <strong>{facture.numero}</strong> ? Cette action est irréversible.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Bouton variante="secondaire" onClick={() => setModalSupprimer(false)}>Annuler</Bouton>
            <Bouton variante="danger" onClick={supprimer}>Supprimer</Bouton>
          </div>
        </div>
      </div>
    </div>
  );
}