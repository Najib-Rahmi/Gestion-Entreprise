import { NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Employe from "@/models/Employe";
import JourTravail from "@/models/JourTravail";
import Avance from "@/models/Avance";
import Facture from "@/models/Facture";
import Client from "@/models/Client";
import { calculerResumePaie } from "@/lib/paie";

/**
 * GET /api/statistiques - Indicateurs du tableau de bord.
 */
export async function GET() {
  try {
    await connecterDB();

    const [nbClients, nbFactures, factures, employesActifs] = await Promise.all(
      [
        Client.countDocuments(),
        Facture.countDocuments(),
        Facture.find().select("totalTTC").lean(),
        Employe.find({ actif: true }).lean(),
      ],
    );

    const chiffreAffaires = factures.reduce(
      (somme, f) => somme + (f.totalTTC || 0),
      0,
    );

    // Masse salariale due = somme des soldes dus des employés actifs
    let masseSalarialeDue = 0;
    for (const employe of employesActifs) {
      const [jours, avances] = await Promise.all([
        JourTravail.find({ employe: employe._id }).lean(),
        Avance.find({ employe: employe._id }).lean(),
      ]);
      const resume = calculerResumePaie(
        jours,
        avances,
        employe.salaireJournalier,
      );
      masseSalarialeDue += resume.soldeDu;
    }

    return NextResponse.json({
      nbClients,
      nbFactures,
      nbEmployes: employesActifs.length,
      chiffreAffaires,
      masseSalarialeDue,
    });
  } catch (erreur) {
    console.error("Erreur GET statistiques :", erreur);
    return NextResponse.json(
      { message: "Erreur lors du calcul des statistiques" },
      { status: 500 },
    );
  }
}
