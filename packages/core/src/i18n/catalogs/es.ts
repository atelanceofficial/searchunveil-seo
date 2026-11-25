import type { CoreCatalog } from './en.ts';

/** Español (tratamiento de tú). Comillas angulares «…», como recomienda la RAE. */
export const es: CoreCatalog = {
  'status.attention': 'Requiere atención',
  'status.review': 'Vale la pena revisarlo',
  'status.good': 'Todo bien',
  'status.info': 'Conviene saberlo',

  'metric.clicks': 'Clics',
  'metric.impressions': 'Impresiones',
  'metric.ctr': 'Porcentaje de clics',
  'metric.position': 'Posición media',
  'metric.clicks.help':
    'Cuántas veces la gente hizo clic para llegar a tu sitio desde la Búsqueda de Google.',
  'metric.impressions.help':
    'Cuántas veces apareció un enlace a tu sitio en resultados de búsqueda que alguien vio.',
  'metric.ctr.help': 'La parte de las impresiones que se convirtió en clics.',
  'metric.position.help':
    'Dónde apareció tu sitio normalmente en los resultados. Cuanto más bajo, mejor: 1 es lo más alto de la página.',

  'evidence.recent-period': 'Periodo reciente',
  'evidence.previous-period': 'Periodo anterior',
  'evidence.period': '{range}',
  'evidence.change': 'Variación',
  'evidence.first-day': 'Primer día',
  'evidence.last-day': 'Último día',
  'evidence.impressions-on': 'Impresiones del {day}',
  'evidence.typical-impressions': 'Día habitual',
  'evidence.head-breaker': 'Cerró el head',
  'evidence.title': 'Título',
  'evidence.description': 'Descripción',
  'evidence.viewport': 'Viewport',
  'evidence.canonical': 'Enlace canónico',
  'evidence.heading': 'Encabezado',
  'evidence.heading-level': 'h{level}',
  'evidence.status': 'Código de estado',
  'evidence.final-address': 'Dirección final',
  'evidence.redirect': 'Redirecciones',
  'evidence.header': 'Encabezado',
  'evidence.robots-rule': 'Regla de robots.txt',
  'evidence.response-time': 'Tiempo de respuesta (segundos)',
  'table.query': 'Consulta',
  'table.page': 'Página',
  'table.text': '{text}',
  'table.typical-ctr': 'Habitual en tu sitio',
  'table.primary-period': 'Periodo principal',
  'table.comparison-period': 'Periodo comparado',
  'table.tag': 'Etiqueta',
  'table.image': 'Imagen',
  'table.link': 'Enlace',

  'ref.gsc-metrics': 'Ayuda de Search Console: qué significan impresiones, posición y clics',
  'ref.gsc-performance': 'Ayuda de Search Console: informe de rendimiento',
  'ref.title-links': 'Google Search Central: cómo influir en los enlaces de título',
  'ref.snippets': 'Google Search Central: fragmentos y metadescripciones',
  'ref.robots-meta': 'Google Search Central: metaetiqueta robots',
  'ref.canonical': 'Google Search Central: URLs canónicas',
  'ref.hreflang': 'Google Search Central: versiones localizadas de las páginas',
  'ref.structured-data': 'Google Search Central: introducción a los datos estructurados',
  'ref.rich-results-test': 'Prueba de resultados enriquecidos de Google',
  'ref.images': 'Google Search Central: prácticas recomendadas para imágenes',
  'ref.valid-metadata': 'Google Search Central: usa metadatos de página válidos',
  'ref.crawlable-links': 'Google Search Central: enlaces rastreables',
  'ref.wcag-language': 'WCAG 2.2: Idioma de la página (3.1.1)',
  'ref.wcag-non-text': 'WCAG 2.2: Contenido no textual (1.1.1)',
  'ref.wcag-resize': 'WCAG 2.2: Cambio de tamaño del texto (1.4.4)',
  'ref.wcag-link-purpose': 'WCAG 2.2: Propósito de los enlaces (2.4.4)',
  'ref.wcag-structure': 'WCAG 2.2: Información y relaciones (1.3.1)',
  'ref.viewport': 'MDN: la metaetiqueta viewport',
  'ref.open-graph': 'El protocolo Open Graph',
  'ref.robots-txt': 'Google Search Central: introducción a robots.txt',
  'ref.http-status': 'Google Search Central: códigos de estado HTTP y errores de red',
  'ref.https': 'web.dev: por qué importa HTTPS',

  'gsc.headline.method':
    'Comparamos {current} con {previous}, emparejando cada día con el mismo día de la semana.',
  'gsc.headline.up-up': 'Más personas encontraron tus páginas y las visitaron.',
  'gsc.headline.up-flat':
    'Más personas hicieron clic, mientras tus páginas aparecían con una frecuencia similar.',
  'gsc.headline.up-down': 'Los clics aumentaron aunque tus páginas aparecieron menos.',
  'gsc.headline.flat-up':
    'Tus páginas aparecieron más a menudo en la búsqueda, pero los clics se mantuvieron más o menos igual.',
  'gsc.headline.flat-flat': 'El rendimiento en la búsqueda se mantuvo más o menos igual.',
  'gsc.headline.flat-down':
    'Tus páginas aparecieron menos, pero los clics se mantuvieron más o menos igual.',
  'gsc.headline.down-up':
    'Tus páginas aparecieron más a menudo, pero menos personas hicieron clic.',
  'gsc.headline.down-flat':
    'Menos personas hicieron clic, mientras tus páginas aparecían con una frecuencia similar.',
  'gsc.headline.down-down': 'Tus páginas aparecieron menos y recibieron menos clics.',
  'gsc.headline.impressions-up':
    'Tus páginas aparecieron más a menudo en la búsqueda. Todavía hay muy pocos clics para compararlos.',
  'gsc.headline.impressions-flat':
    'Tus páginas aparecieron más o menos tanto como antes. Todavía hay muy pocos clics para compararlos.',
  'gsc.headline.impressions-down':
    'Tus páginas aparecieron menos en la búsqueda. Todavía hay muy pocos clics para compararlos.',
  'gsc.headline.insufficient':
    'Todavía no hay suficientes datos de búsqueda para comparar periodos con fiabilidad.',

  'gsc.check.growth-drivers':
    'Busca las páginas y consultas que impulsan el crecimiento y mantén ese contenido correcto y actualizado.',
  'gsc.check.queries-gained':
    'Compara las consultas de ambos periodos para ver cuáles ganaron impresiones y si encajan con lo que ofrecen tus páginas.',
  'gsc.check.titles':
    'Revisa los títulos y las descripciones de las páginas implicadas. Es lo que la gente lee antes de decidir si hace clic.',
  'gsc.check.position-shift':
    'Revisa la posición media: las nuevas apariciones suelen empezar más abajo en la página, donde menos gente hace clic.',
  'gsc.check.lost-visibility':
    'Busca las páginas y consultas que perdieron impresiones y comprueba que esas páginas siguen funcionando y se pueden indexar.',
  'gsc.check.site-changes':
    'Piensa en cambios recientes del sitio, como un rediseño, páginas movidas o eliminadas, o nuevas reglas de robots.',
  'gsc.check.seasonality':
    'Compara con las mismas semanas del año anterior. El interés por muchos temas sube y baja según la temporada.',
  'gsc.check.serp-features':
    'Busca tú mismo tus consultas principales. Los anuncios, vídeos o respuestas generadas por IA en la página de resultados pueden restar clics.',
  'gsc.check.opportunities':
    'Consulta abajo las oportunidades de consultas y páginas que podrían conseguir más clics.',
  'gsc.check.export-longer':
    'Exporta un intervalo de fechas más largo desde Search Console, idealmente los últimos 3 meses, para tener una imagen más clara.',
  'gsc.check.focused-page':
    'Asegúrate de que una única página, clara y actualizada, responda a cada consulta, y enlázala desde páginas relacionadas.',
  'gsc.check.search-intent':
    'Busca las consultas por las que aparecen estas páginas y comprueba si responden a lo que la gente quiere.',

  'gsc.change.clicks.up': 'Los clics subieron un {change}, hasta {current}.',
  'gsc.change.clicks.down': 'Los clics bajaron un {change}, hasta {current}.',
  'gsc.change.clicks.flat': 'Los clics se mantuvieron más o menos igual, en {current}.',
  'gsc.change.clicks.started': 'Los clics pasaron de ninguno a {current}.',
  'gsc.change.impressions.up': 'Las impresiones subieron un {change}, hasta {current}.',
  'gsc.change.impressions.down': 'Las impresiones bajaron un {change}, hasta {current}.',
  'gsc.change.impressions.flat': 'Las impresiones se mantuvieron más o menos igual, en {current}.',
  'gsc.change.impressions.started': 'Las impresiones pasaron de ninguna a {current}.',
  'gsc.change.ctr.up': 'El porcentaje de clics subió de {previous} a {current}.',
  'gsc.change.ctr.down': 'El porcentaje de clics bajó de {previous} a {current}.',
  'gsc.change.ctr.flat': 'El porcentaje de clics se mantuvo más o menos igual, en {current}.',
  'gsc.change.position.better': 'La posición media mejoró de {previous} a {current}.',
  'gsc.change.position.worse': 'La posición media empeoró de {previous} a {current}.',
  'gsc.change.position.flat': 'La posición media se mantuvo más o menos igual, en {current}.',
  'gsc.daybyday.higher':
    'El valor fue más alto en {count} de {days} días que el mismo día de la semana del periodo anterior.',
  'gsc.daybyday.lower':
    'El valor fue más bajo en {count} de {days} días que el mismo día de la semana del periodo anterior.',
  'gsc.daybyday.uneven':
    'Día a día, el cambio fue irregular ({higher} días más alto, {lower} días más bajo), así que unos pocos días podrían explicar la mayor parte.',

  'gsc.limit.weekday-matching':
    'Cada periodo abarca semanas completas, para que las diferencias entre días laborables y fines de semana no distorsionen la comparación.',
  'gsc.limit.ctr-features':
    'El porcentaje de clics también depende de lo que muestre la página de resultados, como anuncios, vídeos o respuestas generadas por IA.',
  'gsc.limit.position-mix':
    'La posición media también cambia cuando cambia la combinación de búsquedas, no solo cuando se mueven las clasificaciones.',
  'gsc.limit.position-average':
    'La posición media resume muchas búsquedas. En búsquedas concretas, una página puede aparecer más arriba o más abajo.',

  'gsc.opportunity.low-ctr.query':
    '{count, plural, one {# consulta recibe} other {# consultas reciben}} menos clics que resultados similares',
  'gsc.opportunity.low-ctr.page':
    '{count, plural, one {# página recibe} other {# páginas reciben}} menos clics que resultados similares',
  'gsc.opportunity.low-ctr.summary':
    'Aparecen entre los diez primeros resultados, pero su porcentaje de clics no llega ni al {share} del que consiguen tus otros resultados en una posición similar.',
  'gsc.opportunity.near-top.query':
    '{count, plural, one {# consulta se posiciona} other {# consultas se posicionan}} justo por debajo de los diez primeros',
  'gsc.opportunity.near-top.page':
    '{count, plural, one {# página se posiciona} other {# páginas se posicionan}} justo por debajo de las diez primeras',
  'gsc.opportunity.near-top.summary':
    'Su posición media está entre {from} y {to}, y se buscan a menudo. Mejorar la página que las responde podría hacerla visible.',
  'gsc.opportunity.zero-click-pages':
    '{count, plural, one {# página se ve, pero nunca recibe clics} other {# páginas se ven, pero nunca reciben clics}}',
  'gsc.opportunity.zero-click-pages.summary':
    'Cada una apareció al menos {min} veces en los resultados de búsqueda sin recibir ni un clic.',
  'gsc.movers.gains':
    '{kind, select, page {Páginas} other {Consultas}} con mayores aumentos de clics',
  'gsc.movers.losses':
    '{kind, select, page {Páginas} other {Consultas}} con mayores pérdidas de clics',

  'gsc.note.no-dates':
    'Esta exportación no tiene datos diarios, así que no se pueden mostrar tendencias.',
  'gsc.note.short-range':
    'Esta exportación abarca {days, plural, one {# día} other {# días}}: demasiado poco para comparar dos periodos.',
  'gsc.note.missing-days':
    '{count, plural, one {# día no tiene datos} other {# días no tienen datos}}',
  'gsc.note.missing-days.summary':
    'Los días sin fila normalmente no tuvieron impresiones. Los contamos como cero.',
  'gsc.note.incomplete-days':
    '{count, plural, one {El último día parece incompleto} other {Los últimos # días parecen incompletos}}',
  'gsc.note.incomplete-days.summary':
    'Es posible que Search Console aún esté procesando los datos recientes. Dejamos {count, plural, one {este día} other {estos días}} fuera de la comparación.',
  'gsc.note.anonymized-queries': 'La tabla Consultas cubre el {share} de todos los clics',
  'gsc.note.anonymized-queries.summary':
    'Search Console no muestra las consultas poco frecuentes para proteger la privacidad de quienes buscan, y exporta como máximo {limit} filas. Por eso, los totales de la tabla Consultas son más bajos que los del gráfico.',
  'gsc.note.row-limit':
    '{kind, select, query {La tabla Consultas} page {La tabla Páginas} country {La tabla Países} other {Una tabla}} llegó a {limit} filas',
  'gsc.note.row-limit.summary':
    'Es el límite de exportación de Search Console, así que pueden faltar {kind, select, query {consultas} page {páginas} country {países} other {filas}} menos frecuentes.',
  'gsc.note.partial-totals':
    'Los totales provienen de la tabla {kind, select, query {Consultas} page {Páginas} country {Países} device {Dispositivos} other {exportada}}',
  'gsc.note.partial-totals.summary':
    '{kind, select, query {Las consultas poco frecuentes se ocultan por privacidad, así que estos totales son más bajos que los totales reales de tu sitio.} page {Cuando varias de tus páginas aparecen en la misma búsqueda, cada una cuenta, así que estos totales pueden diferir de los de tu sitio.} other {Pueden diferir de los totales de tu sitio. Incluye la tabla de fechas para obtener los totales completos.}}',
  'gsc.note.comparison-export': 'Esta exportación compara «{primary}» con «{comparison}».',
  'gsc.note.comparison-export.unlabeled': 'Esta exportación compara dos intervalos de fechas.',
  'gsc.note.filters': 'Ajustes de la exportación',

  'page.limit.source':
    'Revisamos el HTML que proporcionaste. No se incluye el contenido que JavaScript añade después de cargar la página.',
  'page.limit.scope':
    'Los encabezados HTTP, el robots.txt, la velocidad y los enlaces desde otros sitios también influyen en la búsqueda. No forman parte de esta revisión.',
  'page.limit.width':
    'Los resultados de búsqueda miden el ancho en píxeles, no en caracteres, así que esto es una estimación.',
  'page.head.ok': 'Todas las etiquetas importantes están dentro del head',
  'page.head.broken':
    '{count, plural, one {# etiqueta importante quedó} other {# etiquetas importantes quedaron}} fuera del head',
  'page.head.broken.summary':
    'Antes de {count, plural, one {esta etiqueta} other {estas etiquetas}} apareció algo que no pertenece al head, así que el navegador cerró el head antes de tiempo. Los buscadores ignoran estas etiquetas fuera del head.',
  'page.head.noscript':
    '{count, plural, one {# etiqueta tras un bloque noscript podría ignorarse} other {# etiquetas tras un bloque noscript podrían ignorarse}}',
  'page.head.noscript.summary':
    'Una imagen u otro elemento similar dentro de un noscript en el head cierra el head para las herramientas que no ejecutan JavaScript. Los navegadores que ejecutan JavaScript no se ven afectados.',
  'page.check.head':
    'Mueve el elemento inesperado debajo del head, o mueve estas etiquetas por encima de él.',
  'page.check.noscript':
    'Mueve el bloque noscript al final del head, después de las etiquetas importantes.',
  'page.robots.noindex': 'La página pide a los buscadores que no la muestren en los resultados',
  'page.robots.noindex.summary':
    'Las páginas marcadas con noindex no aparecen en los resultados de búsqueda. Es lo correcto en páginas privadas o duplicadas, y un error costoso en cualquier otra.',
  'page.check.robots':
    'Si esta página debe aparecer en la búsqueda, quita noindex de su metaetiqueta robots.',
  'page.robots.nofollow': 'La página pide a los buscadores que no sigan sus enlaces',
  'page.robots.nofollow.summary':
    'Los buscadores no usarán los enlaces de esta página para descubrir otras páginas.',
  'page.robots.limited': 'La página limita cómo pueden mostrarla los buscadores',
  'page.robots.limited.summary':
    'Reglas como nosnippet o max-snippet cambian cómo aparece la página en los resultados.',
  'page.robots.indexable': 'Nada en el HTML impide la indexación',
  'page.robots.indexable.summary':
    'No encontramos ninguna regla noindex en la página. Las reglas también pueden venir de encabezados HTTP o del robots.txt, que el HTML no muestra.',
  'page.title.why':
    'Los buscadores suelen mostrar el título como enlace a tu página, y los navegadores lo muestran en pestañas y marcadores.',
  'page.check.title':
    'Escribe un título breve y único que diga qué ofrece la página, con las palabras más importantes al principio.',
  'page.title.missing': 'La página no tiene título',
  'page.title.empty': 'El título de la página está vacío',
  'page.title.multiple': 'La página tiene {count} títulos',
  'page.title.multiple.summary':
    'Los navegadores usan el primero y los buscadores pueden usar cualquiera. Deja solo uno.',
  'page.title.short': 'El título es muy corto',
  'page.title.short.summary':
    'Un título como «Inicio» rara vez dice a quien busca qué ofrece la página.',
  'page.title.long': 'Es posible que el título se acorte en los resultados de búsqueda',
  'page.title.long.summary':
    'Tiene unos {length} caracteres. Normalmente caben unos {fit} antes de que los resultados lo corten.',
  'page.title.ok': 'El título existe y tiene una longitud razonable',
  'page.description.why':
    'La metadescripción es opcional, y Google a menudo escribe su propio fragmento. Aun así, una buena descripción puede ayudar a que la gente elija tu resultado.',
  'page.check.description':
    'Escribe una o dos frases que resuman la página para alguien que está decidiendo si hacer clic.',
  'page.description.missing': 'La página no tiene metadescripción',
  'page.description.empty': 'La metadescripción está vacía',
  'page.description.multiple': 'La página tiene {count} metadescripciones',
  'page.description.multiple.summary': 'Deja solo una, para que quede claro cuál usar.',
  'page.description.long': 'Es posible que la descripción se acorte en los resultados de búsqueda',
  'page.description.long.summary':
    'Tiene unos {length} caracteres. En un fragmento suelen caber unos {fit}.',
  'page.description.ok': 'La página tiene metadescripción',
  'page.lang.missing': 'La página no declara su idioma',
  'page.lang.invalid': 'El código de idioma {value} no es válido',
  'page.lang.why':
    'Los lectores de pantalla usan el idioma para pronunciar bien el texto, y los navegadores, para ofrecer traducción.',
  'page.check.lang': 'Añade un atributo lang al elemento html, por ejemplo lang="es" o lang="en".',
  'page.lang.ok': 'La página declara su idioma: {value}',
  'page.viewport.missing': 'La página no está preparada para móviles',
  'page.viewport.why':
    'Sin la metaetiqueta viewport, los móviles muestran la página reducida, como una página de escritorio. Google utiliza principalmente la versión móvil de las páginas para indexarlas.',
  'page.check.viewport':
    'Añade <meta name="viewport" content="width=device-width, initial-scale=1"> al head.',
  'page.viewport.zoom-blocked': 'La página impide que los visitantes amplíen',
  'page.viewport.zoom-blocked.summary':
    'Bloquear el zoom dificulta la lectura a las personas con baja visión. Quita user-scalable=no y cualquier maximum-scale inferior a 2.',
  'page.viewport.ok': 'La página está preparada para móviles',
  'page.canonical.missing': 'La página no tiene enlace canónico',
  'page.canonical.missing.summary':
    'Es normal en la mayoría de las páginas. Si el mismo contenido está disponible en varias direcciones, un enlace canónico indica a los buscadores cuál prefieres.',
  'page.canonical.multiple': 'La página tiene {count} enlaces canónicos que no coinciden',
  'page.canonical.multiple.summary':
    'Cuando los enlaces canónicos apuntan a páginas distintas, los buscadores pueden ignorarlos todos.',
  'page.canonical.invalid': 'El enlace canónico {href} no es una dirección válida',
  'page.canonical.relative': 'El enlace canónico usa una dirección relativa',
  'page.canonical.relative.summary':
    'Funciona, pero una dirección completa que empiece por https:// evita errores, y Google la recomienda.',
  'page.canonical.other-site': 'El enlace canónico apunta a otro sitio web: {host}',
  'page.canonical.other-site.summary':
    'Los buscadores podrían mostrar la página de ese sitio en lugar de esta. Solo es lo esperado si esta página es una copia.',
  'page.canonical.other-page': 'El enlace canónico apunta a otra página',
  'page.canonical.other-page.summary':
    'Los buscadores podrían tratar esta página como un duplicado y mostrar la otra en su lugar.',
  'page.canonical.self': 'El enlace canónico apunta a esta página',
  'page.canonical.present': 'La página tiene un enlace canónico',
  'page.h1.missing': 'La página no tiene encabezado principal (h1)',
  'page.h1.why':
    'Un encabezado principal indica a los visitantes, también a quienes usan lectores de pantalla, de qué trata la página.',
  'page.h1.multiple': 'La página tiene {count} encabezados principales (h1)',
  'page.h1.multiple.summary':
    'Está permitido. Aun así, un único encabezado principal suele hacer la estructura más clara.',
  'page.headings.skipped': 'Los niveles de encabezado saltan de h{from} a h{to}',
  'page.headings.skipped.summary':
    'Muchas personas que usan lectores de pantalla recorren la página por sus encabezados. Un nivel omitido puede hacer pensar que falta contenido.',
  'page.headings.empty':
    '{count, plural, one {# encabezado está vacío} other {# encabezados están vacíos}}',
  'page.headings.empty.summary':
    'Los lectores de pantalla anuncian los encabezados vacíos, pero no dicen nada.',
  'page.headings.ok':
    '{count, plural, one {El encabezado forma} other {Los # encabezados forman}} un esquema claro',
  'page.images.missing-alt':
    '{count, plural, one {# imagen no tiene} other {# imágenes no tienen}} texto alternativo',
  'page.images.missing-alt.summary':
    'Los lectores de pantalla no pueden describir estas imágenes, y los buscadores las entienden peor. Describe cada imagen en su atributo alt, o usa un alt vacío para las imágenes puramente decorativas.',
  'page.images.ok':
    '{count, plural, one {La imagen tiene} other {Las # imágenes tienen}} texto alternativo',
  'page.links.unnamed':
    '{count, plural, one {# enlace no tiene} other {# enlaces no tienen}} texto',
  'page.links.unnamed.summary':
    'Los lectores de pantalla anuncian estos enlaces sin decir adónde llevan. Añade texto visible, o un aria-label en los enlaces con icono.',
  'page.links.javascript':
    '{count, plural, one {# enlace ejecuta} other {# enlaces ejecutan}} JavaScript en lugar de apuntar a una dirección',
  'page.links.javascript.summary':
    'Los buscadores no pueden seguir estos enlaces. Pon una dirección real en el href de cada enlace.',
  'page.links.summary':
    'La página enlaza a {total, plural, one {# dirección} other {# direcciones}}: {internal} en este sitio y {external} en otros',
  'page.links.nofollow':
    '{count, plural, one {# enlace está marcado} other {# enlaces están marcados}} como nofollow.',
  'page.structured-data.invalid':
    '{count, plural, one {# bloque de datos estructurados no se puede leer} other {# bloques de datos estructurados no se pueden leer}}',
  'page.structured-data.invalid.summary':
    'Los buscadores ignoran los datos estructurados que no son JSON válido.',
  'page.structured-data.found': 'La página tiene datos estructurados: {types}',
  'page.structured-data.untyped': 'La página tiene datos estructurados sin tipo',
  'page.structured-data.found.summary':
    'Comprobamos que se pueden leer. La Prueba de resultados enriquecidos de Google indica si cumplen los requisitos para mostrar resultados enriquecidos.',
  'page.hreflang.invalid': 'Algunas anotaciones de idioma usan códigos no válidos: {values}',
  'page.hreflang.invalid.summary':
    'Usa códigos de idioma como en, en-GB o zh-Hans, o x-default. El código del Reino Unido es GB, no UK.',
  'page.hreflang.no-self': 'Las anotaciones de idioma no incluyen esta página',
  'page.hreflang.no-self.summary':
    'Cada versión de idioma debe incluirse a sí misma, además de las demás.',
  'page.hreflang.ok':
    'La página indica {count, plural, one {# versión de idioma} other {# versiones de idioma}}',
  'page.hreflang.limit':
    'Solo podemos revisar esta página. Cada página indicada debe enlazar de vuelta a esta; si no, los buscadores ignoran las anotaciones.',
  'page.charset.missing': 'La página no declara su codificación de caracteres',
  'page.charset.missing.summary':
    'Si el servidor no la declara, los navegadores pueden equivocarse y mostrar caracteres incorrectos. Añade <meta charset="utf-8"> al principio del head.',
  'page.charset.legacy': 'La página usa la codificación de caracteres {value}',
  'page.charset.legacy.summary': 'Para la web se recomienda UTF-8: abarca todos los idiomas.',
  'page.charset.ok': 'La página declara la codificación UTF-8',
  'page.social.missing': 'Las vistas previas de enlaces podrían estar incompletas: faltan {tags}',
  'page.social.missing.summary':
    'Las redes sociales y las aplicaciones de chat usan las etiquetas Open Graph para crear vistas previas de enlaces. No influyen en las clasificaciones de búsqueda.',
  'page.social.ok': 'La página tiene etiquetas para vistas previas de enlaces',
  'page.limit.fetched':
    'Revisamos el HTML que el servidor envió para esta dirección. No se incluye el contenido que JavaScript añade después de cargar la página.',
  'page.limit.scope.fetched':
    'La velocidad de carga y los enlaces desde otros sitios también influyen en la búsqueda. No forman parte de esta revisión.',

  'http.status': 'El servidor respondió con el estado {status} en lugar de la página',
  'http.status.summary':
    'Los buscadores indexan las páginas que responden con un estado de éxito (200). Los estados de error y de redirección dejan esta dirección fuera de los resultados.',
  'http.check.status':
    'Abre la dirección en un navegador y revisa la configuración del servidor o del hosting que devuelve este estado.',
  'http.https': 'La página se sirve sin HTTPS',
  'http.https.summary':
    'Los navegadores marcan como no seguras las páginas sin HTTPS, y los buscadores prefieren la versión segura de una página.',
  'http.check.https':
    'Instala un certificado y redirige cada dirección http:// a su versión https://.',
  'http.x-robots-tag':
    'El servidor indica a los buscadores que no muestren la página en los resultados',
  'http.x-robots-tag.summary':
    'El encabezado X-Robots-Tag funciona como una metaetiqueta robots, pero lo añade el servidor, así que es fácil pasarlo por alto en el HTML.',
  'http.check.x-robots-tag':
    'Si esta página debe aparecer en la búsqueda, quita noindex del encabezado X-Robots-Tag en la configuración del servidor o del hosting.',
  'http.robots-txt': 'robots.txt impide a los buscadores acceder a esta página',
  'http.robots-txt.summary':
    'Googlebot no rastrea las direcciones que robots.txt prohíbe, así que no puede leer el contenido de esta página.',
  'http.check.robots-txt':
    'Si esta página debe aparecer en la búsqueda, elimina la regla de robots.txt o hazla más específica.',
  'http.robots-txt.unreadable': 'No pudimos leer el robots.txt del sitio',
  'http.robots-txt.unreadable.summary':
    'Si robots.txt responde con un error del servidor, Google deja de rastrear todo el sitio hasta que puede volver a leer el archivo. Comprueba que se abre.',
  'http.redirects':
    'La dirección redirige {count, plural, one {una vez} other {# veces}} antes de llegar a la página',
  'http.redirects.summary':
    'Cada redirección añade un viaje de ida y vuelta para visitantes y rastreadores. Enlaza directamente a la dirección final.',
  'http.ok': 'El servidor entrega la página sin obstáculos',
  'http.ok.summary':
    'Responde con éxito a través de HTTPS, y ni robots.txt ni los encabezados del servidor alejan a los buscadores.',

  'analyst.do.status': 'Haz que esta dirección devuelva la página',
  'analyst.do.status.how':
    'El servidor responde con el estado {status}. Si la página se movió, redirige la dirección antigua a la nueva con un 301; si se eliminó por error, restáurala; si el servidor falla, pide a tu proveedor de hosting que revise sus registros de errores.',
  'analyst.do.https': 'Pasa el sitio a HTTPS',
  'analyst.do.https.how':
    'Activa un certificado en el panel de tu hosting (muchos incluyen certificados gratuitos de Let’s Encrypt), redirige cada dirección http:// a su versión https:// con un 301 y luego usa {url} en el enlace canónico y en el sitemap.',
  'analyst.do.header-noindex': 'Quita noindex de los encabezados del servidor',
  'analyst.do.header-noindex.how':
    'El servidor envía {header}. Quita noindex de ese encabezado en la configuración del servidor, del hosting o de la CDN, y vuelve a revisar la página para confirmarlo.',
  'analyst.do.robots-txt': 'Deja que los buscadores rastreen esta página',
  'analyst.do.robots-txt.how':
    'El robots.txt contiene {rule}, que abarca {path}. Borra esa línea o limítala a las direcciones que de verdad quieras mantener fuera.',
  'analyst.do.robots-txt-error': 'Haz que robots.txt cargue sin fallos',
  'analyst.do.robots-txt-error.how':
    'Abre {url}. Debe cargar rápido con el estado 200, o responder 404 si no necesitas reglas, pero nunca con un error del servidor.',
  'analyst.do.redirects': 'Enlaza directamente a la dirección final',
  'analyst.do.redirects.how':
    'Apunta tus enlaces, el sitemap y el enlace canónico a {url}, y haz que cada dirección antigua redirija allí en un solo paso.',
  'analyst.do.noindex': 'Deja que los buscadores indexen la página',
  'analyst.do.noindex.how': 'Quita la metaetiqueta robots o cámbiala por {snippet}.',
  'analyst.do.nofollow': 'Comprueba si se deben seguir los enlaces de la página',
  'analyst.do.nofollow.how':
    'Si los buscadores deben seguir los enlaces de esta página, quita nofollow de su metaetiqueta robots.',
  'analyst.do.head': 'Devuelve las etiquetas importantes al head',
  'analyst.do.head.how':
    'Un elemento que pertenece al body aparece al principio del head y lo cierra. Muévelo al body, después de las etiquetas title, meta y link.',
  'analyst.do.title-missing': 'Dale un título a la página',
  'analyst.do.title-missing.how': 'Añade esto dentro del head y ajústalo a tu estilo: {snippet}',
  'analyst.do.title': 'Reescribe el título',
  'analyst.do.title.how':
    'Nombra primero lo que ofrece la página y al final tu marca, en unos 60 caracteres. Por ejemplo: {snippet}',
  'analyst.do.description': 'Escribe una metadescripción',
  'analyst.do.description.how': 'Añade esto dentro del head y ajústalo a tu estilo: {snippet}',
  'analyst.do.lang': 'Declara el idioma de la página',
  'analyst.do.lang.how':
    'Empieza la página con {snippet} para que los lectores de pantalla pronuncien bien el texto y los navegadores ofrezcan la traducción correcta.',
  'analyst.do.language-mismatch': 'Declara el idioma en que está escrito el texto',
  'analyst.do.language-mismatch.how':
    'La página dice que está en {declaredLanguage}, pero su texto está escrito en {detectedLanguage}. Cambia la etiqueta html por {snippet}.',
  'analyst.do.viewport': 'Haz que la página se adapte a los móviles',
  'analyst.do.viewport.how': 'Añade {snippet} al head y no bloquees el zoom.',
  'analyst.do.canonical': 'Corrige el enlace canónico',
  'analyst.do.canonical.how':
    'Deja un solo enlace canónico en el head, con la dirección completa de la página que quieres en los resultados: {snippet}',
  'analyst.do.h1': 'Dale a la página un encabezado principal',
  'analyst.do.h1.how':
    'Añade un único h1 cerca del principio que diga lo que ofrece la página, por ejemplo {snippet}.',
  'analyst.do.generic-heading': 'Haz que el encabezado principal diga lo que ofrece la página',
  'analyst.do.generic-heading.how':
    '«{heading}» podría estar en cualquier sitio. Nombra el tema, por ejemplo {snippet}.',
  'analyst.do.heading-order': 'Corrige los niveles de los encabezados',
  'analyst.do.heading-order.how':
    'Usa h2 para las secciones principales y h3 dentro de ellas, sin saltarte niveles.',
  'analyst.do.heading-empty': 'Rellena o quita los encabezados vacíos',
  'analyst.do.heading-empty.how':
    'Dale a cada encabezado un texto visible, o quítalo si solo añade espacio.',
  'analyst.do.alt': 'Describe las imágenes que transmiten información',
  'analyst.do.alt.how':
    '{count, plural, one {Añade texto alternativo a esta imagen} other {Añade texto alternativo a estas # imágenes}}: unas palabras sobre lo que muestra cada una. Deja alt vacío en las decorativas. Empieza por {examples}.',
  'analyst.do.link-names': 'Dale un nombre a cada enlace',
  'analyst.do.link-names.how':
    '{count, plural, one {Dale a este enlace} other {Dales a estos # enlaces}} un texto visible, o un aria-label si son iconos. Empieza por {examples}.',
  'analyst.do.crawlable': 'Usa direcciones reales en los enlaces',
  'analyst.do.crawlable.how':
    'Sustituye los enlaces javascript: por un href normal a la página que abren, para que los buscadores puedan seguirlos.',
  'analyst.do.structured-data': 'Corrige los datos estructurados',
  'analyst.do.structured-data.how':
    'Pega cada bloque JSON-LD en la prueba de resultados enriquecidos de Google, corrige los errores que muestre y vuelve a probar.',
  'analyst.do.hreflang': 'Corrige las anotaciones de idioma',
  'analyst.do.hreflang.how':
    'Usa códigos como en, en-GB o tr, incluye esta página entre sus propias alternativas y haz que cada página indicada enlace de vuelta.',
  'analyst.do.charset': 'Declara UTF-8',
  'analyst.do.charset.how': 'Pon {snippet} al principio del head.',
  'analyst.do.social': 'Añade etiquetas para vistas previas de enlaces',
  'analyst.do.social.how':
    'Añade esto al head para que los enlaces compartidos muestren título, texto e imagen: {snippet}',
  'analyst.do.thin': 'Cuenta más sobre lo que ofreces',
  'analyst.do.thin.how':
    'La página tiene {words} palabras. Explica con tus palabras qué ofreces, para quién, dónde y cuál es el siguiente paso.',
  'analyst.why.language-mismatch':
    'Los lectores de pantalla pronuncian el texto según el idioma declarado, y los navegadores lo usan para ofrecer traducción.',
  'analyst.why.generic-heading':
    'El encabezado principal dice a visitantes y buscadores de qué trata la página; un saludo no les dice nada.',
  'analyst.why.generic-title':
    '«{title}» podría ser el título de cualquier página, y el título es lo primero que leen quienes buscan.',
  'analyst.why.thin':
    'Buscadores y visitantes entienden una página por sus palabras. Muy poco texto les da poco con qué trabajar.',
  'analyst.evidence.declared': 'Idioma declarado',
  'analyst.evidence.detected': 'Idioma del texto',
  'analyst.evidence.words': 'Palabras',
  'analyst.note.topic-title':
    'La página habla sobre todo de «{topic}», pero el título no lo menciona.',
  'analyst.note.topic-h1':
    'El encabezado principal no menciona «{topic}», el tema principal de la página.',
  'analyst.note.topic-description': 'La descripción no menciona «{topic}».',
  'analyst.note.brand':
    'El título no incluye tu marca, «{brand}». Ponerla al final ayuda a que te reconozcan en los resultados.',
  'analyst.note.thin':
    'El texto es bastante corto ({words} palabras). Asegúrate de que responde a lo que la gente busca.',
  'analyst.note.long-sentences':
    'Las frases tienen de media {average} palabras. Las frases cortas se leen mejor, sobre todo en el móvil.',
  'analyst.note.same-title-description':
    'El título y la descripción dicen lo mismo; la descripción puede aportar detalles.',
  'analyst.note.description-short':
    'La descripción es corta ({count} caracteres); hay sitio para una frase que invite a hacer clic.',
  'analyst.note.headings-few':
    'La página no tiene encabezados de sección. Los encabezados ayudan a los visitantes a recorrerla y a los buscadores a entender su estructura.',
  'analyst.note.internal-links':
    'La página no enlaza a ninguna otra página de tu sitio. Los enlaces a páginas relacionadas ayudan a visitantes y buscadores a encontrarlas.',
  'analyst.note.contact':
    'La página muestra datos de contacto. Los datos estructurados de tipo LocalBusiness u Organization pueden describir tu negocio a los buscadores.',
  'analyst.note.prices':
    'La página menciona precios. Los datos estructurados de tipo Product u Offer pueden describirlos a los buscadores.',
  'analyst.note.slow':
    'El servidor tardó {seconds} segundos en enviar el HTML. Apunta a bastante menos de un segundo; la caché o un hosting más rápido ayudan.',
  'analyst.note.compression':
    'El HTML ({kilobytes} KB) se envía sin comprimir. Activar gzip o Brotli en el servidor lo hace más pequeño y rápido.',
  'analyst.note.heavy':
    'Solo el HTML ocupa {kilobytes} KB. Las páginas grandes cargan despacio en el móvil; busca datos o scripts incrustados que puedas sacar.',
  'analyst.note.hsts':
    'HTTPS funciona, pero el servidor no envía HSTS, que indica a los navegadores que usen siempre la versión segura.',
  'analyst.note.sitemap':
    'El robots.txt no indica ningún sitemap. Una línea «Sitemap:» con la dirección de tu sitemap ayuda a los buscadores a encontrar todas las páginas.',
  'analyst.caveat.scope':
    'Este análisis solo lee esta página. No ve posiciones, competidores, enlaces desde otros sitios ni lo rápida que se siente en un móvil.',
  'analyst.caveat.pasted':
    'No se revisaron la respuesta del servidor ni el robots.txt, porque el HTML se proporcionó directamente.',
  'analyst.caveat.little-text':
    'El HTML contiene muy poco texto. Si el contenido aparece mediante JavaScript, los buscadores pueden ver menos que los visitantes.',
  'analyst.caveat.no-language':
    'No se pudo saber el idioma de la página por su texto, así que se omitieron las comprobaciones que leen palabras.',
  'analyst.caveat.ideas':
    'Las ideas de título y descripción se construyen con las propias palabras de la página; ajústalas para que suenen como tú.',
  'analyst.summary.strong':
    'La página está en buena forma: nada de lo encontrado la deja fuera de la búsqueda y lo básico está en su sitio.',
  'analyst.summary.fair':
    'La página se puede encontrar, pero {count, plural, one {# problema la frena} other {# problemas la frenan}}.',
  'analyst.summary.weak':
    '{count, plural, one {# problema grave puede} other {# problemas graves pueden}} impedir que esta página se encuentre o se use.',
  'analyst.summary.blocked':
    'Tal como está, se pide a los buscadores que no muestren esta página, o no pueden llegar a ella.',
  'analyst.summary.topic': 'Su texto trata sobre todo de «{topic}».',
  'analyst.summary.start': 'Empieza por esto: {action}.',
  'analyst.summary.done':
    'No queda nada urgente: mantén el texto al día y vuelve a revisar la página después de cada cambio.',

  'mentions.kind.citation': 'Citado con enlace',
  'mentions.kind.mention': 'Nombrado sin enlace',
  'mentions.method.own-check': 'Se lo pregunté yo al asistente',
  'mentions.method.shared-with-me': 'Alguien me lo compartió',
  'mentions.method.screenshot': 'Desde una captura de pantalla',
  'mentions.method.other': 'De otra forma',
  'mentions.certainty.confirmed': 'Confirmado',
  'mentions.certainty.uncertain': 'Dudoso',
  'mentions.error.required': 'Este campo es obligatorio.',
  'mentions.error.too-long': 'Usa como máximo {max} caracteres.',
  'mentions.error.invalid-url':
    'Escribe una dirección web completa que empiece por https:// o http://.',
  'mentions.error.invalid-date': 'Escribe una fecha válida.',
  'mentions.error.future-date': 'La fecha no puede ser futura.',
  'mentions.error.invalid-choice': 'Elige una de las opciones.',
  'mentions.limit.scope':
    'Estas son las menciones que registraste. Muestran dónde has visto tu sitio, no con qué frecuencia lo mencionan en general los asistentes de IA.',

  // AI visibility check
  'visibility.approximate': 'Visibilidad aproximada',
  'visibility.approximate.why':
    'Las respuestas que obtiene un programa pueden diferir de lo que la gente ve en las aplicaciones, y cambian de un día a otro. Lee estos resultados como una estimación, no como una medición.',
  'visibility.paid-tools': 'Esta comprobación usa herramientas de pago de {provider}.',
  'visibility.cost.calls':
    '{questions, plural, one {# pregunta} other {# preguntas}} × {engines, plural, one {# IA} other {# IA}} × {repeats, plural, one {# vez} other {# veces}} = {calls, plural, one {# llamada} other {# llamadas}}',
  'visibility.cost.estimate':
    'Costo estimado: {calls, plural, one {# llamada} other {# llamadas}}, aproximadamente {amount}.',
  'visibility.cost.unpriced':
    '{calls, plural, one {# llamada no tiene precio indicado, así que la estimación no la incluye.} other {# llamadas no tienen precio indicado, así que la estimación no las incluye.}}',
  'visibility.cost.billing':
    '{billing, select, account {Este cargo no está incluido en tu suscripción a SearchUnveil y se cobra a tu propia cuenta de {provider}.} other {Este cargo no está incluido en tu suscripción a SearchUnveil y se descuenta de tu saldo de {provider}.}}',
  'visibility.cost.failed-free': 'Las llamadas fallidas no se cobran.',
  'visibility.cost.confirm': '¿Quieres continuar?',
  'visibility.cost.reduce':
    'Para pagar menos, haz menos preguntas, elige menos IA o repite cada pregunta menos veces. Los competidores no cuestan nada extra.',
  'visibility.cost.actual':
    'Esta comprobación hizo {calls, plural, one {# llamada} other {# llamadas}} y costó aproximadamente {amount}.',
  'visibility.cost.actual.unpriced':
    '{calls, plural, one {# llamada cobrada no tenía precio indicado y no está incluida.} other {# llamadas cobradas no tenían precio indicado y no están incluidas.}}',
  'visibility.cost.interrupted':
    '{calls, plural, one {# llamada se interrumpió cuando detuviste la comprobación; {provider} podría cobrarla de todos modos.} other {# llamadas se interrumpieron cuando detuviste la comprobación; {provider} podría cobrarlas de todos modos.}}',
  'visibility.cell.cited': 'Citado',
  'visibility.cell.position': 'fuente {position}',
  'visibility.cell.named': 'Nombrado, sin enlace',
  'visibility.cell.absent': 'No aparece',
  'visibility.cell.no-answer': 'Sin respuesta',
  'visibility.cell.rate': '{count} de {answers}',
  'visibility.summary':
    'Apareces en {present} de {answers, plural, one {# respuesta} other {# respuestas}}.',
  'visibility.summary.competitor':
    '{name} aparece en {present} de {answers, plural, one {# respuesta} other {# respuestas}}.',
  'visibility.summary.none':
    'No llegó ninguna respuesta, así que todavía no hay nada que comparar.',
  'visibility.stopped':
    'Detuviste la comprobación, así que estos resultados solo cubren las respuestas recibidas hasta ese momento.',
  'visibility.other-sources': 'Sitios citados en lugar del tuyo',
  'visibility.failure':
    '{reason, select, unavailable {La IA no estaba disponible} rate-limited {Demasiadas solicitudes a la vez} refused {La IA se negó a responder} no-balance {Saldo insuficiente} timeout {No respondió a tiempo} stopped {La detuviste tú} other {Algo salió mal}}',

  'diagnostic.input.empty': 'Este archivo está vacío.',
  'diagnostic.input.binary':
    'No es un archivo de texto. Elige un archivo CSV o el archivo ZIP que descarga Search Console.',
  'diagnostic.input.spreadsheet':
    'Es un libro de hoja de cálculo. Guárdalo como CSV o usa el archivo ZIP original de Search Console.',
  'diagnostic.input.unsupported-type': 'Este tipo de archivo no es compatible.',
  'diagnostic.encoding.legacy-fallback':
    'Este archivo no está guardado como UTF-8, así que lo leímos como {encoding}. Si ves letras incorrectas, vuelve a exportarlo desde Search Console sin abrirlo antes en una hoja de cálculo.',
  'diagnostic.encoding.utf16-without-bom':
    'Este archivo usa la codificación {encoding}. La detectamos automáticamente.',
  'diagnostic.csv.no-header': 'Este archivo no tiene fila de encabezado.',
  'diagnostic.csv.unterminated-quote': 'Un valor que empieza con comillas nunca se cierra.',
  'diagnostic.csv.stray-quote': 'Hay unas comillas dentro de un valor. Las dejamos tal cual.',
  'diagnostic.csv.text-after-quote':
    'Hay texto después de unas comillas de cierre. Lo conservamos como parte del valor.',
  'diagnostic.csv.field-count':
    'Esta fila tiene {actual} valores, pero el encabezado tiene {expected}.',
  'diagnostic.csv.too-many-rows':
    'Este archivo tiene más de {limit} filas, el máximo que podemos leer.',
  'diagnostic.csv.too-many-columns':
    'Una fila tiene más de {limit} columnas, el máximo que podemos leer.',
  'diagnostic.csv.field-too-long':
    'Un valor tiene más de {limit} caracteres, el máximo que podemos leer.',
  'diagnostic.zip.invalid':
    'Este archivo ZIP está dañado o incompleto. Prueba a descargarlo de nuevo.',
  'diagnostic.zip.multi-disk':
    'Este archivo ZIP está dividido en varias partes, algo no compatible.',
  'diagnostic.zip.encrypted':
    'Este archivo ZIP está protegido con contraseña. Usa una exportación sin contraseña.',
  'diagnostic.zip.unsupported-method':
    '«{entry}», dentro de este archivo ZIP, usa un método de compresión que no podemos leer.',
  'diagnostic.zip.too-many-entries': 'Este archivo ZIP contiene más de {limit} archivos.',
  'diagnostic.zip.entry-too-large':
    '«{entry}», dentro de este archivo ZIP, ocupa más de {megabytes} MB al descomprimirse.',
  'diagnostic.zip.suspicious-ratio':
    '«{entry}», dentro de este archivo ZIP, está tan comprimido que descomprimirlo podría no ser seguro, así que nos detuvimos.',
  'diagnostic.zip.overlapping-entries':
    'Los archivos de este ZIP se solapan, señal de un archivo dañado o inseguro, así que nos detuvimos.',
  'diagnostic.zip.corrupt-entry': '«{entry}», dentro de este archivo ZIP, está dañado.',
  'diagnostic.zip.checksum-mismatch':
    '«{entry}», dentro de este archivo ZIP, no superó la comprobación de integridad.',
  'diagnostic.zip.no-csv': 'Este archivo ZIP no contiene archivos CSV.',
  'diagnostic.zip.website':
    'Este archivo ZIP contiene un sitio web ({pages, plural, one {# página web} other {# páginas web}} entre {files, plural, one {# archivo} other {# archivos}}), no una exportación de Search Console. La revisión de página puede revisar cada una de sus páginas.',

  'diagnostic.gsc.no-tables':
    'No encontramos datos de Search Console en los archivos que elegiste.',
  'diagnostic.gsc.unrecognized-table':
    'Este archivo no parece una exportación de rendimiento de Search Console.',
  'diagnostic.gsc.duplicate-table':
    'Elegiste más de una tabla {kind, select, date {de fechas} query {Consultas} page {Páginas} country {Países} device {Dispositivos} searchAppearance {Aspecto en la búsqueda} other {del mismo tipo}}. Usamos la primera.',
  'diagnostic.gsc.columns-inferred':
    'No reconocimos los nombres de las columnas, así que las emparejamos según el orden estándar de Search Console y comprobamos sus valores.',
  'diagnostic.gsc.dimension-inferred':
    'No reconocimos el nombre de la primera columna. {kind, select, date {Sus valores son fechas.} page {Sus valores son direcciones de páginas.} other {Mostramos sus valores tal cual.}}',
  'diagnostic.gsc.missing-columns':
    'A esta tabla le falta la columna {metric, select, clicks {Clics} impressions {Impresiones} ctr {CTR} position {Posición} other {{metric}}}.',
  'diagnostic.gsc.invalid-number': '«{value}» no es un número válido.',
  'diagnostic.gsc.invalid-date': '«{value}» no es una fecha válida.',
  'diagnostic.gsc.ambiguous-dates':
    'No sabemos si estas fechas empiezan por el día o por el mes. Vuelve a exportar el archivo desde Search Console sin editarlo.',
  'diagnostic.gsc.mixed-decimal-separators':
    'La columna «{column}» mezcla puntos y comas decimales.',
  'diagnostic.gsc.decimal-comma': 'La columna «{column}» usa la coma como separador decimal.',
  'diagnostic.gsc.ctr-as-fraction':
    'La columna «{column}» da el porcentaje de clics como fracción: 0,05 significa un 5 %.',
  'diagnostic.gsc.clicks-exceed-impressions':
    'Esta fila tiene más clics ({clicks}) que impresiones ({impressions}), algo que Search Console nunca indica.',
  'diagnostic.gsc.columns-swapped':
    'La mayoría de las filas tienen más clics que impresiones. Puede que las dos columnas estén intercambiadas, así que no usamos esta tabla.',
  'diagnostic.gsc.ctr-mismatch':
    'En {rows, plural, one {# fila} other {# filas}}, el porcentaje de clics no coincide con los clics divididos entre las impresiones. Puede que el archivo se haya editado.',
  'diagnostic.gsc.position-out-of-range':
    '«{value}» no es una posición media válida. Las posiciones empiezan en 1.',
  'diagnostic.gsc.duplicate-key': '«{key}» aparece más de una vez. Usamos la primera fila.',
  'diagnostic.gsc.empty-key': 'La primera columna de esta fila está vacía, así que la omitimos.',
  'diagnostic.gsc.empty-table': 'Esta tabla no tiene filas que podamos usar.',

  'diagnostic.mentions.invalid-json': 'Este archivo no es un JSON válido.',
  'diagnostic.mentions.invalid-format':
    'Este archivo no es un registro de menciones de SearchUnveil.',
  'diagnostic.mentions.unsupported-version':
    'Este registro de menciones se creó con una versión más reciente de SearchUnveil (formato {version}).',
  'diagnostic.mentions.too-many':
    'Este registro tiene más de {limit} menciones, el máximo que podemos leer.',
  'diagnostic.mentions.invalid-field': 'Entrada {index}: «{field}» falta o no es válido.',
  'diagnostic.mentions.duplicate-id':
    'La entrada {index} repite una entrada anterior. Conservamos la primera.',

  // Diagnostics: saved AI visibility checks
  'diagnostic.visibility.invalid-json': 'Este archivo no es un JSON válido.',
  'diagnostic.visibility.invalid-format':
    'Este archivo no es una comprobación de visibilidad en IA guardada por SearchUnveil.',
  'diagnostic.visibility.unsupported-version':
    'Esta comprobación se guardó con una versión más reciente de SearchUnveil (formato {version}).',
  'diagnostic.visibility.invalid-field':
    'Esta comprobación guardada está dañada: «{field}» falta o no es válido.',
  'diagnostic.visibility.invalid-answer':
    'La respuesta {index} está dañada, así que la dejamos fuera.',
  'diagnostic.visibility.duplicate-answer':
    'La respuesta {index} repite una anterior. Conservamos la primera.',

  'diagnostic.page.empty': 'Pega el HTML de una página, o elige un archivo HTML, para revisarla.',
  'diagnostic.page.too-large':
    'Este HTML tiene más de {limit} caracteres, el máximo que podemos revisar.',
  'diagnostic.page.not-html':
    'Esto no parece HTML. Pega el código fuente de la página, no su dirección.',
  'diagnostic.page.invalid-url':
    '«{value}» no es una dirección web completa, así que omitimos las comprobaciones que comparan los enlaces con la página.',
  'diagnostic.site.no-pages':
    'Ninguno de los archivos que elegiste es una página web (un archivo .html o .htm).',

  'diagnostic.diagnostic.more':
    '…y {count, plural, one {# caso más como este} other {# casos más como este}}.',
};
