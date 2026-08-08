"use client";

import { formaterMontant } from "@/lib/utils";

interface TotauxFactureProps {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  timbre: number;
  setTimbre: (value: number) => void;
}

export function TotauxFacture({ totalHT, totalTVA, totalTTC, timbre, setTimbre }: TotauxFactureProps) {
  return (
    <div className="mt-6 flex justify-end">
      <div className="w-full max-w-xs space-y-2 text-sm">
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Total HT</span>
          <span className="font-medium">{formaterMontant(totalHT)}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>TVA 19%</span>
          <span className="font-medium">{formaterMontant(totalTVA)}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Timbre Facture</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={timbre}
            onChange={(e) => setTimbre(Number(e.target.value) || 0)}
            className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">
          <span>Total TTC</span>
          <span>{formaterMontant(totalTTC)}</span>
        </div>
      </div>
    </div>
  );
}