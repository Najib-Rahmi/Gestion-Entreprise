"use client";

import { useState } from "react";
import { ChampSelect, ChampTexte } from "@/components/ui/Champs";
import { Carte } from "@/components/ui/Carte";
import { formaterMontant } from "@/lib/utils";
import { LigneFacture } from "./LigneFacture";
import { TotauxFacture } from "./TotauxFacture";

interface Client {
  _id: string;
  nom: string;
  adresse: string;
  tva: string;
}

export interface LigneFormulaire {
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire: number;
}

export interface FactureFormulaire {
  _id?: string;
  numero?: string;
  client: string;
  projet: string;
  date: string;
  timbre: number;
  lignes: LigneFormulaire[];
}

const LIGNE_VIDE: LigneFormulaire = {
  designation: "",
  unite: "m²",
  quantite: 1,
  prixUnitaire: 0,
};

const TVA_DEFAUT = 19;
const TIMBRE_DEFAUT = 1;

export function FormulaireFactureHeader({
  clients,
  clientsChargement,
  clientId,
  setClientId,
  projet,
  setProjet,
  date,
  setDate,
}: {
  clients: Client[];
  clientsChargement: boolean;
  clientId: string;
  setClientId: (value: string) => void;
  projet: string;
  setProjet: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
}) {
  return (
    <Carte className="p-6">
      <h2 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
        Informations générales
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <ChampSelect
            libelle="Client"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Sélectionner un client"
            options={clients.map((c) => ({
              valeur: c._id,
              libelle: `${c.nom} (${c.tva})`,
            }))}
            disabled={clientsChargement}
          />
        </div>
        <div>
          <ChampTexte
            libelle="Projet"
            required
            value={projet}
            onChange={(e) => setProjet(e.target.value)}
            placeholder="Nom du projet"
          />
        </div>
        <div>
          <ChampTexte
            libelle="Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
    </Carte>
  );
}

export function FormulaireFactureLignes({
  lignes,
  setLignes,
}: {
  lignes: LigneFormulaire[];
  setLignes: React.Dispatch<React.SetStateAction<LigneFormulaire[]>>;
}) {
  const [, forceUpdate] = useState(0);

  function modifierLigne(
    index: number,
    champ: keyof LigneFormulaire,
    valeur: string | number,
  ) {
    setLignes(
      lignes.map((ligne, i) =>
        i === index ? { ...ligne, [champ]: valeur } : ligne,
      ),
    );
    forceUpdate(n => n + 1);
  }

  function ajouterLigne() {
    setLignes([...lignes, { ...LIGNE_VIDE }]);
    forceUpdate(n => n + 1);
  }

  function supprimerLigne(index: number) {
    if (lignes.length <= 1) return;
    setLignes(lignes.filter((_, i) => i !== index));
    forceUpdate(n => n + 1);
  }

  return (
    <Carte className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">
          Lignes de facturation
        </h2>
        <button
          type="button"
          onClick={ajouterLigne}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
          Ajouter une ligne
        </button>
      </div>

      <div className="space-y-3">
        {/* En-têtes (desktop) */}
        <div className="hidden grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
          <span className="col-span-4">Désignation</span>
          <span className="col-span-1">Unité</span>
          <span className="col-span-1">Quantité</span>
          <span className="col-span-2">Prix U.HTVA</span>
          <span className="col-span-2">Prix T.HTVA</span>
          <span className="col-span-1" />
          <span className="col-span-1" />
        </div>

        {lignes.map((ligne, index) => (
          <LigneFacture
            key={index}
            index={index}
            ligne={ligne}
            onChange={modifierLigne}
            onDelete={supprimerLigne}
            canDelete={lignes.length > 1}
          />
        ))}
      </div>
    </Carte>
  );
}

export function FormulaireFactureTotaux({
  lignes,
  timbre,
  setTimbre,
}: {
  lignes: LigneFormulaire[];
  timbre: number;
  setTimbre: (value: number) => void;
}) {
  const totalHT = lignes.reduce(
    (somme, l) => somme + l.quantite * l.prixUnitaire,
    0,
  );
  const totalTVA = lignes.reduce(
    (somme, l) => somme + (l.quantite * l.prixUnitaire * TVA_DEFAUT) / 100,
    0,
  );
  const totalTTC = totalHT + totalTVA + timbre;

  return (
    <TotauxFacture
      totalHT={totalHT}
      totalTVA={totalTVA}
      totalTTC={totalTTC}
      timbre={timbre}
      setTimbre={setTimbre}
    />
  );
}

export function FormulaireFactureActions({
  envoiEnCours,
  estModification,
  onCancel,
  onSubmit,
}: {
  envoiEnCours: boolean;
  estModification: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
          Annuler
        </button>
        <button
          type="submit"
          disabled={envoiEnCours}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {envoiEnCours
            ? "Enregistrement..."
            : estModification
            ? "Mettre à jour"
            : "Créer la facture"}
        </button>
      </div>
    </form>
  );
}