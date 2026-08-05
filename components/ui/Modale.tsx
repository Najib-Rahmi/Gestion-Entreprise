"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fenêtre modale réutilisable.
 * - Fermeture par clic sur le fond, touche Échap ou bouton fermer.
 * - Empêche le défilement de la page en arrière-plan.
 */

interface ModaleProps {
  ouverte: boolean;
  onFermer: () => void;
  titre: string;
  children: React.ReactNode;
  largeur?: "md" | "lg" | "xl";
}

const LARGEURS: Record<string, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modale({
  ouverte,
  onFermer,
  titre,
  children,
  largeur = "md",
}: ModaleProps) {
  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!ouverte) return;
    const gererTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    document.addEventListener("keydown", gererTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", gererTouche);
      document.body.style.overflow = "";
    };
  }, [ouverte, onFermer]);

  if (!ouverte) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onFermer}
      role="dialog"
      aria-modal="true"
      aria-label={titre}>
      <div
        className={cn(
          "verre w-full rounded-2xl",
          "max-h-[90vh] overflow-y-auto",
          LARGEURS[largeur],
        )}
        onClick={(e) => e.stopPropagation()}>
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between border-b border-(--couleur-bordure) px-6 py-4">
          <h2 className="font-affichage text-lg font-semibold text-(--couleur-texte)">
            {titre}
          </h2>
          <button
            onClick={onFermer}
            className="rounded-lg p-1 text-(--couleur-texte-secondaire) transition-colors hover:bg-(--couleur-primaire-doux) hover:text-(--couleur-texte)"
            aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        {/* Contenu */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
