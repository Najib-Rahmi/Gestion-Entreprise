"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LogIn } from "lucide-react";
import { toast } from "sonner";
import Bouton from "@/components/ui/Bouton";
import { ChampTexte } from "@/components/ui/Champs";
import BasculeTheme from "@/components/ui/BasculeTheme";

/**
 * Page de connexion.
 * Formulaire email/mot de passe, appel à l'API /api/auth/connexion.
 * Redirige vers la page d'accueil (dashboard) après connexion.
 * Seul le compte admin existe (créé au démarrage), pas d'inscription possible.
 */
export default function PageConnexion() {
  const routeur = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [chargement, setChargement] = useState(false);
  const annee = new Date().getFullYear();

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setChargement(true);

    try {
      const reponse = await fetch("/api/auth/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });
      const donnees = await reponse.json();

      if (!reponse.ok) {
        toast.error(donnees.message || "Erreur de connexion");
        return;
      }

      toast.success(`Bienvenue, ${donnees.utilisateur.nom} !`);

      routeur.push("/tableau-de-bord");
      routeur.refresh();
    } catch {
      toast.error("Erreur réseau, veuillez réessayer");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header public */}
      <header className="verre sticky top-0 z-10 border-b border-(--couleur-bordure)">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--couleur-primaire) text-(--couleur-primaire-texte) shadow-[0_4px_14px_rgba(245,165,36,0.4)]">
              <Building2 size={20} />
            </div>
            <div className="hidden sm:block">
              <p className="font-affichage text-sm font-bold text-(--couleur-texte)">
                Gestion Entreprise
              </p>
              <p className="text-xs text-(--couleur-texte-secondaire)">
                Factures · Clients · Employés
              </p>
            </div>
          </Link>
          <BasculeTheme />
        </div>
      </header>

      {/* Formulaire */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--couleur-primaire) text-(--couleur-primaire-texte) shadow-[0_8px_24px_rgba(245,165,36,0.4)]">
              <Building2 size={28} />
            </div>
            <h1 className="font-affichage text-2xl font-bold tracking-tight text-(--couleur-texte)">
              Gestion Entreprise
            </h1>
            <p className="mt-1 text-sm text-(--couleur-texte-secondaire)">
              Connectez-vous à votre espace
            </p>
          </div>

          <div className="verre rounded-2xl p-8">
            <form
              onSubmit={soumettre}
              className="space-y-5">
              <ChampTexte
                libelle="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.fr"
                required
                autoComplete="email"
              />
              <ChampTexte
                libelle="Mot de passe"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <Bouton
                type="submit"
                className="w-full"
                taille="lg"
                disabled={chargement}>
                <LogIn size={18} />
                {chargement ? "Connexion en cours..." : "Se connecter"}
              </Bouton>
            </form>
          </div>
        </div>
      </main>

      {/* Footer public */}
      <footer className="verre border-t border-(--couleur-bordure)">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--couleur-primaire) text-(--couleur-primaire-texte)">
              <Building2 size={16} />
            </div>
            <p className="font-affichage text-sm font-bold text-(--couleur-texte)">
              Gestion Entreprise
            </p>
          </div>
          <p className="text-xs text-(--couleur-texte-secondaire)">
            © {annee} Gestion Entreprise - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
