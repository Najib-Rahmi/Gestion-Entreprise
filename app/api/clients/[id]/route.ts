import { NextRequest, NextResponse } from "next/server";
import { connecterDB } from "@/lib/mongodb";
import Client from "@/models/Client";

type Contexte = { params: Promise<{ id: string }> };

/**
 * GET /api/clients/[id] - Récupère un client par son identifiant.
 */
export async function GET(_requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const client = await Client.findById(id).lean();

    if (!client) {
      return NextResponse.json(
        { message: "Client introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json(client);
  } catch (erreur) {
    console.error("Erreur GET client :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du client" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/clients/[id] - Met à jour un client.
 */
export async function PUT(requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const donnees = await requete.json();

    const client = await Client.findByIdAndUpdate(id, donnees, { new: true }).lean();

    if (!client) {
      return NextResponse.json(
        { message: "Client introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json(client);
  } catch (erreur: unknown) {
    console.error("Erreur PUT client :", erreur);
    const message =
      erreur instanceof Error ? erreur.message : "Erreur lors de la mise à jour";
    return NextResponse.json({ message }, { status: 400 });
  }
}

/**
 * DELETE /api/clients/[id] - Supprime un client.
 */
export async function DELETE(_requete: NextRequest, contexte: Contexte) {
  try {
    await connecterDB();
    const { id } = await contexte.params;
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return NextResponse.json(
        { message: "Client introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Client supprimé avec succès" });
  } catch (erreur) {
    console.error("Erreur DELETE client :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}