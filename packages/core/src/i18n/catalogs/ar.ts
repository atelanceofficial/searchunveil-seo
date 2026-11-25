import type { CoreCatalog } from './en.ts';

/**
 * العربية الفصحى المعاصرة. تستخدم صيغ الجمع الست (zero, one, two, few, many, other) حيث
 * يتغير المعدود؛ وحيث يصعب التوافق تُستخدم صيغة «التسمية: العدد». علامات التنصيص «…».
 */
export const ar: CoreCatalog = {
  'status.attention': 'يحتاج إلى اهتمام',
  'status.review': 'يستحق النظر',
  'status.good': 'يبدو جيدًا',
  'status.info': 'من المفيد معرفته',

  'metric.clicks': 'النقرات',
  'metric.impressions': 'مرات الظهور',
  'metric.ctr': 'نسبة النقر إلى الظهور',
  'metric.position': 'متوسط الموضع',
  'metric.clicks.help': 'عدد مرات النقر للانتقال إلى موقعك من بحث Google.',
  'metric.impressions.help': 'عدد مرات ظهور رابط إلى موقعك في نتائج بحث شاهدها أحدهم.',
  'metric.ctr.help': 'نسبة مرات الظهور التي تحولت إلى نقرات.',
  'metric.position.help':
    'الموضع الذي ظهر فيه موقعك عادةً في النتائج. الرقم الأقل أفضل: 1 هو أعلى الصفحة.',

  'evidence.recent-period': 'الفترة الأخيرة',
  'evidence.previous-period': 'الفترة السابقة',
  'evidence.period': '{range}',
  'evidence.change': 'التغيّر',
  'evidence.first-day': 'اليوم الأول',
  'evidence.last-day': 'اليوم الأخير',
  'evidence.impressions-on': 'مرات الظهور في {day}',
  'evidence.typical-impressions': 'يوم معتاد',
  'evidence.head-breaker': 'ما أنهى قسم head',
  'evidence.title': 'عنوان الصفحة',
  'evidence.description': 'الوصف',
  'evidence.viewport': 'منفذ العرض',
  'evidence.canonical': 'الرابط الأساسي',
  'evidence.heading': 'عنوان القسم',
  'evidence.heading-level': 'h{level}',
  'evidence.status': 'رمز الحالة',
  'evidence.final-address': 'العنوان النهائي',
  'evidence.redirect': 'عمليات إعادة التوجيه',
  'evidence.header': 'عنوان HTTP',
  'evidence.robots-rule': 'قاعدة robots.txt',
  'evidence.response-time': 'زمن الاستجابة (بالثواني)',
  'table.query': 'طلب البحث',
  'table.page': 'الصفحة',
  'table.text': '{text}',
  'table.typical-ctr': 'المعتاد في موقعك',
  'table.primary-period': 'الفترة الرئيسية',
  'table.comparison-period': 'فترة المقارنة',
  'table.tag': 'الوسم',
  'table.image': 'الصورة',
  'table.link': 'الرابط',

  'ref.gsc-metrics': 'مساعدة Search Console: معنى مرات الظهور والموضع والنقرات',
  'ref.gsc-performance': 'مساعدة Search Console: تقرير الأداء',
  'ref.title-links': 'مركز Google للبحث: التأثير في روابط العناوين',
  'ref.snippets': 'مركز Google للبحث: المقتطفات والأوصاف التعريفية',
  'ref.robots-meta': 'مركز Google للبحث: علامة robots الوصفية',
  'ref.canonical': 'مركز Google للبحث: عناوين URL الأساسية',
  'ref.hreflang': 'مركز Google للبحث: النسخ المترجمة من الصفحات',
  'ref.structured-data': 'مركز Google للبحث: مقدمة عن البيانات المنظَّمة',
  'ref.rich-results-test': 'اختبار النتائج المنسّقة من Google',
  'ref.images': 'مركز Google للبحث: أفضل ممارسات الصور',
  'ref.valid-metadata': 'مركز Google للبحث: استخدام بيانات وصفية صالحة للصفحة',
  'ref.crawlable-links': 'مركز Google للبحث: جعل الروابط قابلة للزحف',
  'ref.wcag-language': 'WCAG 2.2: لغة الصفحة (3.1.1)',
  'ref.wcag-non-text': 'WCAG 2.2: المحتوى غير النصي (1.1.1)',
  'ref.wcag-resize': 'WCAG 2.2: تغيير حجم النص (1.4.4)',
  'ref.wcag-link-purpose': 'WCAG 2.2: الغرض من الرابط (2.4.4)',
  'ref.wcag-structure': 'WCAG 2.2: المعلومات والعلاقات (1.3.1)',
  'ref.viewport': 'MDN: علامة viewport الوصفية',
  'ref.open-graph': 'بروتوكول Open Graph',
  'ref.robots-txt': 'مركز Google للبحث: مقدمة عن ملف robots.txt',
  'ref.http-status': 'مركز Google للبحث: رموز حالة HTTP وأخطاء الشبكة',
  'ref.https': 'web.dev: لماذا يهم HTTPS',

  'gsc.headline.method':
    'قارنّا الفترة {current} مع الفترة {previous}، مع مطابقة كل يوم باليوم نفسه من الأسبوع.',
  'gsc.headline.up-up': 'عثر عدد أكبر من الأشخاص على صفحاتك وزاروها.',
  'gsc.headline.up-flat': 'نقر عدد أكبر من الأشخاص، بينما ظهرت صفحاتك بالقدر نفسه تقريبًا.',
  'gsc.headline.up-down': 'ارتفعت النقرات رغم أن صفحاتك ظهرت بشكل أقل.',
  'gsc.headline.flat-up': 'ظهرت صفحاتك في البحث أكثر من قبل، لكن النقرات بقيت على حالها تقريبًا.',
  'gsc.headline.flat-flat': 'بقي أداء البحث على حاله تقريبًا.',
  'gsc.headline.flat-down': 'ظهرت صفحاتك بشكل أقل، لكن النقرات بقيت على حالها تقريبًا.',
  'gsc.headline.down-up': 'ظهرت صفحاتك أكثر من قبل، لكن عدد من نقروا أصبح أقل.',
  'gsc.headline.down-flat': 'نقر عدد أقل من الأشخاص، بينما ظهرت صفحاتك بالقدر نفسه تقريبًا.',
  'gsc.headline.down-down': 'ظهرت صفحاتك بشكل أقل وحصلت على نقرات أقل.',
  'gsc.headline.impressions-up':
    'ظهرت صفحاتك في البحث أكثر من قبل. النقرات ما زالت قليلة جدًا بحيث لا تمكن مقارنتها.',
  'gsc.headline.impressions-flat':
    'ظهرت صفحاتك بالقدر نفسه تقريبًا كما في السابق. النقرات ما زالت قليلة جدًا بحيث لا تمكن مقارنتها.',
  'gsc.headline.impressions-down':
    'ظهرت صفحاتك في البحث بشكل أقل. النقرات ما زالت قليلة جدًا بحيث لا تمكن مقارنتها.',
  'gsc.headline.insufficient': 'لا تتوفر بعدُ بيانات بحث كافية لمقارنة الفترات بشكل موثوق.',

  'gsc.check.growth-drivers':
    'حدِّد الصفحات وطلبات البحث التي تقف وراء النمو، وحافظ على دقة هذا المحتوى وتحديثه.',
  'gsc.check.queries-gained':
    'قارن طلبات البحث بين الفترتين لمعرفة أيها حصل على مرات ظهور أكثر، وهل تتوافق مع ما تقدمه صفحاتك.',
  'gsc.check.titles':
    'راجع عناوين الصفحات المعنية وأوصافها؛ فهي ما يقرؤه الناس قبل أن يقرروا النقر.',
  'gsc.check.position-shift':
    'تحقق من متوسط الموضع: كثيرًا ما تبدأ مرات الظهور الجديدة في مواضع أدنى من الصفحة، حيث ينقر عدد أقل من الأشخاص.',
  'gsc.check.lost-visibility':
    'حدِّد الصفحات وطلبات البحث التي فقدت مرات ظهور، وتأكد من أن هذه الصفحات ما زالت تعمل ويمكن فهرستها.',
  'gsc.check.site-changes':
    'فكّر في التغييرات الأخيرة على الموقع، مثل إعادة التصميم أو نقل الصفحات أو حذفها أو قواعد robots جديدة.',
  'gsc.check.seasonality':
    'قارن بالأسابيع نفسها من العام السابق؛ فالاهتمام بكثير من المواضيع يرتفع وينخفض مع المواسم.',
  'gsc.check.serp-features':
    'ابحث بنفسك عن طلبات البحث الرئيسية. قد تجتذب الإعلانات أو الفيديوهات أو الإجابات المولَّدة بالذكاء الاصطناعي في صفحة النتائج جزءًا من النقرات.',
  'gsc.check.opportunities':
    'اطّلع على الفرص أدناه لطلبات البحث والصفحات التي قد تحصل على نقرات أكثر.',
  'gsc.check.export-longer':
    'صدِّر نطاقًا زمنيًا أطول من Search Console، ويُفضَّل آخر 3 أشهر، للحصول على صورة أوضح.',
  'gsc.check.focused-page':
    'تأكد من أن صفحة واحدة واضحة ومحدَّثة تجيب عن كل طلب بحث، وأضف روابط إليها من الصفحات ذات الصلة.',
  'gsc.check.search-intent':
    'ابحث عن طلبات البحث التي تظهر لها هذه الصفحات، وتحقق مما إذا كانت الصفحات تجيب عما يريده الناس.',

  'gsc.change.clicks.up': 'ارتفعت النقرات بنسبة {change} لتصل إلى {current}.',
  'gsc.change.clicks.down': 'انخفضت النقرات بنسبة {change} لتصل إلى {current}.',
  'gsc.change.clicks.flat': 'بقيت النقرات على حالها تقريبًا عند {current}.',
  'gsc.change.clicks.started': 'ارتفعت النقرات من صفر إلى {current}.',
  'gsc.change.impressions.up': 'ارتفعت مرات الظهور بنسبة {change} لتصل إلى {current}.',
  'gsc.change.impressions.down': 'انخفضت مرات الظهور بنسبة {change} لتصل إلى {current}.',
  'gsc.change.impressions.flat': 'بقيت مرات الظهور على حالها تقريبًا عند {current}.',
  'gsc.change.impressions.started': 'ارتفعت مرات الظهور من صفر إلى {current}.',
  'gsc.change.ctr.up': 'ارتفعت نسبة النقر إلى الظهور من {previous} إلى {current}.',
  'gsc.change.ctr.down': 'انخفضت نسبة النقر إلى الظهور من {previous} إلى {current}.',
  'gsc.change.ctr.flat': 'بقيت نسبة النقر إلى الظهور على حالها تقريبًا عند {current}.',
  'gsc.change.position.better': 'تحسّن متوسط الموضع من {previous} إلى {current}.',
  'gsc.change.position.worse': 'تراجع متوسط الموضع من {previous} إلى {current}.',
  'gsc.change.position.flat': 'بقي متوسط الموضع على حاله تقريبًا عند {current}.',
  'gsc.daybyday.higher':
    'كانت القيمة أعلى في {count} من أصل {days, plural, one {يوم واحد} two {يومين} few {# أيام} many {# يومًا} other {# يوم}} مقارنةً باليوم نفسه من الأسبوع في الفترة السابقة.',
  'gsc.daybyday.lower':
    'كانت القيمة أدنى في {count} من أصل {days, plural, one {يوم واحد} two {يومين} few {# أيام} many {# يومًا} other {# يوم}} مقارنةً باليوم نفسه من الأسبوع في الفترة السابقة.',
  'gsc.daybyday.uneven':
    'كان التغيّر متفاوتًا من يوم لآخر (عدد الأيام الأعلى: {higher}، والأدنى: {lower})، لذا قد تفسّر أيام قليلة معظمه.',

  'gsc.limit.weekday-matching':
    'تغطي كل فترة أسابيع كاملة، حتى لا تشوّه الفروق بين أيام العمل وعطلات نهاية الأسبوع المقارنة.',
  'gsc.limit.ctr-features':
    'تعتمد نسبة النقر إلى الظهور أيضًا على ما تعرضه صفحة النتائج من عناصر أخرى، مثل الإعلانات أو الفيديوهات أو الإجابات المولَّدة بالذكاء الاصطناعي.',
  'gsc.limit.position-mix':
    'يتغير متوسط الموضع أيضًا عندما يتغير مزيج عمليات البحث، وليس فقط عندما تتغير الترتيبات.',
  'gsc.limit.position-average':
    'يلخّص متوسط الموضع عمليات بحث كثيرة. وفي عمليات بحث بعينها قد تظهر الصفحة في موضع أعلى أو أدنى.',

  'gsc.opportunity.low-ctr.query':
    'يحصل {count, plural, one {طلب بحث واحد} two {طلبا بحث} few {# طلبات بحث} many {# طلبَ بحث} other {# طلب بحث}} على نقرات أقل من النتائج المماثلة',
  'gsc.opportunity.low-ctr.page':
    'تحصل {count, plural, one {صفحة واحدة} two {صفحتان} few {# صفحات} many {# صفحةً} other {# صفحة}} على نقرات أقل من النتائج المماثلة',
  'gsc.opportunity.low-ctr.summary':
    'تظهر ضمن أول عشر نتائج، لكن نسبة النقر إلى الظهور لديها لا تبلغ حتى {share} مما تحققه نتائجك الأخرى في مواضع مماثلة.',
  'gsc.opportunity.near-top.query':
    'يأتي ترتيب {count, plural, one {طلب بحث واحد} two {طلبَي بحث} few {# طلبات بحث} many {# طلبَ بحث} other {# طلب بحث}} مباشرةً بعد المراكز العشرة الأولى',
  'gsc.opportunity.near-top.page':
    'يأتي ترتيب {count, plural, one {صفحة واحدة} two {صفحتين} few {# صفحات} many {# صفحةً} other {# صفحة}} مباشرةً بعد المراكز العشرة الأولى',
  'gsc.opportunity.near-top.summary':
    'يتراوح متوسط موضعها بين {from} و{to}، ويكثر البحث عنها. وقد يؤدي تحسين الصفحة التي تجيب عنها إلى ظهورها أمام الباحثين.',
  'gsc.opportunity.zero-click-pages':
    '{count, plural, one {صفحة واحدة تظهر} two {صفحتان تظهران} few {# صفحات تظهر} many {# صفحةً تظهر} other {# صفحة تظهر}} دون أن ينقر عليها أحد',
  'gsc.opportunity.zero-click-pages.summary':
    'ظهرت كل صفحة منها في نتائج البحث {min, plural, one {مرة واحدة} two {مرتين} few {# مرات} many {# مرةً} other {# مرة}} على الأقل دون أي نقرة.',
  'gsc.movers.gains':
    '{kind, select, page {الصفحات} other {طلبات البحث}} الأكثر ارتفاعًا في النقرات',
  'gsc.movers.losses':
    '{kind, select, page {الصفحات} other {طلبات البحث}} الأكثر تراجعًا في النقرات',

  'gsc.note.no-dates': 'لا يتضمن هذا الملف المُصدَّر بيانات يومية، لذا لا يمكن عرض الاتجاهات.',
  'gsc.note.short-range':
    'يغطي هذا الملف المُصدَّر {days, plural, one {يومًا واحدًا} two {يومين} few {# أيام} many {# يومًا} other {# يوم}} فقط، وهي مدة أقصر من أن تسمح بمقارنة فترتين.',
  'gsc.note.missing-days':
    '{count, plural, one {يوم واحد بلا بيانات} two {يومان بلا بيانات} few {# أيام بلا بيانات} many {# يومًا بلا بيانات} other {# يوم بلا بيانات}}',
  'gsc.note.missing-days.summary':
    'الأيام التي لا صف لها لم تحصل عادةً على أي مرات ظهور، لذلك احتسبناها صفرًا.',
  'gsc.note.incomplete-days':
    '{count, plural, one {يبدو اليوم الأخير غير مكتمل} two {يبدو اليومان الأخيران غير مكتملين} other {تبدو الأيام الأخيرة غير مكتملة (#)}}',
  'gsc.note.incomplete-days.summary':
    'ربما لا يزال Search Console يعالج البيانات الحديثة، لذلك استبعدنا {count, plural, one {هذا اليوم} two {هذين اليومين} other {هذه الأيام}} من المقارنة.',
  'gsc.note.anonymized-queries': 'يغطي جدول طلبات البحث {share} من إجمالي النقرات',
  'gsc.note.anonymized-queries.summary':
    'لا يعرض Search Console طلبات البحث النادرة حفاظًا على خصوصية الباحثين، ولا يصدّر أكثر من {limit} صف. لذلك تكون إجماليات جدول طلبات البحث أقل من إجماليات الرسم البياني.',
  'gsc.note.row-limit':
    '{kind, select, query {بلغ جدول طلبات البحث} page {بلغ جدول الصفحات} country {بلغ جدول البلدان} other {بلغ أحد الجداول}} {limit} صف',
  'gsc.note.row-limit.summary':
    'هذا هو حد التصدير في Search Console، لذا قد تكون بعض {kind, select, query {طلبات البحث} page {الصفحات} country {البلدان} other {الصفوف}} الأقل تكرارًا مفقودة.',
  'gsc.note.partial-totals':
    'الإجماليات مأخوذة من {kind, select, query {جدول طلبات البحث} page {جدول الصفحات} country {جدول البلدان} device {جدول الأجهزة} other {الجدول المُصدَّر}}',
  'gsc.note.partial-totals.summary':
    '{kind, select, query {تُخفى طلبات البحث النادرة حفاظًا على الخصوصية، لذا فهذه الإجماليات أقل من الإجماليات الفعلية لموقعك.} page {عندما تظهر عدة صفحات من موقعك في البحث نفسه تُحتسب كل منها، لذا قد تختلف هذه الإجماليات عن إجماليات موقعك.} other {قد تختلف عن إجماليات موقعك. أضف جدول البيانات اليومية للحصول على إجماليات كاملة.}}',
  'gsc.note.comparison-export': 'يقارن هذا الملف المُصدَّر «{primary}» مع «{comparison}».',
  'gsc.note.comparison-export.unlabeled': 'يقارن هذا الملف المُصدَّر بين نطاقين زمنيين.',
  'gsc.note.filters': 'إعدادات التصدير',

  'page.limit.source':
    'راجعنا رمز HTML الذي قدّمته. ولا يشمل ذلك المحتوى الذي تضيفه JavaScript بعد تحميل الصفحة.',
  'page.limit.scope':
    'تؤثر أيضًا عناوين HTTP وملف robots.txt والسرعة والروابط من المواقع الأخرى في البحث، لكنها ليست جزءًا من هذه المراجعة.',
  'page.limit.width': 'تقيس نتائج البحث العرض بالبكسل لا بالأحرف، لذا فهذا تقدير.',
  'page.head.ok': 'جميع الوسوم المهمة داخل قسم head',
  'page.head.broken':
    '{count, plural, one {أصبح وسم مهم واحد} two {أصبح وسمان مهمان} few {أصبحت # وسوم مهمة} many {أصبح # وسمًا مهمًا} other {أصبح # وسم مهم}} خارج قسم head',
  'page.head.broken.summary':
    'ظهر قبل {count, plural, one {هذا الوسم} two {هذين الوسمين} other {هذه الوسوم}} عنصر لا ينتمي إلى قسم head، فأنهى المتصفح القسم مبكرًا. وتتجاهل محركات البحث هذه الوسوم خارج قسم head.',
  'page.head.noscript':
    '{count, plural, one {قد يُتجاهل وسم واحد} two {قد يُتجاهل وسمان} few {قد تُتجاهل # وسوم} many {قد يُتجاهل # وسمًا} other {قد يُتجاهل # وسم}} بعد كتلة noscript',
  'page.head.noscript.summary':
    'تؤدي صورة أو عنصر مشابه داخل noscript في قسم head إلى إنهاء القسم بالنسبة إلى الأدوات التي لا تشغّل JavaScript. ولا تتأثر المتصفحات التي تشغّل JavaScript.',
  'page.check.head': 'انقل العنصر غير المتوقع إلى ما بعد قسم head، أو انقل هذه الوسوم إلى ما قبله.',
  'page.check.noscript': 'انقل كتلة noscript إلى نهاية قسم head، بعد الوسوم المهمة.',
  'page.robots.noindex': 'تطلب الصفحة من محركات البحث عدم عرضها في النتائج',
  'page.robots.noindex.summary':
    'لا تظهر الصفحات التي تحمل noindex في نتائج البحث. وهذا صحيح للصفحات الخاصة أو المكررة، وخطأ مكلف في أي مكان آخر.',
  'page.check.robots':
    'إن كان يجب أن تظهر هذه الصفحة في البحث، فاحذف noindex من علامة robots الوصفية فيها.',
  'page.robots.nofollow': 'تطلب الصفحة من محركات البحث عدم تتبّع روابطها',
  'page.robots.nofollow.summary':
    'لن تستخدم محركات البحث الروابط في هذه الصفحة لاكتشاف صفحات أخرى.',
  'page.robots.limited': 'تقيّد الصفحة الطريقة التي يمكن لمحركات البحث عرضها بها',
  'page.robots.limited.summary':
    'تغيّر قواعد مثل nosnippet أو max-snippet طريقة ظهور الصفحة في النتائج.',
  'page.robots.indexable': 'لا شيء في رمز HTML يمنع الفهرسة',
  'page.robots.indexable.summary':
    'لم نعثر على قاعدة noindex في الصفحة. وقد تأتي القواعد أيضًا من عناوين HTTP أو ملف robots.txt، وهي لا تظهر في HTML.',
  'page.title.why':
    'تعرض محركات البحث عادةً عنوان الصفحة رابطًا إليها، وتعرضه المتصفحات في علامات التبويب والإشارات المرجعية.',
  'page.check.title': 'اكتب عنوانًا قصيرًا وفريدًا يوضح ما تقدمه الصفحة، وابدأ بأهم الكلمات.',
  'page.title.missing': 'ليس للصفحة عنوان',
  'page.title.empty': 'عنوان الصفحة فارغ',
  'page.title.multiple':
    '{count, plural, one {للصفحة عنوان واحد} two {للصفحة عنوانان} few {للصفحة # عناوين} many {للصفحة # عنوانًا} other {للصفحة # عنوان}}',
  'page.title.multiple.summary':
    'تستخدم المتصفحات العنوان الأول، وقد تستخدم محركات البحث أيًّا منها. احتفظ بعنوان واحد فقط.',
  'page.title.short': 'عنوان الصفحة قصير جدًا',
  'page.title.short.summary': 'نادرًا ما يخبر عنوان مثل «الرئيسية» الباحثين بما تقدمه الصفحة.',
  'page.title.long': 'قد يُختصر عنوان الصفحة في نتائج البحث',
  'page.title.long.summary':
    'طوله نحو {length, plural, few {# أحرف} many {# حرفًا} other {# حرف}}، وعادةً يتسع المكان لنحو {fit, plural, few {# أحرف} many {# حرفًا} other {# حرف}} قبل أن تقطعه نتائج البحث.',
  'page.title.ok': 'عنوان الصفحة موجود وطوله مناسب',
  'page.description.why':
    'الوصف التعريفي اختياري، وكثيرًا ما تكتب Google مقتطفها الخاص. ومع ذلك قد يساعد الوصف الجيد الناس على اختيار نتيجتك.',
  'page.check.description': 'اكتب جملة أو جملتين تلخّصان الصفحة لمن يقرر ما إذا كان سينقر.',
  'page.description.missing': 'ليس للصفحة وصف تعريفي',
  'page.description.empty': 'الوصف التعريفي فارغ',
  'page.description.multiple':
    '{count, plural, one {للصفحة وصف تعريفي واحد} two {للصفحة وصفان تعريفيان} few {للصفحة # أوصاف تعريفية} many {للصفحة # وصفًا تعريفيًا} other {للصفحة # وصف تعريفي}}',
  'page.description.multiple.summary': 'احتفظ بوصف واحد فقط، حتى يكون واضحًا أيها يُستخدم.',
  'page.description.long': 'قد يُختصر الوصف في نتائج البحث',
  'page.description.long.summary':
    'طوله نحو {length, plural, few {# أحرف} many {# حرفًا} other {# حرف}}، وعادةً يتسع المقتطف لنحو {fit, plural, few {# أحرف} many {# حرفًا} other {# حرف}}.',
  'page.description.ok': 'للصفحة وصف تعريفي',
  'page.lang.missing': 'لا تحدد الصفحة لغتها',
  'page.lang.invalid': 'رمز اللغة {value} غير صالح',
  'page.lang.why':
    'تستخدم قارئات الشاشة اللغة لنطق النص بشكل صحيح، وتستخدمها المتصفحات لعرض الترجمة.',
  'page.check.lang': 'أضف السمة lang إلى العنصر html، مثل lang="ar" أو lang="en".',
  'page.lang.ok': 'تحدد الصفحة لغتها: {value}',
  'page.viewport.missing': 'الصفحة غير مهيأة للهواتف',
  'page.viewport.why':
    'بدون علامة viewport الوصفية، تعرض الهواتف الصفحة مصغّرة مثل صفحة سطح المكتب. وتعتمد Google في الفهرسة بشكل أساسي على نسخة الجوّال من الصفحات.',
  'page.check.viewport':
    'أضف <meta name="viewport" content="width=device-width, initial-scale=1"> إلى قسم head.',
  'page.viewport.zoom-blocked': 'تمنع الصفحة الزوار من التكبير',
  'page.viewport.zoom-blocked.summary':
    'يجعل منع التكبير قراءة النص صعبة على ضعاف البصر. احذف user-scalable=no وأي قيمة لـ maximum-scale أقل من 2.',
  'page.viewport.ok': 'الصفحة مهيأة للهواتف',
  'page.canonical.missing': 'ليس للصفحة رابط أساسي',
  'page.canonical.missing.summary':
    'هذا مقبول لمعظم الصفحات. وإذا كان المحتوى نفسه متاحًا على عدة عناوين، فإن الرابط الأساسي يخبر محركات البحث بالعنوان الذي تفضّله.',
  'page.canonical.multiple':
    '{count, plural, one {للصفحة رابط أساسي واحد} two {للصفحة رابطان أساسيان متعارضان} few {للصفحة # روابط أساسية متعارضة} many {للصفحة # رابطًا أساسيًا متعارضًا} other {للصفحة # رابط أساسي متعارض}}',
  'page.canonical.multiple.summary':
    'عندما تشير الروابط الأساسية إلى صفحات مختلفة، قد تتجاهلها محركات البحث جميعًا.',
  'page.canonical.invalid': 'الرابط الأساسي {href} ليس عنوانًا صالحًا',
  'page.canonical.relative': 'يستخدم الرابط الأساسي عنوانًا نسبيًا',
  'page.canonical.relative.summary':
    'هذا يعمل، لكن العنوان الكامل الذي يبدأ بـ https:// يجنّبك الأخطاء، وتوصي به Google.',
  'page.canonical.other-site': 'يشير الرابط الأساسي إلى موقع آخر: {host}',
  'page.canonical.other-site.summary':
    'قد تعرض محركات البحث صفحة ذلك الموقع بدلًا من هذه الصفحة. ويكون ذلك مقصودًا فقط إذا كانت هذه الصفحة نسخة.',
  'page.canonical.other-page': 'يشير الرابط الأساسي إلى صفحة أخرى',
  'page.canonical.other-page.summary':
    'قد تعامل محركات البحث هذه الصفحة كنسخة مكررة وتعرض الصفحة الأخرى بدلًا منها.',
  'page.canonical.self': 'يشير الرابط الأساسي إلى هذه الصفحة',
  'page.canonical.present': 'للصفحة رابط أساسي واحد',
  'page.h1.missing': 'ليس للصفحة عنوان رئيسي (h1)',
  'page.h1.why': 'يخبر العنوان الرئيسي الزوار، ومنهم مستخدمو قارئات الشاشة، بموضوع الصفحة.',
  'page.h1.multiple':
    '{count, plural, one {للصفحة عنوان رئيسي واحد (h1)} two {للصفحة عنوانان رئيسيان (h1)} few {للصفحة # عناوين رئيسية (h1)} many {للصفحة # عنوانًا رئيسيًا (h1)} other {للصفحة # عنوان رئيسي (h1)}}',
  'page.h1.multiple.summary':
    'هذا مسموح. ومع ذلك فإن عنوانًا رئيسيًا واحدًا يجعل البنية أوضح عادةً.',
  'page.headings.skipped': 'تقفز مستويات العناوين من h{from} إلى h{to}',
  'page.headings.skipped.summary':
    'يتنقل كثير من مستخدمي قارئات الشاشة في الصفحة عبر عناوينها. وقد يوحي المستوى المحذوف بأن محتوى ما مفقود.',
  'page.headings.empty': 'عناوين أقسام فارغة: {count}',
  'page.headings.empty.summary': 'تعلن قارئات الشاشة عن العناوين الفارغة، لكنها لا تقول شيئًا.',
  'page.headings.ok':
    '{count, plural, one {يشكّل عنوان القسم مخططًا واضحًا} other {تشكّل عناوين الأقسام (#) مخططًا واضحًا}}',
  'page.images.missing-alt':
    '{count, plural, one {صورة واحدة بلا} two {صورتان بلا} few {# صور بلا} many {# صورةً بلا} other {# صورة بلا}} نص بديل',
  'page.images.missing-alt.summary':
    'لا تستطيع قارئات الشاشة وصف هذه الصور، وتفهمها محركات البحث بشكل أقل. صِف كل صورة في السمة alt، أو استخدم alt فارغة للصور الزخرفية فقط.',
  'page.images.ok':
    '{count, plural, one {للصورة نص بديل} two {للصورتين نص بديل} other {لجميع الصور (#) نص بديل}}',
  'page.links.unnamed':
    '{count, plural, one {رابط واحد بلا} two {رابطان بلا} few {# روابط بلا} many {# رابطًا بلا} other {# رابط بلا}} نص',
  'page.links.unnamed.summary':
    'تعلن قارئات الشاشة عن هذه الروابط دون أن تقول إلى أين تؤدي. أضف نصًا مرئيًا، أو aria-label لروابط الأيقونات.',
  'page.links.javascript': 'روابط تشغّل JavaScript بدلًا من الإشارة إلى عنوان: {count}',
  'page.links.javascript.summary':
    'لا تستطيع محركات البحث تتبّع هذه الروابط. ضع عنوانًا حقيقيًا في السمة href لكل رابط.',
  'page.links.summary':
    'تحتوي الصفحة على روابط إلى {total, plural, one {عنوان واحد} two {عنوانين} few {# عناوين} many {# عنوانًا} other {# عنوان}}: {internal} في هذا الموقع و{external} في مواقع أخرى',
  'page.links.nofollow': 'روابط مُعلَّمة بـ nofollow: {count}.',
  'page.structured-data.invalid': 'كتل بيانات منظَّمة تتعذر قراءتها: {count}',
  'page.structured-data.invalid.summary':
    'تتجاهل محركات البحث البيانات المنظَّمة التي ليست JSON صالحًا.',
  'page.structured-data.found': 'تحتوي الصفحة على بيانات منظَّمة: {types}',
  'page.structured-data.untyped': 'تحتوي الصفحة على بيانات منظَّمة بلا نوع',
  'page.structured-data.found.summary':
    'تحققنا من إمكانية قراءتها. ويوضح اختبار النتائج المنسّقة من Google ما إذا كانت مؤهلة للنتائج المنسّقة.',
  'page.hreflang.invalid': 'تستخدم بعض تعليقات اللغة رموزًا غير صالحة: {values}',
  'page.hreflang.invalid.summary':
    'استخدم رموز لغات مثل en أو en-GB أو zh-Hans، أو x-default. رمز المملكة المتحدة هو GB وليس UK.',
  'page.hreflang.no-self': 'لا تتضمن تعليقات اللغة هذه الصفحة',
  'page.hreflang.no-self.summary': 'يجب أن تُدرج كل نسخة لغوية نفسها إلى جانب النسخ الأخرى.',
  'page.hreflang.ok':
    'تُدرج الصفحة {count, plural, one {نسخة لغوية واحدة} two {نسختين لغويتين} few {# نسخ لغوية} many {# نسخةً لغوية} other {# نسخة لغوية}}',
  'page.hreflang.limit':
    'لا يمكننا التحقق إلا من هذه الصفحة. ويجب أن تربط كل صفحة مُدرجة إليها بدورها، وإلا تجاهلت محركات البحث التعليقات.',
  'page.charset.missing': 'لا تحدد الصفحة ترميز الأحرف',
  'page.charset.missing.summary':
    'ما لم يحدده الخادم، قد تخطئ المتصفحات التخمين فتعرض أحرفًا مشوّهة. أضف <meta charset="utf-8"> في بداية قسم head.',
  'page.charset.legacy': 'تستخدم الصفحة ترميز الأحرف {value}',
  'page.charset.legacy.summary': 'يُوصى باستخدام UTF-8 على الويب؛ فهو يغطي جميع اللغات.',
  'page.charset.ok': 'تحدد الصفحة ترميز UTF-8',
  'page.social.missing': 'قد تكون معاينات الروابط ناقصة، فالوسوم التالية غير موجودة: {tags}',
  'page.social.missing.summary':
    'تستخدم الشبكات الاجتماعية وتطبيقات المراسلة وسوم Open Graph لإنشاء معاينات الروابط. ولا تؤثر هذه الوسوم في ترتيب البحث.',
  'page.social.ok': 'للصفحة وسوم لمعاينة الروابط',
  'page.limit.fetched':
    'راجعنا رمز HTML الذي أرسله الخادم لهذا العنوان. ولا يشمل ذلك المحتوى الذي تضيفه JavaScript بعد تحميل الصفحة.',
  'page.limit.scope.fetched':
    'تؤثر أيضًا سرعة التحميل والروابط من المواقع الأخرى في البحث، لكنها ليست جزءًا من هذه المراجعة.',

  'http.status': 'ردّ الخادم برمز الحالة {status} بدلًا من الصفحة',
  'http.status.summary':
    'تفهرس محركات البحث الصفحات التي تردّ برمز نجاح (200). أما رموز الخطأ وإعادة التوجيه فتُبقي هذا العنوان خارج النتائج.',
  'http.check.status':
    'افتح العنوان في متصفح، وراجع إعداد الخادم أو الاستضافة الذي يُرجع هذا الرمز.',
  'http.https': 'تُقدَّم الصفحة بدون HTTPS',
  'http.https.summary':
    'تَسِم المتصفحات الصفحات التي لا تستخدم HTTPS بأنها غير آمنة، وتفضّل محركات البحث النسخة الآمنة من الصفحة.',
  'http.check.https': 'ثبّت شهادة أمان، وأعِد توجيه كل عنوان http:// إلى نسخته https://.',
  'http.x-robots-tag': 'يطلب الخادم من محركات البحث عدم عرض الصفحة في النتائج',
  'http.x-robots-tag.summary':
    'يعمل عنوان X-Robots-Tag مثل علامة robots الوصفية، لكن الخادم هو من يضيفه، لذا يسهل أن يفوتك عند فحص HTML.',
  'http.check.x-robots-tag':
    'إن كان يجب أن تظهر هذه الصفحة في البحث، فاحذف noindex من عنوان X-Robots-Tag في إعدادات الخادم أو الاستضافة.',
  'http.robots-txt': 'يمنع ملف robots.txt محركات البحث من الوصول إلى هذه الصفحة',
  'http.robots-txt.summary':
    'لا يزحف Googlebot إلى العناوين التي يمنعها robots.txt، لذا لا يستطيع قراءة محتوى هذه الصفحة.',
  'http.check.robots-txt':
    'إن كان يجب أن تظهر هذه الصفحة في البحث، فاحذف القاعدة من robots.txt أو اجعلها أضيق نطاقًا.',
  'http.robots-txt.unreadable': 'تعذّرت علينا قراءة ملف robots.txt للموقع',
  'http.robots-txt.unreadable.summary':
    'إذا ردّ ملف robots.txt بخطأ في الخادم، يتوقف Google عن الزحف إلى الموقع كله حتى يتمكن من قراءة الملف مجددًا. تحقّق من أنه يُفتح.',
  'http.redirects':
    'يُعاد توجيه العنوان {count, plural, one {مرة واحدة} two {مرتين} few {# مرات} many {# مرةً} other {# مرة}} قبل الوصول إلى الصفحة',
  'http.redirects.summary':
    'تضيف كل عملية إعادة توجيه طلبًا إضافيًا للزوار وبرامج الزحف. اربط مباشرةً بالعنوان النهائي.',
  'http.ok': 'يقدّم الخادم الصفحة دون عوائق',
  'http.ok.summary':
    'يردّ بنجاح عبر HTTPS، ولا يُبعد robots.txt ولا عناوين الخادم محركاتِ البحث عنها.',

  'analyst.do.status': 'اجعل هذا العنوان يُرجع الصفحة',
  'analyst.do.status.how':
    'يردّ الخادم برمز الحالة {status}. إن انتقلت الصفحة فأعِد توجيه العنوان القديم إلى الجديد برمز 301، وإن حُذفت بالخطأ فاستعِدها، وإن كان الخادم يتعطّل فاطلب من جهة الاستضافة مراجعة سجلات الأخطاء.',
  'analyst.do.https': 'انقل الموقع إلى HTTPS',
  'analyst.do.https.how':
    'فعّل شهادة من لوحة الاستضافة (تقدّم كثير من جهات الاستضافة شهادات Let’s Encrypt مجانية)، وأعِد توجيه كل عنوان http:// إلى نسخته https:// برمز 301، ثم استخدم {url} في الرابط الأساسي وخريطة الموقع.',
  'analyst.do.header-noindex': 'أزِل noindex من عناوين الخادم',
  'analyst.do.header-noindex.how':
    'يرسل الخادم {header}. أزِل noindex من هذا العنوان في إعدادات الخادم أو الاستضافة أو شبكة CDN، ثم راجِع الصفحة مجددًا للتأكد.',
  'analyst.do.robots-txt': 'اسمح لمحركات البحث بالزحف إلى هذه الصفحة',
  'analyst.do.robots-txt.how':
    'يحتوي ملف robots.txt على {rule}، وهي تشمل {path}. احذف هذا السطر أو اقصره على العناوين التي تريد فعلًا إبقاءها خارجًا.',
  'analyst.do.robots-txt-error': 'اجعل ملف robots.txt يُحمَّل دون أخطاء',
  'analyst.do.robots-txt-error.how':
    'افتح {url}. يجب أن يُحمَّل بسرعة برمز 200، أو يردّ برمز 404 إن لم تكن بحاجة إلى قواعد، لكن ليس بخطأ في الخادم أبدًا.',
  'analyst.do.redirects': 'اربط مباشرةً بالعنوان النهائي',
  'analyst.do.redirects.how':
    'وجّه روابطك وخريطة الموقع والرابط الأساسي إلى {url}، واجعل كل عنوان قديم يُعاد توجيهه إليه بخطوة واحدة.',
  'analyst.do.noindex': 'اسمح لمحركات البحث بفهرسة الصفحة',
  'analyst.do.noindex.how': 'احذف علامة robots الوصفية أو غيّرها إلى {snippet}.',
  'analyst.do.nofollow': 'تحقّق مما إذا كان يجب تتبّع روابط الصفحة',
  'analyst.do.nofollow.how':
    'إن كان يجب أن تتبع محركات البحث روابط هذه الصفحة، فاحذف nofollow من علامة robots الوصفية فيها.',
  'analyst.do.head': 'أعِد العلامات المهمة إلى قسم head',
  'analyst.do.head.how':
    'يظهر في بداية قسم head عنصر مكانه body فيُنهيه مبكرًا. انقله إلى body بعد علامات title وmeta وlink.',
  'analyst.do.title-missing': 'أعطِ الصفحة عنوانًا',
  'analyst.do.title-missing.how': 'أضِف هذا داخل قسم head ثم عدّله بأسلوبك: {snippet}',
  'analyst.do.title': 'أعِد كتابة العنوان',
  'analyst.do.title.how':
    'اذكر أولًا ما تقدّمه الصفحة واسم علامتك التجارية في النهاية، في نحو 60 حرفًا. على سبيل المثال: {snippet}',
  'analyst.do.description': 'اكتب وصفًا تعريفيًا',
  'analyst.do.description.how': 'أضِف هذا داخل قسم head ثم عدّله بأسلوبك: {snippet}',
  'analyst.do.lang': 'حدّد لغة الصفحة',
  'analyst.do.lang.how':
    'ابدأ الصفحة بـ {snippet} لكي تنطق برامج قراءة الشاشة النص بشكل صحيح وتقترح المتصفحات الترجمة المناسبة.',
  'analyst.do.language-mismatch': 'حدّد اللغة التي كُتب بها النص فعلًا',
  'analyst.do.language-mismatch.how':
    'تقول الصفحة إنها باللغة {declaredLanguage}، لكن نصها مكتوب باللغة {detectedLanguage}. غيّر علامة html إلى {snippet}.',
  'analyst.do.viewport': 'اجعل الصفحة تناسب شاشات الهواتف',
  'analyst.do.viewport.how': 'أضِف {snippet} إلى قسم head، ولا تمنع التكبير.',
  'analyst.do.canonical': 'صحّح الرابط الأساسي',
  'analyst.do.canonical.how':
    'أبقِ رابطًا أساسيًا واحدًا في قسم head يحمل العنوان الكامل للصفحة التي تريدها في النتائج: {snippet}',
  'analyst.do.h1': 'أعطِ الصفحة عنوانًا رئيسيًا واحدًا',
  'analyst.do.h1.how': 'أضِف عنوان h1 واحدًا قرب أعلى الصفحة يقول ما تقدّمه، مثل {snippet}.',
  'analyst.do.generic-heading': 'اجعل العنوان الرئيسي يقول ما تقدّمه الصفحة',
  'analyst.do.generic-heading.how':
    'قد يظهر «{heading}» على أي موقع. اذكر الموضوع بدلًا منه، مثل {snippet}.',
  'analyst.do.heading-order': 'صحّح مستويات العناوين',
  'analyst.do.heading-order.how': 'استخدم h2 للأقسام الرئيسية وh3 داخلها، دون تخطّي أي مستوى.',
  'analyst.do.heading-empty': 'املأ العناوين الفارغة أو احذفها',
  'analyst.do.heading-empty.how': 'أعطِ كل عنوان نصًا ظاهرًا، أو احذفه إن كان لا يضيف سوى مسافة.',
  'analyst.do.alt': 'صِف الصور التي تحمل معنى',
  'analyst.do.alt.how':
    '{count, plural, one {أضِف نصًا بديلًا لهذه الصورة} two {أضِف نصًا بديلًا لهاتين الصورتين} few {أضِف نصًا بديلًا لهذه الصور الـ#} many {أضِف نصًا بديلًا لهذه الصور الـ#} other {أضِف نصًا بديلًا لهذه الصور الـ#}}: بضع كلمات تصف ما تُظهره كل صورة. اترك alt فارغًا للصور الزخرفية. ابدأ بـ {examples}.',
  'analyst.do.link-names': 'أعطِ كل رابط اسمًا',
  'analyst.do.link-names.how':
    '{count, plural, one {أعطِ هذا الرابط} two {أعطِ هذين الرابطين} few {أعطِ هذه الروابط الـ#} many {أعطِ هذه الروابط الـ#} other {أعطِ هذه الروابط الـ#}} نصًا ظاهرًا، أو aria-label لروابط الأيقونات. ابدأ بـ {examples}.',
  'analyst.do.crawlable': 'استخدم عناوين حقيقية في الروابط',
  'analyst.do.crawlable.how':
    'استبدل روابط javascript: برابط href عادي إلى الصفحة التي تفتحها، لتتمكن محركات البحث من تتبّعها.',
  'analyst.do.structured-data': 'صحّح البيانات المنظَّمة',
  'analyst.do.structured-data.how':
    'الصق كل كتلة JSON-LD في اختبار النتائج الغنية من Google، وصحّح الأخطاء التي يعرضها، ثم اختبر مجددًا.',
  'analyst.do.hreflang': 'صحّح التعليقات التوضيحية للغة',
  'analyst.do.hreflang.how':
    'استخدم رموزًا مثل en أو en-GB أو tr، وأدرِج هذه الصفحة ضمن بدائلها، واجعل كل صفحة مُدرَجة تربط بها بالمقابل.',
  'analyst.do.charset': 'حدّد ترميز UTF-8',
  'analyst.do.charset.how': 'ضع {snippet} في بداية قسم head.',
  'analyst.do.social': 'أضِف وسوم معاينة الروابط',
  'analyst.do.social.how':
    'أضِف هذه الوسوم إلى قسم head لتعرض الروابط المُشارَكة عنوانًا ونصًا وصورة: {snippet}',
  'analyst.do.thin': 'قل المزيد عمّا تقدّمه',
  'analyst.do.thin.how':
    'تحتوي الصفحة على {words} كلمة. اشرح بكلماتك ما تقدّمه، ولمن، وأين، وما الخطوة التالية.',
  'analyst.why.language-mismatch':
    'تنطق برامج قراءة الشاشة النص وفق اللغة المحددة، وتستخدمها المتصفحات لاقتراح الترجمة.',
  'analyst.why.generic-heading':
    'يخبر العنوان الرئيسي الزوار ومحركات البحث بموضوع الصفحة، أما التحية فلا تخبرهم بشيء.',
  'analyst.why.generic-title':
    'قد يكون «{title}» عنوانًا لأي صفحة، والعنوان أول ما يقرؤه الباحثون.',
  'analyst.why.thin':
    'تفهم محركات البحث والزوار الصفحة من كلماتها، والنص القليل جدًا لا يمنحهم ما يكفي.',
  'analyst.evidence.declared': 'اللغة المحددة',
  'analyst.evidence.detected': 'لغة النص',
  'analyst.evidence.words': 'عدد الكلمات',
  'analyst.note.topic-title': 'تتحدث الصفحة غالبًا عن «{topic}»، لكن العنوان لا يذكره.',
  'analyst.note.topic-h1': 'لا يذكر العنوان الرئيسي «{topic}»، وهو موضوع الصفحة الأساسي.',
  'analyst.note.topic-description': 'لا يذكر الوصف «{topic}».',
  'analyst.note.brand':
    'لا يتضمن العنوان علامتك التجارية «{brand}». وضعها في النهاية يساعد الناس على التعرّف إليك في النتائج.',
  'analyst.note.thin': 'النص قصير نسبيًا ({words} كلمة). تأكّد من أنه يجيب عمّا يبحث عنه الناس.',
  'analyst.note.long-sentences':
    'متوسط طول الجملة {average} كلمة. الجمل الأقصر أسهل قراءةً، خاصةً على الهاتف.',
  'analyst.note.same-title-description':
    'يقول العنوان والوصف الشيء نفسه، ويمكن أن يضيف الوصف تفاصيل بدلًا من ذلك.',
  'analyst.note.description-short': 'الوصف قصير ({count} حرفًا)، وهناك متسع لجملة تشجّع على النقر.',
  'analyst.note.headings-few':
    'لا تحتوي الصفحة على عناوين للأقسام. تساعد العناوين الزوار على تصفّح الصفحة ومحركات البحث على فهم بنيتها.',
  'analyst.note.internal-links':
    'لا تربط الصفحة بأي صفحة أخرى في موقعك. تساعد الروابط إلى الصفحات ذات الصلة الزوار ومحركات البحث على العثور عليها.',
  'analyst.note.contact':
    'تعرض الصفحة بيانات اتصال. يمكن للبيانات المنظَّمة من نوع LocalBusiness أو Organization أن تصف نشاطك لمحركات البحث.',
  'analyst.note.prices':
    'تذكر الصفحة أسعارًا. يمكن للبيانات المنظَّمة من نوع Product أو Offer أن تصفها لمحركات البحث.',
  'analyst.note.slow':
    'استغرق الخادم {seconds} ثانية لإرسال HTML. استهدف أقل بكثير من ثانية؛ التخزين المؤقت أو استضافة أسرع يساعدان.',
  'analyst.note.compression':
    'يُرسَل HTML ({kilobytes} ك.ب) دون ضغط. تفعيل gzip أو Brotli على الخادم يجعله أصغر وأسرع.',
  'analyst.note.heavy':
    'حجم HTML وحده {kilobytes} ك.ب. تُحمَّل الصفحات الكبيرة ببطء على الهواتف؛ ابحث عن بيانات أو نصوص برمجية مضمّنة يمكنك نقلها.',
  'analyst.note.hsts':
    'يعمل HTTPS، لكن الخادم لا يرسل HSTS الذي يطلب من المتصفحات استخدام النسخة الآمنة دائمًا.',
  'analyst.note.sitemap':
    'لا يذكر ملف robots.txt أي خريطة موقع. يساعد سطر «Sitemap:» يحمل عنوان خريطة موقعك محركات البحث على العثور على كل صفحة.',
  'analyst.caveat.scope':
    'يقرأ هذا التحليل هذه الصفحة فقط. لا يرى الترتيب في النتائج ولا المنافسين ولا الروابط من المواقع الأخرى ولا سرعة الصفحة على الهاتف.',
  'analyst.caveat.pasted': 'لم يُفحص ردّ الخادم ولا ملف robots.txt، لأن رمز HTML قُدّم مباشرةً.',
  'analyst.caveat.little-text':
    'يحتوي HTML على نص قليل جدًا. إن كان المحتوى يظهر عبر JavaScript فقد ترى محركات البحث أقل مما يراه الزوار.',
  'analyst.caveat.no-language':
    'تعذّر تحديد لغة الصفحة من نصها، لذا تُخطّيت الفحوص التي تعتمد على قراءة الكلمات.',
  'analyst.caveat.ideas':
    'أفكار العنوان والوصف مبنية من كلمات الصفحة نفسها؛ عدّلها لتعبّر عن أسلوبك.',
  'analyst.summary.strong':
    'الصفحة في حالة جيدة: لم يُعثر على ما يُبعدها عن البحث، وأساسياتها في مكانها.',
  'analyst.summary.fair':
    'يمكن العثور على الصفحة، لكن {count, plural, one {مشكلة واحدة تعيقها} two {مشكلتين تعيقانها} few {# مشكلات تعيقها} many {# مشكلةً تعيقها} other {# مشكلة تعيقها}}.',
  'analyst.summary.weak':
    'قد {count, plural, one {تمنع مشكلة خطيرة واحدة} two {تمنع مشكلتان خطيرتان} few {تمنع # مشكلات خطيرة} many {تمنع # مشكلةً خطيرة} other {تمنع # مشكلة خطيرة}} العثور على هذه الصفحة أو استخدامها.',
  'analyst.summary.blocked':
    'بوضعها الحالي، يُطلب من محركات البحث عدم عرض هذه الصفحة، أو لا تستطيع الوصول إليها.',
  'analyst.summary.topic': 'يدور نصها أساسًا حول «{topic}».',
  'analyst.summary.start': 'ابدأ بهذا: {action}.',
  'analyst.summary.done':
    'لم يبقَ شيء عاجل: حافظ على تحديث النص وراجِع الصفحة مجددًا بعد التغييرات.',

  'mentions.kind.citation': 'ذُكر مع رابط',
  'mentions.kind.mention': 'ذُكر بالاسم دون رابط',
  'mentions.method.own-check': 'سألت المساعد بنفسي',
  'mentions.method.shared-with-me': 'شاركه أحدهم معي',
  'mentions.method.screenshot': 'من لقطة شاشة',
  'mentions.method.other': 'بطريقة أخرى',
  'mentions.certainty.confirmed': 'مؤكَّد',
  'mentions.certainty.uncertain': 'غير مؤكَّد',
  'mentions.error.required': 'هذا الحقل مطلوب.',
  'mentions.error.too-long':
    'استخدم {max, plural, few {# أحرف} many {# حرفًا} other {# حرف}} كحد أقصى.',
  'mentions.error.invalid-url': 'أدخل عنوان ويب كاملًا يبدأ بـ https:// أو http://.',
  'mentions.error.invalid-date': 'أدخل تاريخًا صالحًا.',
  'mentions.error.future-date': 'لا يمكن أن يكون التاريخ في المستقبل.',
  'mentions.error.invalid-choice': 'اختر أحد الخيارات.',
  'mentions.limit.scope':
    'هذه هي الإشارات التي سجّلتها. وهي تُظهر أين رأيت موقعك، لا عدد المرات التي تذكره فيها مساعدات الذكاء الاصطناعي عمومًا.',

  // AI visibility check
  'visibility.approximate': 'ظهور تقريبي',
  'visibility.approximate.why':
    'قد تختلف الإجابات التي يحصل عليها برنامج عمّا يراه الناس في التطبيقات، كما أنها تتغير من يوم لآخر. اقرأ هذه النتائج على أنها تقدير لا قياس.',
  'visibility.paid-tools': 'يستخدم هذا الفحص أدوات مدفوعة على {provider}.',
  'visibility.cost.calls':
    '{questions, plural, one {سؤال واحد} two {سؤالان} few {# أسئلة} many {# سؤالًا} other {# سؤال}} × {engines, plural, one {أداة ذكاء اصطناعي واحدة} two {أداتا ذكاء اصطناعي} few {# أدوات ذكاء اصطناعي} many {# أداة ذكاء اصطناعي} other {# أداة ذكاء اصطناعي}} × {repeats, plural, one {مرة واحدة} two {مرتان} few {# مرات} many {# مرة} other {# مرة}} = {calls, plural, one {طلب واحد} two {طلبان} few {# طلبات} many {# طلبًا} other {# طلب}}',
  'visibility.cost.estimate':
    'التكلفة التقديرية: {calls, plural, one {طلب واحد} two {طلبان} few {# طلبات} many {# طلبًا} other {# طلب}}، بنحو {amount}.',
  'visibility.cost.unpriced':
    '{calls, plural, one {طلب واحد بلا سعر معلن، لذا لا يشمله التقدير.} two {طلبان بلا سعر معلن، لذا لا يشملهما التقدير.} few {# طلبات بلا سعر معلن، لذا لا يشملها التقدير.} many {# طلبًا بلا سعر معلن، لذا لا يشملها التقدير.} other {# طلب بلا سعر معلن، لذا لا يشملها التقدير.}}',
  'visibility.cost.billing':
    '{billing, select, account {هذه الرسوم غير مشمولة في اشتراكك في SearchUnveil ولا في فترة تجربتك المجانية البالغة {trialDays, plural, one {يومًا واحدًا} two {يومين} few {# أيام} many {# يومًا} other {# يوم}}، وتُخصم من حسابك الخاص على {provider}.} other {هذه الرسوم غير مشمولة في اشتراكك في SearchUnveil ولا في فترة تجربتك المجانية البالغة {trialDays, plural, one {يومًا واحدًا} two {يومين} few {# أيام} many {# يومًا} other {# يوم}}، وتُخصم من رصيدك على {provider}.}}',
  'visibility.cost.failed-free': 'لا تُحتسب رسوم على الطلبات التي تفشل.',
  'visibility.cost.confirm': 'هل تريد المتابعة؟',
  'visibility.cost.reduce':
    'لتدفع أقل، اطرح أسئلة أقل، أو اختر أدوات ذكاء اصطناعي أقل، أو كرّر كل سؤال مرات أقل. لا يكلّف المنافسون شيئًا إضافيًا.',
  'visibility.cost.actual':
    'أجرى هذا الفحص {calls, plural, one {طلبًا واحدًا} two {طلبين} few {# طلبات} many {# طلبًا} other {# طلب}} وكلّف نحو {amount}.',
  'visibility.cost.actual.unpriced':
    '{calls, plural, one {طلب واحد محتسب لم يكن له سعر معلن، فلم يُدرج في المجموع.} two {طلبان محتسبان لم يكن لهما سعر معلن، فلم يُدرجا في المجموع.} few {# طلبات محتسبة لم يكن لها سعر معلن، فلم تُدرج في المجموع.} many {# طلبًا محتسبًا لم يكن لها سعر معلن، فلم تُدرج في المجموع.} other {# طلب محتسب لم يكن لها سعر معلن، فلم تُدرج في المجموع.}}',
  'visibility.cost.interrupted':
    '{calls, plural, one {انقطع طلب واحد عندما أوقفت الفحص، وقد يحتسب {provider} رسومه مع ذلك.} two {انقطع طلبان عندما أوقفت الفحص، وقد يحتسب {provider} رسومهما مع ذلك.} few {انقطعت # طلبات عندما أوقفت الفحص، وقد يحتسب {provider} رسومها مع ذلك.} many {انقطع # طلبًا عندما أوقفت الفحص، وقد يحتسب {provider} رسومها مع ذلك.} other {انقطع # طلب عندما أوقفت الفحص، وقد يحتسب {provider} رسومها مع ذلك.}}',
  'visibility.cell.cited': 'مُستشهد به',
  'visibility.cell.position': 'المصدر رقم {position}',
  'visibility.cell.named': 'مذكور بالاسم، بلا رابط',
  'visibility.cell.absent': 'غير موجود',
  'visibility.cell.no-answer': 'لا إجابة',
  'visibility.cell.rate': '{count} من {answers}',
  'visibility.summary':
    'تظهر في {present} من {answers, plural, one {إجابة واحدة} two {إجابتين} few {# إجابات} many {# إجابة} other {# إجابة}}.',
  'visibility.summary.competitor':
    'يظهر {name} في {present} من {answers, plural, one {إجابة واحدة} two {إجابتين} few {# إجابات} many {# إجابة} other {# إجابة}}.',
  'visibility.summary.none': 'لم تصل أي إجابة، لذا لا يوجد ما يُقارن بعد.',
  'visibility.stopped': 'أوقفت الفحص، لذا لا تشمل هذه النتائج إلا الإجابات التي وصلت قبل ذلك.',
  'visibility.other-sources': 'مواقع استُشهد بها بدلًا من موقعك',
  'visibility.failure':
    '{reason, select, unavailable {لم تكن أداة الذكاء الاصطناعي متاحة} rate-limited {طلبات كثيرة جدًا في وقت واحد} refused {رفضت أداة الذكاء الاصطناعي الإجابة} no-balance {الرصيد غير كافٍ} timeout {لم تصل إجابة في الوقت المحدد} stopped {أوقفته أنت} other {حدث خطأ ما}}',
  'visibility.cost.failed-charged': 'تُحتسب رسوم الطلبات التي تفشل أيضًا.',
  'visibility.cost.failed-free-count':
    '{calls, plural, one {فشل طلب واحد ولم تُحتسب رسومه.} two {فشل طلبان ولم تُحتسب رسومهما.} few {فشلت # طلبات ولم تُحتسب رسومها.} many {فشل # طلبًا ولم تُحتسب رسومها.} other {فشل # طلب ولم تُحتسب رسومها.}}',
  'visibility.engine.unavailable':
    '{count, plural, one {لا يمكن فحص {products} على {provider}: لا تتوفر أداة لذلك.} other {لا يمكن فحص {products} على {provider}: لا تتوفر أدوات لذلك.}}',
  'visibility.engine.price': '{price} لكل طلب، ونحو {cost} لهذا الفحص',
  'visibility.engine.unpriced': 'لا يوجد سعر معلن',
  'visibility.engine.cheapest': 'الأرخص',
  'visibility.engine.chosen': 'مُختار',
  'visibility.column.question': 'السؤال',
  'visibility.source.count':
    '{site}: مُستشهد به في {count, plural, one {إجابة واحدة} two {إجابتين} few {# إجابات} many {# إجابة} other {# إجابة}}',
  'visibility.calls.failed':
    '{count, plural, one {لم يأتِ طلب واحد بإجابة} two {لم يأتِ طلبان بإجابة} few {لم تأتِ # طلبات بإجابة} many {لم يأتِ # طلبًا بإجابة} other {لم يأتِ # طلب بإجابة}}: {reasons}.',
  'visibility.heading.engines': 'أدوات الذكاء الاصطناعي والنماذج المتاحة للاختيار',
  'visibility.heading.cost': 'التكلفة',
  'visibility.trend.title': 'التغير بمرور الوقت',
  'visibility.trend.point': '{date}: {present} من {answers}',
  'visibility.trend.basis':
    'المقارنة على أساس {questions, plural, one {سؤال واحد} two {سؤالين} few {# أسئلة} many {# سؤالًا} other {# سؤال}} و{products} المشتركة بين كل الفحوص.',
  'visibility.trend.skipped':
    '{count, plural, one {استُبعد فحص واحد لموقع أو بلد أو لغة أخرى.} two {استُبعد فحصان لموقع أو بلد أو لغة أخرى.} few {استُبعدت # فحوص لموقع أو بلد أو لغة أخرى.} many {استُبعد # فحصًا لموقع أو بلد أو لغة أخرى.} other {استُبعد # فحص لموقع أو بلد أو لغة أخرى.}}',
  'visibility.trend.not-checked': 'لم يُبحث عنه',

  // Pricing
  'pricing.trial':
    'تشمل فترة التجربة المجانية البالغة {trialDays, plural, one {يومًا واحدًا} two {يومين} few {# أيام} many {# يومًا} other {# يوم}} اشتراك SearchUnveil فقط. يستخدم فحص الظهور في الذكاء الاصطناعي أدوات مدفوعة على {provider}، وتُخصم رسومها من رصيدك على {provider} خلال فترة التجربة أيضًا.',

  'diagnostic.input.empty': 'هذا الملف فارغ.',
  'diagnostic.input.binary':
    'هذا ليس ملفًا نصيًا. اختر ملف CSV، أو ملف ZIP الذي ينزّله Search Console.',
  'diagnostic.input.spreadsheet':
    'هذا مصنّف جداول بيانات. احفظه بتنسيق CSV، أو استخدم ملف ZIP الأصلي من Search Console.',
  'diagnostic.input.unsupported-type': 'هذا النوع من الملفات غير مدعوم.',
  'diagnostic.encoding.legacy-fallback':
    'لم يُحفظ هذا الملف بترميز UTF-8، لذا قرأناه بترميز {encoding}. إذا ظهرت الأحرف بشكل خاطئ، فصدِّر الملف مرة أخرى من Search Console دون فتحه أولًا في برنامج جداول بيانات.',
  'diagnostic.encoding.utf16-without-bom':
    'يستخدم هذا الملف ترميز {encoding}. اكتشفنا ذلك تلقائيًا.',
  'diagnostic.csv.no-header': 'لا يحتوي هذا الملف على صف عناوين.',
  'diagnostic.csv.unterminated-quote': 'قيمة تبدأ بعلامة اقتباس لا تنتهي أبدًا.',
  'diagnostic.csv.stray-quote': 'تظهر علامة اقتباس داخل قيمة. أبقيناها كما هي.',
  'diagnostic.csv.text-after-quote': 'يلي علامةَ الاقتباس الختامية نصٌّ. أبقيناه جزءًا من القيمة.',
  'diagnostic.csv.field-count':
    'يحتوي هذا الصف على {actual} من القيم، لكن صف العناوين يحتوي على {expected}.',
  'diagnostic.csv.too-many-rows':
    'يحتوي هذا الملف على أكثر من {limit} صف، وهو الحد الأقصى الذي يمكننا قراءته.',
  'diagnostic.csv.too-many-columns':
    'يحتوي أحد الصفوف على أكثر من {limit} عمود، وهو الحد الأقصى الذي يمكننا قراءته.',
  'diagnostic.csv.field-too-long':
    'تتجاوز إحدى القيم {limit} حرف، وهو الحد الأقصى الذي يمكننا قراءته.',
  'diagnostic.zip.invalid': 'ملف ZIP هذا تالف أو غير مكتمل. حاول تنزيله مرة أخرى.',
  'diagnostic.zip.multi-disk': 'ملف ZIP هذا مقسّم إلى عدة أجزاء، وهذا غير مدعوم.',
  'diagnostic.zip.encrypted': 'ملف ZIP هذا محمي بكلمة مرور. استخدم ملفًا مُصدَّرًا بلا كلمة مرور.',
  'diagnostic.zip.unsupported-method':
    'يستخدم «{entry}» في ملف ZIP هذا طريقة ضغط لا يمكننا قراءتها.',
  'diagnostic.zip.too-many-entries':
    'يحتوي ملف ZIP هذا على أكثر من {limit, plural, few {# ملفات} many {# ملفًا} other {# ملف}}.',
  'diagnostic.zip.entry-too-large':
    'يتجاوز حجم «{entry}» في ملف ZIP هذا {megabytes} ميغابايت بعد فك الضغط.',
  'diagnostic.zip.suspicious-ratio':
    '«{entry}» في ملف ZIP هذا مضغوط بدرجة كبيرة قد تجعل فك ضغطه غير آمن، لذا توقفنا.',
  'diagnostic.zip.overlapping-entries':
    'تتداخل الملفات في أرشيف ZIP هذا، وهذه علامة على أرشيف تالف أو غير آمن، لذا توقفنا.',
  'diagnostic.zip.corrupt-entry': '«{entry}» في ملف ZIP هذا تالف.',
  'diagnostic.zip.checksum-mismatch': 'لم يجتز «{entry}» في ملف ZIP هذا فحص السلامة.',
  'diagnostic.zip.no-csv': 'لا يحتوي ملف ZIP هذا على ملفات CSV.',
  'diagnostic.zip.website':
    'يحتوي ملف ZIP هذا على موقع ويب، لا على بيانات مُصدَّرة من Search Console: {pages, plural, zero {لا صفحات ويب} one {صفحة ويب واحدة} two {صفحتا ويب} few {# صفحات ويب} many {# صفحة ويب} other {# صفحة ويب}} من بين {files, plural, zero {لا ملفات} one {ملف واحد} two {ملفين} few {# ملفات} many {# ملفًا} other {# ملف}}. يمكن لمراجعة الصفحة فحص كل صفحة فيه.',

  'diagnostic.gsc.no-tables': 'لم نعثر على بيانات Search Console في الملفات التي اخترتها.',
  'diagnostic.gsc.unrecognized-table': 'لا يبدو هذا الملف ملف تصدير لأداء Search Console.',
  'diagnostic.gsc.duplicate-table':
    'اخترت أكثر من جدول {kind, select, date {للبيانات اليومية} query {لطلبات البحث} page {للصفحات} country {للبلدان} device {للأجهزة} searchAppearance {لمظهر البحث} other {من النوع نفسه}}. استخدمنا الجدول الأول.',
  'diagnostic.gsc.columns-inferred':
    'لم نتعرّف على أسماء الأعمدة، لذا طابقنا الأعمدة وفق الترتيب القياسي في Search Console وتحققنا من قيمها.',
  'diagnostic.gsc.dimension-inferred':
    'لم نتعرّف على اسم العمود الأول. {kind, select, date {قيمه تواريخ.} page {قيمه عناوين صفحات.} other {نعرض قيمه كما هي.}}',
  'diagnostic.gsc.missing-columns':
    'يفتقد هذا الجدول عمود {metric, select, clicks {«النقرات»} impressions {«مرات الظهور»} ctr {«نسبة النقر إلى الظهور»} position {«الموضع»} other {«{metric}»}}.',
  'diagnostic.gsc.invalid-number': '«{value}» ليس رقمًا صالحًا.',
  'diagnostic.gsc.invalid-date': '«{value}» ليس تاريخًا صالحًا.',
  'diagnostic.gsc.ambiguous-dates':
    'لا يمكننا معرفة ما إذا كانت هذه التواريخ تبدأ باليوم أم بالشهر. صدِّر الملف مرة أخرى من Search Console دون تعديله.',
  'diagnostic.gsc.mixed-decimal-separators':
    'يخلط العمود «{column}» بين النقطة العشرية والفاصلة العشرية.',
  'diagnostic.gsc.decimal-comma': 'يستخدم العمود «{column}» الفاصلة فاصلًا عشريًا.',
  'diagnostic.gsc.ctr-as-fraction':
    'يعرض العمود «{column}» نسبة النقر إلى الظهور ككسر: 0.05 تعني 5%.',
  'diagnostic.gsc.clicks-exceed-impressions':
    'عدد النقرات في هذا الصف ({clicks}) أكبر من عدد مرات الظهور ({impressions})، وهو ما لا يُبلغ عنه Search Console أبدًا.',
  'diagnostic.gsc.columns-swapped':
    'عدد النقرات في معظم الصفوف أكبر من عدد مرات الظهور. ربما تم تبديل العمودين، لذا لم نستخدم هذا الجدول.',
  'diagnostic.gsc.ctr-mismatch':
    'في {rows, plural, one {صف واحد} two {صفين} few {# صفوف} many {# صفًا} other {# صف}}، لا تتطابق نسبة النقر إلى الظهور مع حاصل قسمة النقرات على مرات الظهور. ربما عُدّل الملف.',
  'diagnostic.gsc.position-out-of-range': '«{value}» ليس متوسط موضع صالحًا. تبدأ المواضع من 1.',
  'diagnostic.gsc.duplicate-key': 'يتكرر «{key}» أكثر من مرة. استخدمنا الصف الأول.',
  'diagnostic.gsc.empty-key': 'العمود الأول في هذا الصف فارغ، لذا تخطّيناه.',
  'diagnostic.gsc.empty-table': 'لا يحتوي هذا الجدول على صفوف يمكن استخدامها.',

  'diagnostic.mentions.invalid-json': 'هذا الملف ليس JSON صالحًا.',
  'diagnostic.mentions.invalid-format': 'هذا الملف ليس سجل إشارات من SearchUnveil.',
  'diagnostic.mentions.unsupported-version':
    'أُنشئ سجل الإشارات هذا بإصدار أحدث من SearchUnveil (التنسيق {version}).',
  'diagnostic.mentions.too-many':
    'يحتوي هذا السجل على أكثر من {limit} إشارة، وهو الحد الأقصى الذي يمكننا قراءته.',
  'diagnostic.mentions.invalid-field': 'الإدخال {index}: «{field}» مفقود أو غير صالح.',
  'diagnostic.mentions.duplicate-id': 'الإدخال {index} يكرر إدخالًا سابقًا. احتفظنا بالأول.',

  // Diagnostics: saved AI visibility checks
  'diagnostic.visibility.invalid-json': 'هذا الملف ليس JSON صالحًا.',
  'diagnostic.visibility.invalid-format':
    'هذا الملف ليس فحصًا محفوظًا من SearchUnveil لظهورك في إجابات الذكاء الاصطناعي.',
  'diagnostic.visibility.unsupported-version':
    'حُفظ هذا الفحص بإصدار أحدث من SearchUnveil (التنسيق {version}).',
  'diagnostic.visibility.invalid-field': 'هذا الفحص المحفوظ تالف: «{field}» مفقود أو غير صالح.',
  'diagnostic.visibility.invalid-answer': 'الإجابة {index} تالفة، لذا استبعدناها.',
  'diagnostic.visibility.duplicate-answer': 'الإجابة {index} تكرر إجابة سابقة. احتفظنا بالأولى.',

  'diagnostic.page.empty': 'الصق رمز HTML لصفحة ما، أو اختر ملف HTML، لمراجعتها.',
  'diagnostic.page.too-large':
    'يتجاوز رمز HTML هذا {limit} حرف، وهو الحد الأقصى الذي يمكننا مراجعته.',
  'diagnostic.page.not-html': 'لا يبدو هذا رمز HTML. الصق الرمز المصدري للصفحة، لا عنوانها.',
  'diagnostic.page.invalid-url':
    '«{value}» ليس عنوان ويب كاملًا، لذا تخطّينا عمليات التحقق التي تقارن الروابط بالصفحة.',
  'diagnostic.site.no-pages':
    'لا يوجد بين الملفات التي اخترتها أي صفحة ويب (ملف بامتداد html أو htm).',

  'diagnostic.diagnostic.more':
    '…و{count, plural, one {حالة أخرى مماثلة} two {حالتان أخريان مماثلتان} few {# حالات أخرى مماثلة} many {# حالةً أخرى مماثلة} other {# حالة أخرى مماثلة}}.',
};
