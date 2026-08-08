"use client";

import { Trash2 } from "lucide-react";
import { formaterMontant } from "@/lib/utils";
import { LigneFormulaire } from "./FormulaireFactureParts";

interface LigneFactureProps {
  index: number;
  ligne: LigneFormulaire;
  onChange: (index: number, champ: keyof LigneFormulaire, valeur: string | number) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
}

export function LigneFacture({ index, ligne, onChange, onDelete, canDelete }: LigneFactureProps) {
  const totalLigne = ligne.quantite * ligne.prixUnitaire;

  return (
    <div
      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-12 sm:border-0 sm:p-0">
      <div className="sm:col-span-4">
        <input
          type="text"
          value={ligne.designation}
          onChange={(e) => onChange(index, "designation", e.target.value)}
          placeholder="Désignation du produit ou service"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </div>
      <div className="sm:col-span-1">
        <select
          value={ligne.unite}
          onChange={(e) => onChange(index, "unite", e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
          <option value="m">m</option>
          <option value="m²">m²</option>
          <option value="m³">m³</option>
        </select>
      </div>
      <div className="sm:col-span-1">
        <input
          type="number"
          min="0"
          step="1"
          value={ligne.quantite}
          onChange={(e) => onChange(index, "quantite", Number(e.target.value))}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </div>
      <div className="sm:col-span-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={ligne.prixUnitaire}
          onChange={(e) => onChange(index, "prixUnitaire", Number(e.target.value))}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </div>
      <div className="sm:col-span-2">
        <input
          type="text"
          value={formaterMontant(totalLigne)}
          readOnly
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </div>
      <div className="sm:col-span-1" />
      <div className="flex items-center justify-end sm:col-span-1">
        <button
          type="button"
          onClick={() => onDelete(index)}
          disabled={!canDelete}
          title="Supprimer la ligne"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-900/20">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}