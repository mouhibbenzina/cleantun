# CleanTun 🇹🇳

Signalement citoyen des déchets en Tunisie — signaler, cartographier, résoudre.

## Stack

- **Backend** : Node.js + Express + SQLite (`node:sqlite`, zéro installation)
- **Frontend** : React + Vite + Leaflet + Tailwind CSS v4

## Démarrage

**Terminal 1 — API :**
```bash
cd backend
npm install
npm run seed       # données de démo (Tunis, Sfax, Sousse…)
npm run dev        # http://localhost:4000
npm test           # smoke test
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Ouvrir **http://localhost:5173** — le proxy Vite redirige `/api` et `/uploads` vers le backend.

**Comptes démo** : `admin@cleantun.tn` / `demo1234` (admin) — `amine@cleantun.tn` / `demo1234` (citoyen).

Déploiement gratuit (Render + Vercel) : voir [DEPLOY.md](DEPLOY.md).

> SQLite convient au MVP. En production : migrer vers PostgreSQL/PostGIS pour
> les requêtes géospatiales à grande échelle (le schéma SQL est quasi identique).

## API

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Santé de l'API |
| POST | `/api/auth/register` | Inscription `{name, email, password, city?}` |
| POST | `/api/auth/login` | Connexion `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | Profil (Bearer) |
| GET | `/api/reports` | Liste — filtres : `status`, `type`, `city`, `lat,lng,radius` |
| GET | `/api/reports/:id` | Détail |
| POST | `/api/reports` | Créer (Bearer, multipart : `type, lat, lng, photo, ...`) |
| PATCH | `/api/reports/:id` | Modifier statut/description (propriétaire ou admin) |
| DELETE | `/api/reports/:id` | Supprimer (propriétaire ou admin) |
| GET | `/api/stats` | Statistiques (statuts, villes, types) |
| GET | `/api/leaderboard` | Top 10 citoyens par points |

**Types** : `dump`, `overflow`, `burning`, `recycling`, `water`, `other`
**Statuts** : `reported` → `in_progress` → `resolved` / `rejected`

## Gamification

- +10 points : créer un signalement
- +20 points : signalement résolu
- `GET /api/leaderboard` : classement des citoyens
