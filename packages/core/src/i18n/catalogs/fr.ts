import type { CoreCatalog } from './en.ts';

/**
 * Français (vouvoiement). Typographie française : espace fine insécable dans les guillemets
 * « … » et avant ; ! ?, espace insécable avant les deux-points.
 */
export const fr: CoreCatalog = {
  'status.attention': 'À traiter en priorité',
  'status.review': 'À examiner',
  'status.good': 'Tout va bien',
  'status.info': 'Bon à savoir',

  'metric.clicks': 'Clics',
  'metric.impressions': 'Impressions',
  'metric.ctr': 'Taux de clics',
  'metric.position': 'Position moyenne',
  'metric.clicks.help':
    'Nombre de fois où des internautes ont cliqué pour accéder à votre site depuis la recherche Google.',
  'metric.impressions.help':
    'Nombre de fois où un lien vers votre site est apparu dans des résultats de recherche vus par quelqu’un.',
  'metric.ctr.help': 'La part des impressions qui se sont transformées en clics.',
  'metric.position.help':
    'L’endroit où votre site apparaissait généralement dans les résultats. Plus c’est bas, mieux c’est\u00A0: 1 correspond au haut de la page.',

  'evidence.recent-period': 'Période récente',
  'evidence.previous-period': 'Période précédente',
  'evidence.period': '{range}',
  'evidence.change': 'Évolution',
  'evidence.first-day': 'Premier jour',
  'evidence.last-day': 'Dernier jour',
  'evidence.impressions-on': 'Impressions le {day}',
  'evidence.typical-impressions': 'Jour habituel',
  'evidence.head-breaker': 'A refermé le head',
  'evidence.title': 'Titre',
  'evidence.description': 'Description',
  'evidence.viewport': 'Viewport',
  'evidence.canonical': 'Lien canonique',
  'evidence.heading': 'Titre de section',
  'evidence.heading-level': 'h{level}',
  'evidence.status': 'Code d’état',
  'evidence.final-address': 'Adresse finale',
  'evidence.redirect': 'Redirections',
  'evidence.header': 'En-tête',
  'evidence.robots-rule': 'Règle robots.txt',
  'evidence.response-time': 'Temps de réponse (secondes)',
  'table.query': 'Requête',
  'table.page': 'Page',
  'table.text': '{text}',
  'table.typical-ctr': 'Habituel pour votre site',
  'table.primary-period': 'Période principale',
  'table.comparison-period': 'Période comparée',
  'table.tag': 'Balise',
  'table.image': 'Image',
  'table.link': 'Lien',

  'ref.gsc-metrics': 'Aide Search Console\u00A0: ce que signifient impressions, position et clics',
  'ref.gsc-performance': 'Aide Search Console\u00A0: rapport sur les performances',
  'ref.title-links': 'Google Search Central\u00A0: influencer les liens de titre',
  'ref.snippets': 'Google Search Central\u00A0: extraits et balises meta description',
  'ref.robots-meta': 'Google Search Central\u00A0: balise meta robots',
  'ref.canonical': 'Google Search Central\u00A0: URL canoniques',
  'ref.hreflang': 'Google Search Central\u00A0: versions localisées des pages',
  'ref.structured-data': 'Google Search Central\u00A0: introduction aux données structurées',
  'ref.rich-results-test': 'Test des résultats enrichis de Google',
  'ref.images': 'Google Search Central\u00A0: bonnes pratiques pour les images',
  'ref.valid-metadata': 'Google Search Central\u00A0: utiliser des métadonnées de page valides',
  'ref.crawlable-links': 'Google Search Central\u00A0: rendre les liens explorables',
  'ref.wcag-language': 'WCAG 2.2\u00A0: Langue de la page (3.1.1)',
  'ref.wcag-non-text': 'WCAG 2.2\u00A0: Contenu non textuel (1.1.1)',
  'ref.wcag-resize': 'WCAG 2.2\u00A0: Redimensionnement du texte (1.4.4)',
  'ref.wcag-link-purpose': 'WCAG 2.2\u00A0: Fonction du lien (2.4.4)',
  'ref.wcag-structure': 'WCAG 2.2\u00A0: Information et relations (1.3.1)',
  'ref.viewport': 'MDN\u00A0: la balise meta viewport',
  'ref.open-graph': 'Le protocole Open Graph',
  'ref.robots-txt': 'Google Search Central\u00A0: présentation du fichier robots.txt',
  'ref.http-status': 'Google Search Central\u00A0: codes d’état HTTP et erreurs réseau',
  'ref.https': 'web.dev\u00A0: pourquoi HTTPS est important',

  'gsc.headline.method':
    'Nous avons comparé {current} avec {previous}, en associant chaque jour au même jour de la semaine.',
  'gsc.headline.up-up': 'Davantage de personnes ont trouvé vos pages et les ont visitées.',
  'gsc.headline.up-flat':
    'Davantage de personnes ont cliqué, alors que vos pages sont apparues à peu près aussi souvent.',
  'gsc.headline.up-down': 'Les clics ont augmenté alors que vos pages sont apparues moins souvent.',
  'gsc.headline.flat-up':
    'Vos pages sont apparues plus souvent dans la recherche, mais les clics sont restés à peu près stables.',
  'gsc.headline.flat-flat': 'Les performances dans la recherche sont restées à peu près stables.',
  'gsc.headline.flat-down':
    'Vos pages sont apparues moins souvent, mais les clics sont restés à peu près stables.',
  'gsc.headline.down-up':
    'Vos pages sont apparues plus souvent, mais moins de personnes ont cliqué.',
  'gsc.headline.down-flat':
    'Moins de personnes ont cliqué, alors que vos pages sont apparues à peu près aussi souvent.',
  'gsc.headline.down-down': 'Vos pages sont apparues moins souvent et ont reçu moins de clics.',
  'gsc.headline.impressions-up':
    'Vos pages sont apparues plus souvent dans la recherche. Il y a encore trop peu de clics pour les comparer.',
  'gsc.headline.impressions-flat':
    'Vos pages sont apparues à peu près aussi souvent qu’avant. Il y a encore trop peu de clics pour les comparer.',
  'gsc.headline.impressions-down':
    'Vos pages sont apparues moins souvent dans la recherche. Il y a encore trop peu de clics pour les comparer.',
  'gsc.headline.insufficient':
    'Il n’y a pas encore assez de données de recherche pour comparer des périodes de façon fiable.',

  'gsc.check.growth-drivers':
    'Repérez les pages et les requêtes à l’origine de la croissance, et gardez ces contenus exacts et à jour.',
  'gsc.check.queries-gained':
    'Comparez les requêtes des deux périodes pour voir lesquelles ont gagné des impressions, et si elles correspondent à ce que proposent vos pages.',
  'gsc.check.titles':
    'Relisez les titres et les descriptions des pages concernées. C’est ce que les gens lisent avant de décider de cliquer.',
  'gsc.check.position-shift':
    'Regardez la position moyenne\u00A0: les nouvelles apparitions commencent souvent plus bas dans la page, là où l’on clique moins.',
  'gsc.check.lost-visibility':
    'Repérez les pages et les requêtes qui ont perdu des impressions, et vérifiez que ces pages fonctionnent toujours et peuvent être indexées.',
  'gsc.check.site-changes':
    'Pensez aux modifications récentes du site, comme une refonte, des pages déplacées ou supprimées, ou de nouvelles règles robots.',
  'gsc.check.seasonality':
    'Comparez avec les mêmes semaines de l’année précédente. L’intérêt pour de nombreux sujets varie selon les saisons.',
  'gsc.check.serp-features':
    'Recherchez vous-même vos principales requêtes. Les annonces, les vidéos ou les réponses générées par l’IA sur la page de résultats peuvent capter des clics.',
  'gsc.check.opportunities':
    'Consultez ci-dessous les opportunités de requêtes et de pages susceptibles d’obtenir davantage de clics.',
  'gsc.check.export-longer':
    'Exportez une période plus longue depuis la Search Console, idéalement les 3 derniers mois, pour une vue plus claire.',
  'gsc.check.focused-page':
    'Assurez-vous qu’une seule page, claire et à jour, réponde à chaque requête, et créez des liens vers elle depuis les pages liées.',
  'gsc.check.search-intent':
    'Recherchez les requêtes pour lesquelles ces pages apparaissent, et vérifiez qu’elles répondent à ce que les gens veulent.',

  'gsc.change.clicks.up': 'Les clics ont augmenté de {change}, pour atteindre {current}.',
  'gsc.change.clicks.down': 'Les clics ont baissé de {change}, pour s’établir à {current}.',
  'gsc.change.clicks.flat': 'Les clics sont restés à peu près stables, à {current}.',
  'gsc.change.clicks.started': 'Les clics sont passés de zéro à {current}.',
  'gsc.change.impressions.up':
    'Les impressions ont augmenté de {change}, pour atteindre {current}.',
  'gsc.change.impressions.down':
    'Les impressions ont baissé de {change}, pour s’établir à {current}.',
  'gsc.change.impressions.flat': 'Les impressions sont restées à peu près stables, à {current}.',
  'gsc.change.impressions.started': 'Les impressions sont passées de zéro à {current}.',
  'gsc.change.ctr.up': 'Le taux de clics est passé de {previous} à {current}.',
  'gsc.change.ctr.down': 'Le taux de clics a baissé de {previous} à {current}.',
  'gsc.change.ctr.flat': 'Le taux de clics est resté à peu près stable, à {current}.',
  'gsc.change.position.better': 'La position moyenne s’est améliorée, de {previous} à {current}.',
  'gsc.change.position.worse': 'La position moyenne a reculé, de {previous} à {current}.',
  'gsc.change.position.flat': 'La position moyenne est restée à peu près stable, à {current}.',
  'gsc.daybyday.higher':
    'La valeur a été plus élevée {count} jours sur {days} que le même jour de la semaine de la période précédente.',
  'gsc.daybyday.lower':
    'La valeur a été plus basse {count} jours sur {days} que le même jour de la semaine de la période précédente.',
  'gsc.daybyday.uneven':
    'Au jour le jour, l’évolution a été irrégulière ({higher} jours en hausse, {lower} jours en baisse)\u202F; quelques jours pourraient donc en expliquer l’essentiel.',

  'gsc.limit.weekday-matching':
    'Chaque période couvre des semaines entières, pour que les écarts entre semaine et week-end ne faussent pas la comparaison.',
  'gsc.limit.ctr-features':
    'Le taux de clics dépend aussi de ce qu’affiche la page de résultats, comme des annonces, des vidéos ou des réponses générées par l’IA.',
  'gsc.limit.position-mix':
    'La position moyenne change aussi quand la combinaison des recherches change, pas seulement quand les classements évoluent.',
  'gsc.limit.position-average':
    'La position moyenne résume de nombreuses recherches. Dans une recherche donnée, une page peut apparaître plus haut ou plus bas.',

  'gsc.opportunity.low-ctr.query':
    '{count, plural, one {# requête obtient} other {# requêtes obtiennent}} moins de clics que des résultats similaires',
  'gsc.opportunity.low-ctr.page':
    '{count, plural, one {# page obtient} other {# pages obtiennent}} moins de clics que des résultats similaires',
  'gsc.opportunity.low-ctr.summary':
    'Elles apparaissent parmi les dix premiers résultats, mais leur taux de clics n’atteint même pas {share} de celui de vos autres résultats à une position similaire.',
  'gsc.opportunity.near-top.query':
    '{count, plural, one {# requête se classe} other {# requêtes se classent}} juste après les dix premiers résultats',
  'gsc.opportunity.near-top.page':
    '{count, plural, one {# page se classe} other {# pages se classent}} juste après les dix premiers résultats',
  'gsc.opportunity.near-top.summary':
    'Leur position moyenne se situe entre {from} et {to}, et elles sont souvent recherchées. Améliorer la page qui y répond pourrait la rendre visible.',
  'gsc.opportunity.zero-click-pages':
    '{count, plural, one {# page est vue mais jamais cliquée} other {# pages sont vues mais jamais cliquées}}',
  'gsc.opportunity.zero-click-pages.summary':
    'Chacune est apparue au moins {min} fois dans les résultats de recherche sans le moindre clic.',
  'gsc.movers.gains': '{kind, select, page {Pages} other {Requêtes}} ayant le plus gagné en clics',
  'gsc.movers.losses': '{kind, select, page {Pages} other {Requêtes}} ayant le plus perdu en clics',

  'gsc.note.no-dates':
    'Cette exportation ne contient pas de données quotidiennes\u202F; les tendances ne peuvent donc pas être affichées.',
  'gsc.note.short-range':
    'Cette exportation couvre {days, plural, one {# jour} other {# jours}}\u00A0: trop peu pour comparer deux périodes.',
  'gsc.note.missing-days':
    '{count, plural, one {# jour n’a pas de données} other {# jours n’ont pas de données}}',
  'gsc.note.missing-days.summary':
    'Les jours sans ligne n’avaient généralement aucune impression. Nous les avons comptés comme zéro.',
  'gsc.note.incomplete-days':
    '{count, plural, one {Le dernier jour semble incomplet} other {Les # derniers jours semblent incomplets}}',
  'gsc.note.incomplete-days.summary':
    'La Search Console traite peut-être encore les données récentes. Nous avons exclu {count, plural, one {ce jour} other {ces jours}} de la comparaison.',
  'gsc.note.anonymized-queries': 'Le tableau Requêtes couvre {share} de l’ensemble des clics',
  'gsc.note.anonymized-queries.summary':
    'La Search Console ne liste pas les requêtes rares, afin de protéger la vie privée des internautes, et exporte au maximum {limit} lignes. Les totaux du tableau Requêtes sont donc inférieurs à ceux du graphique.',
  'gsc.note.row-limit':
    '{kind, select, query {Le tableau Requêtes} page {Le tableau Pages} country {Le tableau Pays} other {Un tableau}} a atteint {limit} lignes',
  'gsc.note.row-limit.summary':
    'C’est la limite d’exportation de la Search Console\u202F; des {kind, select, query {requêtes} page {pages} country {pays} other {lignes}} moins fréquentes peuvent donc manquer.',
  'gsc.note.partial-totals':
    'Les totaux proviennent du tableau {kind, select, query {Requêtes} page {Pages} country {Pays} device {Appareils} other {exporté}}',
  'gsc.note.partial-totals.summary':
    '{kind, select, query {Les requêtes rares sont masquées par souci de confidentialité\u202F; ces totaux sont donc inférieurs aux totaux réels de votre site.} page {Quand plusieurs de vos pages apparaissent dans la même recherche, chacune compte\u202F; ces totaux peuvent donc différer de ceux de votre site.} other {Ils peuvent différer des totaux de votre site. Ajoutez le tableau des dates pour obtenir des totaux complets.}}',
  'gsc.note.comparison-export':
    'Cette exportation compare «\u202F{primary}\u202F» avec «\u202F{comparison}\u202F».',
  'gsc.note.comparison-export.unlabeled': 'Cette exportation compare deux périodes.',
  'gsc.note.filters': 'Paramètres de l’exportation',

  'page.limit.source':
    'Nous avons examiné le HTML que vous avez fourni. Le contenu ajouté par JavaScript après le chargement de la page n’est pas inclus.',
  'page.limit.scope':
    'Les en-têtes HTTP, le fichier robots.txt, la vitesse et les liens depuis d’autres sites comptent aussi pour la recherche. Ils ne font pas partie de cet examen.',
  'page.limit.width':
    'Les résultats de recherche mesurent la largeur en pixels, pas en caractères\u202F; il s’agit donc d’une estimation.',
  'page.head.ok': 'Toutes les balises importantes sont dans le head',
  'page.head.broken':
    '{count, plural, one {# balise importante s’est retrouvée} other {# balises importantes se sont retrouvées}} hors du head',
  'page.head.broken.summary':
    'Un élément qui n’a pas sa place dans le head est apparu avant {count, plural, one {cette balise} other {ces balises}}, si bien que le navigateur a refermé le head trop tôt. Les moteurs de recherche ignorent ces balises hors du head.',
  'page.head.noscript':
    '{count, plural, one {# balise après un bloc noscript risque d’être ignorée} other {# balises après un bloc noscript risquent d’être ignorées}}',
  'page.head.noscript.summary':
    'Une image ou un élément similaire dans un bloc noscript du head referme le head pour les outils qui n’exécutent pas JavaScript. Les navigateurs qui exécutent JavaScript ne sont pas concernés.',
  'page.check.head':
    'Déplacez l’élément inattendu sous le head, ou placez ces balises au-dessus de lui.',
  'page.check.noscript':
    'Déplacez le bloc noscript à la fin du head, après les balises importantes.',
  'page.robots.noindex':
    'La page demande aux moteurs de recherche de ne pas l’afficher dans les résultats',
  'page.robots.noindex.summary':
    'Les pages marquées noindex n’apparaissent pas dans les résultats de recherche. C’est voulu pour des pages privées ou en double, et une erreur coûteuse partout ailleurs.',
  'page.check.robots':
    'Si cette page doit apparaître dans la recherche, retirez noindex de sa balise meta robots.',
  'page.robots.nofollow': 'La page demande aux moteurs de recherche de ne pas suivre ses liens',
  'page.robots.nofollow.summary':
    'Les moteurs de recherche n’utiliseront pas les liens de cette page pour découvrir d’autres pages.',
  'page.robots.limited': 'La page limite la façon dont les moteurs de recherche peuvent l’afficher',
  'page.robots.limited.summary':
    'Des règles comme nosnippet ou max-snippet modifient l’apparence de la page dans les résultats.',
  'page.robots.indexable': 'Rien dans le HTML n’empêche l’indexation',
  'page.robots.indexable.summary':
    'Nous n’avons trouvé aucune règle noindex dans la page. Des règles peuvent aussi venir des en-têtes HTTP ou du fichier robots.txt, que le HTML ne montre pas.',
  'page.title.why':
    'Les moteurs de recherche affichent généralement le titre comme lien vers votre page, et les navigateurs l’affichent dans les onglets et les favoris.',
  'page.check.title':
    'Rédigez un titre court et unique qui dit ce que propose la page, en commençant par les mots les plus importants.',
  'page.title.missing': 'La page n’a pas de titre',
  'page.title.empty': 'Le titre de la page est vide',
  'page.title.multiple': 'La page a {count} titres',
  'page.title.multiple.summary':
    'Les navigateurs utilisent le premier, et les moteurs de recherche peuvent utiliser n’importe lequel. Gardez-en un seul.',
  'page.title.short': 'Le titre est très court',
  'page.title.short.summary':
    'Un titre comme «\u202FAccueil\u202F» dit rarement aux internautes ce que propose la page.',
  'page.title.long': 'Le titre risque d’être raccourci dans les résultats de recherche',
  'page.title.long.summary':
    'Il compte environ {length} caractères. En général, environ {fit} tiennent avant que les résultats ne le coupent.',
  'page.title.ok': 'Le titre est présent et d’une longueur raisonnable',
  'page.description.why':
    'La balise meta description est facultative, et Google rédige souvent son propre extrait. Une bonne description peut tout de même aider les gens à choisir votre résultat.',
  'page.check.description':
    'Rédigez une ou deux phrases qui résument la page pour quelqu’un qui hésite à cliquer.',
  'page.description.missing': 'La page n’a pas de meta description',
  'page.description.empty': 'La meta description est vide',
  'page.description.multiple': 'La page a {count} meta descriptions',
  'page.description.multiple.summary':
    'Gardez-en une seule, pour qu’il soit clair laquelle utiliser.',
  'page.description.long':
    'La description risque d’être raccourcie dans les résultats de recherche',
  'page.description.long.summary':
    'Elle compte environ {length} caractères. En général, environ {fit} tiennent dans un extrait.',
  'page.description.ok': 'La page a une meta description',
  'page.lang.missing': 'La page n’indique pas sa langue',
  'page.lang.invalid': 'Le code de langue {value} n’est pas valide',
  'page.lang.why':
    'Les lecteurs d’écran utilisent la langue pour prononcer correctement le texte, et les navigateurs pour proposer une traduction.',
  'page.check.lang':
    'Ajoutez un attribut lang à l’élément html, par exemple lang="fr" ou lang="en".',
  'page.lang.ok': 'La page indique sa langue\u00A0: {value}',
  'page.viewport.missing': 'La page n’est pas adaptée aux téléphones',
  'page.viewport.why':
    'Sans balise meta viewport, les téléphones affichent la page en réduction, comme une page pour ordinateur. Google utilise principalement la version mobile des pages pour l’indexation.',
  'page.check.viewport':
    'Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1"> dans le head.',
  'page.viewport.zoom-blocked': 'La page empêche les visiteurs de zoomer',
  'page.viewport.zoom-blocked.summary':
    'Bloquer le zoom rend le texte difficile à lire pour les personnes malvoyantes. Retirez user-scalable=no et toute valeur maximum-scale inférieure à 2.',
  'page.viewport.ok': 'La page est adaptée aux téléphones',
  'page.canonical.missing': 'La page n’a pas de lien canonique',
  'page.canonical.missing.summary':
    'C’est normal pour la plupart des pages. Si le même contenu est accessible à plusieurs adresses, un lien canonique indique aux moteurs de recherche celle que vous préférez.',
  'page.canonical.multiple': 'La page a {count} liens canoniques contradictoires',
  'page.canonical.multiple.summary':
    'Quand des liens canoniques pointent vers des pages différentes, les moteurs de recherche peuvent tous les ignorer.',
  'page.canonical.invalid': 'Le lien canonique {href} n’est pas une adresse valide',
  'page.canonical.relative': 'Le lien canonique utilise une adresse relative',
  'page.canonical.relative.summary':
    'Cela fonctionne, mais une adresse complète commençant par https:// évite les erreurs, et Google la recommande.',
  'page.canonical.other-site': 'Le lien canonique pointe vers un autre site\u00A0: {host}',
  'page.canonical.other-site.summary':
    'Les moteurs de recherche peuvent afficher la page de ce site à la place de celle-ci. Ce n’est voulu que si cette page est une copie.',
  'page.canonical.other-page': 'Le lien canonique pointe vers une autre page',
  'page.canonical.other-page.summary':
    'Les moteurs de recherche peuvent considérer cette page comme un doublon et afficher l’autre à sa place.',
  'page.canonical.self': 'Le lien canonique pointe vers cette page',
  'page.canonical.present': 'La page a un lien canonique',
  'page.h1.missing': 'La page n’a pas de titre principal (h1)',
  'page.h1.why':
    'Un titre principal indique aux visiteurs, y compris aux utilisateurs de lecteurs d’écran, de quoi parle la page.',
  'page.h1.multiple': 'La page a {count} titres principaux (h1)',
  'page.h1.multiple.summary':
    'C’est autorisé. Un seul titre principal rend toutefois la structure généralement plus claire.',
  'page.headings.skipped': 'Les niveaux de titre passent de h{from} à h{to}',
  'page.headings.skipped.summary':
    'De nombreux utilisateurs de lecteurs d’écran parcourent une page par ses titres. Un niveau sauté peut laisser croire qu’il manque du contenu.',
  'page.headings.empty':
    '{count, plural, one {# titre de section est vide} other {# titres de section sont vides}}',
  'page.headings.empty.summary':
    'Les lecteurs d’écran annoncent les titres vides, mais ceux-ci ne disent rien.',
  'page.headings.ok':
    '{count, plural, one {Le titre de section forme} other {Les # titres de section forment}} un plan clair',
  'page.images.missing-alt':
    '{count, plural, one {# image n’a pas} other {# images n’ont pas}} de texte de remplacement',
  'page.images.missing-alt.summary':
    'Les lecteurs d’écran ne peuvent pas décrire ces images, et les moteurs de recherche les comprennent moins bien. Décrivez chaque image dans son attribut alt, ou utilisez un alt vide pour les images purement décoratives.',
  'page.images.ok':
    '{count, plural, one {L’image a} other {Les # images ont}} un texte de remplacement',
  'page.links.unnamed': '{count, plural, one {# lien n’a pas} other {# liens n’ont pas}} de texte',
  'page.links.unnamed.summary':
    'Les lecteurs d’écran annoncent ces liens sans dire où ils mènent. Ajoutez un texte visible, ou un aria-label pour les liens en forme d’icône.',
  'page.links.javascript':
    '{count, plural, one {# lien exécute} other {# liens exécutent}} du JavaScript au lieu de pointer vers une adresse',
  'page.links.javascript.summary':
    'Les moteurs de recherche ne peuvent pas suivre ces liens. Indiquez une véritable adresse dans le href de chaque lien.',
  'page.links.summary':
    'La page renvoie vers {total, plural, one {# adresse} other {# adresses}}\u00A0: {internal} sur ce site et {external} ailleurs',
  'page.links.nofollow':
    '{count, plural, one {# lien est marqué} other {# liens sont marqués}} nofollow.',
  'page.structured-data.invalid':
    '{count, plural, one {# bloc de données structurées est illisible} other {# blocs de données structurées sont illisibles}}',
  'page.structured-data.invalid.summary':
    'Les moteurs de recherche ignorent les données structurées qui ne sont pas du JSON valide.',
  'page.structured-data.found': 'La page contient des données structurées\u00A0: {types}',
  'page.structured-data.untyped': 'La page contient des données structurées sans type',
  'page.structured-data.found.summary':
    'Nous avons vérifié qu’elles sont lisibles. Le Test des résultats enrichis de Google indique si elles sont éligibles aux résultats enrichis.',
  'page.hreflang.invalid':
    'Certaines annotations de langue utilisent des codes non valides\u00A0: {values}',
  'page.hreflang.invalid.summary':
    'Utilisez des codes de langue comme en, en-GB ou zh-Hans, ou x-default. Le code du Royaume-Uni est GB, pas UK.',
  'page.hreflang.no-self': 'Les annotations de langue n’incluent pas cette page',
  'page.hreflang.no-self.summary':
    'Chaque version linguistique doit se lister elle-même, en plus des autres.',
  'page.hreflang.ok':
    'La page liste {count, plural, one {# version linguistique} other {# versions linguistiques}}',
  'page.hreflang.limit':
    'Nous ne pouvons vérifier que cette page. Chaque page listée doit renvoyer vers elle, sinon les moteurs de recherche ignorent les annotations.',
  'page.charset.missing': 'La page n’indique pas son encodage de caractères',
  'page.charset.missing.summary':
    'Si le serveur ne l’indique pas, les navigateurs risquent de se tromper et d’afficher des caractères incorrects. Ajoutez <meta charset="utf-8"> au début du head.',
  'page.charset.legacy': 'La page utilise l’encodage de caractères {value}',
  'page.charset.legacy.summary':
    'L’UTF-8 est recommandé pour le Web\u202F; il couvre toutes les langues.',
  'page.charset.ok': 'La page indique l’encodage UTF-8',
  'page.social.missing': 'Les aperçus de liens risquent d’être incomplets\u00A0: {tags} manquant',
  'page.social.missing.summary':
    'Les réseaux sociaux et les messageries utilisent les balises Open Graph pour créer les aperçus de liens. Elles n’influencent pas le classement dans la recherche.',
  'page.social.ok': 'La page a des balises pour les aperçus de liens',
  'page.limit.fetched':
    'Nous avons examiné le HTML envoyé par le serveur pour cette adresse. Le contenu ajouté par JavaScript après le chargement de la page n’est pas inclus.',
  'page.limit.scope.fetched':
    'La vitesse de chargement et les liens depuis d’autres sites comptent aussi pour la recherche. Ils ne font pas partie de cet examen.',

  'http.status': 'Le serveur a répondu avec le code {status} au lieu de la page',
  'http.status.summary':
    'Les moteurs de recherche indexent les pages qui répondent avec un code de succès (200). Les codes d’erreur et de redirection excluent cette adresse des résultats.',
  'http.check.status':
    'Ouvrez l’adresse dans un navigateur et vérifiez le réglage du serveur ou de l’hébergement qui renvoie ce code.',
  'http.https': 'La page est servie sans HTTPS',
  'http.https.summary':
    'Les navigateurs signalent les pages sans HTTPS comme non sécurisées, et les moteurs de recherche préfèrent la version sécurisée d’une page.',
  'http.check.https':
    'Installez un certificat et redirigez chaque adresse http:// vers sa version https://.',
  'http.x-robots-tag':
    'Le serveur demande aux moteurs de recherche de ne pas afficher la page dans les résultats',
  'http.x-robots-tag.summary':
    'L’en-tête X-Robots-Tag agit comme une balise meta robots, mais c’est le serveur qui l’ajoute\u202F; il passe donc facilement inaperçu dans le HTML.',
  'http.check.x-robots-tag':
    'Si cette page doit apparaître dans la recherche, retirez noindex de l’en-tête X-Robots-Tag dans les réglages du serveur ou de l’hébergement.',
  'http.robots-txt': 'Le fichier robots.txt interdit cette page aux moteurs de recherche',
  'http.robots-txt.summary':
    'Googlebot n’explore pas les adresses que robots.txt interdit\u202F; il ne peut donc pas lire le contenu de cette page.',
  'http.check.robots-txt':
    'Si cette page doit apparaître dans la recherche, supprimez la règle de robots.txt ou restreignez-la.',
  'http.robots-txt.unreadable': 'Nous n’avons pas pu lire le fichier robots.txt du site',
  'http.robots-txt.unreadable.summary':
    'Si robots.txt répond par une erreur serveur, Google cesse d’explorer tout le site jusqu’à ce qu’il puisse relire le fichier. Vérifiez qu’il s’ouvre.',
  'http.redirects':
    'L’adresse redirige {count, plural, one {une fois} other {# fois}} avant d’atteindre la page',
  'http.redirects.summary':
    'Chaque redirection ajoute un aller-retour pour les visiteurs et les robots d’exploration. Faites pointer vos liens directement vers l’adresse finale.',
  'http.ok': 'Le serveur livre la page sans obstacle',
  'http.ok.summary':
    'Il répond avec succès en HTTPS, et ni robots.txt ni les en-têtes du serveur n’écartent les moteurs de recherche.',

  'analyst.do.status': 'Faites en sorte que cette adresse renvoie la page',
  'analyst.do.status.how':
    'Le serveur répond avec le code {status}. Si la page a déménagé, redirigez l’ancienne adresse vers la nouvelle avec une 301\u202F; si elle a été supprimée par erreur, restaurez-la\u202F; si le serveur échoue, demandez à votre hébergeur de consulter ses journaux d’erreurs.',
  'analyst.do.https': 'Passez le site en HTTPS',
  'analyst.do.https.how':
    'Activez un certificat dans votre panneau d’hébergement (beaucoup d’hébergeurs incluent des certificats Let’s Encrypt gratuits), redirigez chaque adresse http:// vers sa version https:// avec une 301, puis utilisez {url} dans le lien canonique et le sitemap.',
  'analyst.do.header-noindex': 'Retirez noindex des en-têtes du serveur',
  'analyst.do.header-noindex.how':
    'Le serveur envoie {header}. Retirez noindex de cet en-tête dans les réglages du serveur, de l’hébergement ou du CDN, puis examinez la page de nouveau pour vérifier.',
  'analyst.do.robots-txt': 'Laissez les moteurs de recherche explorer cette page',
  'analyst.do.robots-txt.how':
    'Le fichier robots.txt contient {rule}, qui couvre {path}. Supprimez cette ligne, ou restreignez-la aux adresses que vous voulez vraiment exclure.',
  'analyst.do.robots-txt-error': 'Faites en sorte que robots.txt se charge sans faute',
  'analyst.do.robots-txt-error.how':
    'Ouvrez {url}. Il doit se charger vite avec le code 200, ou répondre 404 si vous n’avez besoin d’aucune règle, mais jamais par une erreur serveur.',
  'analyst.do.redirects': 'Faites pointer vos liens vers l’adresse finale',
  'analyst.do.redirects.how':
    'Faites pointer vos liens, votre sitemap et votre lien canonique vers {url}, et redirigez chaque ancienne adresse vers elle en une seule étape.',
  'analyst.do.noindex': 'Laissez les moteurs de recherche indexer la page',
  'analyst.do.noindex.how': 'Supprimez la balise meta robots, ou remplacez-la par {snippet}.',
  'analyst.do.nofollow': 'Vérifiez si les liens de la page doivent être suivis',
  'analyst.do.nofollow.how':
    'Si les moteurs de recherche doivent suivre les liens de cette page, retirez nofollow de sa balise meta robots.',
  'analyst.do.head': 'Remettez les balises importantes dans le head',
  'analyst.do.head.how':
    'Un élément qui appartient au body apparaît tôt dans le head et le termine. Déplacez-le dans le body, après les balises title, meta et link.',
  'analyst.do.title-missing': 'Donnez un titre à la page',
  'analyst.do.title-missing.how':
    'Ajoutez ceci dans le head, puis adaptez-le à votre ton\u00A0: {snippet}',
  'analyst.do.title': 'Réécrivez le titre',
  'analyst.do.title.how':
    'Nommez d’abord ce que la page propose et votre marque en dernier, en 60 caractères environ. Par exemple\u00A0: {snippet}',
  'analyst.do.description': 'Rédigez une meta description',
  'analyst.do.description.how':
    'Ajoutez ceci dans le head, puis adaptez-le à votre ton\u00A0: {snippet}',
  'analyst.do.lang': 'Déclarez la langue de la page',
  'analyst.do.lang.how':
    'Commencez la page par {snippet}, pour que les lecteurs d’écran prononcent bien le texte et que les navigateurs proposent la bonne traduction.',
  'analyst.do.language-mismatch': 'Déclarez la langue dans laquelle le texte est écrit',
  'analyst.do.language-mismatch.how':
    'La page indique qu’elle est en {declaredLanguage}, mais son texte est rédigé en {detectedLanguage}. Remplacez la balise html par {snippet}.',
  'analyst.do.viewport': 'Adaptez la page aux écrans de téléphone',
  'analyst.do.viewport.how': 'Ajoutez {snippet} dans le head, et ne bloquez pas le zoom.',
  'analyst.do.canonical': 'Corrigez le lien canonique',
  'analyst.do.canonical.how':
    'Gardez un seul lien canonique dans le head, avec l’adresse complète de la page que vous voulez voir dans les résultats\u00A0: {snippet}',
  'analyst.do.h1': 'Donnez à la page un titre principal',
  'analyst.do.h1.how':
    'Ajoutez un seul h1 en haut de la page qui dit ce qu’elle propose, par exemple {snippet}.',
  'analyst.do.generic-heading': 'Faites dire au titre principal ce que la page propose',
  'analyst.do.generic-heading.how':
    '«\u202F{heading}\u202F» pourrait figurer sur n’importe quel site. Nommez plutôt le sujet, par exemple {snippet}.',
  'analyst.do.heading-order': 'Corrigez les niveaux de titres',
  'analyst.do.heading-order.how':
    'Utilisez h2 pour les sections principales et h3 à l’intérieur, sans sauter de niveau.',
  'analyst.do.heading-empty': 'Remplissez ou supprimez les titres vides',
  'analyst.do.heading-empty.how':
    'Donnez à chaque titre un texte visible, ou supprimez-le s’il ne sert qu’à créer de l’espace.',
  'analyst.do.alt': 'Décrivez les images porteuses de sens',
  'analyst.do.alt.how':
    '{count, plural, one {Ajoutez un texte alternatif à cette image} other {Ajoutez un texte alternatif à ces # images}}\u00A0: quelques mots sur ce que montre chacune. Laissez alt vide pour la décoration. Commencez par {examples}.',
  'analyst.do.link-names': 'Nommez chaque lien',
  'analyst.do.link-names.how':
    '{count, plural, one {Donnez à ce lien} other {Donnez à ces # liens}} un texte visible, ou un aria-label pour les liens en icône. Commencez par {examples}.',
  'analyst.do.crawlable': 'Utilisez de vraies adresses dans les liens',
  'analyst.do.crawlable.how':
    'Remplacez les liens javascript: par un href normal vers la page qu’ils ouvrent, pour que les moteurs de recherche puissent les suivre.',
  'analyst.do.structured-data': 'Corrigez les données structurées',
  'analyst.do.structured-data.how':
    'Collez chaque bloc JSON-LD dans le test des résultats enrichis de Google, corrigez les erreurs signalées et testez de nouveau.',
  'analyst.do.hreflang': 'Corrigez les annotations de langue',
  'analyst.do.hreflang.how':
    'Utilisez des codes comme en, en-GB ou tr, incluez cette page parmi ses propres variantes et faites en sorte que chaque page indiquée renvoie un lien.',
  'analyst.do.charset': 'Déclarez l’UTF-8',
  'analyst.do.charset.how': 'Placez {snippet} au tout début du head.',
  'analyst.do.social': 'Ajoutez des balises d’aperçu de lien',
  'analyst.do.social.how':
    'Ajoutez ces balises dans le head pour que les liens partagés affichent un titre, un texte et une image\u00A0: {snippet}',
  'analyst.do.thin': 'Dites-en plus sur ce que vous proposez',
  'analyst.do.thin.how':
    'La page compte {words} mots. Expliquez avec vos mots ce que vous proposez, pour qui, où, et quelle est l’étape suivante.',
  'analyst.why.language-mismatch':
    'Les lecteurs d’écran prononcent le texte selon la langue déclarée, et les navigateurs s’en servent pour proposer une traduction.',
  'analyst.why.generic-heading':
    'Le titre principal dit aux visiteurs et aux moteurs de recherche de quoi parle la page\u202F; une formule d’accueil ne leur dit rien.',
  'analyst.why.generic-title':
    '«\u202F{title}\u202F» pourrait être le titre de n’importe quelle page, et le titre est la première chose que lisent les internautes.',
  'analyst.why.thin':
    'Les moteurs de recherche et les visiteurs comprennent une page par ses mots. Très peu de texte leur donne peu de prise.',
  'analyst.evidence.declared': 'Langue déclarée',
  'analyst.evidence.detected': 'Langue du texte',
  'analyst.evidence.words': 'Mots',
  'analyst.note.topic-title':
    'La page parle surtout de «\u202F{topic}\u202F», mais le titre ne le mentionne pas.',
  'analyst.note.topic-h1':
    'Le titre principal ne mentionne pas «\u202F{topic}\u202F», le sujet principal de la page.',
  'analyst.note.topic-description': 'La description ne mentionne pas «\u202F{topic}\u202F».',
  'analyst.note.brand':
    'Le titre ne contient pas votre marque, «\u202F{brand}\u202F». La placer à la fin aide les internautes à vous reconnaître dans les résultats.',
  'analyst.note.thin':
    'Le texte est assez court ({words} mots). Vérifiez qu’il répond à ce que les gens recherchent.',
  'analyst.note.long-sentences':
    'Les phrases comptent en moyenne {average} mots. Des phrases plus courtes se lisent mieux, surtout sur téléphone.',
  'analyst.note.same-title-description':
    'Le titre et la description disent la même chose\u202F; la description peut plutôt apporter des détails.',
  'analyst.note.description-short':
    'La description est courte ({count} caractères)\u202F; il reste de la place pour une phrase qui donne envie de cliquer.',
  'analyst.note.headings-few':
    'La page n’a aucun titre de section. Les titres aident les visiteurs à la parcourir et les moteurs de recherche à comprendre sa structure.',
  'analyst.note.internal-links':
    'La page ne renvoie vers aucune autre page de votre site. Des liens vers des pages proches aident les visiteurs et les moteurs de recherche à les trouver.',
  'analyst.note.contact':
    'La page affiche des coordonnées. Des données structurées de type LocalBusiness ou Organization peuvent décrire votre activité aux moteurs de recherche.',
  'analyst.note.prices':
    'La page mentionne des prix. Des données structurées de type Product ou Offer peuvent les décrire aux moteurs de recherche.',
  'analyst.note.slow':
    'Le serveur a mis {seconds} secondes à envoyer le HTML. Visez bien moins d’une seconde\u202F; un cache ou un hébergement plus rapide aident.',
  'analyst.note.compression':
    'Le HTML ({kilobytes}\u00A0Ko) est envoyé sans compression. Activer gzip ou Brotli sur le serveur le rend plus léger et plus rapide.',
  'analyst.note.heavy':
    'Le HTML seul pèse {kilobytes}\u00A0Ko. Les pages lourdes se chargent lentement sur téléphone\u202F; cherchez des données ou des scripts intégrés à déplacer.',
  'analyst.note.hsts':
    'HTTPS fonctionne, mais le serveur n’envoie pas HSTS, qui demande aux navigateurs d’utiliser toujours la version sécurisée.',
  'analyst.note.sitemap':
    'Le fichier robots.txt n’indique aucun sitemap. Une ligne «\u202FSitemap:\u202F» avec l’adresse de votre sitemap aide les moteurs de recherche à trouver chaque page.',
  'analyst.caveat.scope':
    'Cette analyse ne lit que cette page. Elle ne voit ni les classements, ni les concurrents, ni les liens depuis d’autres sites, ni la rapidité ressentie sur téléphone.',
  'analyst.caveat.pasted':
    'La réponse du serveur et le fichier robots.txt n’ont pas été vérifiés, car le HTML a été fourni directement.',
  'analyst.caveat.little-text':
    'Le HTML contient très peu de texte. Si le contenu s’affiche par JavaScript, les moteurs de recherche peuvent en voir moins que les visiteurs.',
  'analyst.caveat.no-language':
    'La langue de la page n’a pas pu être déduite de son texte\u202F; les vérifications qui lisent les mots ont donc été ignorées.',
  'analyst.caveat.ideas':
    'Les idées de titre et de description sont construites avec les mots de la page\u202F; adaptez-les pour qu’elles vous ressemblent.',
  'analyst.summary.strong':
    'La page est en bon état\u00A0: rien ne l’écarte de la recherche, et l’essentiel est en place.',
  'analyst.summary.fair':
    'La page peut être trouvée, mais {count, plural, one {# problème la freine} other {# problèmes la freinent}}.',
  'analyst.summary.weak':
    '{count, plural, one {# problème grave peut} other {# problèmes graves peuvent}} empêcher cette page d’être trouvée ou utilisée.',
  'analyst.summary.blocked':
    'En l’état, on demande aux moteurs de recherche de ne pas afficher cette page, ou ils ne peuvent pas l’atteindre.',
  'analyst.summary.topic': 'Son texte porte surtout sur «\u202F{topic}\u202F».',
  'analyst.summary.start': 'Commencez par ceci\u00A0: {action}.',
  'analyst.summary.done':
    'Plus rien d’urgent\u00A0: gardez le texte à jour et examinez de nouveau la page après chaque modification.',

  'mentions.kind.citation': 'Cité avec un lien',
  'mentions.kind.mention': 'Nommé sans lien',
  'mentions.method.own-check': 'J’ai interrogé l’assistant moi-même',
  'mentions.method.shared-with-me': 'Quelqu’un me l’a partagé',
  'mentions.method.screenshot': 'D’après une capture d’écran',
  'mentions.method.other': 'Autrement',
  'mentions.certainty.confirmed': 'Confirmé',
  'mentions.certainty.uncertain': 'Incertain',
  'mentions.error.required': 'Ce champ est obligatoire.',
  'mentions.error.too-long': 'Utilisez au maximum {max} caractères.',
  'mentions.error.invalid-url':
    'Saisissez une adresse Web complète commençant par https:// ou http://.',
  'mentions.error.invalid-date': 'Saisissez une date valide.',
  'mentions.error.future-date': 'La date ne peut pas être dans le futur.',
  'mentions.error.invalid-choice': 'Choisissez l’une des options.',
  'mentions.limit.scope':
    'Voici les mentions que vous avez enregistrées. Elles montrent où vous avez vu votre site, et non la fréquence à laquelle les assistants IA le mentionnent en général.',

  // AI visibility check
  'visibility.approximate': 'Visibilité approximative',
  'visibility.approximate.why':
    'Les réponses obtenues par un programme peuvent différer de ce que les gens voient dans les applications, et elles changent d’un jour à l’autre. Lisez ces résultats comme une estimation, pas comme une mesure.',
  'visibility.paid-tools': 'Cette vérification utilise des outils payants sur {provider}.',
  'visibility.cost.calls':
    '{questions, plural, one {# question} other {# questions}} × {engines, plural, one {# IA} other {# IA}} × {repeats, plural, one {# fois} other {# fois}} = {calls, plural, one {# appel} other {# appels}}',
  'visibility.cost.estimate':
    'Coût estimé\u00A0: {calls, plural, one {# appel} other {# appels}}, environ {amount}.',
  'visibility.cost.unpriced':
    '{calls, plural, one {# appel n’a pas de prix indiqué, l’estimation ne le compte donc pas.} other {# appels n’ont pas de prix indiqué, l’estimation ne les compte donc pas.}}',
  'visibility.cost.billing':
    '{billing, select, account {Ces frais ne sont inclus ni dans votre abonnement SearchUnveil ni dans votre essai gratuit de {trialDays, plural, one {# jour} other {# jours}}, et sont facturés sur votre propre compte {provider}.} other {Ces frais ne sont inclus ni dans votre abonnement SearchUnveil ni dans votre essai gratuit de {trialDays, plural, one {# jour} other {# jours}}, et sont prélevés sur votre solde {provider}.}}',
  'visibility.cost.failed-free': 'Les appels qui échouent ne sont pas facturés.',
  'visibility.cost.confirm': 'Voulez-vous continuer\u00A0?',
  'visibility.cost.reduce':
    'Pour payer moins, posez moins de questions, choisissez moins d’IA ou répétez chaque question moins souvent. Les concurrents ne coûtent rien de plus.',
  'visibility.cost.actual':
    'Cette vérification a fait {calls, plural, one {# appel} other {# appels}} et a coûté environ {amount}.',
  'visibility.cost.actual.unpriced':
    '{calls, plural, one {# appel facturé n’avait pas de prix indiqué et n’est pas compté.} other {# appels facturés n’avaient pas de prix indiqué et ne sont pas comptés.}}',
  'visibility.cost.interrupted':
    '{calls, plural, one {# appel a été interrompu quand vous avez arrêté la vérification\u00A0; {provider} peut quand même le facturer.} other {# appels ont été interrompus quand vous avez arrêté la vérification\u00A0; {provider} peut quand même les facturer.}}',
  'visibility.cell.cited': 'Cité',
  'visibility.cell.position': 'source n°\u00A0{position}',
  'visibility.cell.named': 'Nommé, sans lien',
  'visibility.cell.absent': 'Absent',
  'visibility.cell.no-answer': 'Pas de réponse',
  'visibility.cell.rate': '{count} sur {answers}',
  'visibility.summary':
    '{present, plural, one {Vous apparaissez dans # réponse sur {answers}.} other {Vous apparaissez dans # réponses sur {answers}.}}',
  'visibility.summary.competitor':
    '{present, plural, one {{name} apparaît dans # réponse sur {answers}.} other {{name} apparaît dans # réponses sur {answers}.}}',
  'visibility.summary.none': 'Aucune réponse n’est revenue, il n’y a donc encore rien à comparer.',
  'visibility.stopped':
    'Vous avez arrêté la vérification\u00A0: ces résultats ne couvrent que les réponses reçues jusque-là.',
  'visibility.other-sources': 'Sites cités à votre place',
  'visibility.failure':
    '{reason, select, unavailable {L’IA n’était pas disponible} rate-limited {Trop de demandes à la fois} refused {L’IA a refusé de répondre} no-balance {Solde insuffisant} timeout {Pas de réponse à temps} stopped {Arrêté par vous} other {Une erreur s’est produite}}',
  'visibility.cost.failed-charged': 'Les appels qui échouent sont facturés aussi.',
  'visibility.cost.failed-free-count':
    '{calls, plural, one {# appel a échoué et n’a pas été facturé.} other {# appels ont échoué et n’ont pas été facturés.}}',
  'visibility.engine.unavailable':
    '{count, plural, one {{products} ne peut pas être vérifié sur {provider}\u00A0: aucun outil n’y est proposé pour cela.} other {{products} ne peuvent pas être vérifiés sur {provider}\u00A0: aucun outil n’y est proposé pour cela.}}',
  'visibility.engine.price': '{price} par appel, environ {cost} pour cette vérification',
  'visibility.engine.unpriced': 'Aucun prix indiqué',
  'visibility.engine.cheapest': 'Le moins cher',
  'visibility.engine.chosen': 'Choisi',
  'visibility.column.question': 'Question posée',
  'visibility.source.count':
    '{site}\u00A0: cité dans {count, plural, one {# réponse} other {# réponses}}',
  'visibility.calls.failed':
    '{count, plural, one {# appel n’a apporté aucune réponse} other {# appels n’ont apporté aucune réponse}}\u00A0: {reasons}.',
  'visibility.heading.engines': 'IA et modèles au choix',
  'visibility.heading.cost': 'Coût',
  'visibility.trend.title': 'Évolution dans le temps',
  'visibility.trend.point': '{date}\u00A0: {present} sur {answers}',
  'visibility.trend.basis':
    'Comparé sur {questions, plural, one {# question} other {# questions}} et {products}, communs à toutes les vérifications.',
  'visibility.trend.skipped':
    '{count, plural, one {# vérification pour un autre site, pays ou langue a été écartée.} other {# vérifications pour un autre site, pays ou langue ont été écartées.}}',
  'visibility.trend.not-checked': 'Non recherché',

  // Pricing
  'pricing.trial':
    'Votre essai gratuit de {trialDays, plural, one {# jour} other {# jours}} ne couvre que l’abonnement SearchUnveil. La vérification de visibilité dans l’IA utilise des outils payants sur {provider}, et leurs frais sont prélevés sur votre solde {provider} pendant l’essai aussi.',

  'diagnostic.input.empty': 'Ce fichier est vide.',
  'diagnostic.input.binary':
    'Ce n’est pas un fichier texte. Choisissez un fichier CSV, ou le fichier ZIP que télécharge la Search Console.',
  'diagnostic.input.spreadsheet':
    'C’est un classeur de tableur. Enregistrez-le au format CSV, ou utilisez le fichier ZIP d’origine de la Search Console.',
  'diagnostic.input.unsupported-type': 'Ce type de fichier n’est pas pris en charge.',
  'diagnostic.encoding.legacy-fallback':
    'Ce fichier n’est pas enregistré en UTF-8\u202F; nous l’avons donc lu en {encoding}. Si des lettres semblent incorrectes, exportez-le de nouveau depuis la Search Console sans l’ouvrir au préalable dans un tableur.',
  'diagnostic.encoding.utf16-without-bom':
    'Ce fichier utilise l’encodage {encoding}. Nous l’avons détecté automatiquement.',
  'diagnostic.csv.no-header': 'Ce fichier n’a pas de ligne d’en-tête.',
  'diagnostic.csv.unterminated-quote':
    'Une valeur qui commence par un guillemet ne se termine jamais.',
  'diagnostic.csv.stray-quote':
    'Un guillemet apparaît au milieu d’une valeur. Nous l’avons conservé tel quel.',
  'diagnostic.csv.text-after-quote':
    'Du texte suit un guillemet fermant. Nous l’avons conservé dans la valeur.',
  'diagnostic.csv.field-count':
    'Cette ligne contient {actual} valeurs, mais l’en-tête en contient {expected}.',
  'diagnostic.csv.too-many-rows':
    'Ce fichier contient plus de {limit} lignes, le maximum que nous pouvons lire.',
  'diagnostic.csv.too-many-columns':
    'Une ligne contient plus de {limit} colonnes, le maximum que nous pouvons lire.',
  'diagnostic.csv.field-too-long':
    'Une valeur dépasse {limit} caractères, le maximum que nous pouvons lire.',
  'diagnostic.zip.invalid':
    'Ce fichier ZIP est endommagé ou incomplet. Essayez de le télécharger à nouveau.',
  'diagnostic.zip.multi-disk':
    'Ce fichier ZIP est découpé en plusieurs parties, ce qui n’est pas pris en charge.',
  'diagnostic.zip.encrypted':
    'Ce fichier ZIP est protégé par un mot de passe. Utilisez une exportation sans mot de passe.',
  'diagnostic.zip.unsupported-method':
    '«\u202F{entry}\u202F», dans ce fichier ZIP, utilise une méthode de compression que nous ne savons pas lire.',
  'diagnostic.zip.too-many-entries': 'Ce fichier ZIP contient plus de {limit} fichiers.',
  'diagnostic.zip.entry-too-large':
    '«\u202F{entry}\u202F», dans ce fichier ZIP, dépasse {megabytes}\u00A0Mo une fois décompressé.',
  'diagnostic.zip.suspicious-ratio':
    '«\u202F{entry}\u202F», dans ce fichier ZIP, est si compressé que sa décompression pourrait être dangereuse\u202F; nous nous sommes donc arrêtés.',
  'diagnostic.zip.overlapping-entries':
    'Les fichiers de cette archive ZIP se chevauchent, signe d’une archive endommagée ou dangereuse\u202F; nous nous sommes donc arrêtés.',
  'diagnostic.zip.corrupt-entry': '«\u202F{entry}\u202F», dans ce fichier ZIP, est endommagé.',
  'diagnostic.zip.checksum-mismatch':
    '«\u202F{entry}\u202F», dans ce fichier ZIP, n’a pas passé le contrôle d’intégrité.',
  'diagnostic.zip.no-csv': 'Ce fichier ZIP ne contient aucun fichier CSV.',
  'diagnostic.zip.website':
    'Ce fichier ZIP contient un site web ({pages, plural, one {# page web} other {# pages web}} parmi {files, plural, one {# fichier} other {# fichiers}}), pas un export Search Console. L’examen de page peut vérifier chacune de ses pages.',

  'diagnostic.gsc.no-tables':
    'Nous n’avons trouvé aucune donnée de la Search Console dans les fichiers choisis.',
  'diagnostic.gsc.unrecognized-table':
    'Ce fichier ne ressemble pas à une exportation des performances de la Search Console.',
  'diagnostic.gsc.duplicate-table':
    'Vous avez choisi plusieurs tableaux {kind, select, date {de dates} query {Requêtes} page {Pages} country {Pays} device {Appareils} searchAppearance {Apparence dans les résultats de recherche} other {du même type}}. Nous avons utilisé le premier.',
  'diagnostic.gsc.columns-inferred':
    'Nous n’avons pas reconnu le nom des colonnes\u202F; nous les avons donc associées selon l’ordre standard de la Search Console et avons vérifié leurs valeurs.',
  'diagnostic.gsc.dimension-inferred':
    'Nous n’avons pas reconnu le nom de la première colonne. {kind, select, date {Ses valeurs sont des dates.} page {Ses valeurs sont des adresses de pages.} other {Nous affichons ses valeurs telles quelles.}}',
  'diagnostic.gsc.missing-columns':
    'Ce tableau n’a pas de colonne {metric, select, clicks {Clics} impressions {Impressions} ctr {CTR} position {Position} other {{metric}}}.',
  'diagnostic.gsc.invalid-number': '«\u202F{value}\u202F» n’est pas un nombre valide.',
  'diagnostic.gsc.invalid-date': '«\u202F{value}\u202F» n’est pas une date valide.',
  'diagnostic.gsc.ambiguous-dates':
    'Nous ne pouvons pas savoir si ces dates commencent par le jour ou par le mois. Exportez de nouveau le fichier depuis la Search Console, sans le modifier.',
  'diagnostic.gsc.mixed-decimal-separators':
    'La colonne «\u202F{column}\u202F» mélange points et virgules décimales.',
  'diagnostic.gsc.decimal-comma':
    'La colonne «\u202F{column}\u202F» utilise la virgule comme séparateur décimal.',
  'diagnostic.gsc.ctr-as-fraction':
    'La colonne «\u202F{column}\u202F» donne le taux de clics sous forme de fraction\u00A0: 0,05 signifie 5\u202F%.',
  'diagnostic.gsc.clicks-exceed-impressions':
    'Cette ligne compte plus de clics ({clicks}) que d’impressions ({impressions}), ce que la Search Console n’indique jamais.',
  'diagnostic.gsc.columns-swapped':
    'La plupart des lignes comptent plus de clics que d’impressions. Les deux colonnes sont peut-être inversées\u202F; nous n’avons donc pas utilisé ce tableau.',
  'diagnostic.gsc.ctr-mismatch':
    'Sur {rows, plural, one {# ligne} other {# lignes}}, le taux de clics ne correspond pas aux clics divisés par les impressions. Le fichier a peut-être été modifié.',
  'diagnostic.gsc.position-out-of-range':
    '«\u202F{value}\u202F» n’est pas une position moyenne valide. Les positions commencent à 1.',
  'diagnostic.gsc.duplicate-key':
    '«\u202F{key}\u202F» apparaît plusieurs fois. Nous avons utilisé la première ligne.',
  'diagnostic.gsc.empty-key':
    'La première colonne de cette ligne est vide\u202F; nous l’avons donc ignorée.',
  'diagnostic.gsc.empty-table': 'Ce tableau ne contient aucune ligne exploitable.',

  'diagnostic.mentions.invalid-json': 'Ce fichier n’est pas un JSON valide.',
  'diagnostic.mentions.invalid-format': 'Ce fichier n’est pas un journal de mentions SearchUnveil.',
  'diagnostic.mentions.unsupported-version':
    'Ce journal de mentions a été créé par une version plus récente de SearchUnveil (format {version}).',
  'diagnostic.mentions.too-many':
    'Ce journal contient plus de {limit} mentions, le maximum que nous pouvons lire.',
  'diagnostic.mentions.invalid-field':
    'Entrée {index}\u00A0: «\u202F{field}\u202F» est manquant ou non valide.',
  'diagnostic.mentions.duplicate-id':
    'L’entrée {index} répète une entrée précédente. Nous avons conservé la première.',

  // Diagnostics: saved AI visibility checks
  'diagnostic.visibility.invalid-json': 'Ce fichier n’est pas un JSON valide.',
  'diagnostic.visibility.invalid-format':
    'Ce fichier n’est pas une vérification de visibilité dans l’IA enregistrée par SearchUnveil.',
  'diagnostic.visibility.unsupported-version':
    'Cette vérification a été enregistrée par une version plus récente de SearchUnveil (format {version}).',
  'diagnostic.visibility.invalid-field':
    'Cette vérification enregistrée est endommagée\u00A0: «\u202F{field}\u202F» est manquant ou non valide.',
  'diagnostic.visibility.invalid-answer':
    'La réponse {index} est endommagée, nous l’avons donc écartée.',
  'diagnostic.visibility.duplicate-answer':
    'La réponse {index} répète une réponse précédente. Nous avons conservé la première.',

  'diagnostic.page.empty':
    'Collez le HTML d’une page, ou choisissez un fichier HTML, pour l’examiner.',
  'diagnostic.page.too-large':
    'Ce HTML dépasse {limit} caractères, le maximum que nous pouvons examiner.',
  'diagnostic.page.not-html':
    'Cela ne ressemble pas à du HTML. Collez le code source de la page, pas son adresse.',
  'diagnostic.page.invalid-url':
    '«\u202F{value}\u202F» n’est pas une adresse Web complète\u202F; nous avons donc ignoré les vérifications qui comparent les liens à la page.',
  'diagnostic.site.no-pages':
    'Aucun des fichiers choisis n’est une page web (un fichier .html ou .htm).',

  'diagnostic.diagnostic.more':
    '…et {count, plural, one {# autre cas semblable} other {# autres cas semblables}}.',
};
