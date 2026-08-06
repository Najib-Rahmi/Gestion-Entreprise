import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Employe from "@/models/Employe";
import JourTravail from "@/models/JourTravail";
import Avance from "@/models/Avance";
import { calculerResumePaie } from "@/lib/paie";
import { schemaEmploye, valider } from "@/lib/validation";

/**
 * GET /api/employes - Liste les employés avec leur solde dû.
 * Query: recherche, tri, ordre
 */
export async function GET(requete: NextRequest) {
  try {
    await connecterDB();
    const { searchParams } = new URL(requete.url);
    const recherche = searchParams.get("recherche") || "";
    const tri = searchParams.get("tri") || "nom";
    const ordre = searchParams.get("ordre") === "desc" ? -1 : 1;

    const filtre = recherche
      ? {
          $or: [{ nom: { $regex: recherche, $options: "i" } }],
        }
      : {};

    const employes = await Employe.find(filtre)
      .sort({ [tri]: ordre })
      .lean();

    // Calcule le solde dû de chaque employé
    const avecSoldes = await Promise.all(
      employes.map(async (employe) => {
        const [jours, avances] = await Promise.all([
          JourTravail.find({ employe: employe._id }).lean(),
          Avance.find({ employe: employe._id }).lean(),
        ]);
        const resume = calculerResumePaie(
          jours,
          avances,
          employe.salaireJournalier,
        );
        return { ...employe, resume };
      }),
    );

    return NextResponse.json(avecSoldes);
  } catch (erreur) {
    console.error("Erreur GET employes :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des employés" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/employes - Crée un employé.
 */
export async function POST(requete: NextRequest) {
  try {
    await connecterDB();
    const corps = await requete.json();

    const resultat = valider(schemaEmploye, corps);
    if (!resultat.succes) {
      return NextResponse.json({ message: resultat.message }, { status: 400 });
    }

    const employe = await Employe.create(resultat.donnees);
    return NextResponse.json(employe, { status: 201 });
  } catch (erreur: unknown) {
    console.error("Erreur POST employe :", erreur);
    const message =
      erreur instanceof Error ? erreur.message : "Erreur lors de la création";
    return NextResponse.json({ message }, { status: 400 });
  }
}
