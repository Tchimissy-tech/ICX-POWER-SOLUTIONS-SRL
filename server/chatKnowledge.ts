export type SourceAuthority = "official" | "partner" | "public" | "icx";

export type ChatSource = {
  id: string;
  title: string;
  url: string;
  authority: SourceAuthority;
  summary: string;
  keywords: string[];
};

export type PublicChatSource = Pick<ChatSource, "id" | "title" | "url" | "authority">;

const sources: ChatSource[] = [
  {
    id: "icx-general",
    title: "ICX POWER SOLUTIONS — Accueil",
    url: "/",
    authority: "icx",
    summary: "ICX POWER SOLUTIONS SRL présente une plateforme d’orientation internationale, de consulting, de sourcing, d’études et de qualification de projets. L’information générale ne vaut ni promesse d’admission, d’emploi, de permis, de financement ni de partenariat.",
    keywords: ["icx", "power solutions", "plateforme", "service", "services", "aide", "orientation"],
  },
  {
    id: "icx-consulting",
    title: "ICX — Consulting international",
    url: "/consulting",
    authority: "icx",
    summary: "Le consulting ICX traite la stratégie et le marché, les opérations et l’organisation, les start-up et l’innovation, l’énergie et le financement, ainsi que la gouvernance et la coopération. La méthode annoncée est : écouter le contexte, formuler la question utile, analyser les options, proposer une prochaine étape.",
    keywords: ["consulting", "conseil", "strategie", "marche", "operations", "organisation", "startup", "innovation", "energie", "financement", "gouvernance", "cooperation"],
  },
  {
    id: "icx-strategic-partnerships",
    title: "ICX — Partenariats stratégiques",
    url: "/partnerships-strategiques",
    authority: "icx",
    summary: "Le parcours Partenariats stratégiques ICX couvre les mines et ressources naturelles, les start-up, l’énergie et le financement, l’agro-industrie, les institutions et le commerce. Il sert à qualifier une organisation, un secteur, un territoire cible et une proposition de coopération. Une affiliation, une introduction et un partenariat confirmé restent distincts.",
    keywords: ["partenariat", "partenariats", "alliance", "alliances", "cooperation", "affiliation", "investisseur", "investissement", "mine", "mines", "ressource", "ressources", "agro", "institution", "commerce", "implantation"],
  },
  {
    id: "icx-study",
    title: "ICX — Étudier à l’étranger",
    url: "/study",
    authority: "icx",
    summary: "Le parcours Étudier à l’étranger aide à définir une destination, un niveau, un domaine, un budget et une langue, puis à consulter les sources officielles des établissements avant de préparer un dossier. ICX n’est pas une université et ne revendique aucun partenariat non confirmé.",
    keywords: ["etudier", "etude", "etudes", "universite", "universites", "admission", "candidature", "master", "licence", "bourse", "student", "study"],
  },
  {
    id: "icx-work",
    title: "ICX — Permis de travail",
    url: "/work-permits",
    authority: "icx",
    summary: "ICX propose une orientation et une assistance administrative pour des projets de travail en Roumanie ou en Pologne. Les autorisations dépendent du profil, de l’employeur et des autorités compétentes ; ICX ne garantit ni emploi ni permis.",
    keywords: ["permis", "travail", "emploi", "employeur", "visa", "residence", "immigration", "roumanie", "pologne", "worker", "work permit"],
  },
  {
    id: "igi-romania",
    title: "Inspectoratul General pentru Imigrări — Roumanie",
    url: "https://igi.mai.gov.ro/en/",
    authority: "official",
    summary: "Le site de l’Inspectoratul General pentru Imigrări est la source officielle indiquée par ICX pour vérifier les exigences liées à l’immigration et aux autorisations de travail en Roumanie. Les conditions, documents, frais et délais doivent être vérifiés directement auprès de l’autorité.",
    keywords: ["roumanie", "romanian", "romania", "igi", "permis", "travail", "visa", "residence", "immigration", "employeur"],
  },
  {
    id: "poland-foreigners",
    title: "Office for Foreigners — Pologne",
    url: "https://www.gov.pl/web/udsc-en",
    authority: "official",
    summary: "Le portail de l’Office polonais des étrangers est la source officielle indiquée par ICX pour vérifier les exigences d’immigration et de séjour en Pologne. Les conditions, documents, frais et délais doivent être confirmés sur ce portail ou auprès de l’autorité compétente.",
    keywords: ["pologne", "poland", "polonais", "polonaise", "udsc", "permis", "travail", "visa", "residence", "immigration", "employeur"],
  },
  {
    id: "onrc-romania",
    title: "ONRC — institution publique et registre national du commerce",
    url: "https://www.onrc.ro/index.php/ro/",
    authority: "official",
    summary: "L’ONRC est une institution publique roumaine sous l’autorité du ministère de la Justice et la source officielle à privilégier pour vérifier une inscription au registre du commerce. Il n’est pas un partenaire ICX. Les références ICX doivent être revalidées auprès de l’ONRC avant tout usage juridique.",
    keywords: ["onrc", "registre", "commerce", "cui", "cif", "euid", "societe", "entreprise", "legal", "juridique", "enregistrement", "iași", "iasi", "caen"],
  },
  {
    id: "lorondo",
    title: "LORONDO SERVICES SRL — site de l’organisation",
    url: "https://lorondo-services.com/",
    authority: "partner",
    summary: "LORONDO SERVICES SRL est référencée sur le site ICX comme une organisation dont le site public présente notamment des services de transport, d’expédition, de ressources humaines et de conseil. Ce lien de référence ne confirme pas à lui seul un partenariat ICX.",
    keywords: ["lorondo", "transport", "expedition", "shipping", "ressources humaines", "rh"],
  },
  {
    id: "aaft",
    title: "AAFT — Asociația Africanilor pentru Fericirea Tuturor",
    url: "https://www.instagram.com/aaft.ro/",
    authority: "public",
    summary: "AAFT est une association roumaine orientée vers la promotion de la culture, de la danse, des arts, du sport et des échanges. Elle ne doit pas être présentée comme une université. Les références publiques accessibles de l’association sont sociales ; le site aaft.com décrit une institution éducative indienne différente. Aucun partenariat ICX n’est confirmé.",
    keywords: ["aaft", "association", "asociatia africanilor", "africanilor", "jean lansana", "koundouno", "marcel traore", "traore"],
  },
  {
    id: "ubb",
    title: "Babeș-Bolyai University — présentation officielle",
    url: "https://www.ubbcluj.ro/en/despre/prezentare/",
    authority: "official",
    summary: "Babeș-Bolyai University est une université publique roumaine et une institution de recherche. Elle est référencée par ICX pour orienter les candidats vers ses informations officielles ; aucun partenariat ICX n’est confirmé. Les programmes, conditions et calendriers doivent être contrôlés sur le site officiel avant toute candidature.",
    keywords: ["babes", "bolyai", "ubb", "cluj", "napoca"],
  },
  {
    id: "bordeaux",
    title: "Université de Bordeaux — étudiants internationaux",
    url: "https://www.u-bordeaux.com/Study/international-students",
    authority: "official",
    summary: "L’Université de Bordeaux est référencée par ICX pour orienter les candidats vers ses informations officielles destinées aux étudiants internationaux. Les programmes, conditions et calendriers doivent être contrôlés sur la page officielle avant toute candidature.",
    keywords: ["bordeaux", "u-bordeaux", "universite de bordeaux"],
  },
  {
    id: "ulb",
    title: "Université libre de Bruxelles — études",
    url: "https://www.ulb.be/en/studies",
    authority: "official",
    summary: "L’Université libre de Bruxelles est référencée par ICX pour orienter les candidats vers ses informations officielles d’études. Les programmes, conditions et calendriers doivent être contrôlés sur son site officiel avant toute candidature.",
    keywords: ["ulb", "bruxelles", "universite libre de bruxelles"],
  },
  {
    id: "unibuc",
    title: "University of Bucharest — admissions",
    url: "https://unibuc.ro/e/n/admission/",
    authority: "official",
    summary: "University of Bucharest est référencée par ICX pour orienter les candidats vers ses informations officielles d’admission. Les programmes, conditions et calendriers doivent être contrôlés sur le site officiel avant toute candidature.",
    keywords: ["bucharest", "bucarest", "unibuc", "university of bucharest"],
  },
  {
    id: "mcgill",
    title: "McGill University — undergraduate admissions",
    url: "https://www.mcgill.ca/undergraduate-admissions/",
    authority: "official",
    summary: "McGill University est référencée par ICX pour orienter les candidats vers son site officiel d’admission de premier cycle. Les critères, programmes, conditions et échéances doivent être vérifiés directement sur ce site.",
    keywords: ["mcgill", "montreal", "montréal"],
  },
  {
    id: "toronto",
    title: "University of Toronto — applications",
    url: "https://future.utoronto.ca/apply/",
    authority: "official",
    summary: "University of Toronto est référencée par ICX pour orienter les candidats vers son site officiel de candidature. Les critères, programmes, conditions et échéances doivent être vérifiés directement sur ce site.",
    keywords: ["toronto", "utoronto", "university of toronto"],
  },
  {
    id: "harvard",
    title: "Harvard College — admissions",
    url: "https://college.harvard.edu/admissions",
    authority: "official",
    summary: "Harvard University est référencée par ICX pour orienter les candidats vers la page officielle d’admission de Harvard College. Les critères, programmes, conditions et échéances doivent être vérifiés directement sur ce site.",
    keywords: ["harvard", "cambridge"],
  },
  {
    id: "columbia",
    title: "Columbia University — undergraduate admissions",
    url: "https://undergrad.admissions.columbia.edu/",
    authority: "official",
    summary: "Columbia University est référencée par ICX pour orienter les candidats vers son site officiel d’admission de premier cycle. Les critères, programmes, conditions et échéances doivent être vérifiés directement sur ce site.",
    keywords: ["columbia", "new york"],
  },
  {
    id: "peking",
    title: "Peking University — International Students Division",
    url: "https://isd.pku.edu.cn/en/",
    authority: "official",
    summary: "Peking University est référencée par ICX pour orienter les candidats vers sa division officielle des étudiants internationaux. Les critères, programmes, conditions et échéances doivent être vérifiés directement sur ce site.",
    keywords: ["peking", "pekin", "pku", "beijing", "chine", "china"],
  },
  {
    id: "msu",
    title: "Moscow State University — admissions",
    url: "https://openday.msu.ru/en/admissions",
    authority: "official",
    summary: "Moscow State University est référencée par ICX pour orienter les candidats vers ses procédures officielles destinées aux étudiants étrangers. Les critères, programmes, conditions et échéances doivent être vérifiés directement sur ce site.",
    keywords: ["moscow", "moscou", "msu", "lomonosov", "russie", "russia"],
  },
];

const authorityWeight: Record<SourceAuthority, number> = { official: 3, public: 2, partner: 2, icx: 1 };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function selectChatSources(question: string): ChatSource[] {
  const normalizedQuestion = normalize(question);
  const ranked = sources.map((source) => {
    const matches = source.keywords.reduce((total, keyword) => total + (normalizedQuestion.includes(normalize(keyword)) ? 1 : 0), 0);
    return { source, score: matches * 10 + authorityWeight[source.authority] };
  });

  const matched = ranked
    .filter(({ score }) => score >= 11)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ source }) => source);

  if (matched.length > 0) {
    const hasIcxContext = matched.some((source) => source.authority === "icx");
    if (!hasIcxContext && matched.length < 3) {
      const contextualIcx = sources.find((source) => source.id === "icx-study" || source.id === "icx-work");
      if (contextualIcx) matched.push(contextualIcx);
    }
    return matched;
  }

  return [sources.find((source) => source.id === "icx-general")!];
}

export function publicSources(sourcesToExpose: ChatSource[]): PublicChatSource[] {
  return sourcesToExpose.map(({ id, title, url, authority }) => ({ id, title, url, authority }));
}

export function formatSourcesForPrompt(sourcesForPrompt: ChatSource[]): string {
  return sourcesForPrompt
    .map((source, index) => `[S${index + 1}] ${source.title}\nAutorité : ${source.authority}\nURL : ${source.url}\nContenu vérifié : ${source.summary}`)
    .join("\n\n");
}

type CachedExtract = { content: string; expiresAt: number };
const liveExtractCache = new Map<string, CachedExtract>();
const LIVE_EXTRACT_TTL_MS = 4 * 60 * 60 * 1000;
const LIVE_EXTRACT_TIMEOUT_MS = 3_500;
const MAX_LIVE_SOURCES = 2;
const MAX_LIVE_CHARS_PER_SOURCE = 4_000;

function decodeBasicEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function textFromHtml(html: string) {
  return decodeBasicEntities(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim())
    .slice(0, MAX_LIVE_CHARS_PER_SOURCE);
}

async function fetchSourceExtract(source: ChatSource): Promise<string | undefined> {
  if (!source.url.startsWith("https://")) return undefined;
  const cached = liveExtractCache.get(source.id);
  if (cached && cached.expiresAt > Date.now()) return cached.content;

  const origin = new URL(source.url);
  try {
    const response = await fetch(source.url, {
      headers: { accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(LIVE_EXTRACT_TIMEOUT_MS),
    });
    const finalUrl = new URL(response.url);
    const sameHost = finalUrl.hostname === origin.hostname || finalUrl.hostname.endsWith(`.${origin.hostname}`) || origin.hostname.endsWith(`.${finalUrl.hostname}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !sameHost || !contentType.includes("text/html")) return undefined;
    const extract = textFromHtml(await response.text());
    if (extract.length < 80) return undefined;
    liveExtractCache.set(source.id, { content: extract, expiresAt: Date.now() + LIVE_EXTRACT_TTL_MS });
    return extract;
  } catch {
    return undefined;
  }
}

export async function formatLiveSourcesForPrompt(selectedSources: ChatSource[]): Promise<string> {
  const eligibleSources = selectedSources.filter((source) => source.authority !== "icx").slice(0, MAX_LIVE_SOURCES);
  const extracts = await Promise.all(eligibleSources.map(async (source) => ({ source, content: await fetchSourceExtract(source) })));
  const available = extracts.filter((item): item is { source: ChatSource; content: string } => Boolean(item.content));
  if (available.length === 0) return "Aucun extrait web actuel n’a été chargé. Utilise uniquement le dossier de sources vérifiées ci-dessus.";
  return available.map(({ source, content }) => `EXTRAIT WEB ACTUEL — ${source.title}\nURL : ${source.url}\nCet extrait est une aide de lecture ; n’en déduis pas une exigence absente ou incomplète.\n${content}`).join("\n\n");
}

export function localizedSourceFallback(locale: string, selectedSources: ChatSource[]): string {
  const citation = selectedSources.length ? " [S1]" : "";
  if (locale === "ro") return `Pot oferi o orientare bazată pe surse, dar nu pot confirma o decizie actuală, un termen, un tarif, un permis sau un rezultat de admitere fără autoritatea competentă. Începeți cu sursa verificată de mai jos și precizați țara sau organizația.${citation}`;
  if (locale === "pt") return `Posso dar uma orientação baseada em fontes, mas não posso confirmar uma decisão atual, prazo, tarifa, autorização ou resultado de admissão sem a autoridade competente. Comece pela fonte verificada abaixo e indique o país ou a organização.${citation}`;
  if (locale === "ar") return `يمكنني تقديم توجيه مبني على مصادر، لكن لا يمكنني تأكيد قرار حالي أو موعد نهائي أو رسم أو تصريح أو نتيجة قبول من دون الجهة المختصة. ابدأ بالمصدر الموثوق أدناه وحدد البلد أو المؤسسة المعنية.${citation}`;
  const sourceIds = new Set(selectedSources.map((source) => source.id));
  if (sourceIds.has("igi-romania")) {
    if (locale === "en") return `For a Romanian work-permit project, use the General Inspectorate for Immigration as the controlling source. Check the work/stay category that matches the case, the current employer and applicant requirements, the official document list, the filing route, and the published fees and processing times. Do not rely on a generic checklist: those elements can change. [S1]`;
    return `Pour un projet de permis de travail en Roumanie, utilisez l’Inspectoratul General pentru Imigrări comme source de contrôle. Vérifiez la catégorie de travail et de séjour correspondant au cas, les conditions actuelles pour l’employeur et le demandeur, la liste officielle des documents, la voie de dépôt, ainsi que les frais et délais publiés. N’utilisez pas une checklist générique : ces éléments peuvent évoluer. [S1]`;
  }
  if (sourceIds.has("poland-foreigners")) {
    if (locale === "en") return `For a Polish work or residence project, start with the Office for Foreigners. Check the relevant residence/work route, the current document list, where the application is filed, the published fee and the current processing information. Do not assume that a Romanian or another-country procedure applies in Poland. [S1]`;
    return `Pour un projet de travail ou de séjour en Pologne, commencez par l’Office for Foreigners. Vérifiez la voie de séjour ou de travail applicable, la liste actuelle des documents, le lieu de dépôt, les frais publiés et les informations de traitement. Ne supposez pas qu’une procédure roumaine ou d’un autre pays s’applique en Pologne. [S1]`;
  }
  if (sourceIds.has("onrc-romania")) {
    if (locale === "en") return `For a Romanian company verification, use the ONRC as the legal reference. Compare the company identifier, trade-register number, EUID, legal address and activity code against the official record before using any information in a contract or legal document. [S1]`;
    return `Pour vérifier une société roumaine, utilisez l’ONRC comme référence juridique. Comparez l’identifiant de la société, le numéro de registre, l’EUID, le siège et le code d’activité avec le registre officiel avant d’utiliser une information dans un contrat ou un document juridique. [S1]`;
  }
  if (sourceIds.has("icx-strategic-partnerships")) {
    if (locale === "en") return `To qualify a strategic alliance, define the organisation, sector, target territory, proposed cooperation and decision-makers first. ICX distinguishes an affiliation, an introduction and a confirmed partnership; a public reference alone does not confirm a partnership. [S1]`;
    return `Pour qualifier une alliance stratégique, commencez par définir l’organisation, le secteur, le territoire cible, la coopération proposée et les décideurs concernés. ICX distingue une affiliation, une introduction et un partenariat confirmé ; un lien de référence public ne confirme jamais un partenariat. [S1]`;
  }
  if (sourceIds.has("icx-consulting")) {
    if (locale === "en") return `For a consulting request, frame the decision to be made, the target market or organisation, the constraints, the evidence already available and the expected outcome. The ICX method is to listen to the context, frame the useful question, analyse options and identify a next step. [S1]`;
    return `Pour une demande de consulting, formulez la décision à prendre, le marché ou l’organisation cible, les contraintes, les éléments déjà disponibles et le résultat attendu. La méthode ICX consiste à écouter le contexte, formuler la question utile, analyser les options puis identifier une prochaine étape. [S1]`;
  }
  if (sourceIds.has("icx-study")) {
    if (locale === "en") return `For a study-abroad project, first define the destination, level, field, budget and language. Then check the programme, admission conditions, deadline and document list on the selected institution’s official page before preparing any application. [S1]`;
    return `Pour un projet d’études à l’étranger, précisez d’abord la destination, le niveau, le domaine, le budget et la langue. Vérifiez ensuite le programme, les conditions d’admission, l’échéance et la liste des documents sur la page officielle de l’établissement avant de préparer une candidature. [S1]`;
  }
  if (locale === "en") return `I can provide a source-based orientation, but I cannot confirm a current decision, deadline, fee, permit or admission outcome without the competent authority. Start with the verified source below and tell me the country or organisation you need.${citation}`;
  return `Je peux vous orienter à partir de sources vérifiées, mais je ne peux pas confirmer une décision, un délai, un tarif, un permis ou une admission sans l’autorité compétente. Commencez par la source ci-dessous et précisez le pays ou l’organisation concernée.${citation}`;
}

export const chatSourcePolicy = `
RÈGLES DE FIABILITÉ IMPÉRATIVES :
- Réponds uniquement à partir du dossier de sources ci-dessous et du message de l’utilisateur. Ne complète jamais une condition, une date, un prix, une procédure ou une exigence que les sources ne donnent pas.
- Réponds d’abord directement à la question. Donne ensuite au plus trois étapes concrètes. Pour chaque fait provenant du dossier, ajoute la citation [S1], [S2] ou [S3] correspondante.
- Hiérarchie : une autorité officielle prévaut sur un site partenaire ; un site partenaire prévaut sur une page ICX ; une page ICX explique son propre parcours, mais ne confirme pas une décision externe.
- Un lien vers une organisation partenaire ou une institution ne prouve jamais un partenariat ICX. Ne présente aucune organisation comme partenaire officiel sans confirmation explicite dans la source.
- Pour une demande sensible ou mouvante (conditions, frais, délais, réglementation, admission, permis), explique précisément ce qui doit être vérifié sur la source officielle citée. Ne fabrique pas de détail « probable ».
- Si la question reste trop vague, pose une seule question utile de précision. N’envoie pas automatiquement vers un contact : propose une action autonome avant un relais humain.
- Ne promets jamais un emploi, un permis, une admission, un financement, un tarif ou un partenariat.
`;
