import { NextResponse } from "next/server";
import { supprimerCookieSession } from "@/lib/auth";

/**
 * POST /api/auth/deconnexion
 * Supprime le cookie de session.
 */
export async function POST() {
  await supprimerCookieSession();
  return NextResponse.json({ message: "Déconnexion réussie" });
}
