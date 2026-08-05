"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Hook de récupération de données depuis l'API.
 * Gère l'état de chargement, les erreurs (toast) et le rechargement.
 *
 * @param url - URL de l'API (peut être null pour désactiver le chargement)
 * @param options.messageErreur - Message affiché en cas d'échec
 * @param options.delai - Délai (ms) avant le chargement (débounce, défaut 0)
 * @param options.transformer - Transforme la réponse JSON avant de la stocker
 */
export function useFetch<T>(
  url: string | null,
  options?: {
    messageErreur?: string;
    delai?: number;
    transformer?: (donnees: unknown) => T;
  },
) {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  const {
    messageErreur = "Erreur lors du chargement",
    delai = 0,
    transformer,
  } = options ?? {};

  const charger = useCallback(async () => {
    if (!url) return;
    setChargement(true);
    setErreur(false);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setDonnees(transformer ? transformer(json) : (json as T));
    } catch {
      setErreur(true);
      setDonnees(null);
      toast.error(messageErreur);
    } finally {
      setChargement(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, messageErreur]);

  useEffect(() => {
    if (delai > 0) {
      const minuteur = setTimeout(charger, delai);
      return () => clearTimeout(minuteur);
    }
    charger();
  }, [charger, delai]);

  return { donnees, chargement, erreur, recharger: charger };
}
