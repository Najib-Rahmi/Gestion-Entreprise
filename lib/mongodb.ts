import mongoose from "mongoose";

/**
 * Connexion à MongoDB avec mise en cache.
 * En développement, Next.js recharge les modules à chaud : on stocke la
 * connexion dans une variable globale pour éviter d'ouvrir plusieurs
 * connexions simultanées.
 */

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Veuillez définir la variable d'environnement MONGODB_URI dans .env.local",
    );
  }
  return uri;
}

// Type du cache global
interface CacheMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Déclaration du cache sur l'objet global
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CacheMongoose | undefined;
}

const cache: CacheMongoose = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

/** Établit (ou réutilise) la connexion à MongoDB. */
export async function connecterDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (erreur) {
    cache.promise = null;
    throw erreur;
  }

  return cache.conn;
}
