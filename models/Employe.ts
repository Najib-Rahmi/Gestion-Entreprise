import mongoose, { Schema, Model, Document } from "mongoose";

export interface IEmploye extends Document {
  nom: string;
  telephone: string;
  dateEmbauche: Date;
  salaireJournalier: number; // DT / jour
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schemaEmploye = new Schema<IEmploye>(
  {
    nom: { type: String, required: true, trim: true },
    telephone: { type: String, trim: true, default: "" },
    dateEmbauche: { type: Date, default: Date.now },
    salaireJournalier: { type: Number, required: true, min: 0 },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Employe: Model<IEmploye> =
  mongoose.models.Employe || mongoose.model<IEmploye>("Employe", schemaEmploye);

export default Employe;
