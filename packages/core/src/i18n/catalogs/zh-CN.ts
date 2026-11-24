import type { CoreCatalog } from './en.ts';

/** 简体中文。中文与拉丁字母、数字之间加半角空格；使用全角标点。中文没有复数变化。 */
export const zhCN: CoreCatalog = {
  'status.attention': '需要关注',
  'status.review': '值得一看',
  'status.good': '状况良好',
  'status.info': '供您参考',

  'metric.clicks': '点击次数',
  'metric.impressions': '展示次数',
  'metric.ctr': '点击率',
  'metric.position': '平均排名',
  'metric.clicks.help': '用户从 Google 搜索点击进入您网站的次数。',
  'metric.impressions.help': '指向您网站的链接出现在用户所见搜索结果中的次数。',
  'metric.ctr.help': '展示中转化为点击的比例。',
  'metric.position.help': '您的网站通常在搜索结果中出现的位置。数值越小越好：1 表示页面最上方。',

  'evidence.recent-period': '近期',
  'evidence.previous-period': '上一时段',
  'evidence.period': '{range}',
  'evidence.change': '变化',
  'evidence.first-day': '第一天',
  'evidence.last-day': '最后一天',
  'evidence.impressions-on': '{day}的展示次数',
  'evidence.typical-impressions': '平常的一天',
  'evidence.head-breaker': '导致 head 提前结束的内容',
  'evidence.title': '标题',
  'evidence.description': '描述',
  'evidence.viewport': '视口',
  'evidence.canonical': '规范链接',
  'evidence.heading': '小标题',
  'evidence.heading-level': 'h{level}',
  'evidence.status': '状态码',
  'evidence.final-address': '最终地址',
  'evidence.redirect': '重定向',
  'evidence.header': '标头',
  'evidence.robots-rule': 'robots.txt 规则',
  'evidence.response-time': '响应时间（秒）',
  'table.query': '查询',
  'table.page': '网页',
  'table.text': '{text}',
  'table.typical-ctr': '您网站的一般水平',
  'table.primary-period': '主要时段',
  'table.comparison-period': '对比时段',
  'table.tag': '标记',
  'table.image': '图片',
  'table.link': '链接',

  'ref.gsc-metrics': 'Search Console 帮助：展示次数、排名和点击次数的含义',
  'ref.gsc-performance': 'Search Console 帮助：效果报告',
  'ref.title-links': 'Google 搜索中心：影响标题链接',
  'ref.snippets': 'Google 搜索中心：摘要和元描述',
  'ref.robots-meta': 'Google 搜索中心：robots meta 标记',
  'ref.canonical': 'Google 搜索中心：规范网址',
  'ref.hreflang': 'Google 搜索中心：网页的本地化版本',
  'ref.structured-data': 'Google 搜索中心：结构化数据简介',
  'ref.rich-results-test': 'Google 富媒体搜索结果测试',
  'ref.images': 'Google 搜索中心：图片最佳做法',
  'ref.valid-metadata': 'Google 搜索中心：使用有效的网页元数据',
  'ref.crawlable-links': 'Google 搜索中心：使链接可供抓取',
  'ref.wcag-language': 'WCAG 2.2：页面语言（3.1.1）',
  'ref.wcag-non-text': 'WCAG 2.2：非文本内容（1.1.1）',
  'ref.wcag-resize': 'WCAG 2.2：调整文本大小（1.4.4）',
  'ref.wcag-link-purpose': 'WCAG 2.2：链接目的（2.4.4）',
  'ref.wcag-structure': 'WCAG 2.2：信息和关系（1.3.1）',
  'ref.viewport': 'MDN：viewport meta 标记',
  'ref.open-graph': 'Open Graph 协议',
  'ref.robots-txt': 'Google 搜索中心：robots.txt 简介',
  'ref.http-status': 'Google 搜索中心：HTTP 状态代码和网络错误',
  'ref.https': 'web.dev：HTTPS 为何重要',

  'gsc.headline.method':
    '我们将 {current} 与 {previous} 进行了比较，并把每一天与星期几相同的那一天对应。',
  'gsc.headline.up-up': '更多人找到并访问了您的网页。',
  'gsc.headline.up-flat': '您的网页出现频率大致不变，但点击的人更多了。',
  'gsc.headline.up-down': '尽管您的网页出现得更少，点击次数却增加了。',
  'gsc.headline.flat-up': '您的网页在搜索中出现得更频繁，但点击次数基本持平。',
  'gsc.headline.flat-flat': '搜索效果基本持平。',
  'gsc.headline.flat-down': '您的网页出现得更少，但点击次数基本持平。',
  'gsc.headline.down-up': '您的网页出现得更频繁，但点击的人更少了。',
  'gsc.headline.down-flat': '您的网页出现频率大致不变，但点击的人更少了。',
  'gsc.headline.down-down': '您的网页出现得更少，获得的点击也更少。',
  'gsc.headline.impressions-up': '您的网页在搜索中出现得更频繁。点击次数还太少，暂时无法比较。',
  'gsc.headline.impressions-flat': '您的网页出现频率与之前大致相同。点击次数还太少，暂时无法比较。',
  'gsc.headline.impressions-down': '您的网页在搜索中出现得更少。点击次数还太少，暂时无法比较。',
  'gsc.headline.insufficient': '搜索数据尚不足以可靠地比较不同时段。',

  'gsc.check.growth-drivers': '找出带来增长的网页和查询，并保持这些内容准确、及时。',
  'gsc.check.queries-gained':
    '比较两个时段的查询，看看哪些查询的展示次数增加了，以及它们是否与您网页提供的内容相符。',
  'gsc.check.titles': '检查相关网页的标题和描述。用户在决定是否点击之前，读到的正是这些内容。',
  'gsc.check.position-shift': '查看平均排名：新出现的结果通常位置较低，而那里的点击较少。',
  'gsc.check.lost-visibility':
    '找出展示次数减少的网页和查询，并确认这些网页仍能正常访问并可被编入索引。',
  'gsc.check.site-changes': '回想网站最近的变更，例如改版、移动或删除网页，或新的 robots 规则。',
  'gsc.check.seasonality': '与去年同期的几周进行比较。人们对许多主题的兴趣会随季节起伏。',
  'gsc.check.serp-features':
    '亲自搜索您的主要查询。结果页上的广告、视频或 AI 生成的回答可能会分走点击。',
  'gsc.check.opportunities': '请参阅下方的机会，了解哪些查询和网页有望获得更多点击。',
  'gsc.check.export-longer':
    '从 Search Console 导出更长的日期范围（最好是最近 3 个月），以便看得更清楚。',
  'gsc.check.focused-page': '确保每个查询都由一个清晰、及时的网页来解答，并从相关网页链接到它。',
  'gsc.check.search-intent': '搜索这些网页所出现的查询，并检查这些网页是否提供了用户想要的答案。',

  'gsc.change.clicks.up': '点击次数增加了 {change}，达到 {current}。',
  'gsc.change.clicks.down': '点击次数减少了 {change}，降至 {current}。',
  'gsc.change.clicks.flat': '点击次数基本持平，为 {current}。',
  'gsc.change.clicks.started': '点击次数从无到有，达到 {current}。',
  'gsc.change.impressions.up': '展示次数增加了 {change}，达到 {current}。',
  'gsc.change.impressions.down': '展示次数减少了 {change}，降至 {current}。',
  'gsc.change.impressions.flat': '展示次数基本持平，为 {current}。',
  'gsc.change.impressions.started': '展示次数从无到有，达到 {current}。',
  'gsc.change.ctr.up': '点击率从 {previous} 上升到 {current}。',
  'gsc.change.ctr.down': '点击率从 {previous} 下降到 {current}。',
  'gsc.change.ctr.flat': '点击率基本持平，为 {current}。',
  'gsc.change.position.better': '平均排名从 {previous} 提升到 {current}。',
  'gsc.change.position.worse': '平均排名从 {previous} 下滑到 {current}。',
  'gsc.change.position.flat': '平均排名基本持平，为 {current}。',
  'gsc.daybyday.higher': '在 {days} 天中，有 {count} 天的数值高于上一时段中星期几相同的那一天。',
  'gsc.daybyday.lower': '在 {days} 天中，有 {count} 天的数值低于上一时段中星期几相同的那一天。',
  'gsc.daybyday.uneven':
    '逐日来看，变化并不均衡（{higher} 天较高，{lower} 天较低），因此少数几天可能就占了大部分变化。',

  'gsc.limit.weekday-matching':
    '每个时段都由完整的周组成，因此工作日与周末的差异不会扭曲比较结果。',
  'gsc.limit.ctr-features':
    '点击率还取决于结果页上显示的其他内容，例如广告、视频或 AI 生成的回答。',
  'gsc.limit.position-mix': '不仅排名变动会改变平均排名，搜索构成的变化也会改变它。',
  'gsc.limit.position-average':
    '平均排名概括了许多次搜索。在具体某次搜索中，网页的位置可能更高或更低。',

  'gsc.opportunity.low-ctr.query': '{count} 个查询获得的点击少于类似结果',
  'gsc.opportunity.low-ctr.page': '{count} 个网页获得的点击少于类似结果',
  'gsc.opportunity.low-ctr.summary':
    '它们出现在前十个结果中，但点击率还不到您其他排名相近的结果的 {share}。',
  'gsc.opportunity.near-top.query': '{count} 个查询排在前十名之后不远处',
  'gsc.opportunity.near-top.page': '{count} 个网页排在前十名之后不远处',
  'gsc.opportunity.near-top.summary':
    '它们的平均排名在 {from} 到 {to} 之间，而且搜索量较大。改进回答这些查询的网页，可能会让它进入用户的视野。',
  'gsc.opportunity.zero-click-pages': '{count} 个网页有人看到却无人点击',
  'gsc.opportunity.zero-click-pages.summary':
    '每个网页都在搜索结果中出现了至少 {min} 次，却没有获得一次点击。',
  'gsc.movers.gains': '点击次数增加最多的{kind, select, page {网页} other {查询}}',
  'gsc.movers.losses': '点击次数减少最多的{kind, select, page {网页} other {查询}}',

  'gsc.note.no-dates': '此导出文件没有按日数据，因此无法显示趋势。',
  'gsc.note.short-range': '此导出文件涵盖 {days} 天，太短，无法比较两个时段。',
  'gsc.note.missing-days': '有 {count} 天没有数据',
  'gsc.note.missing-days.summary': '没有对应行的日子通常没有任何展示。我们将其计为零。',
  'gsc.note.incomplete-days': '{count, plural, other {最后 # 天的数据似乎不完整}}',
  'gsc.note.incomplete-days.summary':
    'Search Console 可能仍在处理近期数据。我们未将这 {count} 天计入比较。',
  'gsc.note.anonymized-queries': '“查询”表涵盖了全部点击的 {share}',
  'gsc.note.anonymized-queries.summary':
    '为了保护搜索者的隐私，Search Console 不会列出罕见查询，并且最多只导出 {limit} 行。因此，“查询”表的总计低于图表中的总计。',
  'gsc.note.row-limit':
    '{kind, select, query {“查询”表} page {“网页”表} country {“国家/地区”表} other {某个表}}已达到 {limit} 行',
  'gsc.note.row-limit.summary':
    '这是 Search Console 的导出上限，因此可能缺少较少出现的{kind, select, query {查询} page {网页} country {国家/地区} other {行}}。',
  'gsc.note.partial-totals':
    '总计来自{kind, select, query {“查询”表} page {“网页”表} country {“国家/地区”表} device {“设备”表} other {导出的表}}',
  'gsc.note.partial-totals.summary':
    '{kind, select, query {出于隐私原因，罕见查询会被隐藏，因此这些总计低于您网站的实际总计。} page {当您的多个网页出现在同一次搜索中时，每个网页都会被计算一次，因此这些总计可能与您网站的总计不同。} other {它们可能与您网站的总计不同。请加入按日数据表以获得完整总计。}}',
  'gsc.note.comparison-export': '此导出文件将“{primary}”与“{comparison}”进行了比较。',
  'gsc.note.comparison-export.unlabeled': '此导出文件比较了两个日期范围。',
  'gsc.note.filters': '导出设置',

  'page.limit.source': '我们检查的是您提供的 HTML。网页加载后由 JavaScript 添加的内容不包括在内。',
  'page.limit.scope':
    'HTTP 标头、robots.txt、加载速度和来自其他网站的链接也会影响搜索，但不在本次检查范围内。',
  'page.limit.width': '搜索结果按像素而非字符衡量宽度，因此这只是估算。',
  'page.head.ok': '所有重要标记都位于 head 内',
  'page.head.broken': '有 {count} 个重要标记落到了 head 之外',
  'page.head.broken.summary':
    '在{count, plural, other {这些标记}}之前出现了不属于 head 的内容，导致浏览器提前结束了 head。搜索引擎会忽略位于 head 之外的这些标记。',
  'page.head.noscript': 'noscript 块之后的 {count} 个标记可能会被忽略',
  'page.head.noscript.summary':
    'head 中 noscript 块内的图片或类似元素，会让不运行 JavaScript 的工具提前结束 head。运行 JavaScript 的浏览器不受影响。',
  'page.check.head': '将这个意外的元素移到 head 下方，或将这些标记移到它的上方。',
  'page.check.noscript': '将 noscript 块移到 head 的末尾，放在重要标记之后。',
  'page.robots.noindex': '此网页要求搜索引擎不要在结果中显示它',
  'page.robots.noindex.summary':
    '标记为 noindex 的网页不会出现在搜索结果中。这对私密或重复的网页是正确的，用在其他网页上则是代价高昂的错误。',
  'page.check.robots': '如果此网页应当出现在搜索中，请从它的 robots meta 标记中删除 noindex。',
  'page.robots.nofollow': '此网页要求搜索引擎不要跟踪其中的链接',
  'page.robots.nofollow.summary': '搜索引擎不会利用此网页上的链接来发现其他网页。',
  'page.robots.limited': '此网页限制了搜索引擎展示它的方式',
  'page.robots.limited.summary': 'nosnippet 或 max-snippet 等规则会改变网页在结果中的显示方式。',
  'page.robots.indexable': 'HTML 中没有任何内容阻止编入索引',
  'page.robots.indexable.summary':
    '我们没有在网页中找到 noindex 规则。规则也可能来自 HTTP 标头或 robots.txt，而 HTML 中看不到这些。',
  'page.title.why': '搜索引擎通常会把标题作为指向您网页的链接，浏览器也会在标签页和书签中显示它。',
  'page.check.title': '写一个简短且独特的标题，说明网页提供什么内容，并把最重要的词放在前面。',
  'page.title.missing': '此网页没有标题',
  'page.title.empty': '此网页的标题为空',
  'page.title.multiple': '此网页有 {count} 个标题',
  'page.title.multiple.summary': '浏览器使用第一个，搜索引擎则可能使用其中任何一个。请只保留一个。',
  'page.title.short': '标题非常短',
  'page.title.short.summary': '像“首页”这样的标题，很少能告诉搜索者网页提供什么内容。',
  'page.title.long': '标题在搜索结果中可能会被截断',
  'page.title.long.summary':
    '它的长度约为 {length} 个字符宽。搜索结果截断之前，通常能显示约 {fit} 个。',
  'page.title.ok': '标题存在且长度适中',
  'page.description.why':
    '元描述是可选的，而且 Google 常常会自行撰写摘要。不过，好的描述仍能帮助用户选择您的结果。',
  'page.check.description': '用一两句话概括网页内容，写给正在考虑是否点击的人。',
  'page.description.missing': '此网页没有元描述',
  'page.description.empty': '元描述为空',
  'page.description.multiple': '此网页有 {count} 个元描述',
  'page.description.multiple.summary': '请只保留一个，以便明确使用哪一个。',
  'page.description.long': '描述在搜索结果中可能会被截断',
  'page.description.long.summary': '它的长度约为 {length} 个字符宽。摘要中通常能显示约 {fit} 个。',
  'page.description.ok': '此网页有元描述',
  'page.lang.missing': '此网页没有声明语言',
  'page.lang.invalid': '语言代码 {value} 无效',
  'page.lang.why': '屏幕阅读器会根据语言正确朗读文本，浏览器也会根据语言提供翻译。',
  'page.check.lang': '为 html 元素添加 lang 属性，例如 lang="zh-CN" 或 lang="en"。',
  'page.lang.ok': '此网页声明了语言：{value}',
  'page.viewport.missing': '此网页没有针对手机进行设置',
  'page.viewport.why':
    '如果没有 viewport meta 标记，手机会像显示桌面网页一样缩小显示整个页面。Google 主要使用网页的移动版本来编入索引。',
  'page.check.viewport':
    '在 head 中添加 <meta name="viewport" content="width=device-width, initial-scale=1">。',
  'page.viewport.zoom-blocked': '此网页禁止访问者缩放',
  'page.viewport.zoom-blocked.summary':
    '禁止缩放会让视力不佳的人难以阅读文字。请删除 user-scalable=no 以及任何小于 2 的 maximum-scale。',
  'page.viewport.ok': '此网页已针对手机进行设置',
  'page.canonical.missing': '此网页没有规范链接',
  'page.canonical.missing.summary':
    '对大多数网页来说这没有问题。如果相同内容可以通过多个网址访问，规范链接会告诉搜索引擎您更倾向于哪一个。',
  'page.canonical.multiple': '此网页有 {count} 个相互矛盾的规范链接',
  'page.canonical.multiple.summary': '当规范链接指向不同的网页时，搜索引擎可能会将它们全部忽略。',
  'page.canonical.invalid': '规范链接 {href} 不是有效的网址',
  'page.canonical.relative': '规范链接使用了相对网址',
  'page.canonical.relative.summary':
    '这样可以生效，但以 https:// 开头的完整网址能避免出错，Google 也推荐这样做。',
  'page.canonical.other-site': '规范链接指向另一个网站：{host}',
  'page.canonical.other-site.summary':
    '搜索引擎可能会显示那个网站的网页，而不是此网页。只有当此网页是副本时，这才符合预期。',
  'page.canonical.other-page': '规范链接指向另一个网页',
  'page.canonical.other-page.summary': '搜索引擎可能会把此网页视为重复网页，转而显示另一个网页。',
  'page.canonical.self': '规范链接指向此网页',
  'page.canonical.present': '此网页有一个规范链接',
  'page.h1.missing': '此网页没有主标题（h1）',
  'page.h1.why': '主标题会告诉访问者（包括使用屏幕阅读器的人）这个网页是关于什么的。',
  'page.h1.multiple': '此网页有 {count} 个主标题（h1）',
  'page.h1.multiple.summary': '这是允许的。不过，只有一个主标题通常能让结构更清晰。',
  'page.headings.skipped': '小标题级别从 h{from} 跳到了 h{to}',
  'page.headings.skipped.summary':
    '许多屏幕阅读器用户会按小标题浏览网页。跳过的级别可能让人以为有内容缺失。',
  'page.headings.empty': '有 {count} 个小标题为空',
  'page.headings.empty.summary': '屏幕阅读器会读出空的小标题，但它们什么也没说。',
  'page.headings.ok': '{count} 个小标题构成了清晰的大纲',
  'page.images.missing-alt': '有 {count} 张图片没有替代文本',
  'page.images.missing-alt.summary':
    '屏幕阅读器无法描述这些图片，搜索引擎对它们的理解也会更差。请在 alt 属性中描述每张图片；纯装饰性的图片请使用空的 alt。',
  'page.images.ok': '{count, plural, other {全部 # 张图片}}都有替代文本',
  'page.links.unnamed': '有 {count} 个链接没有文字',
  'page.links.unnamed.summary':
    '屏幕阅读器在读出这些链接时，无法说明它们通往何处。请添加可见的文字；图标链接可使用 aria-label。',
  'page.links.javascript': '有 {count} 个链接运行 JavaScript，而不是指向某个网址',
  'page.links.javascript.summary':
    '搜索引擎无法跟踪这些链接。请在每个链接的 href 中填写真实的网址。',
  'page.links.summary':
    '此网页链接到 {total} 个网址：{internal} 个在本网站，{external} 个在其他网站',
  'page.links.nofollow': '有 {count} 个链接标记为 nofollow。',
  'page.structured-data.invalid': '有 {count} 个结构化数据块无法读取',
  'page.structured-data.invalid.summary': '搜索引擎会忽略不是有效 JSON 的结构化数据。',
  'page.structured-data.found': '此网页包含结构化数据：{types}',
  'page.structured-data.untyped': '此网页包含未指定类型的结构化数据',
  'page.structured-data.found.summary':
    '我们确认了它可以被读取。它是否符合富媒体搜索结果的条件，请使用 Google 的富媒体搜索结果测试查看。',
  'page.hreflang.invalid': '部分语言注释使用了无效的代码：{values}',
  'page.hreflang.invalid.summary':
    '请使用 en、en-GB 或 zh-Hans 等语言代码，或使用 x-default。英国的代码是 GB，而不是 UK。',
  'page.hreflang.no-self': '语言注释中没有包含此网页',
  'page.hreflang.no-self.summary': '每个语言版本除了列出其他版本外，也应列出自己。',
  'page.hreflang.ok': '此网页列出了 {count} 个语言版本',
  'page.hreflang.limit':
    '我们只能检查此网页。它列出的每个网页都必须链接回来，否则搜索引擎会忽略这些注释。',
  'page.charset.missing': '此网页没有声明字符编码',
  'page.charset.missing.summary':
    '除非服务器已声明，否则浏览器可能会猜错并显示乱码。请在 head 的开头添加 <meta charset="utf-8">。',
  'page.charset.legacy': '此网页使用 {value} 字符编码',
  'page.charset.legacy.summary': '网页推荐使用 UTF-8，它涵盖所有语言。',
  'page.charset.ok': '此网页声明了 UTF-8 编码',
  'page.social.missing': '链接预览可能不完整：缺少 {tags}',
  'page.social.missing.summary':
    '社交网络和聊天应用会使用 Open Graph 标记生成链接预览。它们不会影响搜索排名。',
  'page.social.ok': '此网页有用于链接预览的标记',
  'page.limit.fetched':
    '我们检查的是服务器为此地址发送的 HTML。网页加载后由 JavaScript 添加的内容不包括在内。',
  'page.limit.scope.fetched': '加载速度和来自其他网站的链接也会影响搜索，但不在本次检查范围内。',

  'http.status': '服务器返回了状态码 {status}，而不是网页',
  'http.status.summary':
    '搜索引擎会将以成功状态码（200）响应的网页编入索引。错误和重定向状态码会让此地址无法出现在结果中。',
  'http.check.status': '请在浏览器中打开此地址，并检查返回此状态码的服务器或托管设置。',
  'http.https': '此网页未通过 HTTPS 提供',
  'http.https.summary':
    '浏览器会将未使用 HTTPS 的网页标记为“不安全”，搜索引擎也会优先选择网页的安全版本。',
  'http.check.https': '请安装证书，并将每个 http:// 地址重定向到对应的 https:// 版本。',
  'http.x-robots-tag': '服务器要求搜索引擎不要在结果中显示此网页',
  'http.x-robots-tag.summary':
    'X-Robots-Tag 标头的作用与 robots meta 标记相同，但由服务器设置，因此只看 HTML 很容易遗漏。',
  'http.check.x-robots-tag':
    '如果此网页应当出现在搜索中，请在服务器或托管设置中从 X-Robots-Tag 标头删除 noindex。',
  'http.robots-txt': 'robots.txt 禁止搜索引擎访问此网页',
  'http.robots-txt.summary': 'Googlebot 不会抓取 robots.txt 禁止的地址，因此无法读取此网页的内容。',
  'http.check.robots-txt':
    '如果此网页应当出现在搜索中，请删除 robots.txt 中的这条规则或缩小其范围。',
  'http.robots-txt.unreadable': '我们无法读取该网站的 robots.txt',
  'http.robots-txt.unreadable.summary':
    '如果 robots.txt 返回服务器错误，Google 会暂停抓取整个网站，直到能再次读取该文件。请确认它可以打开。',
  'http.redirects': '该地址在到达网页前重定向了 {count} 次',
  'http.redirects.summary': '每次重定向都会让访问者和抓取工具多一次往返。请直接链接到最终地址。',
  'http.ok': '服务器顺利提供此网页',
  'http.ok.summary': '它通过 HTTPS 成功响应，robots.txt 和服务器标头都没有阻止搜索引擎。',

  'mentions.kind.citation': '附带链接引用',
  'mentions.kind.mention': '提及但未附链接',
  'mentions.method.own-check': '我亲自询问了助手',
  'mentions.method.shared-with-me': '别人分享给我的',
  'mentions.method.screenshot': '来自截图',
  'mentions.method.other': '其他方式',
  'mentions.certainty.confirmed': '已确认',
  'mentions.certainty.uncertain': '不确定',
  'mentions.error.required': '此项为必填项。',
  'mentions.error.too-long': '最多使用 {max} 个字符。',
  'mentions.error.invalid-url': '请输入以 https:// 或 http:// 开头的完整网址。',
  'mentions.error.invalid-date': '请输入有效的日期。',
  'mentions.error.future-date': '日期不能晚于今天。',
  'mentions.error.invalid-choice': '请选择其中一个选项。',
  'mentions.limit.scope':
    '这些是您记录的提及。它们表明您在哪里看到过自己的网站，而不是 AI 助手总体上提及它的频率。',

  'diagnostic.input.empty': '此文件为空。',
  'diagnostic.input.binary': '这不是文本文件。请选择 CSV 文件，或 Search Console 下载的 ZIP 文件。',
  'diagnostic.input.spreadsheet':
    '这是电子表格工作簿。请将其另存为 CSV，或使用 Search Console 提供的原始 ZIP 文件。',
  'diagnostic.input.unsupported-type': '不支持此类型的文件。',
  'diagnostic.encoding.legacy-fallback':
    '此文件不是以 UTF-8 保存的，因此我们按 {encoding} 读取了它。如果文字显示有误，请从 Search Console 重新导出文件，且不要先用电子表格打开。',
  'diagnostic.encoding.utf16-without-bom': '此文件使用 {encoding} 编码。我们已自动识别。',
  'diagnostic.csv.no-header': '此文件没有标题行。',
  'diagnostic.csv.unterminated-quote': '某个以引号开头的值没有结束引号。',
  'diagnostic.csv.stray-quote': '某个值中间出现了引号。我们按原样保留了它。',
  'diagnostic.csv.text-after-quote': '结束引号之后还有文字。我们将其保留为值的一部分。',
  'diagnostic.csv.field-count': '这一行有 {actual} 个值，但标题行有 {expected} 个。',
  'diagnostic.csv.too-many-rows': '此文件超过 {limit} 行，这是我们能读取的上限。',
  'diagnostic.csv.too-many-columns': '某一行超过 {limit} 列，这是我们能读取的上限。',
  'diagnostic.csv.field-too-long': '某个值超过 {limit} 个字符，这是我们能读取的上限。',
  'diagnostic.zip.invalid': '此 ZIP 文件已损坏或不完整。请尝试重新下载。',
  'diagnostic.zip.multi-disk': '此 ZIP 文件被拆分成了多个部分，不受支持。',
  'diagnostic.zip.encrypted': '此 ZIP 文件受密码保护。请使用没有密码的导出文件。',
  'diagnostic.zip.unsupported-method': '此 ZIP 文件中的“{entry}”使用了我们无法读取的压缩方法。',
  'diagnostic.zip.too-many-entries': '此 ZIP 文件包含超过 {limit} 个文件。',
  'diagnostic.zip.entry-too-large': '此 ZIP 文件中的“{entry}”解压后超过 {megabytes} MB。',
  'diagnostic.zip.suspicious-ratio':
    '此 ZIP 文件中的“{entry}”压缩程度过高，解压可能不安全，因此我们停止了处理。',
  'diagnostic.zip.overlapping-entries':
    '此 ZIP 归档中的文件相互重叠，这表明归档已损坏或不安全，因此我们停止了处理。',
  'diagnostic.zip.corrupt-entry': '此 ZIP 文件中的“{entry}”已损坏。',
  'diagnostic.zip.checksum-mismatch': '此 ZIP 文件中的“{entry}”未通过完整性检查。',
  'diagnostic.zip.no-csv': '此 ZIP 文件中没有 CSV 文件。',
  'diagnostic.zip.website':
    '此 ZIP 文件包含的是一个网站，而不是 Search Console 导出文件：{files, plural, other {# 个文件}}中有 {pages, plural, other {# 个网页}}。网页检查可以检查其中的每个网页。',

  'diagnostic.gsc.no-tables': '我们没有在您选择的文件中找到 Search Console 数据。',
  'diagnostic.gsc.unrecognized-table': '此文件看起来不像 Search Console 的效果导出文件。',
  'diagnostic.gsc.duplicate-table':
    '您选择了多个{kind, select, date {按日数据} query {“查询”} page {“网页”} country {“国家/地区”} device {“设备”} searchAppearance {“搜索结果呈现”} other {同类}}表。我们使用了第一个。',
  'diagnostic.gsc.columns-inferred':
    '我们没有识别出列名，因此按照 Search Console 的标准列顺序匹配了各列，并检查了它们的值。',
  'diagnostic.gsc.dimension-inferred':
    '我们没有识别出第一列的名称。{kind, select, date {它的值是日期。} page {它的值是网页地址。} other {我们将按原样显示它的值。}}',
  'diagnostic.gsc.missing-columns':
    '此表缺少{metric, select, clicks {“点击次数”} impressions {“展示次数”} ctr {“点击率”} position {“排名”} other {“{metric}”}}列。',
  'diagnostic.gsc.invalid-number': '“{value}”不是有效的数字。',
  'diagnostic.gsc.invalid-date': '“{value}”不是有效的日期。',
  'diagnostic.gsc.ambiguous-dates':
    '我们无法判断这些日期是以日还是以月开头。请从 Search Console 重新导出文件，不要进行编辑。',
  'diagnostic.gsc.mixed-decimal-separators': '“{column}”列混用了小数点和小数逗号。',
  'diagnostic.gsc.decimal-comma': '“{column}”列使用逗号作为小数分隔符。',
  'diagnostic.gsc.ctr-as-fraction': '“{column}”列以小数形式给出点击率：0.05 表示 5%。',
  'diagnostic.gsc.clicks-exceed-impressions':
    '这一行的点击次数（{clicks}）多于展示次数（{impressions}），而 Search Console 从不会报告这种情况。',
  'diagnostic.gsc.columns-swapped':
    '大多数行的点击次数都多于展示次数。这两列可能被调换了，因此我们没有使用此表。',
  'diagnostic.gsc.ctr-mismatch':
    '有 {rows} 行的点击率与点击次数除以展示次数的结果不符。文件可能被编辑过。',
  'diagnostic.gsc.position-out-of-range': '“{value}”不是有效的平均排名。排名从 1 开始。',
  'diagnostic.gsc.duplicate-key': '“{key}”出现了不止一次。我们使用了第一行。',
  'diagnostic.gsc.empty-key': '这一行的第一列为空，因此我们跳过了它。',
  'diagnostic.gsc.empty-table': '此表中没有可用的行。',

  'diagnostic.mentions.invalid-json': '此文件不是有效的 JSON。',
  'diagnostic.mentions.invalid-format': '此文件不是 SearchUnveil 提及记录。',
  'diagnostic.mentions.unsupported-version':
    '此提及记录由更新版本的 SearchUnveil 创建（格式 {version}）。',
  'diagnostic.mentions.too-many': '此记录包含超过 {limit} 条提及，这是我们能读取的上限。',
  'diagnostic.mentions.invalid-field': '第 {index} 条：“{field}”缺失或无效。',
  'diagnostic.mentions.duplicate-id': '第 {index} 条与之前的某条记录重复。我们保留了第一条。',

  'diagnostic.page.empty': '请粘贴网页的 HTML，或选择一个 HTML 文件，以便进行检查。',
  'diagnostic.page.too-large': '此 HTML 超过 {limit} 个字符，这是我们能检查的上限。',
  'diagnostic.page.not-html': '这看起来不像 HTML。请粘贴网页的源代码，而不是它的网址。',
  'diagnostic.page.invalid-url':
    '“{value}”不是完整的网址，因此我们跳过了将链接与网页进行比较的检查。',
  'diagnostic.site.no-pages': '您选择的文件中没有网页（.html 或 .htm 文件）。',

  'diagnostic.diagnostic.more': '……另有 {count} 处类似问题。',
};
