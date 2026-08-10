import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { CLE_SECRETE } from "./lib/jwt-config";

/**
 * Proxy d'authentification.
 * Protège toutes les pages sauf /connexion.
 * Vérifie le jeton JWT stocké dans le cookie httpOnly.
 * (jose est compatible avec l'Edge Runtime utilisé par le proxy)
 */

// Chemins publics (accessibles sans connexion)
const CHEMINS_PUBLICS = ["/", "/connexion"];

// Routes API publiques (authentification)
const API_PUBLIQUES = ["/api/auth/connexion", "/api/auth/deconnexion"];

export async function proxy(requete: NextRequest) {
  const { pathname } = requete.nextUrl;

  // Vérification du jeton
  const token = requete.cookies.get("session_token")?.value;
  let sessionValide = false;
  if (token) {
    try {
      await jwtVerify(token, CLE_SECRETE);
      sessionValide = true;
    } catch {
      sessionValide = false;
    }
  }

  // Routes API : publiques (auth) ou protégées (tout le reste)
  if (pathname.startsWith("/api")) {
    if (API_PUBLIQUES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    if (!sessionValide) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Exact match for public paths
  const estPublic = CHEMINS_PUBLICS.includes(pathname);

  // Utilisateur connecté sur une page publique (/, /connexion) → redirection vers le dashboard
  if (estPublic && sessionValide) {
    return NextResponse.redirect(new URL("/tableau-de-bord", requete.url));
  }

  // Utilisateur non connecté sur une page protégée → redirection vers connexion
  if (!estPublic && !sessionValide) {
    const url = new URL("/connexion", requete.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclut les fichiers statiques et les assets internes de Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
