# SurChef

SurChef is a responsive recipe and meal-planning web app built with React + Vite.

## Highlights

- Improved UX with polished dashboard UI and smoother interactions.
- Mobile-first bottom footer navigation (desktop keeps the left sidebar/hamburger workflow).
- Built-in auth flow inside the app (sign up + sign in).
- Backend/data integration layer:
  - **Supabase** (if env vars are configured), or
  - **Local fallback** persistence for offline/demo use.
- Persisted pantry, weekly meal plan, and nutrition state with autosave.

## Quick start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

> The Vite chunking config has been updated to avoid the `manualChunks is not a function` production build crash.

## Environment variables

Create a `.env` file with:

```bash
VITE_SPOONACULAR_API_KEY=your_spoonacular_key
VITE_API_BASE_URL=https://api.spoonacular.com

# Optional: enable cloud auth + DB sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If Supabase vars are not provided, SurChef automatically uses local browser storage.

## Supabase setup

1. Open the Supabase SQL editor.
2. Run `supabase/schema.sql`.
3. Enable email/password auth in Supabase.

