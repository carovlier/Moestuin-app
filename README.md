# 🌱 Mijn Moestuin App

## Installatie stap voor stap

### Stap 1 — Supabase database aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account
2. Klik op **"New Project"**, geef het een naam (bijv. `moestuin`)
3. Wacht tot het project klaar is (~1 minuut)
4. Ga naar **Settings → API** en kopieer:
   - **Project URL** (bijv. `https://abcdef.supabase.co`)
   - **anon public key** (lange code die begint met `eyJ...`)
5. Ga naar **SQL Editor** en voer dit commando uit:

```sql
CREATE TABLE moestuin_storage (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Stap 2 — Project op GitHub zetten

1. Ga naar [github.com](https://github.com) en maak een gratis account
2. Klik op **"New repository"**, geef het de naam `moestuin-app`
3. Upload alle bestanden uit deze map naar dat repository
   - Klik op **"uploading an existing file"**
   - Sleep alle bestanden erin (ook de `src` map!)
   - Klik op **"Commit changes"**

### Stap 3 — Publiceren op Vercel

1. Ga naar [vercel.com](https://vercel.com) en log in met je GitHub account
2. Klik op **"Add New Project"**
3. Kies je `moestuin-app` repository
4. Klik op **"Environment Variables"** en voeg toe:
   - `VITE_SUPABASE_URL` → jouw Project URL uit Supabase
   - `VITE_SUPABASE_ANON_KEY` → jouw anon key uit Supabase
5. Klik op **"Deploy"**

Na een minuutje krijg je een link zoals `moestuin-app.vercel.app` — deel die met je tuinpartner! 🎉

## Samenwerken
Jullie zien allebei dezelfde tuin. Als één iemand een plant toevoegt of een taak afvinkt, ziet de ander dat na een refresh.
