/**
 * Configuration JWT partagée entre le middleware (Edge Runtime)
 * et les routes API (Node.js).
 */

function obtenirSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // En production, le secret est obligatoire : ne jamais utiliser de valeur par défaut.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET doit être défini en production (variable d'environnement manquante)",
      );
    }
    // Toléré en développement uniquement.
    return new TextEncoder().encode("secret-de-developpement-a-changer");
  }
  return new TextEncoder().encode(secret);
}

export const CLE_SECRETE = obtenirSecret();
