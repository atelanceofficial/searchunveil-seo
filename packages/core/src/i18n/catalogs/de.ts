import type { CoreCatalog } from './en.ts';

/** Deutsch (Sie-Form). Anführungszeichen „…“, geschützte Leerzeichen vor Prozent- und Maßeinheiten. */
export const de: CoreCatalog = {
  'status.attention': 'Braucht Aufmerksamkeit',
  'status.review': 'Einen Blick wert',
  'status.good': 'Sieht gut aus',
  'status.info': 'Gut zu wissen',

  'metric.clicks': 'Klicks',
  'metric.impressions': 'Impressionen',
  'metric.ctr': 'Klickrate',
  'metric.position': 'Durchschnittliche Position',
  'metric.clicks.help': 'Wie oft Menschen aus der Google-Suche auf Ihre Website geklickt haben.',
  'metric.impressions.help':
    'Wie oft ein Link zu Ihrer Website in Suchergebnissen erschien, die jemand gesehen hat.',
  'metric.ctr.help': 'Der Anteil der Impressionen, aus denen Klicks wurden.',
  'metric.position.help':
    'Wo Ihre Website in den Ergebnissen meist erschien. Niedriger ist besser: 1 ist ganz oben auf der Seite.',

  'evidence.recent-period': 'Aktueller Zeitraum',
  'evidence.previous-period': 'Vorheriger Zeitraum',
  'evidence.period': '{range}',
  'evidence.change': 'Veränderung',
  'evidence.first-day': 'Erster Tag',
  'evidence.last-day': 'Letzter Tag',
  'evidence.impressions-on': 'Impressionen am {day}',
  'evidence.typical-impressions': 'Typischer Tag',
  'evidence.head-breaker': 'Hat den Head beendet',
  'evidence.title': 'Titel',
  'evidence.description': 'Beschreibung',
  'evidence.viewport': 'Viewport',
  'evidence.canonical': 'Canonical-Link',
  'evidence.heading': 'Überschrift',
  'evidence.heading-level': 'h{level}',
  'evidence.status': 'Statuscode',
  'evidence.final-address': 'Endgültige Adresse',
  'evidence.redirect': 'Weiterleitungen',
  'evidence.header': 'Header',
  'evidence.robots-rule': 'robots.txt-Regel',
  'evidence.response-time': 'Antwortzeit (Sekunden)',
  'table.query': 'Suchanfrage',
  'table.page': 'Seite',
  'table.text': '{text}',
  'table.typical-ctr': 'Typisch für Ihre Website',
  'table.primary-period': 'Hauptzeitraum',
  'table.comparison-period': 'Vergleichszeitraum',
  'table.tag': 'Tag',
  'table.image': 'Bild',
  'table.link': 'Link',

  'ref.gsc-metrics': 'Search Console-Hilfe: was Impressionen, Position und Klicks bedeuten',
  'ref.gsc-performance': 'Search Console-Hilfe: Leistungsbericht',
  'ref.title-links': 'Google Search Central: Titellinks beeinflussen',
  'ref.snippets': 'Google Search Central: Snippets und Meta-Beschreibungen',
  'ref.robots-meta': 'Google Search Central: Robots-Meta-Tag',
  'ref.canonical': 'Google Search Central: kanonische URLs',
  'ref.hreflang': 'Google Search Central: lokalisierte Versionen von Seiten',
  'ref.structured-data': 'Google Search Central: Einführung in strukturierte Daten',
  'ref.rich-results-test': 'Google-Test für Rich-Suchergebnisse',
  'ref.images': 'Google Search Central: Best Practices für Bilder',
  'ref.valid-metadata': 'Google Search Central: gültige Seitenmetadaten verwenden',
  'ref.crawlable-links': 'Google Search Central: crawlbare Links',
  'ref.wcag-language': 'WCAG 2.2: Sprache der Seite (3.1.1)',
  'ref.wcag-non-text': 'WCAG 2.2: Nicht-Text-Inhalt (1.1.1)',
  'ref.wcag-resize': 'WCAG 2.2: Textgröße ändern (1.4.4)',
  'ref.wcag-link-purpose': 'WCAG 2.2: Linkzweck (2.4.4)',
  'ref.wcag-structure': 'WCAG 2.2: Info und Beziehungen (1.3.1)',
  'ref.viewport': 'MDN: das Viewport-Meta-Tag',
  'ref.open-graph': 'Das Open-Graph-Protokoll',
  'ref.robots-txt': 'Google Search Central: Einführung in robots.txt',
  'ref.http-status': 'Google Search Central: HTTP-Statuscodes und Netzwerkfehler',
  'ref.https': 'web.dev: Warum HTTPS wichtig ist',

  'gsc.headline.method':
    'Wir haben {current} mit {previous} verglichen und dabei jeden Tag dem gleichen Wochentag gegenübergestellt.',
  'gsc.headline.up-up': 'Mehr Menschen haben Ihre Seiten gefunden und besucht.',
  'gsc.headline.up-flat':
    'Mehr Menschen haben geklickt, während Ihre Seiten etwa gleich oft erschienen.',
  'gsc.headline.up-down': 'Die Klicks sind gestiegen, obwohl Ihre Seiten seltener erschienen.',
  'gsc.headline.flat-up':
    'Ihre Seiten erschienen häufiger in der Suche, aber die Klicks blieben etwa gleich.',
  'gsc.headline.flat-flat': 'Die Suchleistung blieb etwa gleich.',
  'gsc.headline.flat-down': 'Ihre Seiten erschienen seltener, aber die Klicks blieben etwa gleich.',
  'gsc.headline.down-up': 'Ihre Seiten erschienen häufiger, aber weniger Menschen haben geklickt.',
  'gsc.headline.down-flat':
    'Weniger Menschen haben geklickt, während Ihre Seiten etwa gleich oft erschienen.',
  'gsc.headline.down-down': 'Ihre Seiten erschienen seltener und erhielten weniger Klicks.',
  'gsc.headline.impressions-up':
    'Ihre Seiten erschienen häufiger in der Suche. Für einen Vergleich gibt es noch zu wenige Klicks.',
  'gsc.headline.impressions-flat':
    'Ihre Seiten erschienen etwa so oft wie zuvor. Für einen Vergleich gibt es noch zu wenige Klicks.',
  'gsc.headline.impressions-down':
    'Ihre Seiten erschienen seltener in der Suche. Für einen Vergleich gibt es noch zu wenige Klicks.',
  'gsc.headline.insufficient':
    'Es gibt noch nicht genug Suchdaten, um Zeiträume verlässlich zu vergleichen.',

  'gsc.check.growth-drivers':
    'Finden Sie die Seiten und Suchanfragen hinter dem Wachstum und halten Sie diese Inhalte korrekt und aktuell.',
  'gsc.check.queries-gained':
    'Vergleichen Sie die Suchanfragen beider Zeiträume, um zu sehen, welche Impressionen gewonnen haben und ob sie zu Ihren Seiten passen.',
  'gsc.check.titles':
    'Prüfen Sie Titel und Beschreibungen der betroffenen Seiten. Diese lesen Menschen, bevor sie entscheiden, ob sie klicken.',
  'gsc.check.position-shift':
    'Prüfen Sie die durchschnittliche Position: Neue Einblendungen beginnen oft weiter unten auf der Seite, wo weniger Menschen klicken.',
  'gsc.check.lost-visibility':
    'Finden Sie die Seiten und Suchanfragen, die Impressionen verloren haben, und prüfen Sie, ob diese Seiten noch funktionieren und indexiert werden können.',
  'gsc.check.site-changes':
    'Denken Sie an kürzliche Änderungen an der Website, etwa ein Redesign, verschobene oder gelöschte Seiten oder neue Robots-Regeln.',
  'gsc.check.seasonality':
    'Vergleichen Sie mit denselben Wochen des Vorjahres. Das Interesse an vielen Themen schwankt mit den Jahreszeiten.',
  'gsc.check.serp-features':
    'Suchen Sie selbst nach Ihren wichtigsten Suchanfragen. Anzeigen, Videos oder KI-generierte Antworten auf der Ergebnisseite können Klicks abziehen.',
  'gsc.check.opportunities':
    'Unten finden Sie Chancen für Suchanfragen und Seiten, die mehr Klicks erzielen könnten.',
  'gsc.check.export-longer':
    'Exportieren Sie einen längeren Zeitraum aus der Search Console, am besten die letzten 3 Monate, für ein klareres Bild.',
  'gsc.check.focused-page':
    'Sorgen Sie dafür, dass jeweils eine klare, aktuelle Seite die Suchanfrage beantwortet, und verlinken Sie sie von verwandten Seiten.',
  'gsc.check.search-intent':
    'Suchen Sie nach den Suchanfragen, bei denen diese Seiten erscheinen, und prüfen Sie, ob die Seiten beantworten, was Menschen wissen wollen.',

  'gsc.change.clicks.up': 'Die Klicks sind um {change} auf {current} gestiegen.',
  'gsc.change.clicks.down': 'Die Klicks sind um {change} auf {current} gesunken.',
  'gsc.change.clicks.flat': 'Die Klicks blieben mit {current} etwa gleich.',
  'gsc.change.clicks.started': 'Die Klicks stiegen von null auf {current}.',
  'gsc.change.impressions.up': 'Die Impressionen sind um {change} auf {current} gestiegen.',
  'gsc.change.impressions.down': 'Die Impressionen sind um {change} auf {current} gesunken.',
  'gsc.change.impressions.flat': 'Die Impressionen blieben mit {current} etwa gleich.',
  'gsc.change.impressions.started': 'Die Impressionen stiegen von null auf {current}.',
  'gsc.change.ctr.up': 'Die Klickrate stieg von {previous} auf {current}.',
  'gsc.change.ctr.down': 'Die Klickrate sank von {previous} auf {current}.',
  'gsc.change.ctr.flat': 'Die Klickrate blieb mit {current} etwa gleich.',
  'gsc.change.position.better':
    'Die durchschnittliche Position hat sich von {previous} auf {current} verbessert.',
  'gsc.change.position.worse':
    'Die durchschnittliche Position hat sich von {previous} auf {current} verschlechtert.',
  'gsc.change.position.flat': 'Die durchschnittliche Position blieb mit {current} etwa gleich.',
  'gsc.daybyday.higher':
    'Der Wert lag an {count} von {days} Tagen höher als am gleichen Wochentag des vorherigen Zeitraums.',
  'gsc.daybyday.lower':
    'Der Wert lag an {count} von {days} Tagen niedriger als am gleichen Wochentag des vorherigen Zeitraums.',
  'gsc.daybyday.uneven':
    'Von Tag zu Tag war die Veränderung ungleichmäßig ({higher} Tage höher, {lower} Tage niedriger). Wenige Tage könnten also den Großteil erklären.',

  'gsc.limit.weekday-matching':
    'Jeder Zeitraum umfasst ganze Wochen, sodass Muster von Werktagen und Wochenenden den Vergleich nicht verzerren.',
  'gsc.limit.ctr-features':
    'Die Klickrate hängt auch davon ab, was die Ergebnisseite sonst zeigt, etwa Anzeigen, Videos oder KI-generierte Antworten.',
  'gsc.limit.position-mix':
    'Die durchschnittliche Position ändert sich auch, wenn sich die Mischung der Suchanfragen ändert, nicht nur, wenn sich Rankings bewegen.',
  'gsc.limit.position-average':
    'Die durchschnittliche Position fasst viele Suchvorgänge zusammen. In einzelnen Suchen kann eine Seite höher oder tiefer erscheinen.',

  'gsc.opportunity.low-ctr.query':
    '{count, plural, one {# Suchanfrage erhält} other {# Suchanfragen erhalten}} weniger Klicks als ähnliche Ergebnisse',
  'gsc.opportunity.low-ctr.page':
    '{count, plural, one {# Seite erhält} other {# Seiten erhalten}} weniger Klicks als ähnliche Ergebnisse',
  'gsc.opportunity.low-ctr.summary':
    'Sie erscheinen unter den ersten zehn Ergebnissen, doch ihre Klickrate erreicht nicht einmal {share} dessen, was Ihre anderen Ergebnisse an ähnlicher Position erzielen.',
  'gsc.opportunity.near-top.query':
    '{count, plural, one {# Suchanfrage rankt} other {# Suchanfragen ranken}} knapp hinter den ersten zehn',
  'gsc.opportunity.near-top.page':
    '{count, plural, one {# Seite rankt} other {# Seiten ranken}} knapp hinter den ersten zehn',
  'gsc.opportunity.near-top.summary':
    'Ihre durchschnittliche Position liegt zwischen {from} und {to}, und sie werden oft gesucht. Eine bessere Seite dazu könnte sie in Sichtweite bringen.',
  'gsc.opportunity.zero-click-pages':
    '{count, plural, one {# Seite wird gesehen, aber nie angeklickt} other {# Seiten werden gesehen, aber nie angeklickt}}',
  'gsc.opportunity.zero-click-pages.summary':
    'Jede erschien mindestens {min}-mal in Suchergebnissen, ohne einen einzigen Klick.',
  'gsc.movers.gains':
    '{kind, select, page {Seiten} other {Suchanfragen}} mit den größten Zuwächsen bei Klicks',
  'gsc.movers.losses':
    '{kind, select, page {Seiten} other {Suchanfragen}} mit den größten Verlusten bei Klicks',

  'gsc.note.no-dates':
    'Dieser Export enthält keine Tagesdaten, daher können keine Trends gezeigt werden.',
  'gsc.note.short-range':
    'Dieser Export umfasst {days, plural, one {# Tag} other {# Tage}}: zu kurz, um zwei Zeiträume zu vergleichen.',
  'gsc.note.missing-days':
    '{count, plural, one {Für # Tag fehlen Daten} other {Für # Tage fehlen Daten}}',
  'gsc.note.missing-days.summary':
    'Tage ohne Zeile hatten meist keine Impressionen. Wir haben sie als null gezählt.',
  'gsc.note.incomplete-days':
    '{count, plural, one {Der letzte Tag wirkt unvollständig} other {Die letzten # Tage wirken unvollständig}}',
  'gsc.note.incomplete-days.summary':
    'Die Search Console verarbeitet aktuelle Daten möglicherweise noch. Wir haben {count, plural, one {diesen Tag} other {diese Tage}} beim Vergleich ausgelassen.',
  'gsc.note.anonymized-queries': 'Die Tabelle „Suchanfragen“ deckt {share} aller Klicks ab',
  'gsc.note.anonymized-queries.summary':
    'Die Search Console listet seltene Suchanfragen zum Schutz der Privatsphäre nicht auf und exportiert höchstens {limit} Zeilen. Die Summen der Tabelle „Suchanfragen“ sind daher niedriger als die Summen im Diagramm.',
  'gsc.note.row-limit':
    '{kind, select, query {Die Tabelle „Suchanfragen“} page {Die Tabelle „Seiten“} country {Die Tabelle „Länder“} other {Eine Tabelle}} hat {limit} Zeilen erreicht',
  'gsc.note.row-limit.summary':
    'Das ist das Exportlimit der Search Console, daher fehlen möglicherweise seltenere {kind, select, query {Suchanfragen} page {Seiten} country {Länder} other {Zeilen}}.',
  'gsc.note.partial-totals':
    'Die Summen stammen aus der Tabelle {kind, select, query {„Suchanfragen“} page {„Seiten“} country {„Länder“} device {„Geräte“} other {des Exports}}',
  'gsc.note.partial-totals.summary':
    '{kind, select, query {Seltene Suchanfragen werden aus Datenschutzgründen ausgeblendet, daher liegen diese Summen unter den tatsächlichen Summen Ihrer Website.} page {Wenn mehrere Ihrer Seiten in derselben Suche erscheinen, zählt jede einzeln. Diese Summen können daher von den Summen Ihrer Website abweichen.} other {Sie können von den Summen Ihrer Website abweichen. Fügen Sie für vollständige Summen die Tabelle mit den Tagesdaten hinzu.}}',
  'gsc.note.comparison-export': 'Dieser Export vergleicht „{primary}“ mit „{comparison}“.',
  'gsc.note.comparison-export.unlabeled': 'Dieser Export vergleicht zwei Zeiträume.',
  'gsc.note.filters': 'Export-Einstellungen',

  'page.limit.source':
    'Wir haben das von Ihnen bereitgestellte HTML geprüft. Inhalte, die JavaScript nach dem Laden der Seite hinzufügt, sind nicht enthalten.',
  'page.limit.scope':
    'HTTP-Header, robots.txt, Geschwindigkeit und Links von anderen Websites sind für die Suche ebenfalls wichtig. Sie sind nicht Teil dieser Prüfung.',
  'page.limit.width':
    'Suchergebnisse messen die Breite in Pixeln, nicht in Zeichen. Dies ist daher eine Schätzung.',
  'page.head.ok': 'Alle wichtigen Tags stehen im Head',
  'page.head.broken':
    '{count, plural, one {# wichtiges Tag ist} other {# wichtige Tags sind}} außerhalb des Heads gelandet',
  'page.head.broken.summary':
    'Vor {count, plural, one {diesem Tag} other {diesen Tags}} stand etwas, das nicht in den Head gehört, daher hat der Browser den Head vorzeitig beendet. Suchmaschinen ignorieren diese Tags außerhalb des Heads.',
  'page.head.noscript':
    '{count, plural, one {# Tag nach einem noscript-Block wird eventuell ignoriert} other {# Tags nach einem noscript-Block werden eventuell ignoriert}}',
  'page.head.noscript.summary':
    'Ein Bild oder ein ähnliches Element in einem noscript-Block im Head beendet den Head für Tools, die kein JavaScript ausführen. Browser, die JavaScript ausführen, sind nicht betroffen.',
  'page.check.head':
    'Verschieben Sie das unerwartete Element unter den Head oder diese Tags darüber.',
  'page.check.noscript':
    'Verschieben Sie den noscript-Block ans Ende des Heads, hinter die wichtigen Tags.',
  'page.robots.noindex': 'Die Seite bittet Suchmaschinen, sie nicht in den Ergebnissen zu zeigen',
  'page.robots.noindex.summary':
    'Mit noindex markierte Seiten erscheinen nicht in Suchergebnissen. Für private oder doppelte Seiten ist das richtig, überall sonst ein teurer Fehler.',
  'page.check.robots':
    'Wenn diese Seite in der Suche erscheinen soll, entfernen Sie noindex aus ihrem Robots-Meta-Tag.',
  'page.robots.nofollow': 'Die Seite bittet Suchmaschinen, ihren Links nicht zu folgen',
  'page.robots.nofollow.summary':
    'Suchmaschinen nutzen die Links auf dieser Seite nicht, um andere Seiten zu entdecken.',
  'page.robots.limited': 'Die Seite schränkt ein, wie Suchmaschinen sie zeigen dürfen',
  'page.robots.limited.summary':
    'Regeln wie nosnippet oder max-snippet ändern, wie die Seite in den Ergebnissen erscheint.',
  'page.robots.indexable': 'Nichts im HTML verhindert die Indexierung',
  'page.robots.indexable.summary':
    'Wir haben keine noindex-Regel in der Seite gefunden. Regeln können auch aus HTTP-Headern oder der robots.txt stammen, die das HTML nicht zeigt.',
  'page.title.why':
    'Suchmaschinen zeigen den Titel meist als Link zu Ihrer Seite, und Browser zeigen ihn in Tabs und Lesezeichen.',
  'page.check.title':
    'Schreiben Sie einen kurzen, eindeutigen Titel, der sagt, was die Seite bietet, mit den wichtigsten Wörtern zuerst.',
  'page.title.missing': 'Die Seite hat keinen Titel',
  'page.title.empty': 'Der Titel der Seite ist leer',
  'page.title.multiple': 'Die Seite hat {count} Titel',
  'page.title.multiple.summary':
    'Browser verwenden den ersten, Suchmaschinen können jeden verwenden. Behalten Sie genau einen.',
  'page.title.short': 'Der Titel ist sehr kurz',
  'page.title.short.summary':
    'Ein Titel wie „Startseite“ sagt Suchenden selten, was die Seite bietet.',
  'page.title.long': 'Der Titel wird in Suchergebnissen eventuell gekürzt',
  'page.title.long.summary':
    'Er ist etwa {length} Zeichen lang. Meist passen etwa {fit}, bevor Suchergebnisse ihn abschneiden.',
  'page.title.ok': 'Der Titel ist vorhanden und sinnvoll lang',
  'page.description.why':
    'Eine Meta-Beschreibung ist optional, und Google schreibt oft ein eigenes Snippet. Eine gute Beschreibung kann trotzdem helfen, dass Menschen Ihr Ergebnis wählen.',
  'page.check.description':
    'Schreiben Sie ein oder zwei Sätze, die die Seite für jemanden zusammenfassen, der überlegt, ob er klickt.',
  'page.description.missing': 'Die Seite hat keine Meta-Beschreibung',
  'page.description.empty': 'Die Meta-Beschreibung ist leer',
  'page.description.multiple': 'Die Seite hat {count} Meta-Beschreibungen',
  'page.description.multiple.summary':
    'Behalten Sie genau eine, damit klar ist, welche verwendet wird.',
  'page.description.long': 'Die Beschreibung wird in Suchergebnissen eventuell gekürzt',
  'page.description.long.summary':
    'Sie ist etwa {length} Zeichen lang. In ein Snippet passen meist etwa {fit}.',
  'page.description.ok': 'Die Seite hat eine Meta-Beschreibung',
  'page.lang.missing': 'Die Seite gibt ihre Sprache nicht an',
  'page.lang.invalid': 'Der Sprachcode {value} ist ungültig',
  'page.lang.why':
    'Screenreader nutzen die Sprache, um Text richtig auszusprechen, und Browser, um eine Übersetzung anzubieten.',
  'page.check.lang':
    'Fügen Sie dem html-Element ein lang-Attribut hinzu, etwa lang="de" oder lang="en".',
  'page.lang.ok': 'Die Seite gibt ihre Sprache an: {value}',
  'page.viewport.missing': 'Die Seite ist nicht für Smartphones eingerichtet',
  'page.viewport.why':
    'Ohne Viewport-Meta-Tag zeigen Smartphones die Seite verkleinert wie eine Desktop-Seite. Google verwendet für die Indexierung überwiegend die mobile Version von Seiten.',
  'page.check.viewport':
    'Fügen Sie <meta name="viewport" content="width=device-width, initial-scale=1"> in den Head ein.',
  'page.viewport.zoom-blocked': 'Die Seite verhindert, dass Besucher zoomen',
  'page.viewport.zoom-blocked.summary':
    'Wer das Zoomen blockiert, erschwert Menschen mit Sehschwäche das Lesen. Entfernen Sie user-scalable=no und jedes maximum-scale unter 2.',
  'page.viewport.ok': 'Die Seite ist für Smartphones eingerichtet',
  'page.canonical.missing': 'Die Seite hat keinen Canonical-Link',
  'page.canonical.missing.summary':
    'Für die meisten Seiten ist das in Ordnung. Ist derselbe Inhalt unter mehreren Adressen erreichbar, sagt ein Canonical-Link Suchmaschinen, welche Sie bevorzugen.',
  'page.canonical.multiple': 'Die Seite hat {count} widersprüchliche Canonical-Links',
  'page.canonical.multiple.summary':
    'Wenn Canonical-Links auf verschiedene Seiten zeigen, ignorieren Suchmaschinen womöglich alle.',
  'page.canonical.invalid': 'Der Canonical-Link {href} ist keine gültige Adresse',
  'page.canonical.relative': 'Der Canonical-Link verwendet eine relative Adresse',
  'page.canonical.relative.summary':
    'Das funktioniert, aber eine vollständige Adresse mit https:// vermeidet Fehler, und Google empfiehlt sie.',
  'page.canonical.other-site': 'Der Canonical-Link zeigt auf eine andere Website: {host}',
  'page.canonical.other-site.summary':
    'Suchmaschinen zeigen dann womöglich die Seite dieser Website statt dieser hier. Das ist nur beabsichtigt, wenn diese Seite eine Kopie ist.',
  'page.canonical.other-page': 'Der Canonical-Link zeigt auf eine andere Seite',
  'page.canonical.other-page.summary':
    'Suchmaschinen behandeln diese Seite womöglich als Duplikat und zeigen stattdessen die andere.',
  'page.canonical.self': 'Der Canonical-Link zeigt auf diese Seite',
  'page.canonical.present': 'Die Seite hat einen Canonical-Link',
  'page.h1.missing': 'Die Seite hat keine Hauptüberschrift (h1)',
  'page.h1.why':
    'Eine Hauptüberschrift sagt Besuchern, auch Menschen mit Screenreader, worum es auf der Seite geht.',
  'page.h1.multiple': 'Die Seite hat {count} Hauptüberschriften (h1)',
  'page.h1.multiple.summary':
    'Das ist erlaubt. Eine einzige Hauptüberschrift macht die Struktur aber meist klarer.',
  'page.headings.skipped': 'Die Überschriftenebenen springen von h{from} zu h{to}',
  'page.headings.skipped.summary':
    'Viele Screenreader-Nutzende bewegen sich über die Überschriften durch eine Seite. Eine übersprungene Ebene kann den Eindruck erwecken, dass Inhalt fehlt.',
  'page.headings.empty':
    '{count, plural, one {# Überschrift ist} other {# Überschriften sind}} leer',
  'page.headings.empty.summary':
    'Screenreader kündigen leere Überschriften an, doch sie sagen nichts.',
  'page.headings.ok':
    '{count, plural, one {Die Überschrift bildet} other {Die # Überschriften bilden}} eine klare Gliederung',
  'page.images.missing-alt':
    '{count, plural, one {# Bild hat} other {# Bilder haben}} keine Textalternative',
  'page.images.missing-alt.summary':
    'Screenreader können diese Bilder nicht beschreiben, und Suchmaschinen verstehen sie schlechter. Beschreiben Sie jedes Bild im alt-Attribut, oder verwenden Sie ein leeres alt für rein dekorative Bilder.',
  'page.images.ok':
    '{count, plural, one {Das Bild hat} other {Alle # Bilder haben}} eine Textalternative',
  'page.links.unnamed': '{count, plural, one {# Link hat} other {# Links haben}} keinen Text',
  'page.links.unnamed.summary':
    'Screenreader kündigen diese Links an, ohne zu sagen, wohin sie führen. Fügen Sie sichtbaren Text hinzu oder ein aria-label für Icon-Links.',
  'page.links.javascript':
    '{count, plural, one {# Link führt} other {# Links führen}} JavaScript aus, statt auf eine Adresse zu verweisen',
  'page.links.javascript.summary':
    'Suchmaschinen können diesen Links nicht folgen. Tragen Sie in das href jedes Links eine echte Adresse ein.',
  'page.links.summary':
    'Die Seite verlinkt auf {total, plural, one {# Adresse} other {# Adressen}}: {internal} auf dieser Website und {external} anderswo',
  'page.links.nofollow':
    '{count, plural, one {# Link ist} other {# Links sind}} als nofollow markiert.',
  'page.structured-data.invalid':
    '{count, plural, one {# Block strukturierter Daten ist} other {# Blöcke strukturierter Daten sind}} nicht lesbar',
  'page.structured-data.invalid.summary':
    'Suchmaschinen ignorieren strukturierte Daten, die kein gültiges JSON sind.',
  'page.structured-data.found': 'Die Seite enthält strukturierte Daten: {types}',
  'page.structured-data.untyped': 'Die Seite enthält strukturierte Daten ohne Typ',
  'page.structured-data.found.summary':
    'Wir haben geprüft, dass sie lesbar sind. Ob sie für Rich-Suchergebnisse infrage kommen, zeigt Googles Test für Rich-Suchergebnisse.',
  'page.hreflang.invalid': 'Einige Sprachangaben verwenden ungültige Codes: {values}',
  'page.hreflang.invalid.summary':
    'Verwenden Sie Sprachcodes wie en, en-GB oder zh-Hans oder den Wert x-default. Der Code für das Vereinigte Königreich ist GB, nicht UK.',
  'page.hreflang.no-self': 'Die Sprachangaben enthalten diese Seite nicht',
  'page.hreflang.no-self.summary':
    'Jede Sprachversion sollte sich selbst ebenso auflisten wie die anderen.',
  'page.hreflang.ok':
    'Die Seite listet {count, plural, one {# Sprachversion} other {# Sprachversionen}} auf',
  'page.hreflang.limit':
    'Wir können nur diese Seite prüfen. Jede aufgelistete Seite muss zurückverlinken, sonst ignorieren Suchmaschinen die Angaben.',
  'page.charset.missing': 'Die Seite gibt ihre Zeichenkodierung nicht an',
  'page.charset.missing.summary':
    'Sofern der Server sie nicht angibt, raten Browser womöglich falsch und zeigen Zeichen fehlerhaft an. Fügen Sie <meta charset="utf-8"> am Anfang des Heads ein.',
  'page.charset.legacy': 'Die Seite verwendet die Zeichenkodierung {value}',
  'page.charset.legacy.summary': 'Für das Web wird UTF-8 empfohlen; es deckt jede Sprache ab.',
  'page.charset.ok': 'Die Seite gibt UTF-8 als Kodierung an',
  'page.social.missing': 'Linkvorschauen sind womöglich unvollständig: {tags} fehlen',
  'page.social.missing.summary':
    'Soziale Netzwerke und Chat-Apps erstellen Linkvorschauen mit Open-Graph-Tags. Auf das Ranking in der Suche haben sie keinen Einfluss.',
  'page.social.ok': 'Die Seite hat Tags für Linkvorschauen',
  'page.limit.fetched':
    'Wir haben das HTML geprüft, das der Server für diese Adresse gesendet hat. Inhalte, die JavaScript nach dem Laden der Seite hinzufügt, sind nicht enthalten.',
  'page.limit.scope.fetched':
    'Ladegeschwindigkeit und Links von anderen Websites sind für die Suche ebenfalls wichtig. Sie sind nicht Teil dieser Prüfung.',

  'http.status': 'Der Server hat mit Status {status} statt mit der Seite geantwortet',
  'http.status.summary':
    'Suchmaschinen indexieren Seiten, die mit einem Erfolgsstatus (200) antworten. Fehler- und Weiterleitungsstatus halten diese Adresse aus den Ergebnissen heraus.',
  'http.check.status':
    'Öffnen Sie die Adresse im Browser und prüfen Sie die Server- oder Hosting-Einstellung, die diesen Status liefert.',
  'http.https': 'Die Seite wird ohne HTTPS ausgeliefert',
  'http.https.summary':
    'Browser kennzeichnen Seiten ohne HTTPS als nicht sicher, und Suchmaschinen bevorzugen die sichere Version einer Seite.',
  'http.check.https':
    'Installieren Sie ein Zertifikat und leiten Sie jede http://-Adresse auf ihre https://-Version weiter.',
  'http.x-robots-tag':
    'Der Server weist Suchmaschinen an, die Seite nicht in den Ergebnissen zu zeigen',
  'http.x-robots-tag.summary':
    'Der X-Robots-Tag-Header wirkt wie ein Robots-Meta-Tag, wird aber vom Server gesetzt und ist deshalb im HTML leicht zu übersehen.',
  'http.check.x-robots-tag':
    'Wenn diese Seite in der Suche erscheinen soll, entfernen Sie noindex aus dem X-Robots-Tag-Header in den Server- oder Hosting-Einstellungen.',
  'http.robots-txt': 'robots.txt sperrt Suchmaschinen für diese Seite',
  'http.robots-txt.summary':
    'Der Googlebot crawlt keine Adressen, die robots.txt verbietet, und kann den Inhalt dieser Seite daher nicht lesen.',
  'http.check.robots-txt':
    'Wenn diese Seite in der Suche erscheinen soll, entfernen Sie die Regel aus robots.txt oder fassen Sie sie enger.',
  'http.robots-txt.unreadable': 'Wir konnten die robots.txt der Website nicht lesen',
  'http.robots-txt.unreadable.summary':
    'Antwortet robots.txt mit einem Serverfehler, crawlt Google die ganze Website nicht mehr, bis die Datei wieder lesbar ist. Prüfen Sie, ob sie sich öffnen lässt.',
  'http.redirects':
    'Die Adresse leitet {count, plural, one {einmal} other {#-mal}} weiter, bevor die Seite erreicht ist',
  'http.redirects.summary':
    'Jede Weiterleitung kostet Besucher und Crawler eine zusätzliche Anfrage. Verlinken Sie direkt die endgültige Adresse.',
  'http.ok': 'Der Server liefert die Seite ohne Hindernisse aus',
  'http.ok.summary':
    'Er antwortet über HTTPS mit Erfolg, und weder robots.txt noch die Header des Servers halten Suchmaschinen fern.',

  'analyst.do.status': 'Sorgen Sie dafür, dass diese Adresse die Seite liefert',
  'analyst.do.status.how':
    'Der Server antwortet mit Status {status}. Ist die Seite umgezogen, leiten Sie die alte Adresse mit 301 auf die neue weiter; wurde sie versehentlich entfernt, stellen Sie sie wieder her; schlägt der Server fehl, bitten Sie Ihren Hoster, die Fehlerprotokolle zu prüfen.',
  'analyst.do.https': 'Stellen Sie die Website auf HTTPS um',
  'analyst.do.https.how':
    'Aktivieren Sie im Hosting-Panel ein Zertifikat (viele Hoster bieten kostenlose Let’s-Encrypt-Zertifikate), leiten Sie jede http://-Adresse mit 301 auf ihre https://-Version weiter und verwenden Sie dann {url} im Canonical-Link und in der Sitemap.',
  'analyst.do.header-noindex': 'Entfernen Sie noindex aus den Server-Headern',
  'analyst.do.header-noindex.how':
    'Der Server sendet {header}. Entfernen Sie noindex aus diesem Header in den Server-, Hosting- oder CDN-Einstellungen und prüfen Sie die Seite danach erneut.',
  'analyst.do.robots-txt': 'Lassen Sie Suchmaschinen diese Seite crawlen',
  'analyst.do.robots-txt.how':
    'Die robots.txt enthält {rule}, und diese Regel erfasst {path}. Löschen Sie die Zeile oder beschränken Sie sie auf die Adressen, die wirklich draußen bleiben sollen.',
  'analyst.do.robots-txt-error': 'Sorgen Sie dafür, dass robots.txt zuverlässig lädt',
  'analyst.do.robots-txt-error.how':
    'Öffnen Sie {url}. Die Datei sollte schnell mit Status 200 laden oder, wenn Sie keine Regeln brauchen, mit 404 antworten, aber nie mit einem Serverfehler.',
  'analyst.do.redirects': 'Verlinken Sie direkt die endgültige Adresse',
  'analyst.do.redirects.how':
    'Richten Sie Links, Sitemap und Canonical-Link auf {url} aus und lassen Sie jede alte Adresse in einem Schritt dorthin weiterleiten.',
  'analyst.do.noindex': 'Lassen Sie Suchmaschinen die Seite indexieren',
  'analyst.do.noindex.how': 'Entfernen Sie das Robots-Meta-Tag oder ändern Sie es in {snippet}.',
  'analyst.do.nofollow': 'Prüfen Sie, ob den Links der Seite gefolgt werden soll',
  'analyst.do.nofollow.how':
    'Sollen Suchmaschinen den Links dieser Seite folgen, entfernen Sie nofollow aus ihrem Robots-Meta-Tag.',
  'analyst.do.head': 'Bringen Sie die wichtigen Tags zurück in den Head',
  'analyst.do.head.how':
    'Ein Element, das in den Body gehört, steht früh im Head und beendet ihn. Verschieben Sie es in den Body, hinter die title-, meta- und link-Tags.',
  'analyst.do.title-missing': 'Geben Sie der Seite einen Titel',
  'analyst.do.title-missing.how':
    'Fügen Sie dies in den Head ein und passen Sie es an Ihren Ton an: {snippet}',
  'analyst.do.title': 'Formulieren Sie den Titel neu',
  'analyst.do.title.how':
    'Nennen Sie zuerst, was die Seite bietet, und zuletzt Ihre Marke, in etwa 60 Zeichen. Zum Beispiel: {snippet}',
  'analyst.do.description': 'Schreiben Sie eine Meta-Beschreibung',
  'analyst.do.description.how':
    'Fügen Sie dies in den Head ein und passen Sie es an Ihren Ton an: {snippet}',
  'analyst.do.lang': 'Geben Sie die Sprache der Seite an',
  'analyst.do.lang.how':
    'Beginnen Sie die Seite mit {snippet}, damit Screenreader den Text richtig aussprechen und Browser die passende Übersetzung anbieten.',
  'analyst.do.language-mismatch': 'Geben Sie die Sprache an, in der der Text geschrieben ist',
  'analyst.do.language-mismatch.how':
    'Laut Seite ist sie auf {declaredLanguage}, ihr Text ist aber auf {detectedLanguage} geschrieben. Ändern Sie das html-Tag in {snippet}.',
  'analyst.do.viewport': 'Passen Sie die Seite an Smartphone-Bildschirme an',
  'analyst.do.viewport.how':
    'Fügen Sie {snippet} in den Head ein und sperren Sie das Zoomen nicht.',
  'analyst.do.canonical': 'Korrigieren Sie den Canonical-Link',
  'analyst.do.canonical.how':
    'Behalten Sie einen einzigen Canonical-Link im Head, mit der vollständigen Adresse der Seite, die in den Ergebnissen erscheinen soll: {snippet}',
  'analyst.do.h1': 'Geben Sie der Seite eine Hauptüberschrift',
  'analyst.do.h1.how':
    'Fügen Sie oben eine einzige h1 ein, die sagt, was die Seite bietet, zum Beispiel {snippet}.',
  'analyst.do.generic-heading': 'Lassen Sie die Hauptüberschrift sagen, was die Seite bietet',
  'analyst.do.generic-heading.how':
    '„{heading}“ könnte auf jeder Website stehen. Nennen Sie stattdessen das Thema, zum Beispiel {snippet}.',
  'analyst.do.heading-order': 'Korrigieren Sie die Überschriftenebenen',
  'analyst.do.heading-order.how':
    'Verwenden Sie h2 für die Hauptabschnitte und h3 darin, ohne eine Ebene zu überspringen.',
  'analyst.do.heading-empty': 'Füllen oder entfernen Sie leere Überschriften',
  'analyst.do.heading-empty.how':
    'Geben Sie jeder Überschrift sichtbaren Text oder entfernen Sie sie, wenn sie nur Abstand schafft.',
  'analyst.do.alt': 'Beschreiben Sie die Bilder, die etwas aussagen',
  'analyst.do.alt.how':
    '{count, plural, one {Fügen Sie diesem Bild einen Alternativtext hinzu} other {Fügen Sie diesen # Bildern Alternativtexte hinzu}}: ein paar Wörter dazu, was jedes zeigt. Lassen Sie alt bei Dekoration leer. Beginnen Sie mit {examples}.',
  'analyst.do.link-names': 'Geben Sie jedem Link einen Namen',
  'analyst.do.link-names.how':
    '{count, plural, one {Geben Sie diesem Link} other {Geben Sie diesen # Links}} sichtbaren Text, oder ein aria-label bei Icon-Links. Beginnen Sie mit {examples}.',
  'analyst.do.crawlable': 'Verwenden Sie echte Adressen in Links',
  'analyst.do.crawlable.how':
    'Ersetzen Sie javascript:-Links durch einen normalen href auf die Seite, die sie öffnen, damit Suchmaschinen ihnen folgen können.',
  'analyst.do.structured-data': 'Korrigieren Sie die strukturierten Daten',
  'analyst.do.structured-data.how':
    'Fügen Sie jeden JSON-LD-Block in Googles Test für Rich-Suchergebnisse ein, beheben Sie die angezeigten Fehler und testen Sie erneut.',
  'analyst.do.hreflang': 'Korrigieren Sie die Sprachangaben',
  'analyst.do.hreflang.how':
    'Verwenden Sie Codes wie en, en-GB oder tr, führen Sie diese Seite unter ihren eigenen Alternativen auf und sorgen Sie dafür, dass jede aufgeführte Seite zurückverlinkt.',
  'analyst.do.charset': 'Geben Sie UTF-8 an',
  'analyst.do.charset.how': 'Setzen Sie {snippet} an den Anfang des Heads.',
  'analyst.do.social': 'Fügen Sie Tags für Linkvorschauen hinzu',
  'analyst.do.social.how':
    'Fügen Sie diese in den Head ein, damit geteilte Links Titel, Text und Bild zeigen: {snippet}',
  'analyst.do.thin': 'Erzählen Sie mehr über Ihr Angebot',
  'analyst.do.thin.how':
    'Die Seite hat {words} Wörter. Erklären Sie in Ihren eigenen Worten, was Sie anbieten, für wen, wo und was der nächste Schritt ist.',
  'analyst.why.language-mismatch':
    'Screenreader sprechen Text nach der angegebenen Sprache aus, und Browser nutzen sie, um eine Übersetzung anzubieten.',
  'analyst.why.generic-heading':
    'Die Hauptüberschrift sagt Besuchern und Suchmaschinen, worum es auf der Seite geht; eine Begrüßung sagt ihnen nichts.',
  'analyst.why.generic-title':
    '„{title}“ könnte der Titel jeder Seite sein, und der Titel ist das Erste, was Suchende lesen.',
  'analyst.why.thin':
    'Suchmaschinen und Besucher verstehen eine Seite über ihre Wörter. Sehr wenig Text gibt ihnen wenig an die Hand.',
  'analyst.evidence.declared': 'Angegebene Sprache',
  'analyst.evidence.detected': 'Sprache des Texts',
  'analyst.evidence.words': 'Wörter',
  'analyst.note.topic-title':
    'Die Seite handelt vor allem von „{topic}“, aber der Titel erwähnt es nicht.',
  'analyst.note.topic-h1':
    'Die Hauptüberschrift erwähnt „{topic}“ nicht, das Hauptthema der Seite.',
  'analyst.note.topic-description': 'Die Beschreibung erwähnt „{topic}“ nicht.',
  'analyst.note.brand':
    'Der Titel enthält Ihre Marke „{brand}“ nicht. Am Ende eingefügt, hilft sie Menschen, Sie in den Ergebnissen zu erkennen.',
  'analyst.note.thin':
    'Der Text ist recht kurz ({words} Wörter). Achten Sie darauf, dass er beantwortet, wonach Menschen suchen.',
  'analyst.note.long-sentences':
    'Sätze haben im Schnitt {average} Wörter. Kürzere Sätze lesen sich leichter, besonders auf dem Smartphone.',
  'analyst.note.same-title-description':
    'Titel und Beschreibung sagen dasselbe; die Beschreibung kann stattdessen Details ergänzen.',
  'analyst.note.description-short':
    'Die Beschreibung ist kurz ({count} Zeichen); es ist Platz für einen Satz, der zum Klicken einlädt.',
  'analyst.note.headings-few':
    'Die Seite hat keine Abschnittsüberschriften. Überschriften helfen Besuchern beim Überfliegen und Suchmaschinen, den Aufbau zu verstehen.',
  'analyst.note.internal-links':
    'Die Seite verlinkt keine andere Seite Ihrer Website. Links zu verwandten Seiten helfen Besuchern und Suchmaschinen, sie zu finden.',
  'analyst.note.contact':
    'Die Seite zeigt Kontaktdaten. Strukturierte Daten vom Typ LocalBusiness oder Organization können Ihr Unternehmen für Suchmaschinen beschreiben.',
  'analyst.note.prices':
    'Die Seite nennt Preise. Strukturierte Daten vom Typ Product oder Offer können sie für Suchmaschinen beschreiben.',
  'analyst.note.slow':
    'Der Server brauchte {seconds} Sekunden für das HTML. Ziel ist deutlich unter einer Sekunde; Caching oder schnelleres Hosting helfen.',
  'analyst.note.compression':
    'Das HTML ({kilobytes} KB) wird unkomprimiert gesendet. Mit gzip oder Brotli auf dem Server wird es kleiner und schneller.',
  'analyst.note.heavy':
    'Allein das HTML hat {kilobytes} KB. Große Seiten laden auf Smartphones langsam; suchen Sie nach eingebetteten Daten oder Skripten, die Sie auslagern können.',
  'analyst.note.hsts':
    'HTTPS funktioniert, aber der Server sendet kein HSTS, das Browsern sagt, immer die sichere Version zu verwenden.',
  'analyst.note.sitemap':
    'Die robots.txt nennt keine Sitemap. Eine „Sitemap:“-Zeile mit der Adresse Ihrer Sitemap hilft Suchmaschinen, jede Seite zu finden.',
  'analyst.caveat.scope':
    'Diese Analyse liest nur diese Seite. Sie sieht weder Rankings noch Mitbewerber, Links von anderen Websites oder wie schnell sich die Seite auf dem Smartphone anfühlt.',
  'analyst.caveat.pasted':
    'Die Antwort des Servers und die robots.txt wurden nicht geprüft, weil das HTML direkt eingegeben wurde.',
  'analyst.caveat.little-text':
    'Das HTML enthält sehr wenig Text. Erscheint der Inhalt per JavaScript, sehen Suchmaschinen womöglich weniger als Besucher.',
  'analyst.caveat.no-language':
    'Die Sprache der Seite ließ sich am Text nicht erkennen, daher wurden Prüfungen übersprungen, die Wörter auswerten.',
  'analyst.caveat.ideas':
    'Ideen für Titel und Beschreibung entstehen aus den Wörtern der Seite selbst; passen Sie sie an, damit sie nach Ihnen klingen.',
  'analyst.summary.strong':
    'Die Seite ist in gutem Zustand: Nichts hält sie aus der Suche heraus, und die Grundlagen stimmen.',
  'analyst.summary.fair':
    'Die Seite ist auffindbar, aber {count, plural, one {# Problem bremst} other {# Probleme bremsen}} sie.',
  'analyst.summary.weak':
    '{count, plural, one {# ernstes Problem kann} other {# ernste Probleme können}} verhindern, dass diese Seite gefunden oder genutzt wird.',
  'analyst.summary.blocked':
    'Derzeit werden Suchmaschinen angewiesen, diese Seite nicht zu zeigen, oder sie erreichen sie nicht.',
  'analyst.summary.topic': 'Ihr Text handelt vor allem von „{topic}“.',
  'analyst.summary.start': 'Beginnen Sie damit: {action}.',
  'analyst.summary.done':
    'Nichts Dringendes mehr: Halten Sie den Text aktuell und prüfen Sie die Seite nach Änderungen erneut.',

  'mentions.kind.citation': 'Mit Link zitiert',
  'mentions.kind.mention': 'Ohne Link genannt',
  'mentions.method.own-check': 'Ich habe den Assistenten selbst gefragt',
  'mentions.method.shared-with-me': 'Jemand hat es mit mir geteilt',
  'mentions.method.screenshot': 'Aus einem Screenshot',
  'mentions.method.other': 'Auf anderem Weg',
  'mentions.certainty.confirmed': 'Bestätigt',
  'mentions.certainty.uncertain': 'Unsicher',
  'mentions.error.required': 'Dieses Feld ist erforderlich.',
  'mentions.error.too-long': 'Verwenden Sie höchstens {max} Zeichen.',
  'mentions.error.invalid-url':
    'Geben Sie eine vollständige Webadresse ein, die mit https:// oder http:// beginnt.',
  'mentions.error.invalid-date': 'Geben Sie ein gültiges Datum ein.',
  'mentions.error.future-date': 'Das Datum darf nicht in der Zukunft liegen.',
  'mentions.error.invalid-choice': 'Wählen Sie eine der Optionen.',
  'mentions.limit.scope':
    'Das sind die Erwähnungen, die Sie erfasst haben. Sie zeigen, wo Sie Ihre Website gesehen haben, nicht, wie oft KI-Assistenten sie insgesamt erwähnen.',

  // AI visibility check
  'visibility.approximate': 'Ungefähre Sichtbarkeit',
  'visibility.approximate.why':
    'Antworten, die ein Programm abfragt, können von dem abweichen, was Menschen in den Apps sehen, und sie ändern sich von Tag zu Tag. Lesen Sie diese Ergebnisse als Schätzung, nicht als Messung.',
  'visibility.paid-tools': 'Diese Prüfung nutzt kostenpflichtige Tools auf {provider}.',
  'visibility.cost.calls':
    '{questions, plural, one {# Frage} other {# Fragen}} × {engines, plural, one {# KI} other {# KIs}} × {repeats, plural, one {# Durchgang} other {# Durchgänge}} = {calls, plural, one {# Aufruf} other {# Aufrufe}}',
  'visibility.cost.estimate':
    'Geschätzte Kosten: {calls, plural, one {# Aufruf} other {# Aufrufe}}, etwa {amount}.',
  'visibility.cost.unpriced':
    '{calls, plural, one {Für # Aufruf ist kein Preis angegeben, daher fehlt er in der Schätzung.} other {Für # Aufrufe ist kein Preis angegeben, daher fehlen sie in der Schätzung.}}',
  'visibility.cost.billing':
    '{billing, select, account {Diese Gebühr ist nicht in Ihrem SearchUnveil-Abonnement enthalten und wird Ihrem eigenen {provider}-Konto belastet.} other {Diese Gebühr ist nicht in Ihrem SearchUnveil-Abonnement enthalten und wird von Ihrem {provider}-Guthaben abgebucht.}}',
  'visibility.cost.failed-free': 'Fehlgeschlagene Aufrufe werden nicht berechnet.',
  'visibility.cost.confirm': 'Möchten Sie fortfahren?',
  'visibility.cost.reduce':
    'Um weniger zu zahlen, stellen Sie weniger Fragen, wählen Sie weniger KIs aus oder wiederholen Sie jede Frage seltener. Wettbewerber kosten nichts extra.',
  'visibility.cost.actual':
    'Diese Prüfung hat {calls, plural, one {# Aufruf} other {# Aufrufe}} gemacht und etwa {amount} gekostet.',
  'visibility.cost.actual.unpriced':
    '{calls, plural, one {# berechneter Aufruf hatte keinen angegebenen Preis und ist nicht enthalten.} other {# berechnete Aufrufe hatten keinen angegebenen Preis und sind nicht enthalten.}}',
  'visibility.cost.interrupted':
    '{calls, plural, one {# Aufruf wurde abgebrochen, als Sie die Prüfung gestoppt haben; {provider} kann ihn trotzdem berechnen.} other {# Aufrufe wurden abgebrochen, als Sie die Prüfung gestoppt haben; {provider} kann sie trotzdem berechnen.}}',
  'visibility.cell.cited': 'Zitiert',
  'visibility.cell.position': 'Quelle {position}',
  'visibility.cell.named': 'Genannt, ohne Link',
  'visibility.cell.absent': 'Nicht dabei',
  'visibility.cell.no-answer': 'Keine Antwort',
  'visibility.cell.rate': '{count} von {answers}',
  'visibility.summary':
    'Sie erscheinen in {present} von {answers, plural, one {# Antwort} other {# Antworten}}.',
  'visibility.summary.competitor':
    '{name} erscheint in {present} von {answers, plural, one {# Antwort} other {# Antworten}}.',
  'visibility.summary.none':
    'Es kam keine Antwort zurück, daher gibt es noch nichts zu vergleichen.',
  'visibility.stopped':
    'Sie haben die Prüfung gestoppt, daher umfassen diese Ergebnisse nur die bis dahin erhaltenen Antworten.',
  'visibility.other-sources': 'Stattdessen zitierte Websites',
  'visibility.failure':
    '{reason, select, unavailable {Die KI war nicht erreichbar} rate-limited {Zu viele Anfragen auf einmal} refused {Die KI hat die Antwort verweigert} no-balance {Das Guthaben reicht nicht aus} timeout {Keine Antwort in der vorgesehenen Zeit} stopped {Von Ihnen gestoppt} other {Etwas ist schiefgelaufen}}',

  'diagnostic.input.empty': 'Diese Datei ist leer.',
  'diagnostic.input.binary':
    'Das ist keine Textdatei. Wählen Sie eine CSV-Datei oder die ZIP-Datei, die die Search Console herunterlädt.',
  'diagnostic.input.spreadsheet':
    'Das ist eine Tabellenkalkulationsmappe. Speichern Sie sie als CSV oder verwenden Sie die ursprüngliche ZIP-Datei aus der Search Console.',
  'diagnostic.input.unsupported-type': 'Dieser Dateityp wird nicht unterstützt.',
  'diagnostic.encoding.legacy-fallback':
    'Diese Datei ist nicht als UTF-8 gespeichert, daher haben wir sie als {encoding} gelesen. Wenn Buchstaben falsch aussehen, exportieren Sie die Datei erneut aus der Search Console, ohne sie vorher in einer Tabellenkalkulation zu öffnen.',
  'diagnostic.encoding.utf16-without-bom':
    'Diese Datei verwendet die Kodierung {encoding}. Wir haben das automatisch erkannt.',
  'diagnostic.csv.no-header': 'Diese Datei hat keine Kopfzeile.',
  'diagnostic.csv.unterminated-quote':
    'Ein Wert, der mit einem Anführungszeichen beginnt, endet nie.',
  'diagnostic.csv.stray-quote':
    'In einem Wert steht ein Anführungszeichen. Wir haben es so belassen.',
  'diagnostic.csv.text-after-quote':
    'Nach einem schließenden Anführungszeichen folgt Text. Wir haben ihn als Teil des Werts behalten.',
  'diagnostic.csv.field-count': 'Diese Zeile hat {actual} Werte, die Kopfzeile aber {expected}.',
  'diagnostic.csv.too-many-rows':
    'Diese Datei hat mehr als {limit} Zeilen, das Maximum, das wir lesen können.',
  'diagnostic.csv.too-many-columns':
    'Eine Zeile hat mehr als {limit} Spalten, das Maximum, das wir lesen können.',
  'diagnostic.csv.field-too-long':
    'Ein Wert ist länger als {limit} Zeichen, das Maximum, das wir lesen können.',
  'diagnostic.zip.invalid':
    'Diese ZIP-Datei ist beschädigt oder unvollständig. Laden Sie sie erneut herunter.',
  'diagnostic.zip.multi-disk':
    'Diese ZIP-Datei ist in mehrere Teile aufgeteilt, was nicht unterstützt wird.',
  'diagnostic.zip.encrypted':
    'Diese ZIP-Datei ist passwortgeschützt. Verwenden Sie einen Export ohne Passwort.',
  'diagnostic.zip.unsupported-method':
    '„{entry}“ in dieser ZIP-Datei verwendet eine Komprimierungsmethode, die wir nicht lesen können.',
  'diagnostic.zip.too-many-entries': 'Diese ZIP-Datei enthält mehr als {limit} Dateien.',
  'diagnostic.zip.entry-too-large':
    '„{entry}“ in dieser ZIP-Datei ist entpackt größer als {megabytes}\u00A0MB.',
  'diagnostic.zip.suspicious-ratio':
    '„{entry}“ in dieser ZIP-Datei ist so stark komprimiert, dass das Entpacken unsicher sein könnte. Wir haben deshalb abgebrochen.',
  'diagnostic.zip.overlapping-entries':
    'Die Dateien in diesem ZIP-Archiv überlappen sich, ein Zeichen für ein beschädigtes oder unsicheres Archiv. Wir haben deshalb abgebrochen.',
  'diagnostic.zip.corrupt-entry': '„{entry}“ in dieser ZIP-Datei ist beschädigt.',
  'diagnostic.zip.checksum-mismatch':
    '„{entry}“ in dieser ZIP-Datei hat die Integritätsprüfung nicht bestanden.',
  'diagnostic.zip.no-csv': 'Diese ZIP-Datei enthält keine CSV-Dateien.',
  'diagnostic.zip.website':
    'Diese ZIP-Datei enthält eine Website ({pages, plural, one {# Webseite} other {# Webseiten}} unter {files, plural, one {# Datei} other {# Dateien}}), keinen Search-Console-Export. Die Seitenprüfung kann jede Seite darin prüfen.',

  'diagnostic.gsc.no-tables':
    'In den ausgewählten Dateien haben wir keine Search Console-Daten gefunden.',
  'diagnostic.gsc.unrecognized-table':
    'Diese Datei sieht nicht wie ein Leistungsexport der Search Console aus.',
  'diagnostic.gsc.duplicate-table':
    'Sie haben mehr als eine Tabelle {kind, select, date {mit Tagesdaten} query {„Suchanfragen“} page {„Seiten“} country {„Länder“} device {„Geräte“} searchAppearance {„Darstellung in der Suche“} other {desselben Typs}} ausgewählt. Wir haben die erste verwendet.',
  'diagnostic.gsc.columns-inferred':
    'Wir haben die Spaltennamen nicht erkannt und die Spalten daher nach der Standardreihenfolge der Search Console zugeordnet und ihre Werte geprüft.',
  'diagnostic.gsc.dimension-inferred':
    'Wir haben den Namen der ersten Spalte nicht erkannt. {kind, select, date {Ihre Werte sind Datumsangaben.} page {Ihre Werte sind Seitenadressen.} other {Wir zeigen ihre Werte unverändert.}}',
  'diagnostic.gsc.missing-columns':
    'Dieser Tabelle fehlt die Spalte {metric, select, clicks {„Klicks“} impressions {„Impressionen“} ctr {„CTR“} position {„Position“} other {„{metric}“}}.',
  'diagnostic.gsc.invalid-number': '„{value}“ ist keine gültige Zahl.',
  'diagnostic.gsc.invalid-date': '„{value}“ ist kein gültiges Datum.',
  'diagnostic.gsc.ambiguous-dates':
    'Wir können nicht erkennen, ob diese Datumsangaben mit dem Tag oder dem Monat beginnen. Exportieren Sie die Datei erneut aus der Search Console, ohne sie zu bearbeiten.',
  'diagnostic.gsc.mixed-decimal-separators':
    'Die Spalte „{column}“ mischt Dezimalpunkte und Dezimalkommas.',
  'diagnostic.gsc.decimal-comma':
    'Die Spalte „{column}“ verwendet ein Komma als Dezimaltrennzeichen.',
  'diagnostic.gsc.ctr-as-fraction':
    'Die Spalte „{column}“ gibt die Klickrate als Bruch an: 0,05 bedeutet 5\u00A0%.',
  'diagnostic.gsc.clicks-exceed-impressions':
    'Diese Zeile hat mehr Klicks ({clicks}) als Impressionen ({impressions}), was die Search Console nie meldet.',
  'diagnostic.gsc.columns-swapped':
    'Die meisten Zeilen haben mehr Klicks als Impressionen. Die beiden Spalten sind womöglich vertauscht, daher haben wir diese Tabelle nicht verwendet.',
  'diagnostic.gsc.ctr-mismatch':
    'In {rows, plural, one {# Zeile} other {# Zeilen}} passt die Klickrate nicht zu Klicks geteilt durch Impressionen. Die Datei wurde womöglich bearbeitet.',
  'diagnostic.gsc.position-out-of-range':
    '„{value}“ ist keine gültige durchschnittliche Position. Positionen beginnen bei 1.',
  'diagnostic.gsc.duplicate-key':
    '„{key}“ kommt mehrfach vor. Wir haben die erste Zeile verwendet.',
  'diagnostic.gsc.empty-key':
    'Die erste Spalte dieser Zeile ist leer, daher haben wir sie übersprungen.',
  'diagnostic.gsc.empty-table': 'Diese Tabelle hat keine verwendbaren Zeilen.',

  'diagnostic.mentions.invalid-json': 'Diese Datei ist kein gültiges JSON.',
  'diagnostic.mentions.invalid-format': 'Diese Datei ist kein SearchUnveil-Erwähnungsprotokoll.',
  'diagnostic.mentions.unsupported-version':
    'Dieses Erwähnungsprotokoll wurde mit einer neueren SearchUnveil-Version erstellt (Format {version}).',
  'diagnostic.mentions.too-many':
    'Dieses Protokoll enthält mehr als {limit} Erwähnungen, das Maximum, das wir lesen können.',
  'diagnostic.mentions.invalid-field': 'Eintrag {index}: „{field}“ fehlt oder ist ungültig.',
  'diagnostic.mentions.duplicate-id':
    'Eintrag {index} wiederholt einen früheren Eintrag. Wir haben den ersten behalten.',

  // Diagnostics: saved AI visibility checks
  'diagnostic.visibility.invalid-json': 'Diese Datei ist kein gültiges JSON.',
  'diagnostic.visibility.invalid-format':
    'Diese Datei ist keine gespeicherte SearchUnveil-Prüfung der KI-Sichtbarkeit.',
  'diagnostic.visibility.unsupported-version':
    'Diese Prüfung wurde mit einer neueren SearchUnveil-Version gespeichert (Format {version}).',
  'diagnostic.visibility.invalid-field':
    'Diese gespeicherte Prüfung ist beschädigt: „{field}“ fehlt oder ist ungültig.',
  'diagnostic.visibility.invalid-answer': 'Antwort {index} ist beschädigt und wurde ausgelassen.',
  'diagnostic.visibility.duplicate-answer':
    'Antwort {index} wiederholt eine frühere. Wir haben die erste behalten.',

  'diagnostic.page.empty':
    'Fügen Sie das HTML einer Seite ein oder wählen Sie eine HTML-Datei, um sie zu prüfen.',
  'diagnostic.page.too-large':
    'Dieses HTML ist länger als {limit} Zeichen, das Maximum, das wir prüfen können.',
  'diagnostic.page.not-html':
    'Das sieht nicht nach HTML aus. Fügen Sie den Quellcode der Seite ein, nicht ihre Adresse.',
  'diagnostic.page.invalid-url':
    '„{value}“ ist keine vollständige Webadresse, daher haben wir die Prüfungen übersprungen, die Links mit der Seite vergleichen.',
  'diagnostic.site.no-pages':
    'Keine der ausgewählten Dateien ist eine Webseite (eine .html- oder .htm-Datei).',

  'diagnostic.diagnostic.more':
    '…und {count, plural, one {# weiterer Fall dieser Art} other {# weitere Fälle dieser Art}}.',
};
