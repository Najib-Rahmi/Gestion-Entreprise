import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connecterDB } from "@/lib/mongodb";
import Utilisateur from "@/models/Utilisateur";
import { creerToken, definirCookieSession } from "@/lib/auth";

/**
 * POST /api/auth/connexion
 * Authentifie un utilisateur par email/mot de passe et crée la session.
 */
export async function POST(requete: NextRequest) {
  try {
    const { email, motDePasse } = await requete.json();

    // Validation des champs
    if (!email || !motDePasse) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    await connecterDB();

    // Recherche de l'utilisateur
    const utilisateur = await Utilisateur.findOne({
      email: email.toLowerCase(),
    });
    if (!utilisateur) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 },
      );
    }

    // Vérification du mot de passe
    const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!valide) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 },
      );
    }

    // Création de la session
    const token = await creerToken({
      id: utilisateur._id.toString(),
      email: utilisateur.email,
      nom: utilisateur.nom,
      role: utilisateur.role,
    });
    await definirCookieSession(token);

    return NextResponse.json({
      message: "Connexion réussie",
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (erreur) {
    console.error("Erreur connexion :", erreur);
    return NextResponse.json(
      { message: "Erreur serveur lors de la connexion" },
      { status: 500 },
    );
  }
}
