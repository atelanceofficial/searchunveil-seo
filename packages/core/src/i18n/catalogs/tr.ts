import type { CoreCatalog } from './en.ts';

/** Türkçe. Türkçede sayıdan sonra isim tekil kalır (“3 gün”), bu yüzden çoğul biçimler çoğunlukla aynıdır. */
export const tr: CoreCatalog = {
  'status.attention': 'Dikkat gerekiyor',
  'status.review': 'Göz atmaya değer',
  'status.good': 'İyi görünüyor',
  'status.info': 'Bilmekte fayda var',

  'metric.clicks': 'Tıklamalar',
  'metric.impressions': 'Gösterimler',
  'metric.ctr': 'Tıklama oranı',
  'metric.position': 'Ortalama konum',
  'metric.clicks.help': 'Kullanıcıların Google Arama’dan sitenize kaç kez tıklayarak geldiği.',
  'metric.impressions.help':
    'Sitenize giden bir bağlantının, birinin gördüğü arama sonuçlarında kaç kez göründüğü.',
  'metric.ctr.help': 'Gösterimlerin tıklamaya dönüşen payı.',
  'metric.position.help':
    'Sitenizin sonuçlarda genellikle göründüğü yer. Düşük olan daha iyidir: 1, sayfanın en üstüdür.',

  'evidence.recent-period': 'Son dönem',
  'evidence.previous-period': 'Önceki dönem',
  'evidence.period': '{range}',
  'evidence.change': 'Değişim',
  'evidence.first-day': 'İlk gün',
  'evidence.last-day': 'Son gün',
  'evidence.impressions-on': '{day} tarihindeki gösterimler',
  'evidence.typical-impressions': 'Olağan bir gün',
  'evidence.head-breaker': 'Head bölümünü sonlandıran',
  'evidence.title': 'Sayfa başlığı',
  'evidence.description': 'Açıklama',
  'evidence.viewport': 'Görüntü alanı',
  'evidence.canonical': 'Kanonik bağlantı',
  'evidence.heading': 'Başlık',
  'evidence.heading-level': 'h{level}',
  'table.query': 'Sorgu',
  'table.page': 'Sayfa',
  'table.text': '{text}',
  'table.typical-ctr': 'Siteniz için olağan',
  'table.primary-period': 'Ana dönem',
  'table.comparison-period': 'Karşılaştırılan dönem',
  'table.tag': 'Etiket',
  'table.image': 'Görsel',
  'table.link': 'Bağlantı',

  'ref.gsc-metrics': 'Search Console Yardım: gösterim, konum ve tıklamanın anlamı',
  'ref.gsc-performance': 'Search Console Yardım: Performans raporu',
  'ref.title-links': 'Google Arama Merkezi: başlık bağlantılarını etkileme',
  'ref.snippets': 'Google Arama Merkezi: snippet’ler ve meta açıklamalar',
  'ref.robots-meta': 'Google Arama Merkezi: robots meta etiketi',
  'ref.canonical': 'Google Arama Merkezi: standart URL’ler',
  'ref.hreflang': 'Google Arama Merkezi: sayfaların yerelleştirilmiş sürümleri',
  'ref.structured-data': 'Google Arama Merkezi: yapılandırılmış verilere giriş',
  'ref.rich-results-test': 'Google Zengin Sonuçlar Testi',
  'ref.images': 'Google Arama Merkezi: görsellerle ilgili en iyi uygulamalar',
  'ref.valid-metadata': 'Google Arama Merkezi: geçerli sayfa meta verileri kullanma',
  'ref.crawlable-links': 'Google Arama Merkezi: bağlantıları taranabilir yapma',
  'ref.wcag-language': 'WCAG 2.2: Sayfanın Dili (3.1.1)',
  'ref.wcag-non-text': 'WCAG 2.2: Metin Dışı İçerik (1.1.1)',
  'ref.wcag-resize': 'WCAG 2.2: Metni Yeniden Boyutlandırma (1.4.4)',
  'ref.wcag-link-purpose': 'WCAG 2.2: Bağlantının Amacı (2.4.4)',
  'ref.wcag-structure': 'WCAG 2.2: Bilgi ve İlişkiler (1.3.1)',
  'ref.viewport': 'MDN: viewport meta etiketi',
  'ref.open-graph': 'Open Graph protokolü',

  'gsc.headline.method':
    '{current} dönemini {previous} dönemiyle, her günü haftanın aynı günüyle eşleştirerek karşılaştırdık.',
  'gsc.headline.up-up': 'Sayfalarınızı daha çok kişi buldu ve ziyaret etti.',
  'gsc.headline.up-flat': 'Sayfalarınız yaklaşık aynı sıklıkta görünürken daha çok kişi tıkladı.',
  'gsc.headline.up-down': 'Sayfalarınız daha az görünmesine rağmen tıklamalar arttı.',
  'gsc.headline.flat-up':
    'Sayfalarınız aramada daha sık göründü, ancak tıklamalar yaklaşık aynı kaldı.',
  'gsc.headline.flat-flat': 'Arama performansı yaklaşık aynı kaldı.',
  'gsc.headline.flat-down': 'Sayfalarınız daha az göründü, ancak tıklamalar yaklaşık aynı kaldı.',
  'gsc.headline.down-up': 'Sayfalarınız daha sık göründü, ancak daha az kişi tıkladı.',
  'gsc.headline.down-flat': 'Sayfalarınız yaklaşık aynı sıklıkta görünürken daha az kişi tıkladı.',
  'gsc.headline.down-down': 'Sayfalarınız daha az göründü ve daha az tıklama aldı.',
  'gsc.headline.impressions-up':
    'Sayfalarınız aramada daha sık göründü. Tıklamalar henüz karşılaştırma yapmak için çok az.',
  'gsc.headline.impressions-flat':
    'Sayfalarınız öncekiyle yaklaşık aynı sıklıkta göründü. Tıklamalar henüz karşılaştırma yapmak için çok az.',
  'gsc.headline.impressions-down':
    'Sayfalarınız aramada daha az göründü. Tıklamalar henüz karşılaştırma yapmak için çok az.',
  'gsc.headline.insufficient':
    'Dönemleri güvenilir biçimde karşılaştırmak için henüz yeterli arama verisi yok.',

  'gsc.check.growth-drivers':
    'Büyümenin arkasındaki sayfaları ve sorguları bulun; bu içeriği doğru ve güncel tutun.',
  'gsc.check.queries-gained':
    'Hangi sorguların gösterim kazandığını ve sayfalarınızın sunduğuyla örtüşüp örtüşmediğini görmek için iki dönemin sorgularını karşılaştırın.',
  'gsc.check.titles':
    'İlgili sayfaların başlıklarını ve açıklamalarını gözden geçirin. İnsanlar tıklamaya karar vermeden önce bunları okur.',
  'gsc.check.position-shift':
    'Ortalama konuma bakın: yeni görünümler çoğu zaman sayfanın daha aşağısında, daha az tıklanan yerlerde başlar.',
  'gsc.check.lost-visibility':
    'Gösterim kaybeden sayfaları ve sorguları bulun; bu sayfaların hâlâ çalıştığını ve dizine eklenebildiğini kontrol edin.',
  'gsc.check.site-changes':
    'Sitedeki son değişiklikleri düşünün: yeniden tasarım, taşınan ya da silinen sayfalar veya yeni robots kuralları gibi.',
  'gsc.check.seasonality':
    'Bir yıl önceki aynı haftalarla karşılaştırın. Pek çok konuya ilgi mevsimlere göre artıp azalır.',
  'gsc.check.serp-features':
    'Ana sorgularınızı kendiniz arayın. Sonuç sayfasındaki reklamlar, videolar veya yapay zekâ yanıtları tıklamaları başka yöne çekebilir.',
  'gsc.check.opportunities':
    'Daha fazla tıklama kazanabilecek sorgular ve sayfalar için aşağıdaki fırsatlara bakın.',
  'gsc.check.export-longer':
    'Daha net bir tablo için Search Console’dan daha uzun bir tarih aralığını, tercihen son 3 ayı dışa aktarın.',
  'gsc.check.focused-page':
    'Her sorguyu açık ve güncel tek bir sayfanın yanıtladığından emin olun ve ilgili sayfalardan bu sayfaya bağlantı verin.',
  'gsc.check.search-intent':
    'Bu sayfaların göründüğü sorguları arayın ve sayfaların insanların aradığı yanıtı verip vermediğini kontrol edin.',

  'gsc.change.clicks.up': 'Tıklamalar {change} artarak {current} oldu.',
  'gsc.change.clicks.down': 'Tıklamalar {change} azalarak {current} oldu.',
  'gsc.change.clicks.flat': 'Tıklamalar yaklaşık aynı kaldı: {current}.',
  'gsc.change.clicks.started': 'Tıklamalar sıfırdan {current} seviyesine çıktı.',
  'gsc.change.impressions.up': 'Gösterimler {change} artarak {current} oldu.',
  'gsc.change.impressions.down': 'Gösterimler {change} azalarak {current} oldu.',
  'gsc.change.impressions.flat': 'Gösterimler yaklaşık aynı kaldı: {current}.',
  'gsc.change.impressions.started': 'Gösterimler sıfırdan {current} seviyesine çıktı.',
  'gsc.change.ctr.up': 'Tıklama oranı {previous} değerinden {current} değerine yükseldi.',
  'gsc.change.ctr.down': 'Tıklama oranı {previous} değerinden {current} değerine düştü.',
  'gsc.change.ctr.flat': 'Tıklama oranı yaklaşık aynı kaldı: {current}.',
  'gsc.change.position.better': 'Ortalama konum {previous} değerinden {current} değerine iyileşti.',
  'gsc.change.position.worse': 'Ortalama konum {previous} değerinden {current} değerine geriledi.',
  'gsc.change.position.flat': 'Ortalama konum yaklaşık aynı kaldı: {current}.',
  'gsc.daybyday.higher':
    'Değer, {days} günün {count} gününde önceki dönemde haftanın aynı gününe göre daha yüksekti.',
  'gsc.daybyday.lower':
    'Değer, {days} günün {count} gününde önceki dönemde haftanın aynı gününe göre daha düşüktü.',
  'gsc.daybyday.uneven':
    'Gün gün bakıldığında değişim dengesizdi ({higher} gün daha yüksek, {lower} gün daha düşük); değişimin çoğunu birkaç gün açıklıyor olabilir.',

  'gsc.limit.weekday-matching':
    'Her dönem tam haftalardan oluşur; böylece hafta içi ve hafta sonu farkları karşılaştırmayı bozmaz.',
  'gsc.limit.ctr-features':
    'Tıklama oranı, sonuç sayfasında başka nelerin göründüğüne de bağlıdır: reklamlar, videolar veya yapay zekâ yanıtları gibi.',
  'gsc.limit.position-mix':
    'Ortalama konum yalnızca sıralamalar değiştiğinde değil, aramaların karışımı değiştiğinde de değişir.',
  'gsc.limit.position-average':
    'Ortalama konum birçok aramanın özetidir. Tek tek aramalarda bir sayfa daha yukarıda ya da daha aşağıda görünebilir.',

  'gsc.opportunity.low-ctr.query':
    '{count, plural, one {# sorgu} other {# sorgu}} benzer sonuçlardan daha az tıklama alıyor',
  'gsc.opportunity.low-ctr.page':
    '{count, plural, one {# sayfa} other {# sayfa}} benzer sonuçlardan daha az tıklama alıyor',
  'gsc.opportunity.low-ctr.summary':
    'Bunlar ilk on sonuç arasında görünüyor, ancak tıklama oranları benzer konumdaki diğer sonuçlarınızın oranının {share} kadarına bile ulaşmıyor.',
  'gsc.opportunity.near-top.query':
    '{count, plural, one {# sorgu} other {# sorgu}} ilk onun hemen altında sıralanıyor',
  'gsc.opportunity.near-top.page':
    '{count, plural, one {# sayfa} other {# sayfa}} ilk onun hemen altında sıralanıyor',
  'gsc.opportunity.near-top.summary':
    'Ortalama konumları {from} ile {to} arasında ve sık aranıyorlar. Bunları yanıtlayan sayfayı iyileştirmek, sayfayı görünür alana taşıyabilir.',
  'gsc.opportunity.zero-click-pages':
    '{count, plural, one {# sayfa görünüyor ama hiç tıklanmıyor} other {# sayfa görünüyor ama hiç tıklanmıyor}}',
  'gsc.opportunity.zero-click-pages.summary':
    'Her biri arama sonuçlarında en az {min} kez göründü, ancak tek bir tıklama almadı.',
  'gsc.movers.gains':
    'Tıklamalarda en çok artış gösteren {kind, select, page {sayfalar} other {sorgular}}',
  'gsc.movers.losses':
    'Tıklamalarda en çok düşüş gösteren {kind, select, page {sayfalar} other {sorgular}}',

  'gsc.note.no-dates': 'Bu dışa aktarımda günlük veri yok, bu yüzden eğilimler gösterilemiyor.',
  'gsc.note.short-range':
    'Bu dışa aktarım {days, plural, one {# günü} other {# günü}} kapsıyor: iki dönemi karşılaştırmak için çok kısa.',
  'gsc.note.missing-days': '{count, plural, one {# günde veri yok} other {# günde veri yok}}',
  'gsc.note.missing-days.summary':
    'Satırı olmayan günlerde genellikle hiç gösterim olmamıştır. Bu günleri sıfır olarak saydık.',
  'gsc.note.incomplete-days':
    '{count, plural, one {Son gün eksik görünüyor} other {Son # gün eksik görünüyor}}',
  'gsc.note.incomplete-days.summary':
    'Search Console son verileri hâlâ işliyor olabilir. {count, plural, one {Bu günü} other {Bu günleri}} karşılaştırmaya katmadık.',
  'gsc.note.anonymized-queries': 'Sorgular tablosu tüm tıklamaların {share} kadarını kapsıyor',
  'gsc.note.anonymized-queries.summary':
    'Search Console, arama yapanların gizliliğini korumak için nadir sorguları listelemez ve en fazla {limit} satır dışa aktarır. Bu yüzden Sorgular tablosunun toplamları grafikteki toplamlardan düşüktür.',
  'gsc.note.row-limit':
    '{kind, select, query {Sorgular tablosu} page {Sayfalar tablosu} country {Ülkeler tablosu} other {Bir tablo}} {limit} satıra ulaştı',
  'gsc.note.row-limit.summary':
    'Bu, Search Console’un dışa aktarma sınırıdır; daha seyrek görülen {kind, select, query {sorgular} page {sayfalar} country {ülkeler} other {satırlar}} eksik olabilir.',
  'gsc.note.partial-totals':
    'Toplamlar {kind, select, query {Sorgular} page {Sayfalar} country {Ülkeler} device {Cihazlar} other {dışa aktarılan}} tablosundan geliyor',
  'gsc.note.partial-totals.summary':
    '{kind, select, query {Nadir sorgular gizlilik nedeniyle gösterilmez; bu yüzden bu toplamlar sitenizin gerçek toplamlarından düşüktür.} page {Sayfalarınızdan birkaçı aynı aramada göründüğünde her biri ayrı sayılır; bu yüzden bu toplamlar sitenizin toplamlarından farklı olabilir.} other {Bu toplamlar sitenizin toplamlarından farklı olabilir. Eksiksiz toplamlar için günlük verileri içeren tabloyu da ekleyin.}}',
  'gsc.note.comparison-export':
    'Bu dışa aktarım “{primary}” dönemini “{comparison}” dönemiyle karşılaştırıyor.',
  'gsc.note.comparison-export.unlabeled': 'Bu dışa aktarım iki tarih aralığını karşılaştırıyor.',
  'gsc.note.filters': 'Dışa aktarma ayarları',

  'page.limit.source':
    'Sağladığınız HTML’i inceledik. Sayfa yüklendikten sonra JavaScript’in eklediği içerik buna dahil değil.',
  'page.limit.scope':
    'HTTP üst bilgileri, robots.txt, hız ve diğer sitelerden gelen bağlantılar da arama için önemlidir. Bunlar bu incelemenin kapsamında değil.',
  'page.limit.width':
    'Arama sonuçları genişliği karakterle değil pikselle ölçer; bu nedenle bu bir tahmindir.',
  'page.head.ok': 'Önemli etiketlerin tümü head bölümünde',
  'page.head.broken':
    '{count, plural, one {# önemli etiket} other {# önemli etiket}} head bölümünün dışına düştü',
  'page.head.broken.summary':
    'Head bölümüne ait olmayan bir şey {count, plural, one {bu etiketten} other {bu etiketlerden}} önce geldiği için tarayıcı head bölümünü erken bitirdi. Arama motorları head dışındaki bu etiketleri yok sayar.',
  'page.head.noscript':
    '{count, plural, one {Bir noscript bloğundan sonraki # etiket yok sayılabilir} other {Bir noscript bloğundan sonraki # etiket yok sayılabilir}}',
  'page.head.noscript.summary':
    'Head içindeki bir noscript bloğunda yer alan görsel veya benzeri bir öğe, JavaScript çalıştırmayan araçlar için head bölümünü sonlandırır. JavaScript çalıştıran tarayıcılar bundan etkilenmez.',
  'page.check.head':
    'Beklenmeyen öğeyi head bölümünün altına taşıyın ya da bu etiketleri onun üstüne alın.',
  'page.check.noscript':
    'Noscript bloğunu head bölümünün sonuna, önemli etiketlerden sonraya taşıyın.',
  'page.robots.noindex': 'Sayfa, arama motorlarından kendisini sonuçlarda göstermemelerini istiyor',
  'page.robots.noindex.summary':
    'noindex ile işaretlenen sayfalar arama sonuçlarında görünmez. Bu, özel veya kopya sayfalar için doğrudur; diğer her yerde pahalı bir hatadır.',
  'page.check.robots':
    'Bu sayfanın aramada görünmesi gerekiyorsa robots meta etiketinden noindex’i kaldırın.',
  'page.robots.nofollow': 'Sayfa, arama motorlarından bağlantılarını izlememelerini istiyor',
  'page.robots.nofollow.summary':
    'Arama motorları bu sayfadaki bağlantıları başka sayfaları keşfetmek için kullanmaz.',
  'page.robots.limited': 'Sayfa, arama motorlarının kendisini nasıl gösterebileceğini sınırlıyor',
  'page.robots.limited.summary':
    'nosnippet veya max-snippet gibi kurallar sayfanın sonuçlarda nasıl görüneceğini değiştirir.',
  'page.robots.indexable': 'HTML’deki hiçbir şey dizine eklemeyi engellemiyor',
  'page.robots.indexable.summary':
    'Sayfada noindex kuralı bulamadık. Kurallar, HTML’de görünmeyen HTTP üst bilgilerinden veya robots.txt dosyasından da gelebilir.',
  'page.title.why':
    'Arama motorları sayfa başlığını genellikle sayfanıza giden bağlantı olarak gösterir; tarayıcılar da onu sekmelerde ve yer imlerinde gösterir.',
  'page.check.title':
    'Sayfanın ne sunduğunu söyleyen, en önemli kelimeleri başta olan kısa ve benzersiz bir sayfa başlığı yazın.',
  'page.title.missing': 'Sayfanın başlığı yok',
  'page.title.empty': 'Sayfa başlığı boş',
  'page.title.multiple': 'Sayfada {count} sayfa başlığı var',
  'page.title.multiple.summary':
    'Tarayıcılar ilkini kullanır, arama motorları ise herhangi birini kullanabilir. Yalnızca bir tane bırakın.',
  'page.title.short': 'Sayfa başlığı çok kısa',
  'page.title.short.summary':
    '“Ana Sayfa” gibi bir başlık, sayfanın ne sunduğunu arama yapanlara nadiren anlatır.',
  'page.title.long': 'Sayfa başlığı arama sonuçlarında kısaltılabilir',
  'page.title.long.summary':
    'Uzunluğu yaklaşık {length} karakter. Arama sonuçları kesmeden önce genellikle yaklaşık {fit} karakter sığar.',
  'page.title.ok': 'Sayfa başlığı var ve uzunluğu makul',
  'page.description.why':
    'Meta açıklama isteğe bağlıdır ve Google çoğu zaman kendi snippet’ini yazar. Yine de iyi bir açıklama, insanların sizin sonucunuzu seçmesine yardımcı olabilir.',
  'page.check.description':
    'Tıklayıp tıklamamaya karar veren birine sayfayı özetleyen bir veya iki cümle yazın.',
  'page.description.missing': 'Sayfanın meta açıklaması yok',
  'page.description.empty': 'Meta açıklama boş',
  'page.description.multiple': 'Sayfada {count} meta açıklama var',
  'page.description.multiple.summary':
    'Hangisinin kullanılacağı açık olsun diye yalnızca bir tane bırakın.',
  'page.description.long': 'Açıklama arama sonuçlarında kısaltılabilir',
  'page.description.long.summary':
    'Uzunluğu yaklaşık {length} karakter. Bir snippet’e genellikle yaklaşık {fit} karakter sığar.',
  'page.description.ok': 'Sayfanın meta açıklaması var',
  'page.lang.missing': 'Sayfa dilini belirtmiyor',
  'page.lang.invalid': '{value} dil kodu geçerli değil',
  'page.lang.why':
    'Ekran okuyucular metni doğru telaffuz etmek için dili kullanır; tarayıcılar da çeviri önermek için kullanır.',
  'page.check.lang': 'html öğesine lang="tr" veya lang="en" gibi bir lang özniteliği ekleyin.',
  'page.lang.ok': 'Sayfa dilini belirtiyor: {value}',
  'page.viewport.missing': 'Sayfa telefonlar için ayarlanmamış',
  'page.viewport.why':
    'Viewport meta etiketi olmadan telefonlar sayfayı bir masaüstü sayfası gibi uzaklaştırılmış gösterir. Google dizine eklemede ağırlıklı olarak sayfaların mobil sürümünü kullanır.',
  'page.check.viewport':
    'Head bölümüne <meta name="viewport" content="width=device-width, initial-scale=1"> ekleyin.',
  'page.viewport.zoom-blocked': 'Sayfa, ziyaretçilerin yakınlaştırmasını engelliyor',
  'page.viewport.zoom-blocked.summary':
    'Yakınlaştırmayı engellemek, az gören kişilerin metni okumasını zorlaştırır. user-scalable=no ifadesini ve 2’nin altındaki maximum-scale değerlerini kaldırın.',
  'page.viewport.ok': 'Sayfa telefonlar için ayarlanmış',
  'page.canonical.missing': 'Sayfanın kanonik bağlantısı yok',
  'page.canonical.missing.summary':
    'Çoğu sayfa için sorun değil. Aynı içerik birkaç adreste bulunuyorsa kanonik bağlantı, arama motorlarına hangisini tercih ettiğinizi söyler.',
  'page.canonical.multiple': 'Sayfada birbiriyle çelişen {count} kanonik bağlantı var',
  'page.canonical.multiple.summary':
    'Kanonik bağlantılar farklı sayfaları gösterdiğinde arama motorları hepsini yok sayabilir.',
  'page.canonical.invalid': '{href} kanonik bağlantısı geçerli bir adres değil',
  'page.canonical.relative': 'Kanonik bağlantı göreli bir adres kullanıyor',
  'page.canonical.relative.summary':
    'Çalışır, ancak https:// ile başlayan tam bir adres hataları önler ve Google da bunu önerir.',
  'page.canonical.other-site': 'Kanonik bağlantı başka bir web sitesini gösteriyor: {host}',
  'page.canonical.other-site.summary':
    'Arama motorları bu sayfa yerine o sitenin sayfasını gösterebilir. Bu, yalnızca bu sayfa bir kopyaysa istenen sonuçtur.',
  'page.canonical.other-page': 'Kanonik bağlantı farklı bir sayfayı gösteriyor',
  'page.canonical.other-page.summary':
    'Arama motorları bu sayfayı bir kopya sayıp onun yerine diğer sayfayı gösterebilir.',
  'page.canonical.self': 'Kanonik bağlantı bu sayfayı gösteriyor',
  'page.canonical.present': 'Sayfanın bir kanonik bağlantısı var',
  'page.h1.missing': 'Sayfanın ana başlığı (h1) yok',
  'page.h1.why':
    'Ana başlık, ekran okuyucu kullananlar dahil ziyaretçilere sayfanın neyle ilgili olduğunu söyler.',
  'page.h1.multiple': 'Sayfada {count} ana başlık (h1) var',
  'page.h1.multiple.summary':
    'Buna izin verilir. Yine de tek bir ana başlık genellikle yapıyı daha anlaşılır kılar.',
  'page.headings.skipped': 'Başlık düzeyleri h{from} düzeyinden h{to} düzeyine atlıyor',
  'page.headings.skipped.summary':
    'Ekran okuyucu kullananların çoğu sayfada başlıklar arasında gezinir. Atlanan bir düzey, içeriğin eksik olduğunu düşündürebilir.',
  'page.headings.empty': '{count, plural, one {# başlık boş} other {# başlık boş}}',
  'page.headings.empty.summary':
    'Ekran okuyucular boş başlıkları duyurur, ancak bu başlıklar hiçbir şey söylemez.',
  'page.headings.ok':
    '{count, plural, one {Başlık} other {# başlık}} anlaşılır bir ana hat oluşturuyor',
  'page.images.missing-alt':
    '{count, plural, one {# görselin} other {# görselin}} metin alternatifi yok',
  'page.images.missing-alt.summary':
    'Ekran okuyucular bu görselleri tarif edemez, arama motorları da onları daha az anlar. Her görseli alt özniteliğinde tarif edin; yalnızca süs amaçlı görseller için boş bir alt kullanın.',
  'page.images.ok':
    '{count, plural, one {Görselin} other {# görselin tümünün}} metin alternatifi var',
  'page.links.unnamed': '{count, plural, one {# bağlantının} other {# bağlantının}} metni yok',
  'page.links.unnamed.summary':
    'Ekran okuyucular bu bağlantıları nereye gittiklerini söylemeden okur. Görünür bir metin ekleyin; simge bağlantıları için aria-label kullanın.',
  'page.links.javascript':
    '{count, plural, one {# bağlantı} other {# bağlantı}} bir adresi göstermek yerine JavaScript çalıştırıyor',
  'page.links.javascript.summary':
    'Arama motorları bu bağlantıları izleyemez. Her bağlantının href özniteliğine gerçek bir adres yazın.',
  'page.links.summary':
    'Sayfa {total, plural, one {# adrese} other {# adrese}} bağlantı veriyor: {internal} tanesi bu sitede, {external} tanesi başka yerde',
  'page.links.nofollow':
    '{count, plural, one {# bağlantı} other {# bağlantı}} nofollow olarak işaretli.',
  'page.structured-data.invalid':
    '{count, plural, one {# yapılandırılmış veri bloğu} other {# yapılandırılmış veri bloğu}} okunamıyor',
  'page.structured-data.invalid.summary':
    'Arama motorları geçerli JSON olmayan yapılandırılmış verileri yok sayar.',
  'page.structured-data.found': 'Sayfada yapılandırılmış veri var: {types}',
  'page.structured-data.untyped': 'Sayfada türü belirtilmemiş yapılandırılmış veri var',
  'page.structured-data.found.summary':
    'Okunabildiğini kontrol ettik. Zengin sonuçlara uygun olup olmadığını Google’ın Zengin Sonuçlar Testi gösterir.',
  'page.hreflang.invalid': 'Bazı dil ek açıklamaları geçersiz kodlar kullanıyor: {values}',
  'page.hreflang.invalid.summary':
    'en, en-GB veya zh-Hans gibi dil kodlarını ya da x-default değerini kullanın. Birleşik Krallık’ın kodu UK değil, GB’dir.',
  'page.hreflang.no-self': 'Dil ek açıklamaları bu sayfayı içermiyor',
  'page.hreflang.no-self.summary':
    'Her dil sürümü, diğerlerinin yanında kendisini de listelemelidir.',
  'page.hreflang.ok':
    'Sayfa {count, plural, one {# dil sürümünü} other {# dil sürümünü}} listeliyor',
  'page.hreflang.limit':
    'Yalnızca bu sayfayı kontrol edebiliyoruz. Listelediği her sayfanın da bu sayfaya geri bağlantı vermesi gerekir; yoksa arama motorları ek açıklamaları yok sayar.',
  'page.charset.missing': 'Sayfa karakter kodlamasını belirtmiyor',
  'page.charset.missing.summary':
    'Sunucu belirtmedikçe tarayıcılar yanlış tahmin edip karakterleri bozabilir. Head bölümünün başına <meta charset="utf-8"> ekleyin.',
  'page.charset.legacy': 'Sayfa {value} karakter kodlamasını kullanıyor',
  'page.charset.legacy.summary': 'Web için UTF-8 önerilir; tüm dilleri kapsar.',
  'page.charset.ok': 'Sayfa UTF-8 kodlamasını belirtiyor',
  'page.social.missing': 'Bağlantı önizlemeleri eksik olabilir: {tags} yok',
  'page.social.missing.summary':
    'Sosyal ağlar ve mesajlaşma uygulamaları bağlantı önizlemelerini Open Graph etiketleriyle oluşturur. Bunlar arama sıralamasını etkilemez.',
  'page.social.ok': 'Sayfada bağlantı önizleme etiketleri var',

  'mentions.kind.citation': 'Bağlantıyla kaynak gösterildi',
  'mentions.kind.mention': 'Bağlantısız olarak adı geçti',
  'mentions.method.own-check': 'Asistana kendim sordum',
  'mentions.method.shared-with-me': 'Biri benimle paylaştı',
  'mentions.method.screenshot': 'Bir ekran görüntüsünden',
  'mentions.method.other': 'Başka bir yolla',
  'mentions.certainty.confirmed': 'Doğrulandı',
  'mentions.certainty.uncertain': 'Belirsiz',
  'mentions.error.required': 'Bu alan zorunludur.',
  'mentions.error.too-long': 'En fazla {max} karakter kullanın.',
  'mentions.error.invalid-url': 'https:// veya http:// ile başlayan tam bir web adresi girin.',
  'mentions.error.invalid-date': 'Geçerli bir tarih girin.',
  'mentions.error.future-date': 'Tarih gelecekte olamaz.',
  'mentions.error.invalid-choice': 'Seçeneklerden birini seçin.',
  'mentions.limit.scope':
    'Bunlar sizin kaydettiğiniz bahsetmeler. Yapay zekâ asistanlarının sitenizden genel olarak ne sıklıkla bahsettiğini değil, sitenizi nerede gördüğünüzü gösterir.',

  'diagnostic.input.empty': 'Bu dosya boş.',
  'diagnostic.input.binary':
    'Bu bir metin dosyası değil. Bir CSV dosyası ya da Search Console’un indirdiği ZIP dosyasını seçin.',
  'diagnostic.input.spreadsheet':
    'Bu bir elektronik tablo çalışma kitabı. CSV olarak kaydedin ya da Search Console’dan gelen özgün ZIP dosyasını kullanın.',
  'diagnostic.input.unsupported-type': 'Bu dosya türü desteklenmiyor.',
  'diagnostic.encoding.legacy-fallback':
    'Bu dosya UTF-8 olarak kaydedilmemiş, bu yüzden {encoding} olarak okuduk. Harfler bozuk görünüyorsa dosyayı önce bir elektronik tabloda açmadan Search Console’dan yeniden dışa aktarın.',
  'diagnostic.encoding.utf16-without-bom':
    'Bu dosya {encoding} kodlamasında. Bunu otomatik olarak algıladık.',
  'diagnostic.csv.no-header': 'Bu dosyada başlık satırı yok.',
  'diagnostic.csv.unterminated-quote': 'Tırnak işaretiyle başlayan bir değer hiç kapanmıyor.',
  'diagnostic.csv.stray-quote': 'Bir değerin içinde tırnak işareti var. Yazıldığı gibi bıraktık.',
  'diagnostic.csv.text-after-quote':
    'Kapanış tırnağından sonra metin var. Bunu değerin parçası olarak tuttuk.',
  'diagnostic.csv.field-count':
    'Bu satırda {actual} değer var, ancak başlık satırında {expected} değer var.',
  'diagnostic.csv.too-many-rows':
    'Bu dosyada, okuyabildiğimiz en fazla satır sayısı olan {limit} satırdan fazlası var.',
  'diagnostic.csv.too-many-columns':
    'Bir satırda, okuyabildiğimiz en fazla sütun sayısı olan {limit} sütundan fazlası var.',
  'diagnostic.csv.field-too-long':
    'Bir değer, okuyabildiğimiz en fazla uzunluk olan {limit} karakterden uzun.',
  'diagnostic.zip.invalid': 'Bu ZIP dosyası hasarlı veya eksik. Yeniden indirmeyi deneyin.',
  'diagnostic.zip.multi-disk': 'Bu ZIP dosyası birkaç parçaya bölünmüş; bu desteklenmiyor.',
  'diagnostic.zip.encrypted':
    'Bu ZIP dosyası parola korumalı. Parolasız bir dışa aktarım kullanın.',
  'diagnostic.zip.unsupported-method':
    'Bu ZIP dosyasındaki “{entry}”, okuyamadığımız bir sıkıştırma yöntemi kullanıyor.',
  'diagnostic.zip.too-many-entries': 'Bu ZIP dosyasında {limit} dosyadan fazlası var.',
  'diagnostic.zip.entry-too-large':
    'Bu ZIP dosyasındaki “{entry}”, açıldığında {megabytes} MB’tan büyük.',
  'diagnostic.zip.suspicious-ratio':
    'Bu ZIP dosyasındaki “{entry}” o kadar çok sıkıştırılmış ki açmak güvenli olmayabilir; bu yüzden durduk.',
  'diagnostic.zip.overlapping-entries':
    'Bu ZIP arşivindeki dosyalar üst üste biniyor. Bu, hasarlı veya güvensiz bir arşivin işareti; bu yüzden durduk.',
  'diagnostic.zip.corrupt-entry': 'Bu ZIP dosyasındaki “{entry}” hasarlı.',
  'diagnostic.zip.checksum-mismatch':
    'Bu ZIP dosyasındaki “{entry}” bütünlük denetiminden geçemedi.',
  'diagnostic.zip.no-csv': 'Bu ZIP dosyasında CSV dosyası yok.',
  'diagnostic.zip.website':
    'Bu ZIP dosyası bir Search Console dışa aktarımı değil, bir web sitesi: {files, plural, one {# dosyanın} other {# dosyanın}} {pages, plural, one {# tanesi} other {# tanesi}} web sayfası. Sayfa incelemesi içindeki her sayfayı kontrol edebilir.',

  'diagnostic.gsc.no-tables': 'Seçtiğiniz dosyalarda Search Console verisi bulamadık.',
  'diagnostic.gsc.unrecognized-table':
    'Bu dosya bir Search Console performans dışa aktarımına benzemiyor.',
  'diagnostic.gsc.duplicate-table':
    'Birden fazla {kind, select, date {Tarihler} query {Sorgular} page {Sayfalar} country {Ülkeler} device {Cihazlar} searchAppearance {Arama görünümü} other {aynı türde}} tablosu seçtiniz. İlkini kullandık.',
  'diagnostic.gsc.columns-inferred':
    'Sütun adlarını tanımadık; bu yüzden sütunları Search Console’un standart sırasına göre eşleştirip değerlerini kontrol ettik.',
  'diagnostic.gsc.dimension-inferred':
    'İlk sütunun adını tanımadık. {kind, select, date {Değerleri tarih.} page {Değerleri sayfa adresi.} other {Değerlerini olduğu gibi gösteriyoruz.}}',
  'diagnostic.gsc.missing-columns':
    'Bu tabloda {metric, select, clicks {Tıklamalar} impressions {Gösterimler} ctr {TO} position {Konum} other {{metric}}} sütunu yok.',
  'diagnostic.gsc.invalid-number': '“{value}” geçerli bir sayı değil.',
  'diagnostic.gsc.invalid-date': '“{value}” geçerli bir tarih değil.',
  'diagnostic.gsc.ambiguous-dates':
    'Bu tarihlerin günle mi yoksa ayla mı başladığını anlayamıyoruz. Dosyayı düzenlemeden Search Console’dan yeniden dışa aktarın.',
  'diagnostic.gsc.mixed-decimal-separators':
    '“{column}” sütununda ondalık nokta ve ondalık virgül birlikte kullanılmış.',
  'diagnostic.gsc.decimal-comma': '“{column}” sütunu ondalık ayırıcı olarak virgül kullanıyor.',
  'diagnostic.gsc.ctr-as-fraction':
    '“{column}” sütunu tıklama oranını kesir olarak veriyor: 0,05, %5 anlamına gelir.',
  'diagnostic.gsc.clicks-exceed-impressions':
    'Bu satırda tıklama sayısı ({clicks}) gösterim sayısından ({impressions}) fazla; Search Console böyle bir değer raporlamaz.',
  'diagnostic.gsc.columns-swapped':
    'Satırların çoğunda tıklamalar gösterimlerden fazla. İki sütun yer değiştirmiş olabilir; bu yüzden bu tabloyu kullanmadık.',
  'diagnostic.gsc.ctr-mismatch':
    '{rows, plural, one {# satırda} other {# satırda}} tıklama oranı, tıklamaların gösterimlere bölümüyle uyuşmuyor. Dosya düzenlenmiş olabilir.',
  'diagnostic.gsc.position-out-of-range':
    '“{value}” geçerli bir ortalama konum değil. Konumlar 1’den başlar.',
  'diagnostic.gsc.duplicate-key': '“{key}” birden fazla kez geçiyor. İlk satırı kullandık.',
  'diagnostic.gsc.empty-key': 'Bu satırın ilk sütunu boş, bu yüzden satırı atladık.',
  'diagnostic.gsc.empty-table': 'Bu tabloda kullanabileceğimiz satır yok.',

  'diagnostic.mentions.invalid-json': 'Bu dosya geçerli bir JSON değil.',
  'diagnostic.mentions.invalid-format': 'Bu dosya bir SearchUnveil bahsetme günlüğü değil.',
  'diagnostic.mentions.unsupported-version':
    'Bu bahsetme günlüğü SearchUnveil’in daha yeni bir sürümüyle oluşturulmuş (biçim {version}).',
  'diagnostic.mentions.too-many':
    'Bu günlükte, okuyabildiğimiz en fazla sayı olan {limit} bahsetmeden fazlası var.',
  'diagnostic.mentions.invalid-field': '{index}. kayıt: “{field}” eksik veya geçersiz.',
  'diagnostic.mentions.duplicate-id': '{index}. kayıt önceki bir kaydı tekrarlıyor. İlkini tuttuk.',

  'diagnostic.page.empty':
    'İncelemek için bir sayfanın HTML’ini yapıştırın ya da bir HTML dosyası seçin.',
  'diagnostic.page.too-large':
    'Bu HTML, inceleyebildiğimiz en fazla uzunluk olan {limit} karakterden uzun.',
  'diagnostic.page.not-html':
    'Bu HTML’e benzemiyor. Sayfanın adresini değil, kaynak kodunu yapıştırın.',
  'diagnostic.page.invalid-url':
    '“{value}” tam bir web adresi değil; bu yüzden bağlantıları sayfayla karşılaştıran kontroller atlandı.',
  'diagnostic.site.no-pages':
    'Seçtiğiniz dosyaların hiçbiri bir web sayfası (.html ya da .htm dosyası) değil.',

  'diagnostic.diagnostic.more':
    '…ve bunun gibi {count, plural, one {# tane daha} other {# tane daha}}.',
};
