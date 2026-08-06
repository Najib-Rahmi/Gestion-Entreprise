import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * Avance - argent donné à un employé avant le jour de paie (frais).
 * Déduit du solde dû.
 */
export interface IAvance extends Document {
  employe: mongoose.Types.ObjectId;
  montant: number; // DT
  date: Date;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const schemaAvance = new Schema<IAvance>(
  {
    employe: { type: Schema.Types.ObjectId, ref: "Employe", required: true },
    montant: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

schemaAvance.index({ employe: 1, date: -1 });

const Avance: Model<IAvance> =
  mongoose.models.Avance || mongoose.model<IAvance>("Avance", schemaAvance);

export default Avance;
