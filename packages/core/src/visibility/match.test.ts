import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  matchBrand,
  mentionsName,
  mentionsSite,
  onSite,
  siteKey,
  sourcePosition,
} from './match.ts';

describe('siteKey', () => {
  it('reads an address the way people write it', () => {
    expect(siteKey('https://www.Example.com/shop?page=2')).toBe('example.com');
    expect(siteKey('example.com')).toBe('example.com');
    expect(siteKey('www.example.com.')).toBe('example.com');
    expect(siteKey('shop.example.com/blog')).toBe('shop.example.com');
    expect(siteKey('örnek.com')).toBe('xn--rnek-4qa.com');
  });

  it('is null for text that is not a site', () => {
    for (const text of ['', 'localhost', 'not a site', 'ftp://example.com', 'https://']) {
      expect(siteKey(text), text).toBeNull();
    }
  });
});

describe('onSite', () => {
  it('counts subdomains but not look-alikes', () => {
    expect(onSite('example.com', 'example.com')).toBe(true);
    expect(onSite('shop.example.com', 'example.com')).toBe(true);
    expect(onSite('notexample.com', 'example.com')).toBe(false);
    expect(onSite('example.com.evil.net', 'example.com')).toBe(false);
  });
});

describe('sourcePosition', () => {
  const sources = [
    'https://en.wikipedia.org/wiki/Running_shoe',
    'Wikipedia',
    'https://www.ornekspor.com/kosu/ayakkabi',
    'https://blog.ornekspor.com/',
  ];

  it('gives the first place the site holds, counting from 1', () => {
    expect(sourcePosition(sources, 'ornekspor.com')).toBe(3);
    expect(sourcePosition(sources, 'https://WWW.ORNEKSPOR.COM/')).toBe(3);
    expect(sourcePosition(sources, 'blog.ornekspor.com')).toBe(4);
    expect(sourcePosition(sources, 'wikipedia.org')).toBe(1);
  });

  it('is null when the site is absent or not an address', () => {
    expect(sourcePosition(sources, 'rakip.com.tr')).toBeNull();
    expect(sourcePosition(sources, 'ornekspor')).toBeNull();
    expect(sourcePosition([], 'ornekspor.com')).toBeNull();
  });
});

describe('mentionsName', () => {
  it('ignores case, accents and Turkish dotted and dotless i', () => {
    expect(mentionsName('En iyisi ÖRNEK SPOR’dan alınır.', 'Örnek Spor')).toBe(true);
    expect(mentionsName('ornek spor ve diğerleri', 'Örnek Spor')).toBe(true);
    expect(mentionsName('İSTANBUL KOŞU KULÜBÜ önerir', 'Istanbul Kosu Kulubu')).toBe(true);
    expect(mentionsName('Try Café Noir today', 'cafe noir')).toBe(true);
  });

  it('finds names written together or split at capitals', () => {
    expect(mentionsName('Shop at OrnekSpor for deals', 'Ornek Spor')).toBe(true);
    expect(mentionsName('Shop at Ornek Spor for deals', 'OrnekSpor')).toBe(true);
    expect(mentionsName('SearchUnveil™ reviews pages', 'SearchUnveil')).toBe(true);
  });

  it('only finds whole words', () => {
    expect(mentionsName('Örnekler çok', 'Örnek')).toBe(false);
    expect(mentionsName('Spor ayakkabı', 'Örnek Spor')).toBe(false);
    expect(mentionsName('anything', '')).toBe(false);
    expect(mentionsName('anything', ' ® ')).toBe(false);
  });

  it('finds names inside text written without spaces', () => {
    expect(mentionsName('我推荐苹果公司的产品。', '苹果')).toBe(true);
    expect(mentionsName('我推荐三星的产品。', '苹果')).toBe(false);
  });

  it('finds any name of letters between other words, however it is capitalized', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-z]{2,12}( [a-z]{2,12}){0,2}$/), (name) => {
        expect(mentionsName(`Before, ${name.toUpperCase()}! after`, name)).toBe(true);
      }),
    );
  });
});

describe('mentionsSite', () => {
  it('finds the address in the text, with or without www and paths', () => {
    expect(mentionsSite('Visit www.example.com/shop.', 'example.com')).toBe(true);
    expect(mentionsSite('See https://shop.example.com/a for more', 'example.com')).toBe(true);
    expect(mentionsSite('Write to info@example.com', 'example.com')).toBe(true);
    expect(mentionsSite('EXAMPLE.COM’dan alabilirsiniz', 'https://www.example.com/')).toBe(true);
  });

  it('matches international addresses in either form', () => {
    expect(mentionsSite('örnek.com’dan alın', 'xn--rnek-4qa.com')).toBe(true);
    expect(mentionsSite('ÖRNEK.COM’dan alın', 'örnek.com')).toBe(true);
  });

  it('does not match other sites, plain words or decimals', () => {
    expect(mentionsSite('notexample.com is different', 'example.com')).toBe(false);
    expect(mentionsSite('example dot com, version 3.5', 'example.com')).toBe(false);
    expect(mentionsSite('example.com', 'not a site')).toBe(false);
  });
});

describe('matchBrand', () => {
  const brand = { site: 'ornekspor.com', name: 'Örnek Spor', aliases: ['ÖS'] };

  it('reports a citation with its place among the sources', () => {
    const answer = {
      text: 'No names here.',
      sources: ['https://a.com', 'https://ornekspor.com/x'],
    };
    expect(matchBrand(brand, answer)).toEqual({ presence: 'cited', position: 2 });
  });

  it('reports a name, an alias or the address written without a link', () => {
    const sources = ['https://a.com'];
    for (const text of ['Örnek Spor is good', 'ÖS is good', 'see ornekspor.com']) {
      expect(matchBrand(brand, { text, sources }), text).toEqual({
        presence: 'named',
        position: null,
      });
    }
  });

  it('reports absence, and still checks names when the address is not valid', () => {
    expect(matchBrand(brand, { text: 'Nothing', sources: [] }).presence).toBe('absent');
    const unnamed = { site: 'ornekspor.com', name: '' };
    expect(matchBrand(unnamed, { text: 'Örnek Spor', sources: [] }).presence).toBe('absent');
    const noSite = { site: 'not a site', name: 'Örnek Spor' };
    expect(matchBrand(noSite, { text: 'Örnek Spor', sources: [] }).presence).toBe('named');
  });
});
