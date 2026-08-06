/**
 * Logique de paie - fonctions pures, testables isolément.
 *
 * Modèle : paie = (jours travaillés × salaire journalier) − avances.
 * Chaque jour travaillé peut être marqué payé individuellement.
 */

export interface JourPaie {
  date: string | Date;
  paye: boolean;
}

export interface AvancePaie {
  montant: number;
}

export interface ResumePaie {
  joursTravailles: number;
  joursPayes: number;
  totalGagne: number; // jours travaillés × salaire journalier
  totalPaye: number; // jours payés × salaire journalier
  totalAvances: number; // somme des avances
  soldeDu: number; // totalGagne − totalPaye − totalAvances
}

/** Compte les jours travaillés. */
export function compterJoursTravailles(jours: JourPaie[]): number {
  return jours.length;
}

/** Compte les jours marqués comme payés. */
export function compterJoursPayes(jours: JourPaie[]): number {
  return jours.filter((j) => j.paye).length;
}

/** Somme des avances. */
export function totalAvances(avances: AvancePaie[]): number {
  return avances.reduce((somme, a) => somme + (a.montant || 0), 0);
}

/**
 * Calcule le résumé de paie d'un employé.
 * soldeDu = totalGagne − totalPaye − totalAvances (peut être négatif si trop d'avances).
 */
export function calculerResumePaie(
  jours: JourPaie[],
  avances: AvancePaie[],
  salaireJournalier: number,
): ResumePaie {
  const joursTravailles = compterJoursTravailles(jours);
  const joursPayes = compterJoursPayes(jours);
  const totalGagne = joursTravailles * salaireJournalier;
  const totalPaye = joursPayes * salaireJournalier;
  const totalAv = totalAvances(avances);
  const soldeDu = totalGagne - totalPaye - totalAv;

  return {
    joursTravailles,
    joursPayes,
    totalGagne,
    totalPaye,
    totalAvances: totalAv,
    soldeDu,
  };
}

/** Normalise une date à minuit (granularité jour) pour l'unicité. */
export function normaliserJour(date: string | Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Clé AAAA-MM-JJ pour comparer des jours. */
export function cleJour(date: string | Date): string {
  const d = new Date(date);
  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}
