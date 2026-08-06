import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Avance from "@/models/Avance";
import { schemaAvance, valider } from "@/lib/validation";

type Contexte = { params: Promise<{ id: string }> };

/**
 * GET /api/employes/[id]/avances - Liste les avances d'un employé.
 */
export async function GET(_requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const avances = await Avance.find({ employe: id })
      .sort({ date: -1 })
      .lean();
    return NextResponse.json(avances);
  } catch (erreur) {
    console.error("Erreur GET avances :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des avances" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/employes/[id]/avances - Ajoute une avance.
 * Body: { montant, date?, note? }
 */
export async function POST(requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const corps = await requete.json();

    const resultat = valider(schemaAvance, corps);
    if (!resultat.succes) {
      return NextResponse.json({ message: resultat.message }, { status: 400 });
    }

    const avance = await Avance.create({ ...resultat.donnees, employe: id });
    return NextResponse.json(avance, { status: 201 });
  } catch (erreur: unknown) {
    console.error("Erreur POST avance :", erreur);
    const message =
      erreur instanceof Error ? erreur.message : "Erreur lors de la création";
    return NextResponse.json({ message }, { status: 400 });
  }
}

/**
 * DELETE /api/employes/[id]/avances - Supprime une avance.
 * Body: { avanceId }
 */
export async function DELETE(requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { avanceId } = await requete.json();

    if (!avanceId) {
      return NextResponse.json(
        { message: "L'identifiant de l'avance est requis" },
        { status: 400 },
      );
    }

    const avance = await Avance.findByIdAndDelete(avanceId);
    if (!avance) {
      return NextResponse.json(
        { message: "Avance introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Avance supprimée avec succès" });
  } catch (erreur) {
    console.error("Erreur DELETE avance :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
