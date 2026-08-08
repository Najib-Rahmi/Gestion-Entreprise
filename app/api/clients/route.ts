import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Client from "@/models/Client";

/**
 * GET /api/clients
 * Liste des clients avec recherche et tri.
 * Paramètres : ?recherche=...&tri=nom&ordre=asc
 */
export async function GET(requete: NextRequest) {
  try {
    await connecterDB();

    const params = requete.nextUrl.searchParams;
    const recherche = params.get("recherche") || "";
    const tri = params.get("tri") || "nom";
    const ordre = params.get("ordre") === "desc" ? -1 : 1;

    // Construction du filtre MongoDB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtre: Record<string, any> = {};
    if (recherche) {
      filtre.$or = [
        { nom: { $regex: recherche, $options: "i" } },
        { adresse: { $regex: recherche, $options: "i" } },
        { tva: { $regex: recherche, $options: "i" } },
      ];
    }

    const clients = await Client.find(filtre)
      .sort({ [tri]: ordre })
      .lean();

    return NextResponse.json(clients);
  } catch (erreur) {
    console.error("Erreur GET clients :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des clients" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/clients
 * Crée un nouveau client.
 */
export async function POST(requete: NextRequest) {
  try {
    await connecterDB();
    const donnees = await requete.json();

    const client = await Client.create(donnees);
    return NextResponse.json(client, { status: 201 });
  } catch (erreur: unknown) {
    console.error("Erreur POST client :", erreur);
    const message = erreur instanceof Error ? erreur.message : "Erreur lors de la création";
    return NextResponse.json({ message }, { status: 400 });
  }
}