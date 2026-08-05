import { cn } from "@/lib/utils";

/**
 * Badge coloré pour afficher les statuts (frais, employé).
 * La couleur est choisie automatiquement selon le statut.
 */

const COULEURS_STATUT: Record<string, string> = {
  // Statuts de frais
  en_attente:
    "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  approuve:
    "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  refuse:
    "bg-red-500/10 text-red-600 ring-1 ring-red-500/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20",
  // Statuts d'employé
  actif:
    "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  inactif:
    "bg-slate-500/10 text-slate-500 ring-1 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20",
};

interface BadgeProps {
  statut: string;
  libelle: string;
  className?: string;
}

export default function Badge({ statut, libelle, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        COULEURS_STATUT[statut] || COULEURS_STATUT.inactif,
        className,
      )}>
      {libelle}
    </span>
  );
}
