import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Facture from "@/models/Facture";

type Contexte = { params: Promise<{ id: string }> };

/**
 * GET /api/factures/[id] - Récupère une facture par son identifiant.
 */
export async function GET(_requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const facture = await Facture.findById(id)
      .populate("client", "nom adresse tva")
      .lean();

    if (!facture) {
      return NextResponse.json(
        { message: "Facture introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json(facture);
  } catch (erreur) {
    console.error("Erreur GET facture :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la récupération de la facture" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/factures/[id] - Met à jour une facture.
 * Utilise save() pour déclencher le recalcul automatique des totaux.
 */
export async function PUT(requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const donnees = await requete.json();

    const facture = await Facture.findById(id);
    if (!facture) {
      return NextResponse.json(
        { message: "Facture introuvable" },
        { status: 404 },
      );
    }

    // Mise à jour des champs puis save() pour recalculer les totaux
    facture.set(donnees);
    await facture.save();

    const factureMaj = await Facture.findById(facture._id)
      .populate("client", "nom adresse tva")
      .lean();

    return NextResponse.json(factureMaj);
  } catch (erreur: unknown) {
    console.error("Erreur PUT facture :", erreur);
    const message =
      erreur instanceof Error
        ? erreur.message
        : "Erreur lors de la mise à jour";
    return NextResponse.json({ message }, { status: 400 });
  }
}

/**
 * DELETE /api/factures/[id] - Supprime une facture.
 */
export async function DELETE(_requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const facture = await Facture.findByIdAndDelete(id);

    if (!facture) {
      return NextResponse.json(
        { message: "Facture introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Facture supprimée avec succès" });
  } catch (erreur) {
    console.error("Erreur DELETE facture :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}