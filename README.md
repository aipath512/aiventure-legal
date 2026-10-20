# aiventure-legal

Sursa unică a celor 14 pagini juridice `/legal/*` (RO, EN, FR) pentru toate domeniile rețelei AiVenture, plus fragmentul `/legal/strip.html` folosit de celelalte Worker-e.

- Cod: `src/index.js` (Cloudflare Worker `aiventure-legal-worker`, versiune curentă în primul rând de comentariu).
- Datele firmei (denumire, CUI, adresă, contact) sunt în `FIRM_DEFAULTS`; se schimbă într-un singur loc.
- `LEGAL_DATE` trebuie să fie egală cu `<lastmod>` al paginilor `/legal/` din `sitemap.xml` al fiecărui site. Se schimbă doar când textele se schimbă efectiv.
- Rutele `<domeniu>/legal/*` sunt configurate în Cloudflare, nu în acest repo.

## Versiuni
- v1.10 (2026-10-20): adresa „Pustnicul”, fără `primaryImageOfPage`, linkuri cu `/` final, descrieri fără „…” la mijlocul propoziției.
