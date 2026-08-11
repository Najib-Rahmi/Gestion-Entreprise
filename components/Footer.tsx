import Link from "next/link";
import { Building2 } from "lucide-react";

/**
 * Pied de page de l'application.
 * Affiche le logo, des liens rapides vers les modules et les mentions.
 */
export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className="verre mt-2 border-t border-(--couleur-bordure)">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo et nom */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--couleur-primaire) text-(--couleur-primaire-texte)">
              <Building2 size={16} />
            </div>
            <div>
              <p className="font-affichage text-sm font-bold text-(--couleur-texte)">
                Gestion Entreprise
              </p>
              <p className="text-xs text-(--couleur-texte-secondaire)">
                Gérez votre activité en toute simplicité
              </p>
            </div>
          </div>

          {/* Liens rapides vers les modules */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/tableau-de-bord"
              className="text-sm text-(--couleur-texte-secondaire) transition-colors hover:text-(--couleur-primaire)">
              Tableau de bord
            </Link>
            <Link
              href="/factures"
              className="text-sm text-(--couleur-texte-secondaire) transition-colors hover:text-(--couleur-primaire)">
              Factures
            </Link>
            <Link
              href="/clients"
              className="text-sm text-(--couleur-texte-secondaire) transition-colors hover:text-(--couleur-primaire)">
              Clients
            </Link>
            <Link
              href="/employes"
              className="text-sm text-(--couleur-texte-secondaire) transition-colors hover:text-(--couleur-primaire)">
              Employés
            </Link>
          </nav>
        </div>

        {/* Ligne de copyright */}
        <div className="mt-6 border-t border-(--couleur-bordure) pt-6 text-center">
          <p className="text-xs text-(--couleur-texte-secondaire)">
            © {annee} Gestion Entreprise - Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
