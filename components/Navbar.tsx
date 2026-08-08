"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, LogOut, Menu, X, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import BasculeTheme from "@/components/ui/BasculeTheme";

/**
 * Barre de navigation horizontale principale (navbar).
 * - Liens vers les 3 modules : Factures, Clients, Employés
 * - Bouton de bascule de thème et déconnexion
 * - Responsive : menu hamburger déroulant sur mobile
 */

const LIENS_NAVIGATION = [
  { href: "/factures", libelle: "Factures", icone: FileText },
  { href: "/clients", libelle: "Clients", icone: Building2 },
];

export default function Navbar() {
  const chemin = usePathname();
  const routeur = useRouter();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [estConnecte, setEstConnecte] = useState(false);
  const [verificationFini, setVerificationFini] = useState(false);

  useEffect(() => {
    const verifierAuth = async () => {
      try {
        const res = await fetch("/api/auth/profil");
        setEstConnecte(res.ok);
      } catch {
        setEstConnecte(false);
      } finally {
        setVerificationFini(true);
      }
    };
    verifierAuth();
  }, []);

  /** Déconnexion : appel API puis redirection vers la page de connexion. */
  async function deconnecter() {
    try {
      await fetch("/api/auth/deconnexion", { method: "POST" });
      toast.success("Déconnexion réussie");
      routeur.push("/connexion");
      routeur.refresh();
      setEstConnecte(false);
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  }

  /** Vérifie si un lien correspond à la page courante. */
  function estActif(href: string) {
    return chemin.startsWith(href);
  }

  return (
    <header className="verre sticky top-0 z-40 border-b border-(--couleur-bordure)">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / nom de l'application */}
        <Link
          href={verificationFini ? (estConnecte ? "/factures" : "/") : "#"}
          className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--couleur-primaire) text-(--couleur-primaire-texte) shadow-[0_4px_14px_rgba(245,165,36,0.4)]">
            <Building2 size={20} />
          </div>
          <div className="hidden sm:block">
            <p className="font-affichage text-sm font-bold text-(--couleur-texte)">
              Gestion Entreprise
            </p>
          </div>
        </Link>

        {/* Liens de navigation (desktop) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {LIENS_NAVIGATION.map(({ href, libelle, icone: Icone }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                estActif(href)
                  ? "bg-(--couleur-primaire-doux) text-(--couleur-primaire)"
                  : "text-(--couleur-texte-secondaire) hover:bg-(--couleur-primaire-doux) hover:text-(--couleur-texte)",
              )}>
              <Icone size={16} />
              {libelle}
              {estActif(href) && (
                <span className="absolute inset-x-3 -bottom-3.25 h-0.5 rounded-full bg-(--couleur-primaire)" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions à droite (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          <BasculeTheme />
          <button
            onClick={deconnecter}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-(--couleur-texte-secondaire) transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        {/* Bouton hamburger (mobile / tablette) */}
        <div className="flex items-center gap-1 lg:hidden">
          <BasculeTheme />
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="rounded-xl p-2 text-(--couleur-texte-secondaire) transition-colors hover:bg-(--couleur-primaire-doux)"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}>
            {menuOuvert ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu déroulant mobile */}
      {menuOuvert && (
        <nav className="border-t border-(--couleur-bordure) px-4 py-3 lg:hidden">
          <div className="space-y-1">
            {LIENS_NAVIGATION.map(({ href, libelle, icone: Icone }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOuvert(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  estActif(href)
                    ? "bg-(--couleur-primaire-doux) text-(--couleur-primaire)"
                    : "text-(--couleur-texte-secondaire) hover:bg-(--couleur-primaire-doux) hover:text-(--couleur-texte)",
                )}>
                <Icone size={18} />
                {libelle}
              </Link>
            ))}
            <button
              onClick={deconnecter}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--couleur-texte-secondaire) transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
