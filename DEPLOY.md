# Déploiement gratuit de CleanTun

Hébergement 100 % gratuit : **Render** (API) + **Vercel** (frontend).

## Étape 0 — Pousser le code sur GitHub

```bash
cd cleantun
git init
git add .
git commit -m "CleanTun v1"
git remote add origin https://github.com/VOTRE-COMPTE/cleantun.git
git push -u origin main
```

## Étape 1 — Backend sur Render

1. Créer un compte sur [render.com](https://render.com) (gratuit)
2. **New + Web Service** → connecter le dépôt GitHub `cleantun`
3. Render détecte automatiquement `render.yaml` (Blueprint) — cliquer **Apply**
   - Root directory : `backend`
   - Start command : `npm run seed && npm start` (le seed ne se déclenche que si la base est vide)
4. Noter l'URL de l'API, ex : `https://cleantun-api.onrender.com`
5. Vérifier : `https://votre-api.onrender.com/api/health` → `{"status":"ok"}`

**Variables d'environnement** (déjà gérées par render.yaml) :
- `JWT_SECRET` → généré automatiquement
- `CORS_ORIGIN` → à remplir à l'étape 3

> ⚠️ **Limite du plan gratuit** : le disque est éphémère — la base SQLite repart
> vide à chaque redémarrage/deploiement, puis le seed se rejoue automatiquement.
> Pour une vraie mise en production : ajouter un PostgreSQL Render (plan gratuit
> aussi) et migrer `backend/src/db.js` vers `pg` (le schéma SQL est compatible).

> Le plan gratuit de Render met l'API en veille après ~15 min d'inactivité
> (première requête suivante : ~30 s de "cold start").

## Étape 2 — Frontend sur Vercel

1. Créer un compte sur [vercel.com](https://vercel.com) (gratuit, sans carte)
2. **Add New + Project** → importer le dépôt GitHub `cleantun`
3. Configurer :
   - **Root Directory** : `frontend`
   - Framework : Vite (détecté automatiquement)
   - **Environment Variables** :
     ```
     VITE_API_URL = https://cleantun-api.onrender.com
     ```
4. **Deploy** → noter l'URL, ex : `https://cleantun.vercel.app`

## Étape 3 — Connecter les deux

1. Sur Render, dans `cleantun-api` → **Environment** → ajouter :
   ```
   CORS_ORIGIN = https://cleantun.vercel.app
   ```
2. **Save** (le redémarrage est automatique)
3. Ouvrir l'app Vercer → la carte affiche les signalements de démo 🎉

## Comptes démo (après le seed)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@cleantun.tn` | `demo1234` |
| Citoyens | `amine@cleantun.tn` … | `demo1234` |

## Checklist post-déploiement

- [ ] `GET /api/health` répond sur Render
- [ ] La carte charge les données de démo sur Vercel
- [ ] Inscription + création de signalement fonctionnent
- [ ] Le lien **Admin** apparaît pour `admin@cleantun.tn`
- [ ] Une photo envoyée s'affiche dans le popup
