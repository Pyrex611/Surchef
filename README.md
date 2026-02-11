# SurChef

SurChef is a recipe discovery and meal-planning web app with an integrated backend for user accounts and persisted meal/pantry data.

## What is included

- **Modern React + Vite frontend** with improved responsive UX.
- **JWT authentication** (signup/login/logout).
- **Persistent backend storage** (JSON database file) for:
  - meal plans
  - pantry items
- **Mobile-first navigation** with a fixed bottom tab bar, while desktop uses a left menu.
- **Recipe discovery** through Spoonacular API.

## Run locally

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Start backend API:

```bash
npm run dev:api
```

3. In a second terminal start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:4000`.

## Environment variables

Create a `.env` file in the project root:

```bash
VITE_SPOONACULAR_API_KEY=your_spoonacular_key
VITE_API_BASE_URL=https://api.spoonacular.com
VITE_BACKEND_URL=http://localhost:4000/api
JWT_SECRET=change-this-in-production
```

> If `VITE_SPOONACULAR_API_KEY` is missing, SurChef still works for auth/planner/pantry but recipe discovery is disabled with an in-app message.

## Build

```bash
npm run build
```

The build config uses a function-based `manualChunks` so it works with `rolldown-vite` and standard Vite builds.
