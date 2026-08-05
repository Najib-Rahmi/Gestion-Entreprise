import { NextResponse } from "next/server";

/**
 * Helpers partagés pour les routes API (réponses d'erreur, filtres MongoDB).
 */

/** Journalise l'erreur et renvoie une réponse JSON d'erreur serveur (500). */
export function reponseErreurServeur(erreur: unknown, contexte: string) {
  console.error(`Erreur ${contexte} :`, erreur);
  return NextResponse.json(
    { message: `Erreur lors de ${contexte}` },
    { status: 500 },
  );
}

/**
 * Journalise l'erreur et renvoie une réponse JSON d'erreur client (400).
 * Utilise le message de l'erreur si disponible (ex : validation Mongoose).
 */
export function reponseErreurValidation(
  erreur: unknown,
  messageDefaut: string,
) {
  console.error(`Erreur ${messageDefaut} :`, erreur);
  const message = erreur instanceof Error ? erreur.message : messageDefaut;
  return NextResponse.json({ message }, { status: 400 });
}

/** Renvoie une réponse JSON 404 standardisée. */
export function reponseIntrouvable(libelle: string) {
  return NextResponse.json(
    { message: `${libelle} introuvable` },
    { status: 404 },
  );
}

/**
 * Construit un filtre de recherche MongoDB ($or avec regex insensible à la casse)
 * à partir d'une chaîne de recherche et d'une liste de champs.
 */
export function construireFiltreRecherche(
  recherche: string,
  champs: string[],
): Record<string, unknown> {
  if (!recherche) return {};
  return {
    $or: champs.map((champ) => ({
      [champ]: { $regex: recherche, $options: "i" },
    })),
  };
}
