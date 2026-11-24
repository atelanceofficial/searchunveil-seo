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
    'Examinez le HTML d’une page pour repérer les problèmes courants de recherche et d’accessibilité.',
  'ui.home.page.action': 'Examiner une page',
  'ui.home.mentions.title': 'Où l’IA a-t-elle mentionné mon site\u202F?',
  'ui.home.mentions.text':
    'Tenez un journal daté des réponses d’IA qui mentionnent ou citent votre site.',
  'ui.home.mentions.action': 'Ouvrir le journal',
  'ui.home.principles': 'Comment fonctionne SearchUnveil',
  'ui.home.principle.local':
    'Tout se passe dans votre navigateur. Les fichiers que vous choisissez ne sont jamais envoyés.',
  'ui.home.principle.evidence': 'Chaque constat montre les éléments sur lesquels il repose.',
  'ui.home.principle.limits':
    'Chaque résultat indique ce que les données ne permettent pas de savoir.',

  'ui.file.choose': 'Choisir des fichiers',
  'ui.file.choose-one': 'Choisir un fichier',
  'ui.file.drop': 'ou déposez-les ici',
  'ui.file.drop-one': 'ou déposez-le ici',
  'ui.file.limit': 'Fichiers ZIP ou CSV, jusqu’à {megabytes}\u00A0Mo chacun.',
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
    'Collez le code source HTML d’une page, ou choisissez un fichier HTML enregistré. L’examen se fait sur cet appareil.',
  'ui.page.html': 'HTML de la page',
  'ui.page.html.hint':
    'Dans la plupart des navigateurs, ouvrez la page, appuyez sur Ctrl+U (⌥⌘U sur Mac), puis sélectionnez tout et copiez.',
  'ui.page.url': 'Adresse de la page',
  'ui.page.url.hint':
    'Sert à comparer les balises canoniques et les liens avec la page. Rien n’est téléchargé.',
  'ui.page.file': 'Ou choisissez un fichier HTML',
  'ui.page.submit': 'Examiner la page',
  'ui.page.sample': 'Essayer une page d’exemple',
  'ui.page.why-paste':
    'Pourquoi coller plutôt que saisir une adresse\u202F? Récupérer des pages nécessiterait un serveur. Cet aperçu garde tout sur votre appareil.',
  'ui.page.results': 'Résultats',
  'ui.page.reviewed': 'Page examinée\u00A0: {url}',
  'ui.page.reviewed-pasted': 'Le HTML que vous avez fourni a été examiné',
  'ui.page.done': 'Examen prêt.',

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
