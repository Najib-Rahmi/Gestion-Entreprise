import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { CLE_SECRETE } from "./jwt-config";

/**
 * Gestion de l'authentification par jeton JWT stocké dans un cookie httpOnly.
 * Utilise la librairie `jose` (compatible Edge Runtime pour le middleware).
 */

export const NOM_COOKIE = "session_token";
const DUREE_SESSION = 60 * 60 * 24 * 7; // 7 jours (en secondes)

export interface ChargeUtile {
  id: string;
  email: string;
  nom: string;
  role: string;
}

/** Crée un jeton JWT signé pour un utilisateur. */
export async function creerToken(charge: ChargeUtile): Promise<string> {
  return new SignJWT({ ...charge })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DUREE_SESSION}s`)
    .sign(CLE_SECRETE);
}

/** Vérifie et décode un jeton JWT. Retourne null si invalide/expiré. */
export async function verifierToken(
  token: string,
): Promise<ChargeUtile | null> {
  try {
    const { payload } = await jwtVerify(token, CLE_SECRETE);
    return {
      id: payload.id as string,
      email: payload.email as string,
      nom: payload.nom as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/** Enregistre le jeton dans un cookie httpOnly sécurisé. */
export async function definirCookieSession(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(NOM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DUREE_SESSION,
    path: "/",
  });
}

/** Supprime le cookie de session (déconnexion). */
export async function supprimerCookieSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(NOM_COOKIE);
}

/** Récupère l'utilisateur connecté depuis le cookie (côté serveur). */
export async function obtenirSession(): Promise<ChargeUtile | null> {
  const jar = await cookies();
  const token = jar.get(NOM_COOKIE)?.value;
  if (!token) return null;
  return verifierToken(token);
}
