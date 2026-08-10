import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les packages Mongoose sont utilisés côté serveur uniquement
  serverExternalPackages: ["mongoose"],
  // TypeScript 7 n'expose plus l'API compilateur attendue par Next.js :
  // on utilise le CLI TypeScript à la place
  experimental: {
    useTypeScriptCli: true,
  },
  // En-têtes de sécurité appliqués à toutes les réponses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
