/**
 * Configuration JWT partagée entre le middleware (Edge Runtime)
 * et les routes API (Node.js).
 */

export const CLE_SECRETE = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret-de-developpement-a-changer",
);
