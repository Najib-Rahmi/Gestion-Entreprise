import mongoose, { Schema, Model, Document } from "mongoose";

export interface IClient extends Document {
  nom: string;
  adresse: string;
  tva: string;
  createdAt: Date;
  updatedAt: Date;
}

const schemaClient = new Schema<IClient>(
  {
    nom: { type: String, required: true, trim: true },
    adresse: { type: String, required: true, trim: true },
    tva: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>("Client", schemaClient);

export default Client;