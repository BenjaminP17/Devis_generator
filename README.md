# Générateur de Devis

Application web complète de génération de devis au format PDF.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Base de données | PostgreSQL 16 |
| Conteneurisation | Docker + Docker Compose |

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Docker Compose Plugin sur Linux)
- Git

---

## 🚀 Lancer l'environnement

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd devis_generator
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

> Éditez `.env` et renseignez au minimum un `JWT_SECRET` fort  
> (`openssl rand -base64 64` pour en générer un).

### 3. Démarrer tous les services (commande unique)

```bash
docker compose up --build
```

> Les images sont construites, les dépendances installées et les trois  
> services démarrent automatiquement avec hot-reload activé.

---

## URLs d'accès local

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001/api/v1 |
| **Health check** | http://localhost:3001/health |
| **PostgreSQL** | `localhost:5432` (via un client SQL) |

---

## Commandes utiles

### Installer / mettre à jour les dépendances

```bash
# Backend
docker compose exec backend npm install

# Frontend
docker compose exec frontend npm install
```

### Linter & Formateur

```bash
# Backend
docker compose exec backend npm run lint
docker compose exec backend npm run format

# Frontend
docker compose exec frontend npm run lint
docker compose exec frontend npm run format
```

### Accéder au shell d'un conteneur

```bash
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec db psql -U devis_user -d devis_db
```

### Arrêter l'environnement

```bash
# Arrêter sans supprimer les volumes (données conservées)
docker compose down

# Arrêter ET supprimer les volumes (reset complet de la BDD)
docker compose down -v
```

### Voir les logs en temps réel

```bash
docker compose logs -f
# Ou par service :
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## Arborescence du projet

```
devis_generator/
├── docker-compose.yml          # Orchestration des 3 services
├── .env.example                # Template des variables d'environnement
├── .gitignore
├── README.md
│
├── frontend/                   # React + Vite + TailwindCSS
│   ├── Dockerfile
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx            # Point d'entrée React
│       ├── App.tsx             # Routeur racine
│       ├── components/         # Composants réutilisables
│       ├── pages/              # Pages / vues
│       ├── services/           # Appels API (Axios)
│       │   └── apiClient.ts    # Instance Axios configurée
│       ├── hooks/              # Custom React hooks
│       ├── types/              # Types TypeScript globaux
│       └── styles/
│           └── index.css       # Directives TailwindCSS
│
├── backend/                    # Node.js + Express + TypeScript
│   ├── Dockerfile
│   ├── nodemon.json            # Hot-reload TypeScript
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts           # Démarrage du serveur HTTP
│       ├── app.ts              # Configuration Express + middlewares
│       ├── config/
│       │   └── database.ts     # Pool de connexions PostgreSQL
│       ├── routes/
│       │   └── index.ts        # Routeur API v1
│       ├── controllers/        # Logique des endpoints (à venir)
│       ├── services/           # Logique métier (à venir)
│       ├── repositories/       # Accès données / requêtes SQL (à venir)
│       ├── models/             # Types/interfaces domaine (à venir)
│       ├── middleware/
│       │   ├── errorHandler.ts # Gestionnaire d'erreurs global
│       │   └── notFoundHandler.ts
│       ├── utils/
│       │   └── logger.ts       # Logger Winston structuré
│       └── types/
│           └── index.ts        # Types partagés backend
│
└── database/
    └── init/
        └── 01_schema.sql       # Schéma initial (exécuté au 1er démarrage)
```

---

## Architecture Clean Code

Le projet suit une architecture en **couches séparées** :

```
Request → Route → Controller → Service → Repository → Database
```

| Couche | Responsabilité |
|---|---|
| **Controller** | Validation HTTP, parsing requête/réponse |
| **Service** | Logique métier pure, orchestration |
| **Repository** | Accès données, requêtes SQL |
| **Model/Type** | Contrats de données TypeScript |

---

## Standards de qualité

- **TypeScript strict** : `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`
- **ESLint** : règles `@typescript-eslint/recommended` + type-aware
- **Prettier** : formatage uniforme (single quotes, 100 chars, LF)
- **Nommage** : anglais explicite dans tout le code source
