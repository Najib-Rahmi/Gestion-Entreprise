import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Employe from "@/models/Employe";
import JourTravail from "@/models/JourTravail";
import Avance from "@/models/Avance";
import { calculerResumePaie } from "@/lib/paie";

type Contexte = { params: Promise<{ id: string }> };

/**
 * GET /api/employes/[id] - Récupère un employé avec jours, avances et résumé de paie.
 */
export async function GET(_requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const employe = await Employe.findById(id).lean();

    if (!employe) {
      return NextResponse.json(
        { message: "Employé introuvable" },
        { status: 404 },
      );
    }

    const [jours, avances] = await Promise.all([
      JourTravail.find({ employe: id }).sort({ date: 1 }).lean(),
      Avance.find({ employe: id }).sort({ date: -1 }).lean(),
    ]);

    const resume = calculerResumePaie(
      jours,
      avances,
      employe.salaireJournalier,
    );

    return NextResponse.json({ ...employe, jours, avances, resume });
  } catch (erreur) {
    console.error("Erreur GET employe :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la récupération de l'employé" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/employes/[id] - Met à jour un employé.
 */
export async function PUT(requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const donnees = await requete.json();

    const employe = await Employe.findByIdAndUpdate(id, donnees, {
      new: true,
    }).lean();

    if (!employe) {
      return NextResponse.json(
        { message: "Employé introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json(employe);
  } catch (erreur: unknown) {
    console.error("Erreur PUT employe :", erreur);
    const message =
      erreur instanceof Error
        ? erreur.message
        : "Erreur lors de la mise à jour";
    return NextResponse.json({ message }, { status: 400 });
  }
}

/**
 * DELETE /api/employes/[id] - Supprime un employé et ses données liées.
 */
export async function DELETE(_requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const employe = await Employe.findByIdAndDelete(id);

    if (!employe) {
      return NextResponse.json(
        { message: "Employé introuvable" },
        { status: 404 },
      );
    }

    await Promise.all([
      JourTravail.deleteMany({ employe: id }),
      Avance.deleteMany({ employe: id }),
    ]);

    return NextResponse.json({ message: "Employé supprimé avec succès" });
  } catch (erreur) {
    console.error("Erreur DELETE employe :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
