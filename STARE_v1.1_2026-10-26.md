# Stare aiventure-legal — v1.1 — 2026-10-26

## Făcut
- `src/index.js` = Worker legal **v2.0**: o singură pagină `/legal/` cu cele 14 documente ca secțiuni (ancore `/legal/#privacy`, `#terms`, `#cookies`, `#disclaimer`, `#legal-notice`, `#gdpr-rights`, `#data-retention`, `#security`, `#acceptable-use`, `#ai-transparency`, `#eu-ai-act`, `#human-oversight`, `#accessibility`, `#legal-contact`), cu cuprins sus.
- Vechile `/legal/<slug>` și `/legal/<slug>/` răspund 301 → `/legal/#<slug>` (păstrează `?lang=`).
- `/legal/strip.html` (subsolul comun) trimite la `/legal/#<slug>`.
- Schema.org: `usageInfo` → `/legal/#terms`, `publishingPrinciples` → `/legal/#ai-transparency`, `hasPart` cu cele 14 secțiuni.
- Pagina rămâne indexabilă (decizie 2026-10-26). Titlu și descriere în RO, EN, FR.
- Mențiunile legale arată profilurile oficiale AiVenture (`FIRM_DEFAULTS.social`), identice pe toate domeniile.
- Scoase din cod: ecbtax.com, floride-e2.com, aiventure.uk (în afara rețelei). Un host necunoscut trece acum la origine (înainte: 403).
- `LEGAL_DATE` = 2026-10-26.
- Testat local: 25 de verificări (secțiuni, ancore, cuprins, canonical, JSON-LD, 28 de redirecturi, strip, pass-through).

## De făcut (în ordine)
1. Îmbinarea PR-ului în `main` (= publicare automată în ~40 s). Necesită secretele `CLOUDFLARE_API_TOKEN` și `CLOUDFLARE_ACCOUNT_ID` în GitHub → Settings → Secrets and variables → Actions.
2. Verificare live: `/legal/`, `/legal/terms` (301), subsolul de pe 2–3 domenii.
3. **Sitemap la zi pe TOATE site-urile rețelei**: în fiecare `sitemap.xml`, cele 14 intrări `/legal/<slug>/` se înlocuiesc cu o singură `https://<domeniu>/legal/` cu `lastmod` 2026-10-26 (= `LEGAL_DATE`). Se face în ordinea: firmsfinder.eu (ramura `fix/legal-lastmod`), apoi celelalte domenii, un repo pe rând.
4. Rutele `ecbtax.com/legal/terms*` și `ecbtax.com/legal/ai-transparency*` (dacă există) se șterg din Cloudflare; ECBTAX nu mai e în rețea.

## Decizii deschise
- Pagina `eu-ai-act`: titlul lung (62 de caractere) nu mai e o problemă, pagina unică are titlul „Documente juridice | FirmsFinder AI” (35).
- Paragraf în „Politica de confidențialitate” despre datele publice ale firmelor (sursa data.gov.ro, trimitere la `/surse/`): textul se arată înainte, formularea juridică o confirmă proprietarul.
- `ETALON` (meta + Schema.org complet) există doar pentru firmsfinder.eu; celelalte domenii au meta de bază (robots, canonical, description).

## Limite cunoscute
- Rutele `<domeniu>/legal/*` sunt configurate în Cloudflare, nu în repo.
- Datele de identitate sunt încă în `FIRM_DEFAULTS`; mutarea în `aiventure-identity` e un pas separat.
