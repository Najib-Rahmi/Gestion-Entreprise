import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { connecterDB } from "@/lib/mongodb";
import Facture from "@/models/Facture";
import { formaterMontant, formaterDate } from "@/lib/utils";
import { nombreEnLettres } from "@/lib/nombre";

type Contexte = { params: Promise<{ id: string }> };

/**
 * GET /api/factures/[id]/pdf
 * Génère et renvoie le PDF téléchargeable de la facture.
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

    // Création du document PDF
    const doc = new jsPDF();
    const largeurPage = doc.internal.pageSize.getWidth();
    const hauteurPage = doc.internal.pageSize.getHeight();
    let y = 15;

    // --- En-tête gauche : Entreprise ---
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.setFont("helvetica", "bold");
    doc.text("Entreprise de batiment", 14, y);
    y += 6;
    doc.setFontSize(11);
    doc.text("HOUSEMEDDINE RAHMI", 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Lieu : Henchir Laasal - Sbeitla - 1256", 14, y);
    y += 5;
    doc.text("Téléphone : 95626262", 14, y);
    y += 5;
    doc.text("T.V.A : 1771301/G/A/C", 14, y);
    y += 10;

    // --- En-tête droit : Date ---
    const xRight = largeurPage - 14;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date : ${formaterDate(facture.date)}`, xRight, 15, {
      align: "right",
    });

    // --- Titre FACTURE au centre ---
    y = 45;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("FACTURE", largeurPage / 2, y, { align: "center" });
    y += 14;

    // --- Client info (sous le titre, avec espace) ---
    doc.setTextColor(30);
    if (
      facture.client &&
      typeof facture.client === "object" &&
      "nom" in facture.client
    ) {
      const client = facture.client as unknown as {
        nom: string;
        adresse: string;
        tva: string;
      };
      doc.setFontSize(10);
      // Libellés en gras, valeurs en normal
      const ecrireChamp = (label: string, valeur: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 14, y);
        const largeurLabel = doc.getTextWidth(label);
        doc.setFont("helvetica", "normal");
        doc.text(valeur, 14 + largeurLabel, y);
        y += 6;
      };

      ecrireChamp("Doit : ", client.nom);
      if (client.adresse) {
        ecrireChamp("Adresse : ", client.adresse);
      }
      ecrireChamp("T.V.A : ", client.tva);
      if (facture.projet) {
        ecrireChamp("Projet : ", facture.projet);
      }
    }
    y += 6;

    // --- Tableau des lignes ---
    const colonnes = [
      "Désignation",
      "Unité",
      "Quantité",
      "Prix U.HTVA",
      "Prix T.HTVA",
    ];
    const lignes = facture.lignes.map((ligne) => [
      ligne.designation,
      ligne.unite,
      String(ligne.quantite),
      formaterMontant(ligne.prixUnitaire),
      formaterMontant(ligne.quantite * ligne.prixUnitaire),
    ]);

    autoTable(doc, {
      startY: y,
      head: [colonnes],
      body: lignes,
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [30, 30, 30],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { cellWidth: 72 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 20, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [30, 30, 30],
      tableLineWidth: 0.3,
    });

    // --- Totaux dans un tableau avec bordures visibles ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yFinal = (doc as any).lastAutoTable.finalY + 4;

    // Utiliser le timbre stocké en base (défaut 1)
    const timbreValue = facture.timbre ?? 1;
    const totalTTCWithTimbre =
      facture.totalTTC ?? facture.totalHT + facture.totalTVA + timbreValue;

    autoTable(doc, {
      startY: yFinal,
      body: [
        ["TOTAL HTVA :", formaterMontant(facture.totalHT)],
        ["TVA 19% :", formaterMontant(facture.totalTVA)],
        ["Timbre Facture :", formaterMontant(timbreValue)],
        ["Total A Payer TTC :", formaterMontant(totalTTCWithTimbre)],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 2.5,
        textColor: [30, 30, 30],
        lineColor: [30, 30, 30],
        lineWidth: 0.4,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: "bold" },
        1: { cellWidth: 35, halign: "right" },
      },
      margin: { left: largeurPage - 14 - 80 },
      // Dernière ligne (Total TTC) en évidence
      didParseCell: (donnees) => {
        if (donnees.row.index === 3) {
          donnees.cell.styles.fontStyle = "bold";
          donnees.cell.styles.textColor = [37, 99, 235];
          donnees.cell.styles.fontSize = 11;
        }
      },
    });

    // --- Montant en lettres ---
    const montantEnLettres = nombreEnLettres(totalTTCWithTimbre);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yLettres = (doc as any).lastAutoTable.finalY + 10;
    doc.text(
      `arrête la présente facture à la somme de : ${montantEnLettres}`,
      14,
      yLettres,
    );

    // --- Signature ---
    const ySignature = hauteurPage - 44;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Signature", xRight - 30, ySignature, { align: "right" });

    // Conversion en buffer et envoi
    const buffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${facture.numero}.pdf"`,
      },
    });
  } catch (erreur) {
    console.error("Erreur génération PDF :", erreur);
    return NextResponse.json(
      { message: "Erreur lors de la génération du PDF" },
      { status: 500 },
    );
  }
}
