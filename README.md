# Gestion Entreprise

Application web de gestion d'entreprise (PME) en français : factures, clients, employés et paie.

## Fonctionnalités

- **Factures** : CRUD complet, lignes de facturation avec TVA configurable, calcul automatique des totaux HT/TTC, timbre fiscal, génération de PDF téléchargeable, recherche et filtres par client
- **Clients** : CRUD complet via modale (création, édition, suppression), recherche
- **Employés** : CRUD, calendrier de présence (jour travaillé / payé), avances sur salaire, calcul automatique du solde dû
- **Tableau de bord** : statistiques (chiffre d'affaires, factures, employés actifs)
- **Authentification** : connexion par email et mot de passe (JWT dans un cookie httpOnly), limitation de débit contre la force brute
- **Sécurité** : en-têtes HTTP sécurisés, validation des entrées avec Zod, secret JWT obligatoire en production
- **Thème clair / sombre** avec bascule accessible partout
- **Notifications toast** pour confirmer chaque action

## Stack technique

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com) pour le style
- [MongoDB](https://www.mongodb.com) + [Mongoose](https://mongoosejs.com) pour la base de données
- [jsPDF](https://github.com/parallax/jsPDF) pour la génération de PDF
- [jose](https://github.com/panva/jose) pour les JWT, [bcryptjs](https://github.com/dcodeIO/bcrypt.js) pour le hachage des mots de passe
- [Zod](https://zod.dev) pour la validation des requêtes API
- [Vitest](https://vitest.dev) pour les tests unitaires
- [sonner](https://sonner.emilkowal.ski) pour les toasts, [lucide-react](https://lucide.dev) pour les icônes

## Prérequis

- Node.js 18+
- Une base MongoDB (locale via `mongod`, ou [MongoDB Atlas](https://www.mongodb.com/atlas) gratuit)

## Installation

1. **Installer les dépendances**

   ```bash
   pnpm install
   # ou : npm install
   ```

2. **Configurer les variables d'environnement**

   Copiez `.env.example` en `.env.local` et remplissez les valeurs :

   ```bash
   cp .env.example .env.local
   ```

   ```env
   MONGODB_URI=mongodb://localhost:27017/gestion-entreprise
   JWT_SECRET=changez-moi-par-une-longue-chaine-aleatoire
   ADMIN_EMAIL=admin@example.com
   ADMIN_NAME=Administrateur
   ADMIN_PASSWORD=changeme123
   ```

   Pour MongoDB Atlas, utilisez l'URI de connexion fournie par Atlas.
   Générez un secret fort avec :
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **Lancer le serveur de développement**

   ```bash
   pnpm dev
   # ou : npm run dev
   ```

4. Ouvrez [http://localhost:3000](http://localhost:3000) - vous serez redirigé vers la page de connexion. Connectez-vous avec les identifiants admin.

5. **(Optionnel) Créer l'admin via script**

   ```bash
   pnpm tsx scripts/seed-admin.ts
   ```

## Structure du projet

```
app/
  (tableau-de-bord)/     # Pages protégées (factures, clients, employés, dashboard)
  api/                   # Routes API REST (auth, clients, factures, employés, stats)
  connexion/             # Page de connexion
components/
  ui/                    # Composants réutilisables (boutons, champs, modales, badges...)
  employe/               # Calendrier de présence, formulaire employé, avances
  facture/               # Lignes de facture, totaux
  Navbar.tsx, Footer.tsx
lib/
  auth.ts                # JWT, hachage, récupération de l'utilisateur courant
  mongodb.ts             # Connexion MongoDB (avec cache)
  paie.ts                # Calculs de paie (fonctions pures, testées)
  validation.ts          # Schémas Zod des requêtes API
  rate-limit.ts          # Limitation de débit (anti force brute)
  utils.ts               # Formatage (montants, dates), libellés français
models/                  # Schémas Mongoose (Facture, Client, Employe, Avance, JourTravail, Utilisateur)
proxy.ts                 # Protection des routes (redirection si non connecté)
scripts/
  seed-admin.ts          # Création de l'utilisateur admin initial
```

## Routes API

| Méthode        | Route                          | Description                              |
| -------------- | ------------------------------ | ---------------------------------------- |
| POST           | `/api/auth/connexion`          | Se connecter (limité à 5 tentatives / 15 min) |
| POST           | `/api/auth/deconnexion`        | Se déconnecter                           |
| GET            | `/api/auth/profil`             | Profil de l'utilisateur connecté         |
| GET/POST       | `/api/clients`                 | Lister / créer des clients               |
| GET/PUT/DELETE | `/api/clients/[id]`            | Consulter / modifier / supprimer un client |
| GET/POST       | `/api/factures`                | Lister / créer des factures              |
| GET/PUT/DELETE | `/api/factures/[id]`           | Consulter / modifier / supprimer une facture |
| GET            | `/api/factures/[id]/pdf`       | Télécharger la facture en PDF            |
| GET/POST       | `/api/employes`                | Lister (avec soldes) / créer des employés |
| GET/PUT/DELETE | `/api/employes/[id]`           | Consulter / modifier / supprimer un employé |
| POST/PUT       | `/api/employes/[id]/jours`     | Basculer un jour travaillé / marquer payé |
| GET/POST/DELETE| `/api/employes/[id]/avances`   | Lister / ajouter / supprimer des avances |
| GET            | `/api/statistiques`            | Statistiques du tableau de bord          |

## Scripts

- `pnpm dev` - serveur de développement
- `pnpm build` - build de production
- `pnpm start` - serveur de production
- `pnpm lint` - vérification du code
- `pnpm test` - tests unitaires (Vitest)

## Déploiement

1. Définir `MONGODB_URI` (MongoDB Atlas recommandé) et un `JWT_SECRET` fort sur la plateforme d'hébergement
2. Servir en HTTPS (l'en-tête HSTS est activé)
3. Exécuter `pnpm tsx scripts/seed-admin.ts` une fois pour créer le compte admin
4. `pnpm build && pnpm start` (ou déploiement Vercel automatique)