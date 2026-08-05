import { cn } from "@/lib/utils";

/**
 * Carte de conteneur réutilisable (fond blanc, bordure, ombre légère).
 */
export function Carte({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("verre rounded-2xl", className)}>{children}</div>;
}

/**
 * En-tête de page avec titre, description et actions à droite.
 */
export function EntetePage({
  titre,
  description,
  children,
}: {
  titre: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-affichage text-2xl font-bold tracking-tight text-(--couleur-texte)">
          {titre}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-(--couleur-texte-secondaire)">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

/**
 * Indicateur de chargement (spinner centré).
 */
export function Chargement({
  libelle = "Chargement...",
}: {
  libelle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--couleur-bordure) border-t-(--couleur-primaire)" />
      <p className="text-sm text-(--couleur-texte-secondaire)">
        {libelle}
      </p>
    </div>
  );
}

/**
 * Message affiché quand une liste est vide.
 */
export function EtatVide({
  titre,
  description,
  children,
}: {
  titre: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-base font-medium text-(--couleur-texte)">
        {titre}
      </p>
      {description && (
        <p className="text-sm text-(--couleur-texte-secondaire)">
          {description}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
