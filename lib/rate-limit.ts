/**
 * Limiteur de débit simple en mémoire (par clé, ex. IP).
 * Adapté à un déploiement mono-instance. Pour du multi-instance
 * (serverless), utiliser une solution externe type Upstash Redis.
 */

interface EntreeLimite {
  compte: number;
  reinitialisation: number;
}

const cache = new Map<string, EntreeLimite>();

// Nettoyage périodique des entrées expirées pour éviter une fuite mémoire
const INTERVALLE_NETTOYAGE = 60_000;
let dernierNettoyage = Date.now();

function nettoyer(maintenant: number) {
  if (maintenant - dernierNettoyage < INTERVALLE_NETTOYAGE) return;
  dernierNettoyage = maintenant;
  for (const [cle, entree] of cache) {
    if (entree.reinitialisation <= maintenant) {
      cache.delete(cle);
    }
  }
}

export interface ResultatLimite {
  autorise: boolean;
  restant: number;
  reinitialisation: number;
}

/**
 * Vérifie et consomme un jeton pour la clé donnée.
 * @param cle Identifiant du client (ex. adresse IP)
 * @param limite Nombre maximal de requêtes par fenêtre
 * @param fenetreMs Durée de la fenêtre en millisecondes
 */
export function verifierLimite(
  cle: string,
  limite: number,
  fenetreMs: number,
): ResultatLimite {
  const maintenant = Date.now();
  nettoyer(maintenant);

  const entree = cache.get(cle);

  if (!entree || entree.reinitialisation <= maintenant) {
    cache.set(cle, { compte: 1, reinitialisation: maintenant + fenetreMs });
    return {
      autorise: true,
      restant: limite - 1,
      reinitialisation: maintenant + fenetreMs,
    };
  }

  entree.compte += 1;
  const autorise = entree.compte <= limite;
  return {
    autorise,
    restant: Math.max(0, limite - entree.compte),
    reinitialisation: entree.reinitialisation,
  };
}
