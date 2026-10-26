// LEGAL WORKER v2.0 - 2026-10-26
// Change vs v1.10 (owner decisions of 26 Oct 2026: ONE legal page instead of 14):
//  - ONE page /legal/ with the 14 documents as sections. Each section has its own anchor (id = the old slug):
//    /legal/#privacy, /legal/#terms, /legal/#cookies, /legal/#disclaimer, /legal/#legal-notice, /legal/#gdpr-rights, /legal/#data-retention,
//    /legal/#security, /legal/#acceptable-use, /legal/#ai-transparency, /legal/#eu-ai-act, /legal/#human-oversight, /legal/#accessibility,
//    /legal/#legal-contact. A table of contents sits at the top of the page.
//  - The old URLs /legal/<slug> and /legal/<slug>/ answer 301 -> /legal/#<slug> (with ?lang=xx kept when it was given), so no existing link breaks.
//  - /legal/strip.html (the footer strip used by the other Workers) now links to /legal/#<slug>: one click lands on the right section.
//  - Schema.org: WebPage.usageInfo -> /legal/#terms, WebSite.publishingPrinciples -> /legal/#ai-transparency, WebPage.hasPart lists the 14 sections.
//  - Title and description exist in RO, EN and FR. The page stays INDEXABLE (owner decision): index,follow, in the sitemap.
//  - The legal notice section lists the official AiVenture profiles (FIRM_DEFAULTS.social), same on every domain.
//  - LEGAL_DATE = 2026-10-26 (the structure and the notice really changed). It MUST equal <lastmod> of https://<domain>/legal/ in the
//    sitemap.xml of EVERY network site, and the 14 old /legal/<slug>/ entries must be removed from those sitemaps.
//  - ecbtax.com, floride-e2.com and aiventure.uk are no longer part of the AiVenture network: their code is removed.
//    A host that is not in ALLOWED_HOSTS is now passed through to its origin (it used to get 403), so a forgotten route does no harm.
//  Unchanged: firm parameters (FIRM_DEFAULTS, optional KV "firm:<id>"), language by domain (?lang=ro|en|fr), the 14 texts.
// Earlier: v1.10 address "Pustnicul", no primaryImageOfPage; v1.9 ecbtax.com pages; v1.7 SCHEMA etalon for firmsfinder.eu;
//  v1.6 /legal/strip.html?host=<domain>; v1.5 strip endpoint; v1.4 RO/EN/FR; v1.3 all domains, always published; v1.2 firm data = parameters.
// Routes: <domain>/legal/* for each domain (configured in Cloudflare, not in the repo).
const ALLOWED_HOSTS = new Set(["1clic-ia.eu", "1clic-ia.fr", "3webobs.com", "5thelement.ai", "ai-lens.eu", "aireadyinjector.com", "aiventure.ro", "b2b-ai-library.org", "eu-112.eu", "eu-112.ro", "eu-ai-act-ready.eu", "eu-ai-act.ro", "eu-ai-audit.eu", "eu-ai-ready.eu", "firmsfinder.eu", "the3webs.com"]);
const LANG_BY_HOST = {
  "aiventure.ro": "ro", "eu-112.ro": "ro", "eu-ai-act.ro": "ro", "firmsfinder.eu": "ro", "1clic-ia.eu": "ro",
  "1clic-ia.fr": "fr"
  // every other domain: "en"
};
const LANGS = ["ro", "en", "fr"];

// ---- SCHEMA ETALON per site (same values as the SCHEMA parameters of b2b-ai-library.org, site_defaults["firmsfinder.eu"]) ----
// LEGAL_DATE = date of the last real change of the legal texts; it is shown on the page, used as dateModified/datePublished
// and MUST be identical to <lastmod> of /legal/ in the site's sitemap.xml. Change it only when the texts really change.
const LEGAL_DATE = "2026-10-26";
const ETALON = {
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
    usage_info: "/legal/#terms",
    publishing_principles: "/legal/#ai-transparency"
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
  // official AiVenture profiles, shown in the legal notice (same on every network domain)
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/company/107338970" },
    { label: "LinkedIn (5thelement.ai)", url: "https://www.linkedin.com/showcase/5thelement-ai" },
    { label: "X", url: "https://x.com/aipath512" },
    { label: "YouTube", url: "https://www.youtube.com/@AIVenture-q8u" },
    { label: "Medium", url: "https://medium.com/@aipath512" },
    { label: "Facebook", url: "https://www.facebook.com/people/Aiventure/61573220584246" },
    { label: "Reddit", url: "https://www.reddit.com/user/AiVentureRO" },
    { label: "Crunchbase", url: "https://www.crunchbase.com/organization/aiventure-s-r-l" }
  ],
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
  ro: { home: "← Acasă", docs: "Documente juridice", lang: "Limba", updated: "Ultima actualizare", toc: "Cuprins", top: "↑ Cuprins", official: "Profiluri oficiale",
        desc: "Documente juridice {{name}}: mențiuni legale, confidențialitate, cookies, termeni, GDPR, securitate, transparență AI și Regulamentul UE privind IA." },
  en: { home: "← Home", docs: "Legal documents", lang: "Language", updated: "Last updated", toc: "Contents", top: "↑ Contents", official: "Official profiles",
        desc: "{{name}} legal documents: legal notice, privacy, cookies, terms, GDPR rights, security, AI transparency and the EU AI Act." },
  fr: { home: "← Accueil", docs: "Documents juridiques", lang: "Langue", updated: "Dernière mise à jour", toc: "Sommaire", top: "↑ Sommaire", official: "Profils officiels",
        desc: "Documents juridiques {{name}} : mentions légales, confidentialité, cookies, conditions, RGPD, sécurité, transparence de l'IA et règlement européen sur l'IA." }
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
const MISSING = "[de completat]";
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PAGE = '/legal/';
const anchor = slug => PAGE + '#' + slug;
const docTitle = (slug, lang) => DOCS.find(d => d[0] === slug)[1][lang][0];

async function loadFirm(env) {
  let rec = {};
  if (env.FIRMS_KV) {
    try {
      const raw = await env.FIRMS_KV.get('firm:' + (env.FIRM_ID || FIRM_DEFAULTS.id));
      if (raw) rec = JSON.parse(raw);
    } catch { /* invalid or missing record: defaults stay */ }
  }
  const i18n = {};
  for (const l of ['en', 'fr']) i18n[l] = { ...FIRM_DEFAULTS.i18n[l], ...((rec.i18n && rec.i18n[l]) || {}) };
  return { ...FIRM_DEFAULTS, ...rec, representative: { ...FIRM_DEFAULTS.representative, ...(rec.representative || {}) }, i18n };
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

// Head of the single page. ETALON hosts (firmsfinder.eu, Romanian) get the full SCHEMA set: meta + ONE JSON-LD @graph.
function etalonHead(host, title, description, e, sections) {
  const pageUrl = 'https://' + host + PAGE;
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
        usageInfo: origin + e.usage_info, breadcrumb: { '@id': pageUrl + '#breadcrumb' },
        hasPart: sections.map(([slug, name]) => ({ '@type': 'WebPageElement', '@id': pageUrl + '#' + slug, name, url: pageUrl + '#' + slug }))
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

function pageHTML(host, lang, explicit, firm) {
  const ui = UI[lang];
  const a = escapeHtml;
  const title = ui.docs;
  const description = fill(ui.desc, firm, lang);
  const sections = DOCS.map(([slug, t]) => [slug, t[lang][0]]);
  const etalon = ETALON[host] && lang === ETALON[host].html_lang ? ETALON[host] : null;
  const headMeta = etalon
    ? etalonHead(host, title, description, etalon, sections)
    : '<meta name="robots" content="index,follow"><title>' + a(title) + ' — ' + a(firm.brand) + '</title><meta name="description" content="' + a(description) + '"><link rel="canonical" href="https://' + host + PAGE + '">';
  const switcher = LANGS.map(l => l === lang ? '<strong>' + l.toUpperCase() + '</strong>' : '<a href="' + PAGE + '?lang=' + l + '" hreflang="' + l + '">' + l.toUpperCase() + '</a>').join(' · ');
  const toc = sections.map(([slug, name]) => '<li><a href="#' + slug + '">' + a(name) + '</a></li>').join('');
  const body = DOCS.map(([slug, t]) => {
    const [name, paragraphs] = t[lang];
    let extra = '';
    if (slug === 'legal-notice' && Array.isArray(firm.social) && firm.social.length) {
      extra = '<p>' + a(ui.official) + ':</p><ul>' + firm.social.map(s => '<li><a href="' + a(s.url) + '" rel="me noopener">' + a(s.label) + '</a></li>').join('') + '</ul>';
    }
    return '<section id="' + slug + '"><h2>' + a(name) + '</h2>' + paragraphs.map(p => '<p>' + a(fill(p, firm, lang)) + '</p>').join('') + extra + '<p><small><a href="#toc">' + a(ui.top) + '</a></small></p></section>';
  }).join('');
  return '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + headMeta
    + '<style>html{scroll-behavior:smooth}body{font:17px/1.65 system-ui,sans-serif;max-width:850px;margin:40px auto;padding:0 20px;color:#17212c}a{color:#087b86}nav ol{columns:2;padding-left:1.4rem}section{margin:2.2rem 0;scroll-margin-top:16px}section:target h2{border-left:4px solid #087b86;padding-left:10px}main{margin:2rem 0}small{color:#555}</style></head><body>'
    + '<header><a href="/">' + a(ui.home) + '</a> <small style="float:right">' + a(ui.lang) + ': ' + switcher + '</small></header>'
    + '<main><h1>' + a(title) + '</h1><p><small>' + a(ui.updated) + ': <time datetime="' + LEGAL_DATE + '">' + LEGAL_DATE + '</time></small></p>'
    + '<nav id="toc" aria-label="' + a(ui.toc) + '"><h2>' + a(ui.toc) + '</h2><ol>' + toc + '</ol></nav>' + body + '</main>'
    + '<footer><small>' + a(firm.name) + ' · CUI ' + a(firm.cui) + '</small></footer></body></html>';
}

// Footer strip: ONE source for all network sites. Every link goes to its section of the single page (/legal/#slug).
function stripHTML(lang, firm) {
  const links = DOCS.map(([s, t]) => '<a href="' + anchor(s) + '">' + escapeHtml(t[lang][0]) + '</a>').join('');
  return '<style>#aiventure-legal-strip{display:block!important;width:100%!important;margin:0!important;padding:18px 20px!important;background:#000!important;color:#b9c7d8!important;border-top:1px solid #303b48!important;font:13px/1.7 Arial,sans-serif!important;text-align:center!important;position:static!important;clear:both!important}#aiventure-legal-strip p{margin:0 0 6px!important;font:13px/1.7 Arial,sans-serif!important;color:#b9c7d8!important}#aiventure-legal-strip nav{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:2px 16px!important}#aiventure-legal-strip nav a{display:inline!important;padding:2px 0!important;font:13px/1.7 Arial,sans-serif!important;color:#b9c7d8!important;text-decoration:none!important}#aiventure-legal-strip nav a:hover{color:#fff!important;text-decoration:underline!important}</style>'
    + '<div id="aiventure-legal-strip"><p><strong>' + escapeHtml(firm.name) + '</strong> · CUI ' + escapeHtml(firm.cui) + '</p><nav aria-label="' + escapeHtml(UI[lang].docs) + '">' + links + '</nav></div>';
}

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    // A host outside the AiVenture network is not ours: pass through to its origin (v1.x answered 403).
    if (!ALLOWED_HOSTS.has(host)) return fetch(request);

    const path = url.pathname.replace(/\/+$/, '');
    if (path === '/legal/strip.html') {
      const firm = await loadFirm(env);
      const asked = (url.searchParams.get('host') || '').toLowerCase().replace(/^www\./, '');
      const { lang } = pickLang(ALLOWED_HOSTS.has(asked) ? asked : host, url);
      return new Response(stripHTML(lang, firm), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex,nofollow' } });
    }
    if (path === '/legal') {
      const firm = await loadFirm(env);
      const { lang, explicit } = pickLang(host, url);
      return new Response(pageHTML(host, lang, explicit, firm), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
    }
    if (path.startsWith('/legal/')) {
      const slug = path.slice('/legal/'.length);
      if (DOCS.some(d => d[0] === slug)) {
        const q = url.searchParams.get('lang');
        const keep = q && LANGS.includes(q) ? '?lang=' + q : '';
        return new Response(null, { status: 301, headers: { 'Location': PAGE + keep + '#' + slug, 'Cache-Control': 'public, max-age=3600' } });
      }
      return new Response('Not found', { status: 404 });
    }
    return fetch(request);
  }
};
