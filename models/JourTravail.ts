import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * JourTravail - un jour travaillé par un employé.
 * Un document par (employe, date). `paye` marque le jour comme payé.
 */
export interface IJourTravail extends Document {
  employe: mongoose.Types.ObjectId;
  date: Date;
  paye: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schemaJourTravail = new Schema<IJourTravail>(
  {
    employe: { type: Schema.Types.ObjectId, ref: "Employe", required: true },
    date: { type: Date, required: true },
    paye: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Un seul enregistrement par employé et par jour
schemaJourTravail.index({ employe: 1, date: 1 }, { unique: true });

const JourTravail: Model<IJourTravail> =
  mongoose.models.JourTravail ||
  mongoose.model<IJourTravail>("JourTravail", schemaJourTravail);

export default JourTravail;
