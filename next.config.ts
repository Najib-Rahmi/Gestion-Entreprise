import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les packages Mongoose sont utilisés côté serveur uniquement
  serverExternalPackages: ["mongoose"],
  // TypeScript 7 n'expose plus l'API compilateur attendue par Next.js :
  // on utilise le CLI TypeScript à la place
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
