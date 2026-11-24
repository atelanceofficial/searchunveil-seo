import type { UiCatalog } from './en.ts';

export const uiDe: UiCatalog = {
  'ui.app.tagline': 'Verstehen Sie, wie Ihre Website gefunden wird.',
  'ui.app.preview': 'Frühe Vorschau',
  'ui.app.local': 'Ihre Dateien bleiben auf diesem Gerät.',
  'ui.app.loading': 'SearchUnveil wird geladen …',
  'ui.skip': 'Zum Hauptinhalt springen',
  'ui.menu': 'Menü',
  'ui.nav.label': 'Hauptmenü',
  'ui.nav.home': 'Übersicht',
  'ui.nav.search-console': 'Search Console',
  'ui.nav.page-review': 'Seitenprüfung',
  'ui.nav.mentions': 'KI-Erwähnungen',
  'ui.nav.privacy': 'Ihre Daten',
  'ui.language': 'Sprache',
  'ui.theme': 'Design',
  'ui.theme.system': 'Wie Gerät',
  'ui.theme.light': 'Hell',
  'ui.theme.dark': 'Dunkel',
  'ui.footer.built-by': 'SearchUnveil · Entwickelt von Atelance',
  'ui.footer.status': 'In Entwicklung. Keine öffentliche Version.',
  'ui.footer.privacy':
    'Keine Cookies, keine Analyse und keine Netzwerkanfragen, nachdem die Seite geladen ist.',
  'ui.footer.privacy.server':
    'Keine Cookies und keine Analyse. Seiten werden nur auf Ihren Wunsch geladen und analysiert.',
  'ui.footer.privacy.claude':
    'Keine Cookies und keine Analyse. Nichts verlässt Ihr Gerät, außer Sie fordern eine KI-Analyse an.',
  'ui.page-title': '{page} · SearchUnveil',

  'ui.home.title': 'Sehen Sie, wie Ihre Website gefunden wird',
  'ui.home.lead':
    'Beginnen Sie mit einer Informationsquelle. Fügen Sie sie hinzu, verstehen Sie sie und entscheiden Sie, was Sie als Nächstes prüfen.',
  'ui.home.gsc.title': 'Wie schneidet meine Website in der Google-Suche ab?',
  'ui.home.gsc.text':
    'Laden Sie einen Search Console-Export hoch, um Trends bei Klicks und Einblendungen in klarer Sprache zu sehen.',
  'ui.home.gsc.action': 'Export analysieren',
  'ui.home.page.title': 'Ist meine Seite leicht zu finden?',
  'ui.home.page.text':
    'Geben Sie eine Adresse ein oder fügen Sie HTML ein, um eine Seite auf häufige Probleme bei Suche und Barrierefreiheit zu prüfen.',
  'ui.home.page.action': 'Seite prüfen',
  'ui.home.mentions.title': 'Wo hat KI meine Website erwähnt?',
  'ui.home.mentions.text':
    'Führen Sie ein datiertes Protokoll von KI-Antworten, die Ihre Website erwähnen oder zitieren.',
  'ui.home.mentions.action': 'Protokoll öffnen',
  'ui.home.principles': 'So funktioniert SearchUnveil',
  'ui.home.principle.local':
    'Jede Prüfung läuft in Ihrem Browser, und die Dateien, die Sie auswählen, werden nie hochgeladen.',
  'ui.home.principle.evidence': 'Jedes Ergebnis zeigt die Belege, auf denen es beruht.',
  'ui.home.principle.limits': 'Jedes Ergebnis sagt auch, was die Daten nicht verraten können.',
  'ui.home.fact.languages': 'Sprachen',
  'ui.home.fact.uploads': 'hochgeladene Dateien',
  'ui.home.fact.trackers': 'Cookies oder Tracker',
  'ui.home.fact.device': 'der Prüfungen laufen auf Ihrem Gerät',
  'ui.home.showcase.title': 'Was der Beispielexport zeigt',
  'ui.home.showcase.text':
    'Eine fiktive Website, example.com, in Ihrem Browser analysiert, sobald sich diese Seite geöffnet hat.',

  'ui.file.choose': 'Dateien auswählen',
  'ui.file.choose-one': 'Datei auswählen',
  'ui.file.drop': 'oder hier ablegen',
  'ui.file.drop-one': 'oder hier ablegen',
  'ui.file.hint':
    'ZIP- oder CSV-Dateien jeder Größe. Gelesen wird nur, was die Analyse braucht, auf diesem Gerät.',
  'ui.file.selected': '{count, plural, one {# Datei ausgewählt} other {# Dateien ausgewählt}}',

  'ui.gsc.title': 'Search Console-Export',
  'ui.gsc.lead':
    'Wählen Sie die ZIP-Datei, die die Search Console herunterlädt, oder eine oder mehrere CSV-Dateien daraus.',
  'ui.gsc.how': 'So exportieren Sie aus der Search Console',
  'ui.gsc.how.1': 'Öffnen Sie in der Google Search Console den Leistungsbericht.',
  'ui.gsc.how.2': 'Wählen Sie einen Zeitraum, am besten die letzten 3 Monate.',
  'ui.gsc.how.3': 'Wählen Sie „Exportieren“ und dann „CSV herunterladen“.',
  'ui.gsc.sample': 'Beispieldaten ausprobieren',
  'ui.gsc.sample.note': 'Das Beispiel besteht aus erfundenen Daten für example.com.',
  'ui.gsc.sample.badge': 'Beispieldaten',
  'ui.gsc.reading': 'Ihre Dateien werden gelesen …',
  'ui.gsc.ready': 'Analyse fertig.',
  'ui.gsc.failed': 'Wir konnten diese Dateien nicht lesen',
  'ui.gsc.unexpected':
    'Beim Lesen der Dateien ist etwas schiefgegangen. Es wurde nichts übertragen. Versuchen Sie es erneut oder mit einem anderen Export.',
  'ui.gsc.again': 'Andere Dateien analysieren',
  'ui.gsc.website': 'Die Seiten dieser Website prüfen',
  'ui.gsc.what-happened': 'Was ist passiert?',
  'ui.gsc.overview': 'Übersicht',
  'ui.gsc.covers': 'Zeitraum: {range}',
  'ui.gsc.previous-value': 'Vorher: {value}',
  'ui.gsc.findings': 'Ergebnisse',
  'ui.gsc.findings.none': 'In diesem Export sind keine Veränderungen oder Chancen aufgefallen.',
  'ui.gsc.notes': 'Zu diesen Daten',
  'ui.gsc.top-queries': 'Häufigste Suchanfragen',
  'ui.gsc.top-pages': 'Häufigste Seiten',
  'ui.gsc.files': 'Gelesene Dateien',
  'ui.gsc.diagnostics': 'Hinweise zu Ihren Dateien',

  'ui.chart.title': '{metric} pro Tag',
  'ui.chart.description':
    '{metric} für jeden Tag vom {start} bis zum {end}. Die dickere Linie zeigt den 7-Tage-Durchschnitt.',
  'ui.chart.metric': 'Anzeigen',
  'ui.chart.average': '7-Tage-Durchschnitt',
  'ui.chart.daily': 'Jeder Tag',
  'ui.chart.lower-better': 'Niedriger ist besser',
  'ui.chart.incomplete': 'Möglicherweise unvollständig',
  'ui.chart.table': 'Zahlen als Tabelle anzeigen',
  'ui.table.date': 'Datum',

  'ui.finding.evidence': 'Belege',
  'ui.finding.limits': 'Zu beachten',
  'ui.finding.next': 'Was Sie als Nächstes prüfen sollten',
  'ui.finding.sources': 'Quellen',
  'ui.finding.more': 'Grenzen und Quellen',
  'ui.finding.new-tab': '(öffnet in einem neuen Tab)',
  'ui.location.line': 'Zeile {line}',
  'ui.location.column': 'Spalte „{column}“',

  'ui.page.title': 'Seitenprüfung',
  'ui.page.lead':
    'Geben Sie die Adresse einer Website ein oder fügen Sie das HTML einer Seite ein. Jedes Ergebnis kommt mit seinen Belegen und Quellen.',
  'ui.page.mode': 'Was geprüft werden soll',
  'ui.page.mode.address': 'Eine Adresse',
  'ui.page.mode.html': 'Eingefügtes HTML',
  'ui.page.address': 'Adresse der Website',
  'ui.page.address.hint':
    'Zum Beispiel atelance.com oder atelance.com/about. Die Seite und ihre robots.txt werden geladen, wie es ein Browser tun würde.',
  'ui.page.address.no-server':
    'Für die Prüfung per Adresse braucht SearchUnveil seinen Server, und diese Kopie läuft ohne ihn. Sie können das HTML der Seite trotzdem einfügen.',
  'ui.page.address.invalid': 'Geben Sie eine Website-Adresse ein, etwa example.com.',
  'ui.page.html': 'HTML der Seite',
  'ui.page.html.hint':
    'In den meisten Browsern: Seite öffnen, Strg+U drücken (auf dem Mac ⌥⌘U), dann alles auswählen und kopieren.',
  'ui.page.url': 'Adresse der Seite',
  'ui.page.url.hint':
    'Dient dazu, Canonical-Tags und Links mit der Seite zu vergleichen. Es wird nichts heruntergeladen.',
  'ui.page.file': 'Oder eine HTML-Datei auswählen',
  'ui.page.submit': 'Seite prüfen',
  'ui.page.sample': 'Beispielseite ausprobieren',
  'ui.page.fetching': '{address} wird geladen …',
  'ui.page.no-server.title': 'Diese Kopie kann keine Seiten laden',
  'ui.page.no-server.steps':
    'Öffnen Sie {address} in Ihrem Browser und drücken Sie Strg+U (auf dem Mac ⌥⌘U), um den Quelltext zu sehen. Kopieren Sie alles und fügen Sie es unter „Eingefügtes HTML“ ein.',
  'ui.page.no-server.switch': 'Stattdessen HTML einfügen',
  'ui.page.fetch.invalid-address':
    'Das sieht nicht nach einer Website-Adresse aus. Versuchen Sie etwas wie example.com.',
  'ui.page.fetch.blocked-address':
    'Aus Sicherheitsgründen lassen sich nur öffentliche Websites über die üblichen Web-Ports laden.',
  'ui.page.fetch.unknown-host':
    'Unter dieser Adresse antwortet keine Website. Prüfen Sie die Schreibweise.',
  'ui.page.fetch.unreachable':
    'Die Website hat nicht geantwortet. Sie ist vielleicht nicht erreichbar oder weist automatische Besuche ab.',
  'ui.page.fetch.timeout':
    'Die Website hat zu lange gebraucht. Versuchen Sie es gleich noch einmal.',
  'ui.page.fetch.tls':
    'Das Sicherheitszertifikat der Website ließ sich nicht prüfen, daher wurde die Seite nicht geladen.',
  'ui.page.fetch.too-many-redirects':
    'Die Adresse leitet zu oft weiter. Öffnen Sie sie zur Kontrolle im Browser.',
  'ui.page.fetch.too-large': 'Die Seite ist zu groß für eine Prüfung.',
  'ui.page.fetch.not-html': 'Die Adresse führt zu einer Datei, nicht zu einer Webseite.',
  'ui.page.fetch.http-status':
    'Die Website hat mit Status {detail} statt mit einer Seite geantwortet.',
  'ui.page.fetch.rate-limited':
    'Zu viele Prüfungen in kurzer Zeit. Warten Sie eine Minute und versuchen Sie es dann erneut.',
  'ui.page.fetch.offline':
    'Der Server von SearchUnveil war nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
  'ui.page.fetch.failed':
    'Die Seite ließ sich nicht laden. Versuchen Sie es erneut oder fügen Sie ihr HTML ein.',
  'ui.page.results': 'Ergebnisse',
  'ui.page.reviewed': 'Geprüft: {url}',
  'ui.page.reviewed-pasted': 'Das von Ihnen bereitgestellte HTML wurde geprüft',
  'ui.page.done': 'Prüfung fertig.',
  'ui.overview.title': 'Was Suchmaschinen sehen',
  'ui.overview.serp': 'So könnte sie bei Google erscheinen',
  'ui.overview.serp.note':
    'Google kann Titel und Beschreibung kürzen oder anhand der Seite eigene schreiben.',
  'ui.overview.serp.no-description': 'Keine Beschreibung. Google wählt Text aus der Seite.',
  'ui.overview.page': 'Die Seite',
  'ui.overview.server': 'Der Server',
  'ui.overview.language': 'Sprache',
  'ui.overview.canonical': 'Kanonische Adresse',
  'ui.overview.robots': 'Robots-Regeln',
  'ui.overview.words': 'Wörter im Text',
  'ui.overview.headings': 'Überschriften',
  'ui.overview.images': 'Bilder',
  'ui.overview.images.value': '{total} · {missing} ohne Textalternative',
  'ui.overview.links': 'Links',
  'ui.overview.links.value': '{internal} intern · {external} extern',
  'ui.overview.structured-data': 'Strukturierte Daten',
  'ui.overview.social': 'Linkvorschau',
  'ui.overview.social.complete': 'Titel, Beschreibung und Bild',
  'ui.overview.social.partial': 'Unvollständig',
  'ui.overview.languages': 'Sprachversionen',
  'ui.overview.none': 'Keine',
  'ui.overview.not-set': 'Nicht angegeben',
  'ui.overview.status': 'Statuscode',
  'ui.overview.final-address': 'Endgültige Adresse',
  'ui.overview.redirects': 'Weiterleitungen',
  'ui.overview.time': 'Ladezeit',
  'ui.overview.time.value': '{seconds} s',
  'ui.overview.size': 'HTML-Größe',
  'ui.overview.size.value': '{kilobytes} KB',
  'ui.overview.compression': 'Komprimierung',
  'ui.overview.https': 'Sichere Verbindung',
  'ui.overview.https.hsts': 'HTTPS, mit HSTS',
  'ui.overview.https.on': 'HTTPS',
  'ui.overview.https.off': 'Keine',
  'ui.overview.robots-txt': 'robots.txt',
  'ui.overview.robots-txt.allows': 'Erlaubt den Googlebot',
  'ui.overview.robots-txt.blocks': 'Sperrt den Googlebot',
  'ui.overview.robots-txt.missing': 'Keine, also ist alles erlaubt',
  'ui.overview.robots-txt.unknown': 'Nicht lesbar',
  'ui.overview.sitemaps': 'Genannte Sitemaps',
  'ui.overview.outline': 'Gliederung der Überschriften',
  'ui.overview.outline.empty': 'Die Seite hat keine Überschriften.',
  'ui.overview.outline.more':
    '{count, plural, one {und # weitere Überschrift} other {und # weitere Überschriften}}',
  'ui.analysis.title': 'Tiefere Analyse mit KI',
  'ui.analysis.lead':
    'Claude Fable 5.2, das leistungsfähigste Modell von Anthropic, liest diese Prüfung und den Text der Seite und erklärt, worauf es am meisten ankommt und was genau Sie ändern sollten.',
  'ui.analysis.sends.server':
    'Wenn Sie sie starten, gehen die Ergebnisse, die Angaben oben und der Anfang des sichtbaren Seitentexts über den Server von SearchUnveil an Anthropic.',
  'ui.analysis.sends.claude':
    'Wenn Sie sie starten, gehen die Ergebnisse, die Angaben oben und der Anfang des sichtbaren Seitentexts an Claude, über Ihr eigenes Claude-Konto.',
  'ui.analysis.unavailable':
    'Die KI-Analyse funktioniert, wenn SearchUnveil mit seinem Server und einem Anthropic-API-Schlüssel läuft oder in Claude geöffnet wird.',
  'ui.analysis.start': 'Mit Fable 5.2 analysieren',
  'ui.analysis.again': 'Erneut analysieren',
  'ui.analysis.thinking':
    'Claude liest die Prüfung und denkt sie durch. Das dauert meist ein bis drei Minuten.',
  'ui.analysis.writing': 'Claude schreibt die Analyse …',
  'ui.analysis.done': 'Analyse fertig.',
  'ui.analysis.by': 'Geschrieben von {model}.',
  'ui.analysis.by-tier':
    'Geschrieben vom leistungsfähigsten Claude-Modell, das Ihnen zur Verfügung steht.',
  'ui.analysis.fallback':
    'Das angefragte Modell hat einen Teil dieser Anfrage abgelehnt, daher hat {model} sie beendet.',
  'ui.analysis.caution':
    'KI kann sich irren. Prüfen Sie jeden Vorschlag, bevor Sie Ihre Website ändern.',
  'ui.analysis.verdict':
    'Gesamteindruck: {verdict, select, strong {stark} weak {schwach} other {ordentlich}}',
  'ui.analysis.priorities': 'Was zu tun ist, der Reihe nach',
  'ui.analysis.why': 'Warum es wichtig ist',
  'ui.analysis.how': 'So geht es',
  'ui.analysis.evidence': 'Grundlage',
  'ui.analysis.impact': 'Wirkung: {level, select, high {hoch} low {gering} other {mittel}}',
  'ui.analysis.effort': 'Aufwand: {level, select, high {hoch} low {gering} other {mittel}}',
  'ui.analysis.titles': 'Ideen für den Titel',
  'ui.analysis.descriptions': 'Ideen für die Beschreibung',
  'ui.analysis.characters': '{count, plural, one {# Zeichen} other {# Zeichen}}',
  'ui.analysis.content': 'Zum Inhalt',
  'ui.analysis.technical': 'Technische Hinweise',
  'ui.analysis.caveats': 'Was diese Analyse nicht wissen kann',
  'ui.analysis.error.cancelled': 'Die Analyse wurde angehalten.',
  'ui.analysis.error.not-granted':
    'Claude durfte hier nicht ausgeführt werden. Laden Sie die Seite neu, um erneut gefragt zu werden.',
  'ui.analysis.error.rate-limited':
    'Zu viele Analysen in kurzer Zeit. Versuchen Sie es später erneut.',
  'ui.analysis.error.refused': 'Claude hat die Analyse dieser Seite abgelehnt.',
  'ui.analysis.error.too-long': 'Die Antwort wurde abgeschnitten. Versuchen Sie es erneut.',
  'ui.analysis.error.invalid-answer': 'Die Antwort ließ sich nicht lesen. Versuchen Sie es erneut.',
  'ui.analysis.error.unavailable':
    'Die KI-Analyse ist gerade nicht verfügbar. Versuchen Sie es später erneut.',
  'ui.analysis.error.failed':
    'Die Analyse wurde nicht fertig. Versuchen Sie es gleich noch einmal.',
  'ui.site.title': 'Eine ganze Website prüfen',
  'ui.site.lead':
    'Wählen Sie ein ZIP mit den Dateien der Website, etwa ein Backup oder einen statischen Export, oder mehrere HTML-Dateien. Jede Seite wird auf diesem Gerät geprüft; Bilder, Stylesheets und andere Dateien werden gezählt, aber nicht gelesen.',
  'ui.site.url': 'Adresse der Website',
  'ui.site.url.hint':
    'Gibt jeder Seite ihre Adresse, damit auch die Prüfungen laufen, die Links und Canonical-Tags mit der Seite vergleichen.',
  'ui.site.choose': 'Dateien der Website wählen',
  'ui.site.files.hint': 'Eine ZIP-Datei beliebiger Größe oder HTML-Dateien.',
  'ui.site.preparing': 'Dateien werden geöffnet…',
  'ui.site.progress': 'Seite {done} von {total} wird geprüft…',
  'ui.site.stop': 'Anhalten',
  'ui.site.stopped': 'Die Prüfung wurde angehalten.',
  'ui.site.done': 'Website-Prüfung fertig.',
  'ui.site.results': 'Website-Prüfung',
  'ui.site.summary': '{pages, plural, one {# Seite geprüft.} other {# Seiten geprüft.}}',
  'ui.site.other':
    '{count, plural, one {# andere Datei, etwa ein Bild oder ein Stylesheet, wurde nicht geprüft.} other {# andere Dateien, etwa Bilder und Stylesheets, wurden nicht geprüft.}}',
  'ui.site.issues': 'Häufigste Probleme',
  'ui.site.issues.none': 'Keine Seite braucht Aufmerksamkeit oder einen genaueren Blick.',
  'ui.site.issue.pages': '{count, plural, one {Auf # Seite:} other {Auf # Seiten, etwa}} {path}',
  'ui.site.issue.list': 'Seiten anzeigen',
  'ui.site.and-more': '{count, plural, one {und # weitere Seite} other {und # weitere Seiten}}',
  'ui.site.pages': 'Seiten',
  'ui.site.untitled': 'Kein Titel',
  'ui.site.more':
    '{count, plural, one {# weitere Seite anzeigen} other {# weitere Seiten anzeigen}}',
  'ui.site.skipped': 'Seiten, die nicht geprüft werden konnten',
  'ui.site.again': 'Eine andere Website prüfen',

  'ui.mentions.title': 'Protokoll der KI-Erwähnungen',
  'ui.mentions.lead':
    'Halten Sie fest, wenn ein KI-Assistent Ihre Website erwähnt oder zitiert. Einträge werden nur in diesem Browser gespeichert.',
  'ui.mentions.add': 'Erwähnung hinzufügen',
  'ui.mentions.edit-title': 'Erwähnung bearbeiten',
  'ui.mentions.observedOn': 'Gesehen am',
  'ui.mentions.assistant': 'KI-Assistent',
  'ui.mentions.assistant.hint': 'Zum Beispiel ChatGPT, Gemini oder Perplexity.',
  'ui.mentions.kind': 'Art',
  'ui.mentions.citedUrl': 'Zitierte Seite Ihrer Website',
  'ui.mentions.citedUrl.hint': 'Erforderlich, wenn die Antwort auf Ihre Website verlinkt hat.',
  'ui.mentions.prompt': 'Was gefragt wurde',
  'ui.mentions.excerpt': 'Was die Antwort sagte',
  'ui.mentions.evidenceUrl': 'Link zur Antwort',
  'ui.mentions.evidenceUrl.hint':
    'Ein geteilter Link zur Unterhaltung, falls der Assistent einen anbietet.',
  'ui.mentions.method': 'Wie Sie es gesehen haben',
  'ui.mentions.certainty': 'Wie sicher sind Sie?',
  'ui.mentions.notes': 'Notizen',
  'ui.mentions.optional': 'optional',
  'ui.mentions.save': 'Erwähnung speichern',
  'ui.mentions.update': 'Änderungen speichern',
  'ui.mentions.cancel': 'Abbrechen',
  'ui.mentions.saved': 'Erwähnung gespeichert.',
  'ui.mentions.deleted': 'Erwähnung gelöscht.',
  'ui.mentions.fix': 'Bitte korrigieren Sie die unten markierten Felder.',
  'ui.mentions.list': 'Erfasste Erwähnungen',
  'ui.mentions.empty': 'Noch keine Erwähnungen erfasst.',
  'ui.mentions.edit': 'Bearbeiten',
  'ui.mentions.delete': 'Löschen',
  'ui.mentions.delete.confirm': 'Diese Erwähnung löschen? Das lässt sich nicht rückgängig machen.',
  'ui.mentions.summary': 'Zusammenfassung',
  'ui.mentions.total': 'Erfasste Erwähnungen',
  'ui.mentions.citations': 'Mit Link zu Ihrer Website',
  'ui.mentions.uncertain': 'Als unsicher markiert',
  'ui.mentions.period': 'Zuerst und zuletzt gesehen',
  'ui.mentions.by-assistant': 'Nach Assistent',
  'ui.mentions.by-month': 'Nach Monat',
  'ui.mentions.cited-pages': 'Am häufigsten zitierte Seiten',
  'ui.mentions.count': 'Erwähnungen',
  'ui.mentions.export': 'Eine Kopie behalten',
  'ui.mentions.export.json': 'Protokoll herunterladen (JSON)',
  'ui.mentions.export.csv': 'Für Tabellenkalkulationen herunterladen (CSV)',
  'ui.mentions.import': 'Protokoll importieren',
  'ui.mentions.imported':
    '{count, plural, one {# Erwähnung importiert.} other {# Erwähnungen importiert.}}',
  'ui.mentions.clear': 'Alle Erwähnungen löschen',
  'ui.mentions.clear.confirm':
    'Alle {count} Erwähnungen aus diesem Browser löschen? Laden Sie vorher eine Kopie herunter, wenn Sie sie behalten möchten.',
  'ui.mentions.storage-error':
    'Dieser Browser hat das Speichern nicht erlaubt. Privates Surfen oder voller Speicher können die Ursache sein. Laden Sie eine Kopie herunter, damit nichts verloren geht.',

  'ui.privacy.title': 'Ihre Daten',
  'ui.privacy.lead': 'SearchUnveil läuft vollständig in Ihrem Browser.',
  'ui.privacy.lead.server':
    'SearchUnveil prüft Seiten in Ihrem Browser. Sein Server hilft nur, wenn Sie darum bitten.',
  'ui.privacy.lead.claude':
    'SearchUnveil arbeitet in Ihrem Browser. Nur die KI-Analyse sendet Daten, und nur wenn Sie sie anfordern.',
  'ui.privacy.address':
    'Wenn Sie per Adresse prüfen, lädt der Server diese öffentliche Seite und ihre robots.txt und gibt sie an Ihren Browser weiter. Er speichert nichts.',
  'ui.privacy.ai.server':
    'Wenn Sie eine KI-Analyse anfordern, gehen die Ergebnisse, die Seitenangaben und der Anfang des sichtbaren Seitentexts über den Server an Claude von Anthropic. Ihre Dateien nicht.',
  'ui.privacy.ai.claude':
    'Wenn Sie eine KI-Analyse anfordern, gehen die Ergebnisse, die Seitenangaben und der Anfang des sichtbaren Seitentexts über Ihr Konto an Claude. Ihre Dateien nicht.',
  'ui.privacy.network.server':
    'Die Sicherheitsrichtlinie der Seite erlaubt Verbindungen nur zu ihrem eigenen Server.',
  'ui.privacy.files':
    'Dateien, die Sie analysieren, werden im Arbeitsspeicher gelesen. Sie werden nie gespeichert oder hochgeladen.',
  'ui.privacy.stored':
    'Dieser Browser speichert nur Ihr Protokoll der KI-Erwähnungen sowie Ihre Sprach- und Designauswahl.',
  'ui.privacy.network':
    'Nachdem die Seite geladen ist, blockiert ihre Sicherheitsrichtlinie jede Netzwerkverbindung. So können Ihre Daten Ihr Gerät nicht verlassen.',
  'ui.privacy.tracking': 'Es gibt keine Cookies, keine Analyse und keine Tracker.',
  'ui.privacy.clear': 'Alles löschen, was in diesem Browser gespeichert ist',
  'ui.privacy.clear.confirm':
    'Ihr Protokoll der Erwähnungen und Ihre Einstellungen aus diesem Browser löschen?',
  'ui.privacy.cleared':
    'Alles, was SearchUnveil in diesem Browser gespeichert hatte, wurde gelöscht.',

  'ui.not-found.title': 'Seite nicht gefunden',
  'ui.not-found.back': 'Zur Übersicht',
};
