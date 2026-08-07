import { NextResponse } from "next/server";
import { obtenirSession } from "@/lib/auth";

/**
 * GET /api/auth/profil
 * Retourne l'utilisateur connecté (depuis le cookie de session JWT).
 * 401 si non connecté. Utilisé par la Navbar pour détecter l'état de connexion.
 */
export async function GET() {
  const session = await obtenirSession();

  if (!session) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  return NextResponse.json({ utilisateur: session });
}
