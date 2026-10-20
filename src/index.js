// LEGAL WORKER v1.10 - 2026-10-20
// Change vs v1.9 (audit of the 14 /legal/* pages of firmsfinder.eu):
//  - FIRM_DEFAULTS.address corrected: "Drumul Pădurea Pustnicul" (was "Pustnicu"). Affects legal-notice, legal-contact and their meta description.
//  - primaryImageOfPage removed from the WebPage node (the og:image stays in the meta tags).
//  - Internal links of the page navigation now end with "/" (same form as the canonical URL).
//  - makeDescription: no more truncation with "…" in the middle of a sentence; the text is cut at the last comma that leaves >= 70 characters
//    and closed with a full stop; the word-boundary cut with "…" remains only as a last resort.
//  - LEGAL_DATE = 2026-10-20 (the text really changed). It MUST equal <lastmod> of the 14 /legal/ URLs in firmsfinder.eu/sitemap.xml.
//  Nothing else changes: other hosts, ?lang=en|fr, strip endpoint, ecbtax.com pages are unchanged.
// Change vs v1.8: ecbtax.com is a new host (firm ECB TAX ACCOUNTING & HR SRL as parameters, Romanian). It serves ONLY two pages,
//  /legal/terms and /legal/ai-transparency, with ECBTAX-specific texts and the full SCHEMA etalon (47 checks), so that
//  WebPage.usageInfo and WebSite.publishingPrinciples on ecbtax.com point to real pages. Cloudflare routes to add (more specific than
//  the existing ecbtax.com/legal/* route of the "Kit legal" Worker, which stays untouched): ecbtax.com/legal/terms* and
//  ecbtax.com/legal/ai-transparency*. The ecbtax.com pages answer 503 until the variable ECBTAX_APPROVED = 1 is set (owner approval of the texts).
//  Nothing changes for the other hosts.
// Change vs v1.7: firmsfinder.eu (Romanian pages) get the full SCHEMA etalon (47 checks: M1-M24 meta, J1-J23 JSON-LD):
//  title "<Title> | FirmsFinder AI", description, canonical WITH trailing slash, robots with max-* tokens, og:* / twitter:*,
//  meta author, meta referrer, ONE JSON-LD @graph (WebPage, WebSite with publishingPrinciples, Organization, BreadcrumbList Acasa > title),
//  visible "Ultima actualizare" date = LEGAL_DATE (must equal the <lastmod> of the page in firmsfinder.eu/sitemap.xml).
//  All other domains and the ?lang=en|fr variants are unchanged (v1.7 output).
//  /legal/<slug> and /legal/<slug>/ are both served. Strip endpoint unchanged.
// Change vs v1.6: /legal/strip.html accepts ?host=<network domain>. Other Workers (aiventure-legal-worker, aiventure-gdpr) request
// https://firmsfinder.eu/legal/strip.html?host=<their domain> from a DIFFERENT zone, so no service binding is needed.
// The host parameter only selects the language of the labels (it must be in ALLOWED_HOSTS); links stay relative (/legal/...).
// Change vs v1.5: new endpoint GET /legal/strip.html = the ONE source of the slim legal strip
//  (AIVENTURE S.R.L. . CUI + the 14 legal links, labels in the domain's language, links relative to the same domain).
//  aiventure-legal-worker and aiventure-gdpr fetch it and insert it into the page, so the text lives only here.
//  The fragment is sent with X-Robots-Tag noindex. Nothing else changed.
// Change vs v1.4 (owner answers of 18 Oct 2026):
//  - Pages exist in RO, EN and FR. Language follows the domain (LANG_BY_HOST), override with ?lang=ro|en|fr.
//    Domains not listed default to EN. A small RO / EN / FR switcher is shown on every page.
//  - floride-e2.com (test domain) is served noindex (meta + X-Robots-Tag). All other domains: index,follow.
//  - Consent-log retention (about 13 months) and the Cloudflare technical-cookies sentence confirmed by the owner.
// Earlier: v1.4 removed the internal code from the public page; v1.3 ended pilot mode (all domains, always published,
// only /legal/* handled, everything else passes through); v1.2 firm data = parameters (FIRM_DEFAULTS, optional KV "firm:<id>").
// Routes: <domain>/legal/* for each domain.
const ALLOWED_HOSTS = new Set(["1clic-ia.eu", "1clic-ia.fr", "3webobs.com", "5thelement.ai", "ai-lens.eu", "aireadyinjector.com", "aiventure.ro", "aiventure.uk", "b2b-ai-library.org", "eu-112.eu", "eu-112.ro", "eu-ai-act-ready.eu", "eu-ai-act.ro", "eu-ai-audit.eu", "eu-ai-ready.eu", "ecbtax.com", "firmsfinder.eu", "floride-e2.com", "the3webs.com"]);
const NOINDEX_HOSTS = new Set(["floride-e2.com"]);
const LANG_BY_HOST = {
  "aiventure.ro": "ro", "eu-112.ro": "ro", "eu-ai-act.ro": "ro", "ecbtax.com": "ro", "firmsfinder.eu": "ro", "1clic-ia.eu": "ro", "floride-e2.com": "ro",
  "1clic-ia.fr": "fr"
  // every other domain: "en"
};
const LANGS = ["ro", "en", "fr"];

// ---- SCHEMA ETALON per site (same values as the SCHEMA parameters of b2b-ai-library.org, site_defaults["firmsfinder.eu"]) ----
// LEGAL_DATE = date of the last real change of the legal texts; it is shown on the page, used as dateModified/datePublished
// and MUST be identical to <lastmod> of these pages in the site's sitemap.xml. Change it only when the texts really change.
const LEGAL_DATE = "2026-10-20";
const ETALON = {
  "ecbtax.com": {
    site_name: "ECBTAX",
    title_suffix: " | ECBTAX",
    robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    og_type: "website",
    og_locale: "ro_RO",
    html_lang: "ro",
    in_language: "ro-RO",
    twitter_card: "summary_large_image",
    twitter_site: "@aipath512",
    image: "https://ecbtax.com/assets/ecbtax-servicii-og-1200x630.jpg",
    image_alt: "ECBTAX — Servicii de contabilitate, fiscalitate și HR",
    image_width: "1200",
    image_height: "630",
    author_meta: "ECB TAX ACCOUNTING & HR SRL",
    referrer: "strict-origin-when-cross-origin",
    home_name: "Acasă",
    org_id: "https://ecbtax.com/#organization",
    org_name: "ECB TAX ACCOUNTING & HR SRL",
    org_url: "https://ecbtax.com/",
    usage_info: "/legal/terms",
    publishing_principles: "/legal/ai-transparency"
  },
  "firmsfinder.eu": {
    site_name: "FirmsFinder AI",
    title_suffix: " | FirmsFinder AI",
    robots: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
    og_type: "website",
    og_locale: "ro_RO",
    html_lang: "ro",
    in_language: "ro-RO",
    twitter_card: "summary_large_image",
    twitter_site: "@aipath512",
    image: "https://firmsfinder.eu/assets/og-image.webp",
    image_alt: "FirmsFinder AI — date, relații economice și oportunități",
    image_width: "1200",
    image_height: "630",
    author_meta: "AiVenture S.R.L.",
    referrer: "strict-origin-when-cross-origin",
    home_name: "Acasă",
    org_id: "https://aiventure.ro/#organization",
    org_name: "AiVenture S.R.L.",
    org_url: "https://aiventure.ro/",
    usage_info: "/legal/terms",
    publishing_principles: "/legal/ai-transparency"
  }
};

// ---- FIRM PARAMETERS (single place; may be overridden by KV key "firm:<id>" from FIRMS_KV) ----
const FIRM_DEFAULTS = {
  id: "aiventure",
  brand: "AiVenture",
  name: "AIVENTURE S.R.L.",
  cui: "51415878",
  reg: "J2025016406000",
  euid: "ROONRC.J2025016406000",
  address: "București, Sector 1, Drumul Pădurea Pustnicul nr. 141C, Corp A, Etaj 2, Ap. 5",
  representative: { name: "Gratiela Ionescu", role: "administrator" },
  email: "contact@5thelement.ai",
  phone: "+40 737 123 540",
  reg_date: "07.03.2025",
  cert_date: "10.03.2025",
  // texts that depend on the language (RO is the default; en / fr override)
  activity: "6210 – Activități de realizare a soft-ului la comandă (software orientat client)",
  retention_contact: "12 luni de la ultimul contact",
  authority: "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), www.dataprotection.ro",
  i18n: {
    en: {
      rep_role: "administrator",
      activity: "6210 – Custom software development activities (client-oriented software)",
      retention_contact: "12 months from the last contact",
      authority: "National Supervisory Authority for Personal Data Processing (ANSPDCP), www.dataprotection.ro"
    },
    fr: {
      rep_role: "administrateur",
      activity: "6210 – Activités de réalisation de logiciels sur mesure (logiciel orienté client)",
      retention_contact: "12 mois à compter du dernier contact",
      authority: "Autorité nationale de contrôle du traitement des données à caractère personnel (ANSPDCP), www.dataprotection.ro"
    }
  }
};

const UI = {
  ro: { home: "← Acasă", docs: "Documente juridice", lang: "Limba", updated: "Ultima actualizare" },
  en: { home: "← Home", docs: "Legal documents", lang: "Language", updated: "Last updated" },
  fr: { home: "← Accueil", docs: "Documents juridiques", lang: "Langue", updated: "Dernière mise à jour" }
};

// Page texts. Tokens: {{name}} {{cui}} {{reg}} {{euid}} {{address}} {{rep_name}} {{rep_role}} {{email}} {{phone}}
//                     {{activity}} {{reg_date}} {{cert_date}} {{retention_contact}} {{authority}}
const DOCS = [
  ["privacy", {
    ro: ["Politica de confidențialitate", [
      "Operatorul datelor: {{name}}, CUI {{cui}}.",
      "Datele pot include informațiile trimise voluntar prin formulare, date tehnice necesare funcționării și informații de contact pentru solicitări comerciale.",
      "Perioadele de păstrare sunt descrise în pagina Păstrarea și ștergerea datelor.",
      "Persoanele vizate pot solicita acces, rectificare, ștergere, restricționare, portabilitate și pot formula opoziție în condițiile GDPR.",
      "Solicitările privind datele personale se trimit la {{email}}."]],
    en: ["Privacy policy", [
      "Data controller: {{name}}, CUI {{cui}}.",
      "Data may include information sent voluntarily through forms, technical data needed for the service to work, and contact details for commercial enquiries.",
      "Retention periods are described on the page Data retention and deletion.",
      "Data subjects may request access, rectification, erasure, restriction and portability, and may object, under the conditions of the GDPR.",
      "Requests concerning personal data should be sent to {{email}}."]],
    fr: ["Politique de confidentialité", [
      "Responsable du traitement : {{name}}, CUI {{cui}}.",
      "Les données peuvent inclure les informations transmises volontairement via des formulaires, les données techniques nécessaires au fonctionnement du service et les coordonnées de contact pour des demandes commerciales.",
      "Les durées de conservation sont décrites dans la page Conservation et suppression des données.",
      "Les personnes concernées peuvent demander l'accès, la rectification, l'effacement, la limitation et la portabilité, et peuvent s'opposer au traitement, dans les conditions du RGPD.",
      "Les demandes relatives aux données personnelles sont à adresser à {{email}}."]]
  }],
  ["terms", {
    ro: ["Termeni și condiții", [
      "Serviciile și funcțiile disponibile diferă între domenii. Descrierile publice nu constituie automat ofertă contractuală fermă.",
      "Utilizatorii trebuie să respecte legea, drepturile terților și limitele tehnice publicate pentru fiecare serviciu.",
      "Prețurile, livrabilele, condițiile de plată și răspunderea contractuală sunt stabilite prin oferta și contractul acceptate de părți.",
      "Orice dispoziție privind limitarea răspunderii se aplică numai în măsura permisă de legislația aplicabilă."]],
    en: ["Terms and conditions", [
      "Available services and features differ between domains. Public descriptions do not automatically constitute a firm contractual offer.",
      "Users must comply with the law, third-party rights and the technical limits published for each service.",
      "Prices, deliverables, payment terms and contractual liability are set by the offer and contract accepted by the parties.",
      "Any limitation of liability applies only to the extent permitted by applicable law."]],
    fr: ["Conditions générales", [
      "Les services et fonctionnalités disponibles diffèrent selon les domaines. Les descriptions publiques ne constituent pas automatiquement une offre contractuelle ferme.",
      "Les utilisateurs doivent respecter la loi, les droits des tiers et les limites techniques publiées pour chaque service.",
      "Les prix, livrables, conditions de paiement et la responsabilité contractuelle sont fixés par l'offre et le contrat acceptés par les parties.",
      "Toute limitation de responsabilité ne s'applique que dans la mesure permise par la législation applicable."]]
  }],
  ["cookies", {
    ro: ["Politica de cookies", [
      "Cookie-urile strict necesare pot fi folosite pentru funcționarea și securitatea serviciului.",
      "Cookie-urile opționale de analiză sau marketing necesită evaluare și, unde legea impune, consimțământ anterior activării.",
      "Scriptul de consimțământ și contorul de vizite AiVenture nu setează cookie-uri. Alegerea privind consimțământul se păstrează în localStorage-ul browserului, nu într-un cookie.",
      "Contorul de vizite numără paginile vizitate și vizitatorii unici, fără cookie-uri. Nu stochează adresa IP brută; calculează o amprentă tehnică pseudonimizată, păstrată cel mult 26 de ore.",
      "Infrastructura de livrare a site-ului (Cloudflare) poate seta cookie-uri tehnice de securitate. Lista exactă se verifică separat pe fiecare domeniu."]],
    en: ["Cookie policy", [
      "Strictly necessary cookies may be used for the operation and security of the service.",
      "Optional analytics or marketing cookies require assessment and, where the law requires it, prior consent before activation.",
      "The AiVenture consent script and visit counter do not set cookies. The consent choice is stored in the browser's localStorage, not in a cookie.",
      "The visit counter counts pages viewed and unique visitors, without cookies. It does not store the raw IP address; it computes a pseudonymised technical fingerprint, kept for at most 26 hours.",
      "The site's delivery infrastructure (Cloudflare) may set technical security cookies. The exact list is checked separately for each domain."]],
    fr: ["Politique de cookies", [
      "Les cookies strictement nécessaires peuvent être utilisés pour le fonctionnement et la sécurité du service.",
      "Les cookies optionnels d'analyse ou de marketing nécessitent une évaluation et, lorsque la loi l'exige, un consentement préalable à leur activation.",
      "Le script de consentement et le compteur de visites AiVenture ne déposent pas de cookies. Le choix de consentement est conservé dans le localStorage du navigateur, et non dans un cookie.",
      "Le compteur de visites compte les pages vues et les visiteurs uniques, sans cookies. Il ne stocke pas l'adresse IP brute ; il calcule une empreinte technique pseudonymisée, conservée au maximum 26 heures.",
      "L'infrastructure de diffusion du site (Cloudflare) peut déposer des cookies techniques de sécurité. La liste exacte est vérifiée séparément pour chaque domaine."]]
  }],
  ["disclaimer", {
    ro: ["Declinarea responsabilității", [
      "Informațiile prezentate au caracter general și nu reprezintă consultanță juridică, fiscală sau financiară personalizată.",
      "Răspunsurile generate de sisteme AI pot conține erori și trebuie verificate înaintea deciziilor importante.",
      "Nicio funcție demonstrativă nu dovedește de la sine conformitatea legală sau existența unei tranzacții reale."]],
    en: ["Disclaimer", [
      "The information presented is general in nature and is not personalised legal, tax or financial advice.",
      "Answers generated by AI systems may contain errors and should be verified before important decisions.",
      "No demonstration feature proves by itself legal compliance or the existence of a real transaction."]],
    fr: ["Avertissement", [
      "Les informations présentées sont de nature générale et ne constituent pas un conseil juridique, fiscal ou financier personnalisé.",
      "Les réponses générées par des systèmes d'IA peuvent contenir des erreurs et doivent être vérifiées avant toute décision importante.",
      "Aucune fonctionnalité de démonstration ne prouve à elle seule la conformité légale ou l'existence d'une transaction réelle."]]
  }],
  ["legal-notice", {
    ro: ["Mențiuni legale", [
      "Denumire: {{name}}",
      "CUI: {{cui}}. Număr de înregistrare: {{reg}}. EUID: {{euid}}.",
      "Sediu: {{address}}.",
      "Reprezentant legal: {{rep_name}}, {{rep_role}}.",
      "Contact: {{email}}, telefon {{phone}}.",
      "Activitatea principală: {{activity}}.",
      "Data înregistrării: {{reg_date}}. Data eliberării certificatului de înregistrare: {{cert_date}}."]],
    en: ["Legal notice", [
      "Company name: {{name}}",
      "CUI: {{cui}}. Registration number: {{reg}}. EUID: {{euid}}.",
      "Registered office: {{address}}.",
      "Legal representative: {{rep_name}}, {{rep_role}}.",
      "Contact: {{email}}, phone {{phone}}.",
      "Main activity: {{activity}}.",
      "Registration date: {{reg_date}}. Registration certificate issue date: {{cert_date}}."]],
    fr: ["Mentions légales", [
      "Dénomination : {{name}}",
      "CUI : {{cui}}. Numéro d'enregistrement : {{reg}}. EUID : {{euid}}.",
      "Siège social : {{address}}.",
      "Représentant légal : {{rep_name}}, {{rep_role}}.",
      "Contact : {{email}}, téléphone {{phone}}.",
      "Activité principale : {{activity}}.",
      "Date d'immatriculation : {{reg_date}}. Date de délivrance du certificat d'immatriculation : {{cert_date}}."]]
  }],
  ["gdpr-rights", {
    ro: ["Exercitarea drepturilor GDPR", [
      "Drepturile persoanei vizate includ accesul, rectificarea, ștergerea, restricționarea, portabilitatea și opoziția, în limitele GDPR.",
      "Cererile trebuie transmise la {{email}}, canalul oficial de contact al operatorului; identitatea poate fi verificată proporțional cu riscul.",
      "Termenul uzual de răspuns este o lună, cu posibilitatea prelungirii conform art. 12 GDPR.",
      "Se poate depune plângere la autoritatea de supraveghere: {{authority}}."]],
    en: ["Exercising GDPR rights", [
      "Data subject rights include access, rectification, erasure, restriction, portability and objection, within the limits of the GDPR.",
      "Requests must be sent to {{email}}, the operator's official contact channel; identity may be verified in proportion to the risk.",
      "The usual response time is one month, which may be extended under Article 12 GDPR.",
      "A complaint may be lodged with the supervisory authority: {{authority}}."]],
    fr: ["Exercice des droits RGPD", [
      "Les droits de la personne concernée comprennent l'accès, la rectification, l'effacement, la limitation, la portabilité et l'opposition, dans les limites du RGPD.",
      "Les demandes doivent être envoyées à {{email}}, canal de contact officiel de l'opérateur ; l'identité peut être vérifiée de manière proportionnée au risque.",
      "Le délai de réponse habituel est d'un mois, avec possibilité de prolongation conformément à l'article 12 du RGPD.",
      "Une réclamation peut être introduite auprès de l'autorité de contrôle : {{authority}}."]]
  }],
  ["data-retention", {
    ro: ["Păstrarea și ștergerea datelor", [
      "Datele trebuie păstrate numai atât cât este necesar scopului și obligațiilor legale aplicabile.",
      "Mesajele trimise prin formulare și email se păstrează {{retention_contact}}.",
      "Evidența alegerilor de consimțământ (fără adresa IP, doar țara) se păstrează aproximativ 13 luni.",
      "Pentru alte categorii de date, perioada de păstrare este limitată la ce este necesar scopului și obligațiilor legale.",
      "La expirarea perioadei aplicabile, datele sunt șterse sau anonimizate."]],
    en: ["Data retention and deletion", [
      "Data is kept only as long as necessary for the purpose and for applicable legal obligations.",
      "Messages sent through forms and email are kept for {{retention_contact}}.",
      "The record of consent choices (without IP address, country only) is kept for approximately 13 months.",
      "For other categories of data, the retention period is limited to what is necessary for the purpose and for legal obligations.",
      "When the applicable period ends, data is deleted or anonymised."]],
    fr: ["Conservation et suppression des données", [
      "Les données ne sont conservées que le temps nécessaire à la finalité et aux obligations légales applicables.",
      "Les messages envoyés via les formulaires et par e-mail sont conservés {{retention_contact}}.",
      "Le registre des choix de consentement (sans adresse IP, uniquement le pays) est conservé environ 13 mois.",
      "Pour les autres catégories de données, la durée de conservation est limitée à ce qui est nécessaire à la finalité et aux obligations légales.",
      "À l'expiration de la durée applicable, les données sont supprimées ou anonymisées."]]
  }],
  ["security", {
    ro: ["Securitatea informațiilor", [
      "Măsurile de securitate trebuie alese proporțional cu riscurile și cu natura datelor.",
      "Controlul accesului, gestionarea secretelor, jurnalizarea, copiile de siguranță și răspunsul la incidente necesită dovezi tehnice verificabile.",
      "Această pagină nu reprezintă certificare de securitate sau garanție de absență a incidentelor."]],
    en: ["Information security", [
      "Security measures are chosen in proportion to the risks and the nature of the data.",
      "Access control, secrets management, logging, backups and incident response require verifiable technical evidence.",
      "This page does not constitute a security certification or a guarantee that no incidents will occur."]],
    fr: ["Sécurité de l'information", [
      "Les mesures de sécurité sont choisies de manière proportionnée aux risques et à la nature des données.",
      "Le contrôle d'accès, la gestion des secrets, la journalisation, les sauvegardes et la réponse aux incidents nécessitent des preuves techniques vérifiables.",
      "Cette page ne constitue ni une certification de sécurité ni une garantie d'absence d'incidents."]]
  }],
  ["acceptable-use", {
    ro: ["Utilizare acceptabilă", [
      "Sunt interzise accesul neautorizat, abuzul automatizărilor, introducerea de conținut ilegal și încercările de perturbare a serviciilor.",
      "Accesul programatic și utilizarea agenților sunt permise numai în limitele tehnice și contractuale aprobate.",
      "Disponibilitatea unor capabilități tehnice nu echivalează cu permisiunea de executare a tranzacțiilor."]],
    en: ["Acceptable use", [
      "Unauthorised access, abuse of automation, uploading illegal content and attempts to disrupt the services are prohibited.",
      "Programmatic access and use of agents are permitted only within the approved technical and contractual limits.",
      "The availability of technical capabilities does not imply permission to execute transactions."]],
    fr: ["Utilisation acceptable", [
      "L'accès non autorisé, l'abus d'automatisations, l'introduction de contenus illégaux et les tentatives de perturbation des services sont interdits.",
      "L'accès programmatique et l'utilisation d'agents ne sont autorisés que dans les limites techniques et contractuelles approuvées.",
      "La disponibilité de certaines capacités techniques n'équivaut pas à une autorisation d'exécuter des transactions."]]
  }],
  ["ai-transparency", {
    ro: ["Transparența sistemelor AI", [
      "Funcțiile bazate pe AI trebuie identificate acolo unde obligațiile aplicabile impun transparență.",
      "Rezultatele automate pot fi incomplete sau inexacte; sursele, limitele și nivelul de încredere trebuie evaluate contextual.",
      "Afirmațiile despre performanță, verificare sau conformitate necesită probe și nu pot fi deduse doar din generarea unui răspuns."]],
    en: ["AI systems transparency", [
      "AI-based functions must be identified where the applicable obligations require transparency.",
      "Automated results may be incomplete or inaccurate; sources, limits and level of confidence should be assessed in context.",
      "Claims about performance, verification or compliance require evidence and cannot be inferred merely from a response being generated."]],
    fr: ["Transparence des systèmes d'IA", [
      "Les fonctions reposant sur l'IA doivent être identifiées lorsque les obligations applicables imposent la transparence.",
      "Les résultats automatiques peuvent être incomplets ou inexacts ; les sources, les limites et le niveau de confiance doivent être évalués selon le contexte.",
      "Les affirmations sur la performance, la vérification ou la conformité nécessitent des preuves et ne peuvent être déduites du seul fait qu'une réponse a été générée."]]
  }],
  ["eu-ai-act", {
    ro: ["Informații privind Regulamentul UE privind IA", [
      "Obligațiile aplicabile depind de rolul operatorului, scopul sistemului, clasificarea riscului și calendarul normativ relevant.",
      "Nu se afirmă că toate serviciile sunt conforme doar prin existența acestei pagini.",
      "Evaluările, documentația și controalele trebuie efectuate pentru fiecare sistem și caz de utilizare."]],
    en: ["Information on the EU AI Act", [
      "Applicable obligations depend on the operator's role, the purpose of the system, the risk classification and the relevant regulatory timeline.",
      "It is not claimed that all services are compliant merely because this page exists.",
      "Assessments, documentation and controls must be carried out for each system and use case."]],
    fr: ["Informations sur le règlement européen sur l'IA", [
      "Les obligations applicables dépendent du rôle de l'opérateur, de la finalité du système, de la classification du risque et du calendrier réglementaire pertinent.",
      "Il n'est pas affirmé que tous les services sont conformes du seul fait de l'existence de cette page.",
      "Les évaluations, la documentation et les contrôles doivent être réalisés pour chaque système et cas d'usage."]]
  }],
  ["human-oversight", {
    ro: ["Supraveghere umană", [
      "Operațiunile cu efecte juridice sau comerciale pot necesita aprobare umană explicită, în funcție de mandat și risc.",
      "Agenții nu trebuie să inventeze oferte, prețuri sau permisiuni în timpul tranzacției.",
      "Evenimentele de aprobare și execuție trebuie păstrate ca dovezi verificabile când arhitectura serviciului o cere."]],
    en: ["Human oversight", [
      "Operations with legal or commercial effects may require explicit human approval, depending on mandate and risk.",
      "Agents must not invent offers, prices or permissions during a transaction.",
      "Approval and execution events must be kept as verifiable evidence where the service architecture requires it."]],
    fr: ["Supervision humaine", [
      "Les opérations ayant des effets juridiques ou commerciaux peuvent nécessiter une approbation humaine explicite, selon le mandat et le risque.",
      "Les agents ne doivent pas inventer d'offres, de prix ou de permissions pendant une transaction.",
      "Les événements d'approbation et d'exécution doivent être conservés comme preuves vérifiables lorsque l'architecture du service l'exige."]]
  }],
  ["accessibility", {
    ro: ["Accesibilitate", [
      "Obiectivul este furnizarea de conținut lizibil, navigabil prin tastatură și compatibil cu tehnologiile asistive.",
      "Nivelul de conformitate WCAG nu este declarat fără audit de accesibilitate și remedierea neconformităților constatate.",
      "Problemele de accesibilitate pot fi raportate la {{email}}."]],
    en: ["Accessibility", [
      "The goal is to provide content that is readable, keyboard-navigable and compatible with assistive technologies.",
      "No WCAG conformance level is declared without an accessibility audit and remediation of the issues found.",
      "Accessibility issues can be reported to {{email}}."]],
    fr: ["Accessibilité", [
      "L'objectif est de fournir un contenu lisible, navigable au clavier et compatible avec les technologies d'assistance.",
      "Aucun niveau de conformité WCAG n'est déclaré sans audit d'accessibilité et correction des non-conformités constatées.",
      "Les problèmes d'accessibilité peuvent être signalés à {{email}}."]]
  }],
  ["legal-contact", {
    ro: ["Contact juridic", [
      "Operator: {{name}}, CUI {{cui}}.",
      "Sediu: {{address}}.",
      "Reprezentant legal: {{rep_name}}, {{rep_role}}.",
      "E-mail pentru solicitări juridice și GDPR: {{email}}. Telefon: {{phone}}."]],
    en: ["Legal contact", [
      "Operator: {{name}}, CUI {{cui}}.",
      "Registered office: {{address}}.",
      "Legal representative: {{rep_name}}, {{rep_role}}.",
      "Email for legal and GDPR requests: {{email}}. Phone: {{phone}}."]],
    fr: ["Contact juridique", [
      "Opérateur : {{name}}, CUI {{cui}}.",
      "Siège social : {{address}}.",
      "Représentant légal : {{rep_name}}, {{rep_role}}.",
      "E-mail pour les demandes juridiques et RGPD : {{email}}. Téléphone : {{phone}}."]]
  }]
];

// ---- ECBTAX (host ecbtax.com): firm parameters and the two pages it serves ----
// Texts are drafts adapted from the AiVenture generic texts; they must be approved by ECBTAX before ECBTAX_APPROVED = 1.
const FIRM_BY_HOST = {
  "ecbtax.com": {
    id: "ecbtax", brand: "ECBTAX", name: "ECB TAX ACCOUNTING & HR SRL", cui: "35136588",
    address: "Str. Nicolae G. Caramfil 61C, et. 3, București, Sector 1",
    email: "ecbtax@gmail.com", phone: "+40 755 110 012"
  }
};
const DOCS_BY_HOST = {
  "ecbtax.com": [
    ["terms", { ro: ["Termeni și condiții", [
      "Acest site este operat de {{name}} (ECBTAX), CUI {{cui}}, cu sediul în {{address}}, și prezintă servicii de contabilitate, calculul salariilor, fiscalitate și HR.",
      "Descrierile publice de pe site au caracter informativ și nu constituie ofertă contractuală fermă. Serviciile se prestează pe baza unui contract încheiat între ECBTAX și client.",
      "Prețurile, livrabilele, termenele, condițiile de plată și răspunderea contractuală se stabilesc prin oferta și contractul acceptate de părți.",
      "Informațiile de pe site au caracter general și nu înlocuiesc consultanța personalizată pentru situația concretă a fiecărui client.",
      "Utilizatorii trebuie să respecte legea, drepturile terților și limitele tehnice ale funcțiilor online ale site-ului.",
      "Orice limitare a răspunderii se aplică numai în măsura permisă de legislația aplicabilă.",
      "Întrebările privind acești termeni se trimit la {{email}} sau la telefon {{phone}}."]] }],
    ["ai-transparency", { ro: ["Transparența sistemelor AI", [
      "Site-ul ECBTAX folosește date structurate și funcții bazate pe AI: fișiere publice citibile de mașini (de exemplu ai.json și ai-proof.json), marcaje schema.org și un agent AI de calcul salarial care răspunde prin protocolul A2A.",
      "Rezultatele generate automat, inclusiv calculele agentului AI, pot fi incomplete sau inexacte și trebuie verificate de un specialist înaintea deciziilor cu efect fiscal sau juridic.",
      "Documentele din Trust Center sunt însoțite de hash-uri SHA-256 și de mărci de timp OpenTimestamps, care permit verificarea integrității lor; ele nu înlocuiesc verificarea la organismul profesional emitent.",
      "Funcțiile bazate pe AI se identifică acolo unde obligațiile aplicabile impun transparență, inclusiv Regulamentul (UE) 2024/1689.",
      "Întrebările privind sistemele AI de pe site se trimit la {{email}}."]] }]
  ]
};
const docsFor = host => DOCS_BY_HOST[host] || DOCS;

const MISSING = "[de completat]";
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const route = slug => '/legal/' + slug;

async function loadFirm(env, host) {
  const base = FIRM_BY_HOST[host] ? { ...FIRM_DEFAULTS, ...FIRM_BY_HOST[host] } : FIRM_DEFAULTS;
  let rec = {};
  if (env.FIRMS_KV) {
    try {
      const raw = await env.FIRMS_KV.get('firm:' + (FIRM_BY_HOST[host] ? base.id : (env.FIRM_ID || FIRM_DEFAULTS.id)));
      if (raw) rec = JSON.parse(raw);
    } catch { /* invalid or missing record: defaults stay */ }
  }
  const i18n = {};
  for (const l of ['en', 'fr']) i18n[l] = { ...FIRM_DEFAULTS.i18n[l], ...((rec.i18n && rec.i18n[l]) || {}) };
  return { ...base, ...rec, representative: { ...base.representative, ...(rec.representative || {}) }, i18n };
}

function fill(text, firm, lang) {
  const v = {
    name: firm.name, cui: firm.cui, reg: firm.reg, euid: firm.euid, address: firm.address,
    rep_name: firm.representative && firm.representative.name, rep_role: firm.representative && firm.representative.role,
    email: firm.email, phone: firm.phone,
    activity: firm.activity, reg_date: firm.reg_date, cert_date: firm.cert_date,
    retention_contact: firm.retention_contact, authority: firm.authority
  };
  if (lang !== 'ro' && firm.i18n && firm.i18n[lang]) Object.assign(v, firm.i18n[lang]);
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => (v[k] ? v[k] : MISSING));
}

function pickLang(host, url) {
  const q = url.searchParams.get('lang');
  if (q && LANGS.includes(q)) return { lang: q, explicit: true };
  return { lang: LANG_BY_HOST[host] || 'en', explicit: false };
}

// meta description: the first paragraphs of the page, at most 155 characters.
// v1.10: when the next paragraph does not fit, it is cut at the last comma that leaves >= 70 characters and closed with a full stop;
// only if there is no such comma, the cut is made at a word boundary and closed with "…".
function makeDescription(paragraphs, firm, lang) {
  let out = '';
  for (const p of paragraphs) {
    const t = fill(p, firm, lang).replace(/\s+/g, ' ').trim();
    const next = out ? out + ' ' + t : t;
    if (next.length <= 155) { out = next; continue; }
    if (out.length < 70) {
      const cut = next.slice(0, 154);
      const comma = cut.lastIndexOf(', ');
      if (comma >= 70) {
        out = cut.slice(0, comma).replace(/[\s,;:.\-–—]+$/, '') + '.';
      } else {
        out = cut.slice(0, Math.max(cut.lastIndexOf(' '), 60)).replace(/[\s,;:.\-–—]+$/, '') + '…';
      }
    }
    break;
  }
  return out;
}

function etalonHead(host, slug, title, description, e) {
  const pageUrl = 'https://' + host + route(slug) + '/';
  const origin = 'https://' + host;
  const fullTitle = title + e.title_suffix;
  const a = escapeHtml;
  const m = (k, n, v) => '<meta ' + k + '="' + n + '" content="' + a(v) + '">';
  const org = { '@id': e.org_id };
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': pageUrl + '#webpage', url: pageUrl, name: title, description,
        isPartOf: { '@id': origin + '/#website' }, inLanguage: e.in_language,
        dateModified: LEGAL_DATE, datePublished: LEGAL_DATE, copyrightYear: Number(LEGAL_DATE.slice(0, 4)),
        isAccessibleForFree: true, publisher: org, author: org, creator: org, copyrightHolder: org,
        usageInfo: origin + e.usage_info, breadcrumb: { '@id': pageUrl + '#breadcrumb' }
      },
      {
        '@type': 'WebSite', '@id': origin + '/#website', url: origin + '/', name: e.site_name,
        publisher: org, inLanguage: e.in_language, publishingPrinciples: origin + e.publishing_principles
      },
      { '@type': 'Organization', '@id': e.org_id, name: e.org_name, url: e.org_url },
      {
        '@type': 'BreadcrumbList', '@id': pageUrl + '#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: e.home_name, item: origin + '/' },
          { '@type': 'ListItem', position: 2, name: title, item: pageUrl }
        ]
      }
    ]
  };
  const ld = JSON.stringify(graph).replace(/</g, '\\u003c');
  return [
    '<title>' + a(fullTitle) + '</title>',
    '<link rel="canonical" href="' + a(pageUrl) + '">',
    m('name', 'description', description),
    m('name', 'robots', e.robots),
    m('property', 'og:type', e.og_type),
    m('property', 'og:title', fullTitle),
    m('property', 'og:description', description),
    m('property', 'og:url', pageUrl),
    m('property', 'og:site_name', e.site_name),
    m('property', 'og:locale', e.og_locale),
    m('property', 'og:image', e.image),
    m('property', 'og:image:alt', e.image_alt),
    m('property', 'og:image:width', e.image_width),
    m('property', 'og:image:height', e.image_height),
    m('name', 'twitter:card', e.twitter_card),
    m('name', 'twitter:title', fullTitle),
    m('name', 'twitter:description', description),
    m('name', 'twitter:image', e.image),
    m('name', 'twitter:image:alt', e.image_alt),
    m('name', 'twitter:site', e.twitter_site),
    m('name', 'author', e.author_meta),
    m('name', 'referrer', e.referrer),
    '<script type="application/ld+json">' + ld + '</script>'
  ].join('');
}

function documentHTML(host, slug, lang, explicit, firm) {
  const ui = UI[lang];
  const q = explicit ? '?lang=' + lang : '';
  const DL = docsFor(host);
  const doc = DL.find(d => d[0] === slug)[1][lang];
  const title = doc[0], paragraphs = doc[1];
  const links = DL.map(([s, t]) => '<li><a href="' + route(s) + '/' + q + '">' + escapeHtml(t[lang][0]) + '</a></li>').join('');
  const switcher = DOCS_BY_HOST[host] ? '<strong>' + lang.toUpperCase() + '</strong>' : LANGS.map(l => l === lang ? '<strong>' + l.toUpperCase() + '</strong>' : '<a href="' + route(slug) + '/?lang=' + l + '" hreflang="' + l + '">' + l.toUpperCase() + '</a>').join(' · ');
  const etalon = ETALON[host] && lang === ETALON[host].html_lang ? ETALON[host] : null;
  let headMeta, updated = '';
  if (etalon) {
    headMeta = etalonHead(host, slug, title, makeDescription(paragraphs, firm, lang), etalon);
    updated = '<p><small>' + escapeHtml(ui.updated) + ': <time datetime="' + LEGAL_DATE + '">' + LEGAL_DATE + '</time></small></p>';
  } else {
    const robots = NOINDEX_HOSTS.has(host) ? 'noindex,nofollow' : 'index,follow';
    headMeta = '<meta name="robots" content="' + robots + '"><title>' + escapeHtml(title) + ' — ' + escapeHtml(firm.brand) + '</title><link rel="canonical" href="https://' + host + route(slug) + '">';
  }
  return '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + headMeta + '<style>body{font:17px/1.65 system-ui,sans-serif;max-width:850px;margin:40px auto;padding:0 20px;color:#17212c}a{color:#087b86}nav ul{columns:2}main{margin:2rem 0}small{color:#555}</style></head><body><header><a href="/">' + escapeHtml(ui.home) + '</a> <small style="float:right">' + escapeHtml(ui.lang) + ': ' + switcher + '</small></header><main><h1>' + escapeHtml(title) + '</h1>' + paragraphs.map(p => '<p>' + escapeHtml(fill(p, firm, lang)) + '</p>').join('') + updated + '</main><nav aria-label="' + escapeHtml(ui.docs) + '"><h2>' + escapeHtml(ui.docs) + '</h2><ul>' + links + '</ul></nav><footer><small>' + escapeHtml(firm.name) + '</small></footer></body></html>';
}

function stripHTML(lang, firm) {
  const links = DOCS.map(([s, t]) => '<a href="' + route(s) + '">' + escapeHtml(t[lang][0]) + '</a>').join('');
  return '<style>#aiventure-legal-strip{display:block!important;width:100%!important;margin:0!important;padding:18px 20px!important;background:#000!important;color:#b9c7d8!important;border-top:1px solid #303b48!important;font:13px/1.7 Arial,sans-serif!important;text-align:center!important;position:static!important;clear:both!important}#aiventure-legal-strip p{margin:0 0 6px!important;font:13px/1.7 Arial,sans-serif!important;color:#b9c7d8!important}#aiventure-legal-strip nav{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:2px 16px!important}#aiventure-legal-strip nav a{display:inline!important;padding:2px 0!important;font:13px/1.7 Arial,sans-serif!important;color:#b9c7d8!important;text-decoration:none!important}#aiventure-legal-strip nav a:hover{color:#fff!important;text-decoration:underline!important}</style>'
    + '<div id="aiventure-legal-strip"><p><strong>' + escapeHtml(firm.name) + '</strong> · CUI ' + escapeHtml(firm.cui) + '</p><nav aria-label="' + escapeHtml(UI[lang].docs) + '">' + links + '</nav></div>';
}

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!ALLOWED_HOSTS.has(host)) return new Response('Host not authorized', { status: 403 });

    const path = url.pathname.replace(/\/$/, '');
    if (path === '/legal/strip.html') {
      const firm = await loadFirm(env, 'firmsfinder.eu');
      const asked = (url.searchParams.get('host') || '').toLowerCase().replace(/^www\./, '');
      const { lang } = pickLang(ALLOWED_HOSTS.has(asked) ? asked : host, url);
      return new Response(stripHTML(lang, firm), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex,nofollow' } });
    }
    const entry = docsFor(host).find(([slug]) => route(slug) === path);
    if (entry) {
      if (DOCS_BY_HOST[host] && env.ECBTAX_APPROVED !== '1') return new Response('Pagina este în curs de aprobare.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '86400', 'X-Robots-Tag': 'noindex' } });
      const firm = await loadFirm(env, host);
      const { lang: pl, explicit } = pickLang(host, url);
      const lang = DOCS_BY_HOST[host] ? 'ro' : pl;
      const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' };
      if (NOINDEX_HOSTS.has(host)) headers['X-Robots-Tag'] = 'noindex,nofollow';
      return new Response(documentHTML(host, entry[0], lang, explicit, firm), { headers });
    }
    if (url.pathname.startsWith('/legal/')) return new Response('Not found', { status: 404 });
    return fetch(request);
  }
};
