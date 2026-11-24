import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import type { HttpFacts } from '../audit/http.ts';
import { displayWidth, reviewHtml, type PageReport } from '../audit/review.ts';
import { CORE_CATALOGS } from '../i18n/catalogs/all.ts';
import { createTranslator } from '../i18n/format.ts';
import { LOCALES } from '../i18n/locales.ts';
import { analyzePage, renderAnalystReport } from './analyst.ts';
import { keyPhrases, properNames } from './keywords.ts';
import { detectLanguage, sentences, tokenize } from './language.ts';
import { brandOf, descriptionIdeas, isGeneric, titleIdeas } from './suggest.ts';

const parse = (html: string) => new JSDOM(html).window.document;

function review(html: string, url?: string, http?: HttpFacts): PageReport {
  const result = reviewHtml(html, parse, {
    ...(url === undefined ? {} : { url }),
    ...(http === undefined ? {} : { http }),
  });
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  return result.value;
}

/** A Turkish workshop's page that declares English, greets instead of naming its subject. */
const WORKSHOP = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Hoş geldiniz</title>
<link rel="canonical" href="http://www.atolye.example/"><meta property="og:title" content="Seramik Atölyesi">
</head><body><header><a href="/"><img src="/logo.png"></a><nav><a href="/kurslar">Kurslar</a>
<a href="/iletisim">İletişim</a></nav></header><main><h1>Hoş geldiniz</h1>
<p>İzmir Alsancak’taki atölyemizde hafta sonu çömlek ve sırlama kursları düzenliyoruz. Küçük gruplarla, malzemeler dahil.</p>
<h2>Kurslarımız</h2><p>Başlangıç kursu dört hafta sürer. İleri seviye kursta çark ve sırlama teknikleri öğretilir.</p>
<img src="/kurs1.jpg"><h2>Fiyatlar</h2><p>Başlangıç kursu 4.800 TL, ileri seviye 6.200 TL. Bilgi için 0232 444 55 66 numaralı telefonu arayın.</p>
<a href="/kayit"></a></main></body></html>`;

const WORKSHOP_HTTP: HttpFacts = {
  requestedUrl: 'http://atolye.example/',
  finalUrl: 'http://www.atolye.example/',
  status: 200,
  redirects: [{ url: 'http://atolye.example/', status: 301 }],
  elapsedMs: 2300,
  bytes: 48_000,
  contentType: 'text/html',
  contentEncoding: null,
  xRobotsTag: null,
  hsts: false,
  robotsTxt: { found: true, allowsPage: true, rule: null, sitemaps: [] },
};

const WELL_BUILT = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Trail Running Shoes | Stride Co.</title>
<meta name="description" content="Trail running shoes that grip on mud and rock, tested on real trails before they ship. Free returns within 30 days.">
<link rel="canonical" href="https://stride.example/trail">
<meta property="og:title" content="Trail Running Shoes"><meta property="og:description" content="Shoes that grip.">
<meta property="og:image" content="https://stride.example/trail.jpg"><meta property="og:site_name" content="Stride Co.">
</head><body><nav><a href="/">Stride Co.</a> <a href="/road">Road</a></nav><main><h1>Trail running shoes</h1>
<p>Our trail running shoes grip on mud and rock. Every pair of trail running shoes is tested on real trails before it ships.</p>
<h2>Choosing your size</h2><p>Trail running shoes should fit snugly at the heel. Measure your feet in the evening, when they are largest.</p>
${'<p>Good trail running shoes protect your feet on long descents and keep you steady on wet roots.</p>'.repeat(30)}
</main></body></html>`;

describe('detectLanguage', () => {
  it.each([
    [
      'tr',
      'İzmir’deki atölyemizde hafta sonu çömlek kursları düzenliyoruz. Küçük gruplarla çalışıyoruz ve bütün malzemeler dahil.',
    ],
    [
      'en',
      'We make lightweight running shoes for trails and roads. Every pair is tested on real runs before it ships to you.',
    ],
    [
      'de',
      'Wir bieten Töpferkurse für Anfänger in Berlin an. Die Kurse finden am Wochenende statt und alle Materialien sind dabei.',
    ],
    [
      'es',
      'Ofrecemos cursos de cerámica para principiantes en Madrid. Las clases son los fines de semana y todo está incluido.',
    ],
    [
      'fr',
      'Nous proposons des cours de céramique pour débutants à Lyon. Les cours ont lieu le week-end et tout est compris.',
    ],
    [
      'ar',
      'نقدم دورات في صناعة الفخار للمبتدئين في دبي. تقام الدروس في عطلة نهاية الأسبوع وجميع المواد مشمولة.',
    ],
    ['zh', '我们在上海为初学者开设陶艺课程。课程在周末进行，所有材料都包含在价格中。'],
    [
      'ja',
      '私たちは東京で初心者向けの陶芸教室を開いています。週末に開催され、材料費はすべて含まれています。',
    ],
    [
      'ru',
      'Мы проводим курсы керамики для начинающих в Москве. Занятия проходят по выходным, все материалы включены.',
    ],
  ])('recognizes %s', (code, text) => {
    expect(detectLanguage(text)?.code).toBe(code);
  });

  it('says nothing about too little text', () => {
    expect(detectLanguage('Hello')).toBeNull();
    expect(detectLanguage('123 456 789 !!!')).toBeNull();
  });
});

describe('tokenize and sentences', () => {
  it('drops Turkish endings after names and French elisions, and keeps hyphenated words', () => {
    expect(tokenize('İzmir’deki hafta-sonu', 'tr').map((t) => t.norm)).toEqual([
      'izmir',
      'hafta',
      'sonu',
    ]);
    expect(tokenize('İzmir’deki', 'tr')[0]?.clitic).toBe('’deki');
    expect(tokenize('l’atelier d’Anne', 'fr').map((t) => t.surface)).toEqual(['atelier', 'Anne']);
    const [, second] = tokenize('hafta-sonu', 'tr');
    expect(second?.breakBefore).toBe(false);
  });

  it('separates phrases at punctuation, title separators and new lines', () => {
    const breaks = (text: string) => tokenize(text, 'en').map((t) => t.breakBefore);
    expect(breaks('trail shoes, road shoes')).toEqual([true, false, true, false]);
    expect(breaks('Shoes - Stride')).toEqual([true, true]);
    expect(breaks('Shoes\nStride')).toEqual([true, true]);
  });

  it('never joins a heading to the sentence after it', () => {
    expect(sentences('Prices\nOur shoes cost less. They last longer!', 'en')).toEqual([
      'Prices',
      'Our shoes cost less.',
      'They last longer!',
    ]);
  });
});

describe('keyPhrases and properNames', () => {
  it('prefers repeated phrases over their words, and leaves out filler and units', () => {
    const phrases = keyPhrases(
      [
        { text: 'Trail running shoes', weight: 3 },
        {
          text: 'Our trail running shoes cost 120 USD. The trail running shoes are light.',
          weight: 1,
        },
      ],
      'en',
    );
    expect(phrases[0]?.text).toBe('Trail running shoes');
    expect(phrases.map((p) => p.norm)).not.toContain('usd');
    expect(phrases.map((p) => p.norm)).not.toContain('the');
  });

  it('joins Chinese words without spaces', () => {
    const [top] = keyPhrases(
      [
        { text: '陶艺课程 - 泥巴工作室', weight: 3 },
        { text: '我们开设陶艺课程。陶艺课程适合所有人。', weight: 1 },
      ],
      'zh',
    );
    expect(top?.text).toBe('陶艺课程');
  });

  it('finds names written as places, but not menus or sentence starts', () => {
    const tr = properNames(
      'Kurslar İletişim\nİzmir Alsancak’taki atölyemizde kurs veriyoruz.',
      'tr',
    );
    expect(tr).toEqual([{ name: 'İzmir Alsancak', count: 1, located: true, firstSentence: 0 }]);
    const en = properNames(
      'Shop Trail Road\nWe test them in the Scottish Highlands. Runs in London are fun.',
      'en',
    );
    expect(en.map((n) => [n.name, n.located])).toEqual([
      ['Scottish Highlands', false],
      ['London', true],
    ]);
    expect(properNames('Welcome to our shop.', 'en')).toEqual([]);
  });
});

describe('ideas', () => {
  const input = (text: string, overrides: object = {}) => {
    const phrases = keyPhrases(
      [
        { text: 'Seramik Atölyesi', weight: 3 },
        { text: text, weight: 1 },
      ],
      'tr',
    );
    return {
      language: 'tr',
      title: 'Hoş geldiniz',
      h1: 'Hoş geldiniz',
      siteName: null,
      url: 'https://atolye.example/',
      text,
      phrases,
      ...overrides,
    };
  };
  const TEXT =
    'Kurslar İletişim\nİzmir Alsancak’taki atölyemizde hafta sonu çömlek ve sırlama kursları düzenliyoruz. Küçük gruplarla, malzemeler dahil.\nFiyatlar\nBaşlangıç kursu 4.800 TL. Bilgi için 0232 444 55 66 numaralı telefonu arayın.';

  it('names the subject and the place, within what results show', () => {
    const ideas = titleIdeas(input(TEXT));
    expect(ideas[0]).toBe('İzmir Alsancak Seramik Atölyesi');
    for (const idea of ideas) expect(displayWidth(idea)).toBeLessThanOrEqual(60);
  });

  it('adds the brand when the page names it, and never repeats the current title', () => {
    const ideas = titleIdeas(
      input(TEXT, { siteName: 'Kil & Sır', title: 'Seramik Atölyesi | Kil & Sır' }),
    );
    expect(ideas.every((idea) => idea.endsWith('| Kil & Sır'))).toBe(true);
    expect(ideas).not.toContain('Seramik Atölyesi | Kil & Sır');
  });

  it('builds descriptions from the lead sentences, without phone numbers', () => {
    const [first] = descriptionIdeas(input(TEXT));
    expect(first).toBe(
      'İzmir Alsancak’taki atölyemizde hafta sonu çömlek ve sırlama kursları düzenliyoruz. Küçük gruplarla, malzemeler dahil.',
    );
    for (const idea of descriptionIdeas(input(TEXT))) {
      expect(idea).not.toMatch(/0232/);
      expect(displayWidth(idea)).toBeLessThanOrEqual(155);
    }
  });

  it('reads the brand from the site name or from a title that matches the address', () => {
    expect(brandOf(input('', { siteName: 'Stride Co.' }))).toBe('Stride Co.');
    expect(
      brandOf(input('', { title: 'Trail shoes | Stride', url: 'https://stride.example/' })),
    ).toBe('Stride');
    expect(brandOf(input('', { title: 'Shoes' }))).toBeNull();
  });

  it('knows greetings and “home” say nothing', () => {
    for (const text of ['Home', 'Hoş geldiniz!', 'Willkommen', 'Accueil', '首页', 'الرئيسية']) {
      expect(isGeneric(text), text).toBe(true);
    }
    expect(isGeneric('Trail running shoes')).toBe(false);
  });
});

describe('analyzePage', () => {
  it('turns a weak page into a ranked plan with evidence', () => {
    const analysis = analyzePage(review(WORKSHOP, WORKSHOP_HTTP.finalUrl, WORKSHOP_HTTP));
    const ids = analysis.actions.map((a) => a.id);
    expect(analysis.verdict).toBe('weak');
    expect(analysis.blocked).toBe(false);
    expect(analysis.language).toEqual({ declared: 'en', detected: 'tr' });
    expect(analysis.topic).toBe('Seramik Atölyesi');
    expect(ids.slice(0, 2).sort()).toEqual(['https', 'title']);
    expect(ids).toEqual(expect.arrayContaining(['language-mismatch', 'generic-heading', 'alt']));
    expect(analysis.actions.length).toBeLessThanOrEqual(7);
    expect(analysis.titleIdeas[0]).toBe('İzmir Alsancak Seramik Atölyesi');
    expect(analysis.technicalNotes.map((n) => n.key)).toEqual([
      'analyst.note.contact',
      'analyst.note.prices',
      'analyst.note.slow',
      'analyst.note.compression',
      'analyst.note.sitemap',
    ]);
    expect(analysis.caveats.map((c) => c.key)).toEqual([
      'analyst.caveat.scope',
      'analyst.caveat.ideas',
    ]);
  });

  it('puts a page that search engines are told to skip first', () => {
    const html = WELL_BUILT.replace(
      '<meta charset="utf-8">',
      '<meta charset="utf-8"><meta name="robots" content="noindex">',
    );
    const analysis = analyzePage(review(html, 'https://stride.example/trail'));
    expect(analysis.blocked).toBe(true);
    expect(analysis.verdict).toBe('weak');
    expect(analysis.actions[0]?.id).toBe('noindex');
  });

  it('has little to say about a well-built page', () => {
    const analysis = analyzePage(review(WELL_BUILT, 'https://stride.example/trail'));
    expect(analysis.verdict).toBe('strong');
    expect(analysis.actions.filter((a) => a.impact === 'high')).toEqual([]);
    expect(analysis.topic).toBe('Trail running shoes');
    expect(analysis.caveats.map((c) => c.key)).toContain('analyst.caveat.pasted');
  });

  it('gives the same answer every time', () => {
    const report = review(WORKSHOP, WORKSHOP_HTTP.finalUrl, WORKSHOP_HTTP);
    expect(analyzePage(report)).toEqual(analyzePage(report));
  });

  it('never fails, whatever the page holds', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (title, body) => {
        const html = `<html><head><title>${title.replace(/</g, '')}</title></head><body><h1>${body.replace(/</g, '')}</h1><p>${body.replace(/</g, '')}</p></body></html>`;
        const analysis = analyzePage(review(html));
        expect(analysis.actions.length).toBeLessThanOrEqual(7);
      }),
      { numRuns: 60 },
    );
  });
});

describe('renderAnalystReport', () => {
  it.each(LOCALES)('reads well in %s', (locale) => {
    const analysis = analyzePage(review(WORKSHOP, WORKSHOP_HTTP.finalUrl, WORKSHOP_HTTP));
    const rendered = renderAnalystReport(analysis, createTranslator(locale, CORE_CATALOGS[locale]));
    const all = JSON.stringify(rendered);
    expect(all).not.toMatch(/[{}]\w|undefined|NaN/);
    expect(rendered.priorities.length).toBe(analysis.actions.length);
    // Code is marked for the interface, and language codes become language names.
    const mismatch = rendered.priorities.find((p) => p.how.includes('`<html lang="tr">`'));
    expect(mismatch).toBeDefined();
    const turkish = new Intl.DisplayNames(locale, { type: 'language' }).of('tr') ?? 'tr';
    expect(mismatch?.how).toContain(turkish);
    expect(rendered.summary.length).toBeGreaterThan(40);
  });

  it('names the languages in the reader’s language', () => {
    const analysis = analyzePage(review(WORKSHOP, WORKSHOP_HTTP.finalUrl, WORKSHOP_HTTP));
    const tr = renderAnalystReport(analysis, createTranslator('tr', CORE_CATALOGS.tr));
    expect(tr.priorities.map((p) => p.how).join(' ')).toContain('İngilizce');
    expect(tr.summary).toContain('Seramik Atölyesi');
  });
});
