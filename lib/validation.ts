import { z } from "zod";

/**
 * Schémas de validation Zod pour les corps de requêtes API.
 * Centralisés ici pour être réutilisés par les routes POST/PUT.
 */

/** Client : nom, adresse et identifiant TVA obligatoires. */
export const schemaClient = z.object({
  nom: z.string().trim().min(1, "Le nom est requis"),
  adresse: z.string().trim().min(1, "L'adresse est requise"),
  tva: z.string().trim().min(1, "L'identifiant TVA est requis"),
});

/** Employé : nom et salaire journalier obligatoires. */
export const schemaEmploye = z.object({
  nom: z.string().trim().min(1, "Le nom est requis"),
  telephone: z.string().trim().optional().default(""),
  dateEmbauche: z.coerce.date().optional(),
  salaireJournalier: z
    .number({ error: "Le salaire journalier est requis" })
    .min(0, "Le salaire journalier doit être positif"),
  actif: z.boolean().optional().default(true),
});

/** Ligne de facture. */
export const schemaLigneFacture = z.object({
  designation: z.string().trim().min(1, "La désignation est requise"),
  unite: z.string().trim().optional().default("m²"),
  quantite: z.number().min(0, "La quantité doit être positive"),
  prixUnitaire: z.number().min(0, "Le prix unitaire doit être positif"),
  tva: z.number().min(0).max(100).optional().default(19),
});

/** Facture : client, projet et au moins une ligne. */
export const schemaFacture = z.object({
  numero: z.string().trim().optional(),
  client: z.string().min(1, "Le client est requis"),
  projet: z.string().trim().min(1, "Le projet est requis"),
  date: z.coerce.date().optional(),
  timbre: z.number().min(0).optional().default(1),
  lignes: z
    .array(schemaLigneFacture)
    .min(1, "Une facture doit contenir au moins une ligne"),
});

/** Avance : montant strictement positif. */
export const schemaAvance = z.object({
  montant: z
    .number({ error: "Le montant est requis" })
    .positive("Le montant doit être supérieur à zéro"),
  date: z.coerce.date().optional(),
  note: z.string().trim().optional().default(""),
});

/** Bascule d'un jour travaillé. */
export const schemaJour = z.object({
  date: z.coerce.date({ error: "La date est requise" }),
});

/** Marquage d'un jour payé / non payé. */
export const schemaJourPaye = z.object({
  date: z.coerce.date({ error: "La date est requise" }),
  paye: z.boolean({ error: "Le statut paye est requis" }),
});

/** Connexion. */
export const schemaConnexion = z.object({
  email: z.string().trim().email("Email invalide"),
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
});

/**
 * Valide un corps de requête contre un schéma.
 * Retourne { succes: true, donnees } ou { succes: false, message }.
 */
export function valider<T>(
  schema: z.ZodType<T>,
  donnees: unknown,
): { succes: true; donnees: T } | { succes: false; message: string } {
  const resultat = schema.safeParse(donnees);
  if (resultat.success) {
    return { succes: true, donnees: resultat.data };
  }
  const message = resultat.error.issues
    .map((i) => i.message)
    .filter((m, i, arr) => arr.indexOf(m) === i)
    .join(", ");
  return { succes: false, message: message || "Données invalides" };
}
