import type { UiCatalog } from './en.ts';

export const uiFr: UiCatalog = {
  'ui.app.tagline': 'Comprenez comment votre site est trouvé.',
  'ui.app.preview': 'Aperçu anticipé',
  'ui.app.local': 'Vos fichiers restent sur cet appareil.',
  'ui.app.loading': 'Chargement de SearchUnveil…',
  'ui.skip': 'Aller au contenu principal',
  'ui.menu': 'Menu',
  'ui.nav.label': 'Navigation principale',
  'ui.nav.home': 'Vue d’ensemble',
  'ui.nav.search-console': 'Search Console',
  'ui.nav.page-review': 'Examen de page',
  'ui.nav.mentions': 'Mentions par l’IA',
  'ui.nav.privacy': 'Vos données',
  'ui.language': 'Langue',
  'ui.theme': 'Thème',
  'ui.theme.system': 'Comme l’appareil',
  'ui.theme.light': 'Clair',
  'ui.theme.dark': 'Sombre',
  'ui.footer.built-by': 'SearchUnveil · Conçu par Atelance',
  'ui.footer.status': 'En développement. Ce n’est pas une version publique.',
  'ui.footer.privacy':
    'Aucun cookie, aucune mesure d’audience et aucune requête réseau une fois la page chargée.',
  'ui.footer.privacy.server':
    'Aucun cookie, aucune mesure d’audience. Les pages ne sont téléchargées et analysées qu’à votre demande.',
  'ui.footer.privacy.claude':
    'Aucun cookie, aucune mesure d’audience. Rien ne quitte votre appareil, sauf si vous demandez une analyse par IA.',
  'ui.page-title': '{page} · SearchUnveil',

  'ui.home.title': 'Voyez comment votre site est trouvé',
  'ui.home.lead':
    'Commencez par une seule source d’information. Ajoutez-la, comprenez-la et décidez de ce qu’il faut vérifier ensuite.',
  'ui.home.gsc.title': 'Comment mon site se comporte-t-il dans la recherche Google\u202F?',
  'ui.home.gsc.text':
    'Importez une exportation de la Search Console pour voir l’évolution des clics et des apparitions, expliquée simplement.',
  'ui.home.gsc.action': 'Analyser une exportation',
  'ui.home.page.title': 'Ma page est-elle facile à trouver\u202F?',
  'ui.home.page.text':
    'Saisissez une adresse ou collez du HTML pour examiner une page et repérer les problèmes courants de recherche et d’accessibilité.',
  'ui.home.page.action': 'Examiner une page',
  'ui.home.mentions.title': 'Où l’IA a-t-elle mentionné mon site\u202F?',
  'ui.home.mentions.text':
    'Tenez un journal daté des réponses d’IA qui mentionnent ou citent votre site.',
  'ui.home.mentions.action': 'Ouvrir le journal',
  'ui.home.principles': 'Comment fonctionne SearchUnveil',
  'ui.home.principle.local':
    'Chaque examen se fait dans votre navigateur, et les fichiers que vous choisissez ne sont jamais envoyés.',
  'ui.home.principle.evidence': 'Chaque constat montre les éléments sur lesquels il repose.',
  'ui.home.principle.limits':
    'Chaque résultat indique ce que les données ne permettent pas de savoir.',
  'ui.home.fact.languages': 'langues',
  'ui.home.fact.uploads': 'fichiers envoyés',
  'ui.home.fact.trackers': 'cookies ou traceurs',
  'ui.home.fact.device': 'des vérifications se font sur votre appareil',
  'ui.home.showcase.title': 'Ce que montre l’export d’exemple',
  'ui.home.showcase.text':
    'Un site fictif, example.com, analysé dans votre navigateur dès l’ouverture de cette page.',

  'ui.file.choose': 'Choisir des fichiers',
  'ui.file.choose-one': 'Choisir un fichier',
  'ui.file.drop': 'ou déposez-les ici',
  'ui.file.drop-one': 'ou déposez-le ici',
  'ui.file.hint':
    'Fichiers ZIP ou CSV de toute taille. Seul ce dont l’analyse a besoin est lu, sur cet appareil.',
  'ui.file.selected':
    '{count, plural, one {# fichier sélectionné} other {# fichiers sélectionnés}}',

  'ui.gsc.title': 'Exportation de la Search Console',
  'ui.gsc.lead':
    'Choisissez le fichier ZIP que télécharge la Search Console, ou un ou plusieurs des fichiers CSV qu’il contient.',
  'ui.gsc.how': 'Comment exporter depuis la Search Console',
  'ui.gsc.how.1': 'Ouvrez le rapport sur les performances dans Google Search Console.',
  'ui.gsc.how.2': 'Choisissez une période, idéalement les 3 derniers mois.',
  'ui.gsc.how.3': 'Sélectionnez Exporter, puis Télécharger au format CSV.',
  'ui.gsc.sample': 'Essayer avec des données d’exemple',
  'ui.gsc.sample.note': 'L’exemple contient des données fictives pour example.com.',
  'ui.gsc.sample.badge': 'Données d’exemple',
  'ui.gsc.reading': 'Lecture de vos fichiers…',
  'ui.gsc.ready': 'Analyse prête.',
  'ui.gsc.failed': 'Nous n’avons pas pu lire ces fichiers',
  'ui.gsc.unexpected':
    'Un problème est survenu pendant la lecture des fichiers. Rien n’a été envoyé. Réessayez, ou essayez une autre exportation.',
  'ui.gsc.again': 'Analyser d’autres fichiers',
  'ui.gsc.website': 'Examiner les pages de ce site',
  'ui.gsc.what-happened': 'Ce qui s’est passé',
  'ui.gsc.overview': 'Vue d’ensemble',
  'ui.gsc.covers': 'Période\u00A0: {range}',
  'ui.gsc.previous-value': 'Avant\u00A0: {value}',
  'ui.gsc.findings': 'Constats',
  'ui.gsc.findings.none': 'Aucune évolution ni opportunité ne ressort de cette exportation.',
  'ui.gsc.notes': 'À propos de ces données',
  'ui.gsc.top-queries': 'Principales requêtes',
  'ui.gsc.top-pages': 'Principales pages',
  'ui.gsc.files': 'Fichiers lus',
  'ui.gsc.diagnostics': 'Remarques sur vos fichiers',

  'ui.chart.title': '{metric} par jour',
  'ui.chart.description':
    '{metric} pour chaque jour du {start} au {end}. La ligne la plus épaisse montre la moyenne sur 7 jours.',
  'ui.chart.metric': 'Afficher',
  'ui.chart.average': 'Moyenne sur 7 jours',
  'ui.chart.daily': 'Chaque jour',
  'ui.chart.lower-better': 'Plus c’est bas, mieux c’est',
  'ui.chart.incomplete': 'Peut-être incomplet',
  'ui.chart.table': 'Afficher les chiffres dans un tableau',
  'ui.table.date': 'Date',

  'ui.finding.evidence': 'Éléments',
  'ui.finding.limits': 'À garder en tête',
  'ui.finding.next': 'Que vérifier ensuite',
  'ui.finding.sources': 'Sources',
  'ui.finding.more': 'Limites et sources',
  'ui.finding.new-tab': '(s’ouvre dans un nouvel onglet)',
  'ui.location.line': 'ligne {line}',
  'ui.location.column': 'colonne «\u202F{column}\u202F»',

  'ui.page.title': 'Examen de page',
  'ui.page.lead':
    'Saisissez l’adresse d’un site ou collez le HTML d’une page. Chaque constat s’accompagne de ses preuves et de ses sources.',
  'ui.page.mode': 'Que faut-il examiner\u202F?',
  'ui.page.mode.address': 'Une adresse',
  'ui.page.mode.html': 'Du HTML collé',
  'ui.page.address': 'Adresse du site',
  'ui.page.address.hint':
    'Par exemple atelance.com ou atelance.com/a-propos. La page et son fichier robots.txt sont téléchargés comme le ferait un navigateur.',
  'ui.page.address.no-server':
    'L’examen par adresse nécessite le serveur de SearchUnveil, et cette copie fonctionne sans lui. Vous pouvez toujours coller le HTML de la page.',
  'ui.page.address.invalid': 'Saisissez l’adresse d’un site, par exemple example.com.',
  'ui.page.html': 'HTML de la page',
  'ui.page.html.hint':
    'Dans la plupart des navigateurs, ouvrez la page, appuyez sur Ctrl+U (⌥⌘U sur Mac), puis sélectionnez tout et copiez.',
  'ui.page.url': 'Adresse de la page',
  'ui.page.url.hint':
    'Sert à comparer les balises canoniques et les liens avec la page. Rien n’est téléchargé.',
  'ui.page.file': 'Ou choisissez un fichier HTML',
  'ui.page.submit': 'Examiner la page',
  'ui.page.sample': 'Essayer une page d’exemple',
  'ui.page.fetching': 'Téléchargement de {address}…',
  'ui.page.no-server.title': 'Cette copie ne peut pas télécharger de pages',
  'ui.page.no-server.steps':
    'Ouvrez {address} dans votre navigateur et appuyez sur Ctrl+U (⌥⌘U sur Mac) pour afficher le code source. Copiez-le en entier, puis collez-le sous «\u202FDu HTML collé\u202F».',
  'ui.page.no-server.switch': 'Coller le HTML à la place',
  'ui.page.fetch.invalid-address':
    'Cela ne ressemble pas à l’adresse d’un site. Essayez par exemple example.com.',
  'ui.page.fetch.blocked-address':
    'Par sécurité, seuls les sites publics sur les ports web habituels peuvent être téléchargés.',
  'ui.page.fetch.unknown-host': 'Aucun site ne répond à cette adresse. Vérifiez l’orthographe.',
  'ui.page.fetch.unreachable':
    'Le site n’a pas répondu. Il est peut-être hors service, ou il refuse les visites automatisées.',
  'ui.page.fetch.timeout': 'Le site a mis trop de temps à répondre. Réessayez dans un instant.',
  'ui.page.fetch.tls':
    'Le certificat de sécurité du site n’a pas pu être vérifié\u202F; la page n’a donc pas été téléchargée.',
  'ui.page.fetch.too-many-redirects':
    'L’adresse redirige trop de fois. Ouvrez-la dans un navigateur pour vérifier.',
  'ui.page.fetch.too-large': 'La page est trop volumineuse pour être examinée.',
  'ui.page.fetch.not-html': 'L’adresse mène à un fichier, pas à une page web.',
  'ui.page.fetch.http-status': 'Le site a répondu avec le code {detail} au lieu d’une page.',
  'ui.page.fetch.rate-limited':
    'Trop d’examens en peu de temps. Patientez une minute, puis réessayez.',
  'ui.page.fetch.offline':
    'Le serveur de SearchUnveil est injoignable. Vérifiez votre connexion et réessayez.',
  'ui.page.fetch.failed': 'La page n’a pas pu être téléchargée. Réessayez, ou collez son HTML.',
  'ui.page.results': 'Résultats',
  'ui.page.reviewed': 'Page examinée\u00A0: {url}',
  'ui.page.reviewed-pasted': 'Le HTML que vous avez fourni a été examiné',
  'ui.page.done': 'Examen prêt.',
  'ui.overview.title': 'Ce que voient les moteurs de recherche',
  'ui.overview.serp': 'Son apparence possible dans Google',
  'ui.overview.serp.note':
    'Google peut raccourcir le titre et la description, ou rédiger les siens à partir de la page.',
  'ui.overview.serp.no-description': 'Aucune description. Google choisira un texte de la page.',
  'ui.overview.page': 'La page',
  'ui.overview.server': 'Le serveur',
  'ui.overview.language': 'Langue',
  'ui.overview.canonical': 'Adresse canonique',
  'ui.overview.robots': 'Règles pour les robots',
  'ui.overview.words': 'Mots de texte',
  'ui.overview.headings': 'Titres de section',
  'ui.overview.images': 'Images',
  'ui.overview.images.value': '{total} · {missing} sans texte de remplacement',
  'ui.overview.links': 'Liens',
  'ui.overview.links.value': '{internal} internes · {external} externes',
  'ui.overview.structured-data': 'Données structurées',
  'ui.overview.social': 'Aperçu du lien',
  'ui.overview.social.complete': 'Titre, description et image',
  'ui.overview.social.partial': 'Incomplet',
  'ui.overview.languages': 'Versions linguistiques',
  'ui.overview.none': 'Aucun',
  'ui.overview.not-set': 'Non indiqué',
  'ui.overview.status': 'Code d’état',
  'ui.overview.final-address': 'Adresse finale',
  'ui.overview.redirects': 'Redirections',
  'ui.overview.time': 'Durée de téléchargement',
  'ui.overview.time.value': '{seconds}\u00A0s',
  'ui.overview.size': 'Taille du HTML',
  'ui.overview.size.value': '{kilobytes}\u00A0Ko',
  'ui.overview.compression': 'Compression',
  'ui.overview.https': 'Connexion sécurisée',
  'ui.overview.https.hsts': 'HTTPS, avec HSTS',
  'ui.overview.https.on': 'HTTPS',
  'ui.overview.https.off': 'Aucune',
  'ui.overview.robots-txt': 'Fichier robots.txt',
  'ui.overview.robots-txt.allows': 'Autorise Googlebot',
  'ui.overview.robots-txt.blocks': 'Bloque Googlebot',
  'ui.overview.robots-txt.missing': 'Aucun, donc tout est autorisé',
  'ui.overview.robots-txt.unknown': 'Illisible',
  'ui.overview.sitemaps': 'Sitemaps indiqués',
  'ui.overview.outline': 'Plan des titres',
  'ui.overview.outline.empty': 'La page n’a aucun titre de section.',
  'ui.overview.outline.more': '{count, plural, one {et # autre titre} other {et # autres titres}}',
  'ui.analysis.title': 'Analyse approfondie par IA',
  'ui.analysis.lead':
    'Claude Fable 5.2, le modèle le plus performant d’Anthropic, lit cet examen et le texte de la page, puis explique ce qui compte le plus et ce qu’il faut changer, précisément.',
  'ui.analysis.sends.server':
    'Quand vous la lancez, les constats, les informations ci-dessus et le début du texte visible de la page sont envoyés à Anthropic par le serveur de SearchUnveil.',
  'ui.analysis.sends.claude':
    'Quand vous la lancez, les constats, les informations ci-dessus et le début du texte visible de la page sont envoyés à Claude, avec votre propre compte Claude.',
  'ui.analysis.unavailable':
    'L’analyse par IA fonctionne quand SearchUnveil tourne avec son serveur et une clé d’API Anthropic, ou dans Claude.',
  'ui.analysis.start': 'Analyser avec Fable 5.2',
  'ui.analysis.again': 'Relancer l’analyse',
  'ui.analysis.thinking':
    'Claude lit l’examen et y réfléchit. Cela prend généralement une à trois minutes.',
  'ui.analysis.writing': 'Claude rédige l’analyse…',
  'ui.analysis.done': 'Analyse prête.',
  'ui.analysis.by': 'Rédigé par {model}.',
  'ui.analysis.by-tier': 'Rédigé par le modèle Claude le plus performant auquel vous avez accès.',
  'ui.analysis.fallback':
    'Le modèle demandé a refusé une partie de cette demande\u202F; {model} l’a donc terminée.',
  'ui.analysis.caution':
    'L’IA peut se tromper. Vérifiez chaque suggestion avant de modifier votre site.',
  'ui.analysis.verdict':
    'Bilan\u00A0: {verdict, select, strong {solide} weak {faible} other {correct}}',
  'ui.analysis.priorities': 'Que faire, dans l’ordre',
  'ui.analysis.why': 'Pourquoi c’est important',
  'ui.analysis.how': 'Comment faire',
  'ui.analysis.evidence': 'S’appuie sur',
  'ui.analysis.impact': 'Effet\u00A0: {level, select, high {fort} low {faible} other {moyen}}',
  'ui.analysis.effort':
    'Effort\u00A0: {level, select, high {important} low {faible} other {moyen}}',
  'ui.analysis.titles': 'Idées de titres',
  'ui.analysis.descriptions': 'Idées de descriptions',
  'ui.analysis.characters': '{count, plural, one {# caractère} other {# caractères}}',
  'ui.analysis.content': 'Sur le contenu',
  'ui.analysis.technical': 'Remarques techniques',
  'ui.analysis.caveats': 'Ce que cette analyse ne peut pas savoir',
  'ui.analysis.error.cancelled': 'L’analyse a été arrêtée.',
  'ui.analysis.error.not-granted':
    'Claude n’a pas été autorisé à s’exécuter ici. Rechargez la page pour que la question vous soit reposée.',
  'ui.analysis.error.rate-limited': 'Trop d’analyses en peu de temps. Réessayez plus tard.',
  'ui.analysis.error.refused': 'Claude a refusé d’analyser cette page.',
  'ui.analysis.error.too-long': 'La réponse a été coupée. Réessayez.',
  'ui.analysis.error.invalid-answer': 'La réponse n’a pas pu être lue. Réessayez.',
  'ui.analysis.error.unavailable':
    'L’analyse par IA n’est pas disponible pour le moment. Réessayez plus tard.',
  'ui.analysis.error.failed': 'L’analyse n’a pas abouti. Réessayez dans un instant.',
  'ui.site.title': 'Examiner un site entier',
  'ui.site.lead':
    'Choisissez un ZIP des fichiers du site, comme une sauvegarde ou un export statique, ou plusieurs fichiers HTML. Chaque page est examinée sur cet appareil\u00A0; les images, les styles et les autres fichiers sont comptés, mais pas lus.',
  'ui.site.url': 'Adresse du site',
  'ui.site.url.hint':
    'Donne à chaque page son adresse, pour que les vérifications qui comparent les liens et les balises canoniques à la page puissent aussi s’exécuter.',
  'ui.site.choose': 'Choisir les fichiers du site',
  'ui.site.files.hint': 'Un fichier ZIP de toute taille, ou des fichiers HTML.',
  'ui.site.preparing': 'Ouverture des fichiers…',
  'ui.site.progress': 'Examen de la page {done} sur {total}…',
  'ui.site.stop': 'Arrêter',
  'ui.site.stopped': 'L’examen a été arrêté.',
  'ui.site.done': 'Examen du site prêt.',
  'ui.site.results': 'Examen du site',
  'ui.site.summary': '{pages, plural, one {# page examinée.} other {# pages examinées.}}',
  'ui.site.other':
    '{count, plural, one {# autre fichier, comme une image ou une feuille de style, n’a pas été examiné.} other {# autres fichiers, comme des images et des feuilles de style, n’ont pas été examinés.}}',
  'ui.site.issues': 'Problèmes les plus fréquents',
  'ui.site.issues.none': 'Aucune page ne demande d’attention ni d’examen plus poussé.',
  'ui.site.issue.pages':
    '{count, plural, one {Sur # page\u00A0:} other {Sur # pages, comme}} {path}',
  'ui.site.issue.list': 'Voir les pages',
  'ui.site.and-more': '{count, plural, one {et # autre page} other {et # autres pages}}',
  'ui.site.pages': 'Pages',
  'ui.site.untitled': 'Sans titre',
  'ui.site.more': '{count, plural, one {Afficher # page de plus} other {Afficher # pages de plus}}',
  'ui.site.skipped': 'Pages qui n’ont pas pu être examinées',
  'ui.site.again': 'Examiner un autre site',

  'ui.mentions.title': 'Journal des mentions par l’IA',
  'ui.mentions.lead':
    'Notez quand un assistant IA mentionne ou cite votre site. Les entrées sont enregistrées uniquement dans ce navigateur.',
  'ui.mentions.add': 'Ajouter une mention',
  'ui.mentions.edit-title': 'Modifier la mention',
  'ui.mentions.observedOn': 'Date de l’observation',
  'ui.mentions.assistant': 'Assistant IA',
  'ui.mentions.assistant.hint': 'Par exemple ChatGPT, Gemini ou Perplexity.',
  'ui.mentions.kind': 'Type',
  'ui.mentions.citedUrl': 'Page de votre site citée',
  'ui.mentions.citedUrl.hint': 'Obligatoire si la réponse renvoyait vers votre site.',
  'ui.mentions.prompt': 'Ce qui a été demandé',
  'ui.mentions.excerpt': 'Ce que disait la réponse',
  'ui.mentions.evidenceUrl': 'Lien vers la réponse',
  'ui.mentions.evidenceUrl.hint':
    'Un lien de partage de la conversation, si l’assistant en propose un.',
  'ui.mentions.method': 'Comment vous l’avez vue',
  'ui.mentions.certainty': 'Quel est votre degré de certitude\u202F?',
  'ui.mentions.notes': 'Notes',
  'ui.mentions.optional': 'facultatif',
  'ui.mentions.save': 'Enregistrer la mention',
  'ui.mentions.update': 'Enregistrer les modifications',
  'ui.mentions.cancel': 'Annuler',
  'ui.mentions.saved': 'Mention enregistrée.',
  'ui.mentions.deleted': 'Mention supprimée.',
  'ui.mentions.fix': 'Veuillez corriger les champs signalés ci-dessous.',
  'ui.mentions.list': 'Mentions enregistrées',
  'ui.mentions.empty': 'Aucune mention enregistrée pour le moment.',
  'ui.mentions.edit': 'Modifier',
  'ui.mentions.delete': 'Supprimer',
  'ui.mentions.delete.confirm': 'Supprimer cette mention\u202F? Cette action est irréversible.',
  'ui.mentions.summary': 'Synthèse',
  'ui.mentions.total': 'Mentions enregistrées',
  'ui.mentions.citations': 'Avec un lien vers votre site',
  'ui.mentions.uncertain': 'Marquées comme incertaines',
  'ui.mentions.period': 'Première et dernière observation',
  'ui.mentions.by-assistant': 'Par assistant',
  'ui.mentions.by-month': 'Par mois',
  'ui.mentions.cited-pages': 'Pages les plus citées',
  'ui.mentions.count': 'Mentions',
  'ui.mentions.export': 'Conserver une copie',
  'ui.mentions.export.json': 'Télécharger le journal (JSON)',
  'ui.mentions.export.csv': 'Télécharger pour un tableur (CSV)',
  'ui.mentions.import': 'Importer un journal',
  'ui.mentions.imported':
    '{count, plural, one {# mention importée.} other {# mentions importées.}}',
  'ui.mentions.clear': 'Supprimer toutes les mentions',
  'ui.mentions.clear.confirm':
    'Supprimer les {count} mentions de ce navigateur\u202F? Téléchargez d’abord une copie si vous souhaitez les conserver.',
  'ui.mentions.storage-error':
    'Ce navigateur ne nous a pas permis d’enregistrer. La navigation privée ou un stockage plein peuvent en être la cause. Téléchargez une copie pour ne rien perdre.',

  'ui.privacy.title': 'Vos données',
  'ui.privacy.lead': 'SearchUnveil fonctionne entièrement dans votre navigateur.',
  'ui.privacy.lead.server':
    'SearchUnveil examine les pages dans votre navigateur. Son serveur n’intervient qu’à votre demande.',
  'ui.privacy.lead.claude':
    'SearchUnveil fonctionne dans votre navigateur. Seule l’analyse par IA, quand vous la demandez, envoie des données.',
  'ui.privacy.address':
    'Quand vous examinez une adresse, le serveur télécharge cette page publique et son fichier robots.txt, puis les transmet à votre navigateur. Il ne garde rien.',
  'ui.privacy.ai.server':
    'Quand vous demandez une analyse par IA, les constats, les informations sur la page et le début de son texte visible vont à Claude, d’Anthropic, par le serveur. Vos fichiers, non.',
  'ui.privacy.ai.claude':
    'Quand vous demandez une analyse par IA, les constats, les informations sur la page et le début de son texte visible vont à Claude, avec votre compte. Vos fichiers, non.',
  'ui.privacy.network.server':
    'La politique de sécurité de la page ne l’autorise à se connecter qu’à son propre serveur.',
  'ui.privacy.files':
    'Les fichiers que vous analysez sont lus en mémoire. Ils ne sont jamais enregistrés ni envoyés.',
  'ui.privacy.stored':
    'Ce navigateur enregistre uniquement votre journal des mentions par l’IA et vos choix de langue et de thème.',
  'ui.privacy.network':
    'Une fois la page chargée, sa politique de sécurité bloque toute connexion réseau\u202F: vos données ne peuvent pas quitter votre appareil.',
  'ui.privacy.tracking': 'Aucun cookie, aucune mesure d’audience, aucun traceur.',
  'ui.privacy.clear': 'Supprimer tout ce qui est enregistré dans ce navigateur',
  'ui.privacy.clear.confirm':
    'Supprimer votre journal des mentions et vos préférences de ce navigateur\u202F?',
  'ui.privacy.cleared':
    'Tout ce que SearchUnveil avait enregistré dans ce navigateur a été supprimé.',

  'ui.not-found.title': 'Page introuvable',
  'ui.not-found.back': 'Aller à la vue d’ensemble',
};
