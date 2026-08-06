import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import JourTravail from "@/models/JourTravail";
import { normaliserJour } from "@/lib/paie";
import { schemaJour, schemaJourPaye, valider } from "@/lib/validation";

type Contexte = { params: Promise<{ id: string }> };

/**
 * POST /api/employes/[id]/jours - Bascule un jour travaillé.
 * Body: { date }. Si le jour existe, il est supprimé ; sinon il est créé.
 */
export async function POST(requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const corps = await requete.json();

    const resultat = valider(schemaJour, corps);
    if (!resultat.succes) {
      return NextResponse.json({ message: resultat.message }, { status: 400 });
    }

    const jour = normaliserJour(resultat.donnees.date);
    const existant = await JourTravail.findOne({ employe: id, date: jour });

    if (existant) {
      await JourTravail.deleteOne({ _id: existant._id });
      return NextResponse.json({ action: "retire", date: jour });
    }

    const cree = await JourTravail.create({ employe: id, date: jour });
    return NextResponse.json({ action: "ajoute", jour: cree }, { status: 201 });
  } catch (erreur) {
    console.error("Erreur POST jour :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la bascule du jour" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/employes/[id]/jours - Marque un jour comme payé / non payé.
 * Body: { date, paye }
 */
export async function PUT(requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const corps = await requete.json();

    const resultat = valider(schemaJourPaye, corps);
    if (!resultat.succes) {
      return NextResponse.json({ message: resultat.message }, { status: 400 });
    }

    const { date, paye } = resultat.donnees;
    const jour = normaliserJour(date);
    const maj = await JourTravail.findOneAndUpdate(
      { employe: id, date: jour },
      { paye },
      { new: true },
    );

    if (!maj) {
      return NextResponse.json(
        { message: "Jour travaillé introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json(maj);
  } catch (erreur) {
    console.error("Erreur PUT jour :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du jour" },
      { status: 500 },
    );
  }
}
