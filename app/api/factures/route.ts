import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Facture from "@/models/Facture";
import { schemaFacture, valider } from "@/lib/validation";

/**
 * GET /api/factures
 * Liste des factures avec recherche et tri.
 * Paramètres : ?recherche=...&tri=date&ordre=desc
 */
export async function GET(requete: NextRequest) {
  try {
    await connecterDB();

    const params = requete.nextUrl.searchParams;
    const recherche = params.get("recherche") || "";
    const tri = params.get("tri") || "date";
    const ordre = params.get("ordre") === "asc" ? 1 : -1;

    // Construction du filtre MongoDB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtre: Record<string, any> = {};
    if (recherche) {
      filtre.$or = [
        { numero: { $regex: recherche, $options: "i" } },
        { projet: { $regex: recherche, $options: "i" } },
      ];
    }

    const factures = await Facture.find(filtre)
      .populate("client", "nom adresse tva")
      .sort({ [tri]: ordre })
      .lean();

    return NextResponse.json(factures);
  } catch (erreur) {
    console.error("Erreur GET factures :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des factures" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/factures
 * Crée une nouvelle facture (les totaux sont calculés par le modèle).
 * Le timbre est stocké tel que fourni (défaut 1 via le modèle).
 */
export async function POST(requete: NextRequest) {
  try {
    await connecterDB();
    const corps = await requete.json();

    const resultat = valider(schemaFacture, corps);
    if (!resultat.succes) {
      return NextResponse.json({ message: resultat.message }, { status: 400 });
    }

    const facture = await Facture.create(resultat.donnees);
    const factureAvecClient = await Facture.findById(facture._id)
      .populate("client", "nom adresse tva")
      .lean();

    return NextResponse.json(factureAvecClient, { status: 201 });
  } catch (erreur: unknown) {
    console.error("Erreur POST facture :", erreur);
    const message =
      erreur instanceof Error ? erreur.message : "Erreur lors de la création";
    return NextResponse.json({ message }, { status: 400 });
  }
}
