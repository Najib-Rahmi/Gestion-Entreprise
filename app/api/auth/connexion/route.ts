import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connecterDB } from "@/lib/mongodb";
import Utilisateur from "@/models/Utilisateur";
import { creerToken, definirCookieSession } from "@/lib/auth";
import { verifierLimite } from "@/lib/rate-limit";
import { schemaConnexion, valider } from "@/lib/validation";

// 5 tentatives par IP toutes les 15 minutes
const LIMITE_CONNEXION = 5;
const FENETRE_CONNEXION_MS = 15 * 60 * 1000;

/**
 * POST /api/auth/connexion
 * Authentifie un utilisateur par email/mot de passe et crée la session.
 */
export async function POST(requete: NextRequest) {
  try {
    // Limitation de débit contre les attaques par force brute
    const ip =
      requete.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      requete.headers.get("x-real-ip") ??
      "inconnu";
    const limite = verifierLimite(
      `connexion:${ip}`,
      LIMITE_CONNEXION,
      FENETRE_CONNEXION_MS,
    );
    if (!limite.autorise) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez plus tard." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (limite.reinitialisation - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    const corps = await requete.json();

    // Validation des champs
    const resultat = valider(schemaConnexion, corps);
    if (!resultat.succes) {
      return NextResponse.json({ message: resultat.message }, { status: 400 });
    }
    const { email, motDePasse } = resultat.donnees;

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
