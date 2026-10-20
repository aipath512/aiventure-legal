# Stare aiventure-legal — v1.0 — 2026-10-20

## Făcut
- `src/index.js` = Worker legal v1.10 (adresa „Pustnicul”, fără `primaryImageOfPage`, linkuri cu `/` final, descrieri fără „…” la mijlocul propoziției, `LEGAL_DATE` 2026-10-20). Testat local: 13/14 pagini trec verificările meta + Schema.org.
- `.github/workflows/deploy.yml` = publicare automată în Cloudflare la push pe `main` (necesită secretele de mai jos).
- Repo `aipath512/firmsfinder`, ramura `fix/legal-lastmod` (commit 7738456): `lastmod` 2026-10-20 pentru cele 14 pagini `/legal/` din `sitemap.xml`. NEÎMBINATĂ, se îmbină după publicarea Worker-ului, ca pagina și sitemap-ul să arate aceeași dată.

## De făcut (în ordine)
1. Cloudflare → My Profile → API Tokens → Create Token → șablon „Edit Cloudflare Workers” → copiază cheia.
2. GitHub → repo `aiventure-legal` → Settings → Secrets and variables → Actions: `CLOUDFLARE_API_TOKEN` (cheia) și `CLOUDFLARE_ACCOUNT_ID`.
3. Pornește publicarea (Actions → Deploy aiventure-legal-worker → Run workflow). Apoi verificare live pe cele 14 pagini `/legal/*` și îmbinarea ramurei `fix/legal-lastmod`.

## Decizii deschise
- Pagina `eu-ai-act`: titlul „Informații privind Regulamentul UE privind IA | FirmsFinder AI” are 62 de caractere (limită 60). Propunere: „Regulamentul UE privind IA” → v1.11.
- „Politica de confidențialitate”: paragraf despre datele publice ale firmelor (sursa data.gov.ro, trimitere la /date/ și /surse/). Textul se arată înainte de a fi pus; formularea juridică o confirmă proprietarul.
- `ETALON` (set complet meta + Schema.org) există doar pentru firmsfinder.eu și ecbtax.com; celelalte 17 domenii au nevoie de valori proprii (nume site, og:image, org_id, locale).

## Limite cunoscute
- Rutele `<domeniu>/legal/*` sunt configurate în Cloudflare, nu în repo.
- SHA-256 și OTS pentru seturile data.gov.ro rămân `null` până la valori furnizate de proprietar.
- `aiventure-head` în Cloudflare este încă șablonul „Hello World”; produsul de injectare meta + Schema.org pe tip de pagină nu este construit. Are nevoie de repo propriu `aipath512/aiventure-head`.
