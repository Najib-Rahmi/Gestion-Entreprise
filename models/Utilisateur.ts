import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * Modèle Utilisateur - comptes de connexion à l'application.
 * Le mot de passe est stocké hashé (bcrypt), jamais en clair.
 */

export interface IUtilisateur extends Document {
  nom: string;
  email: string;
  motDePasse: string;
  role: "admin" | "utilisateur";
  createdAt: Date;
  updatedAt: Date;
}

const schemaUtilisateur = new Schema<IUtilisateur>(
  {
    nom: { type: String, required: [true, "Le nom est requis"], trim: true },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },
    motDePasse: {
      type: String,
      required: [true, "Le mot de passe est requis"],
    },
    role: {
      type: String,
      enum: ["admin", "utilisateur"],
      default: "admin",
    },
  },
  { timestamps: true },
);

// Réutilise le modèle existant en cas de rechargement à chaud (dev)
const Utilisateur: Model<IUtilisateur> =
  mongoose.models.Utilisateur ||
  mongoose.model<IUtilisateur>("Utilisateur", schemaUtilisateur);

export default Utilisateur;
