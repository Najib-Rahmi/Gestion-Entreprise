"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Bouton de bascule entre thème clair et sombre.
 * Affiche une icône soleil/lune selon le thème actif.
 */
export default function BasculeTheme() {
  const { theme, setTheme } = useTheme();
  const [monte, setMonte] = useState(false);

  // Évite l'erreur d'hydratation : le thème n'est connu qu'après le montage
  useEffect(() => setMonte(true), []);

  if (!monte) {
    return (
      <div
        className="h-9 w-9 rounded-lg"
        aria-hidden="true"
      />
    );
  }

  const estSombre = theme === "dark";

  return (
    <button
      onClick={() => setTheme(estSombre ? "light" : "dark")}
      className="rounded-xl p-2 text-(--couleur-texte-secondaire) transition-colors hover:bg-(--couleur-primaire-doux) hover:text-(--couleur-primaire)"
      aria-label={
        estSombre ? "Passer au thème clair" : "Passer au thème sombre"
      }
      title={estSombre ? "Thème clair" : "Thème sombre"}>
      {estSombre ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
