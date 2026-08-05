import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Bouton réutilisable avec variantes de style.
 * Variantes : primaire, secondaire, danger, fantome.
 */

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primaire" | "secondaire" | "danger" | "fantome";
  taille?: "sm" | "md" | "lg";
}

const stylesVariantes: Record<string, string> = {
  primaire:
    "bg-(--couleur-primaire) text-(--couleur-primaire-texte) shadow-[0_4px_16px_rgba(245,165,36,0.3)] hover:bg-(--couleur-primaire-hover) hover:shadow-[0_4px_20px_rgba(245,165,36,0.45)]",
  secondaire:
    "verre text-(--couleur-texte) hover:bg-(--couleur-primaire-doux)",
  danger:
    "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  fantome:
    "text-(--couleur-texte-secondaire) hover:bg-(--couleur-primaire-doux) hover:text-(--couleur-texte)",
};

const stylesTailles: Record<string, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const Bouton = forwardRef<HTMLButtonElement, BoutonProps>(
  (
    { variante = "primaire", taille = "md", className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-(--couleur-primaire) focus:ring-offset-2 focus:ring-offset-(--couleur-fond)",
          "disabled:cursor-not-allowed disabled:opacity-50",
          stylesVariantes[variante],
          stylesTailles[taille],
          className,
        )}
        {...props}>
        {children}
      </button>
    );
  },
);

Bouton.displayName = "Bouton";
export default Bouton;
