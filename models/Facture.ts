import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * Modèle Facture - factures clients avec lignes de facturation.
 * Les totaux (HT, TVA, TTC) sont calculés automatiquement avant sauvegarde.
 */

export interface ILigneFacture {
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire: number;
  tva: number; // Taux de TVA en % (ex : 19)
}

export interface IFacture extends Document {
  numero: string;
  client: mongoose.Types.ObjectId;
  projet: string;
  date: Date;
  timbre: number;
  lignes: ILigneFacture[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  createdAt: Date;
  updatedAt: Date;
}

const schemaLigne = new Schema<ILigneFacture>(
  {
    designation: { type: String, required: true, trim: true },
    unite: { type: String, required: true, trim: true, default: "m²" },
    quantite: { type: Number, required: true, min: 0 },
    prixUnitaire: { type: Number, required: true, min: 0 },
    tva: { type: Number, required: true, min: 0, max: 100, default: 19 },
  },
  { _id: false },
);

const schemaFacture = new Schema<IFacture>(
  {
    numero: { type: String, unique: true, trim: true },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Le client est requis"],
    },
    projet: { type: String, required: [true, "Le projet est requis"], trim: true },
    date: { type: Date, required: true, default: Date.now },
    timbre: { type: Number, default: 1, min: 0 },
    lignes: {
      type: [schemaLigne],
      validate: {
        validator: (v: ILigneFacture[]) => v.length > 0,
        message: "Une facture doit contenir au moins une ligne",
      },
    },
    totalHT: { type: Number, default: 0 },
    totalTVA: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 },
  },
  { timestamps: true },
);

/**
 * Pre-save hook:
 * 1. Génère le numéro de facture si absent (FAC-AAAA-XXXX).
 * 2. Calcule les totaux HT, TVA et TTC à partir des lignes.
 *    TTC = totalHT + totalTVA + timbre (timbre stocké en base, défaut 1)
 */
schemaFacture.pre("save", async function () {
  // Génération du numéro unique
  if (!this.numero) {
    const annee = new Date().getFullYear();
    const FactureModel = mongoose.models.Facture as Model<IFacture>;
    const derniere = await FactureModel.findOne({
      numero: new RegExp(`^FAC-${annee}-`),
    })
      .sort({ numero: -1 })
      .select("numero")
      .lean();

    let compteur = 1;
    if (derniere?.numero) {
      const partie = parseInt(derniere.numero.split("-")[2], 10);
      if (!isNaN(partie)) compteur = partie + 1;
    }
    this.numero = `FAC-${annee}-${String(compteur).padStart(4, "0")}`;
  }

  // Calcul des totaux - utilise le timbre stocké (défaut 1)
  const timbreValue = this.timbre ?? 1;
  let totalHT = 0;
  let totalTVA = 0;

  for (const ligne of this.lignes) {
    const montantLigne = ligne.quantite * ligne.prixUnitaire;
    totalHT += montantLigne;
    totalTVA += (montantLigne * ligne.tva) / 100;
  }

  this.totalHT = Math.round(totalHT * 100) / 100;
  this.totalTVA = Math.round(totalTVA * 100) / 100;
  this.totalTTC = Math.round((totalHT + totalTVA + timbreValue) * 100) / 100;
});

const Facture: Model<IFacture> =
  mongoose.models.Facture || mongoose.model<IFacture>("Facture", schemaFacture);

export default Facture;