import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { CLE_SECRETE } from "./lib/jwt-config";

/**
 * Middleware d'authentification.
 * Protège toutes les pages sauf /connexion.
 * Vérifie le jeton JWT stocké dans le cookie httpOnly.
 * (jose est compatible avec l'Edge Runtime utilisé par le middleware)
 */

// Chemins publics (accessibles sans connexion)
const CHEMINS_PUBLICS = ["/", "/connexion"];

export async function middleware(requete: NextRequest) {
  const { pathname } = requete.nextUrl;

  // Les routes API gèrent elles-mêmes leur logique (connexion/inscription publiques)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Exact match for public paths
  const estPublic = CHEMINS_PUBLICS.includes(pathname);
  const token = requete.cookies.get("session_token")?.value;

  // Vérification du jeton
  let sessionValide = false;
  if (token) {
    try {
      await jwtVerify(token, CLE_SECRETE);
      sessionValide = true;
    } catch {
      sessionValide = false;
    }
  }

  // Utilisateur connecté sur une page publique (/, /connexion) → redirection vers le dashboard
  if (estPublic && sessionValide) {
    return NextResponse.redirect(new URL("/factures", requete.url));
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
