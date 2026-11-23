/**
 * The facts a page review needs, extracted from a parsed HTML document.
 *
 * Extraction uses only standard DOM interfaces, so it works with a browser's `DOMParser`
 * (which parses exactly as browsers do and never runs scripts or loads resources) and with
 * spec-compliant implementations such as jsdom. Review rules then work on this plain data.
 */

export interface PageSnapshot {
  /** The page's address, when the person provided a valid one. */
  readonly url: string | null;
  readonly lang: string | null;
  readonly titles: readonly HeadValue[];
  readonly descriptions: readonly HeadValue[];
  readonly robots: readonly RobotsDirective[];
  readonly canonicals: readonly HeadValue[];
  readonly viewport: string | null;
  readonly charset: string | null;
  readonly headings: readonly Heading[];
  readonly images: readonly PageImage[];
  readonly links: readonly PageLink[];
  readonly alternates: readonly Alternate[];
  readonly structuredData: readonly StructuredDataBlock[];
  readonly openGraph: Readonly<Record<string, string>>;
  readonly baseHref: string | null;
  /** SEO-relevant head elements that the HTML parser placed in the body. */
  readonly misplaced: readonly string[];
  /** The first element or text that ended the `<head>` early, as written. */
  readonly headBreaker: string | null;
  /** True when the `<head>` ends with a `<noscript>` element. */
  readonly headEndsWithNoscript: boolean;
}

export interface HeadValue {
  readonly value: string;
  readonly inHead: boolean;
}

export interface RobotsDirective {
  /** `robots`, or a crawler-specific name such as `googlebot`. */
  readonly name: string;
  readonly content: string;
  readonly inHead: boolean;
}

export interface Heading {
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
  readonly text: string;
}

export interface PageImage {
  readonly src: string;
  /** `null` when the `alt` attribute is missing; `''` marks a decorative image. */
  readonly alt: string | null;
  /** Hidden from assistive technology, so it needs no text alternative. */
  readonly hidden: boolean;
}

export interface PageLink {
  readonly href: string;
  /** The name assistive technology announces for the link. */
  readonly name: string;
  readonly nofollow: boolean;
}

export interface Alternate {
  readonly hreflang: string;
  readonly href: string;
}

export interface StructuredDataBlock {
  readonly valid: boolean;
  readonly types: readonly string[];
}

const HTML_NS = 'http://www.w3.org/1999/xhtml';
const ROBOTS_NAMES = /^(robots|googlebot|googlebot-news|bingbot)$/i;
/** Elements that may legitimately appear in the `<head>`. */
const HEAD_ELEMENTS = new Set([
  'base',
  'link',
  'meta',
  'noscript',
  'script',
  'style',
  'template',
  'title',
]);
const SNIPPET_LENGTH = 160;
// DOM constants, spelled out because `Node` and `NodeFilter` are not globals outside browsers.
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const SHOW_ELEMENT = 0x1;
const SHOW_TEXT = 0x4;

function text(node: Node | null): string {
  return (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function tokens(value: string | null): string[] {
  return (value ?? '').toLowerCase().split(/\s+/).filter(Boolean);
}

function isHtml(element: Element): boolean {
  return element.namespaceURI === HTML_NS;
}

/** The start tag of an element, as a short snippet for evidence. */
export function startTag(element: Element): string {
  const attributes = Array.from(element.attributes)
    .map((a) => (a.value === '' ? ` ${a.name}` : ` ${a.name}="${a.value.slice(0, 80)}"`))
    .join('');
  const tag = `<${element.localName}${attributes}>`;
  return tag.length > SNIPPET_LENGTH ? `${tag.slice(0, SNIPPET_LENGTH - 2)}…>` : tag;
}

/** Text a screen reader would announce for an element: a close, deliberately simple approximation. */
function accessibleName(element: Element, document: Document): string {
  const label = element.getAttribute('aria-label')?.trim();
  if (label) return label;
  const labelledBy = tokens(element.getAttribute('aria-labelledby'))
    .map((id) => text(document.getElementById(id)))
    .join(' ')
    .trim();
  if (labelledBy) return labelledBy;
  const content = [
    text(element),
    ...Array.from(element.querySelectorAll('img[alt]'), (img) => img.getAttribute('alt') ?? ''),
  ]
    .join(' ')
    .trim();
  if (content) return content;
  return element.getAttribute('title')?.trim() ?? '';
}

function metaByName(document: Document, pattern: RegExp): Element[] {
  return Array.from(document.querySelectorAll('meta[name]')).filter((m) =>
    pattern.test(m.getAttribute('name')?.trim() ?? ''),
  );
}

function linksWithRel(document: Document, rel: string): Element[] {
  return Array.from(document.querySelectorAll('link[rel]')).filter((l) =>
    tokens(l.getAttribute('rel')).includes(rel),
  );
}

function collectTypes(value: unknown, into: Set<string>, depth = 0): void {
  if (depth > 20 || value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) collectTypes(item, into, depth + 1);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (key === '@type') {
      for (const type of Array.isArray(item) ? item : [item])
        if (typeof type === 'string') into.add(type);
    } else {
      collectTypes(item, into, depth + 1);
    }
  }
}

export function extractSnapshot(document: Document, url: string | null = null): PageSnapshot {
  const head = document.head;
  const inHead = (element: Element) => head.contains(element);

  const titles = Array.from(document.getElementsByTagName('title'))
    .filter(isHtml)
    .map((t) => ({ value: text(t), inHead: inHead(t) }));
  const descriptions = metaByName(document, /^description$/i).map((m) => ({
    value: (m.getAttribute('content') ?? '').trim(),
    inHead: inHead(m),
  }));
  const robots = metaByName(document, ROBOTS_NAMES).map((m) => ({
    name: (m.getAttribute('name') ?? '').trim().toLowerCase(),
    content: (m.getAttribute('content') ?? '').trim(),
    inHead: inHead(m),
  }));
  const canonicalLinks = linksWithRel(document, 'canonical');
  const alternateLinks = linksWithRel(document, 'alternate').filter((l) =>
    l.hasAttribute('hreflang'),
  );
  const viewport = metaByName(document, /^viewport$/i)[0]?.getAttribute('content') ?? null;

  let charset = document.querySelector('meta[charset]')?.getAttribute('charset') ?? null;
  if (charset === null) {
    const equiv = Array.from(document.querySelectorAll('meta[http-equiv]')).find(
      (m) => m.getAttribute('http-equiv')?.toLowerCase() === 'content-type',
    );
    charset = /charset=([^;\s]+)/i.exec(equiv?.getAttribute('content') ?? '')?.[1] ?? null;
  }

  const headings = Array.from(document.body.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
    (h) => ({
      level: Number(h.localName.charAt(1)) as Heading['level'],
      text: accessibleName(h, document),
    }),
  );

  const images = Array.from(document.body.getElementsByTagName('img')).map((img) => ({
    src: img.getAttribute('src') ?? img.getAttribute('data-src') ?? '',
    alt: img.getAttribute('alt'),
    hidden:
      img.getAttribute('aria-hidden') === 'true' ||
      ['presentation', 'none'].includes(img.getAttribute('role')?.trim().toLowerCase() ?? ''),
  }));

  const links = Array.from(document.body.querySelectorAll('a[href]')).map((a) => ({
    href: (a.getAttribute('href') ?? '').trim(),
    name: accessibleName(a, document),
    nofollow: tokens(a.getAttribute('rel')).includes('nofollow'),
  }));

  const structuredData = Array.from(document.querySelectorAll('script[type]'))
    .filter((s) => s.getAttribute('type')?.trim().toLowerCase() === 'application/ld+json')
    .map((script) => {
      try {
        const types = new Set<string>();
        collectTypes(JSON.parse(script.textContent), types);
        return { valid: true, types: [...types] };
      } catch {
        return { valid: false, types: [] };
      }
    });

  const openGraph: Record<string, string> = {};
  for (const meta of document.querySelectorAll('meta[property]')) {
    const property = meta.getAttribute('property')?.trim().toLowerCase() ?? '';
    if (property.startsWith('og:') && !(property in openGraph)) {
      openGraph[property] = (meta.getAttribute('content') ?? '').trim();
    }
  }

  const { misplaced, headBreaker } = findMisplacedHeadElements(document);

  return {
    url,
    lang: document.documentElement.getAttribute('lang'),
    titles,
    descriptions,
    robots,
    canonicals: canonicalLinks.map((l) => ({
      value: (l.getAttribute('href') ?? '').trim(),
      inHead: inHead(l),
    })),
    viewport,
    charset,
    headings,
    images,
    links,
    alternates: alternateLinks.map((l) => ({
      hreflang: (l.getAttribute('hreflang') ?? '').trim(),
      href: (l.getAttribute('href') ?? '').trim(),
    })),
    structuredData,
    openGraph,
    baseHref: document.querySelector('base[href]')?.getAttribute('href') ?? null,
    misplaced,
    headBreaker,
    headEndsWithNoscript: head.lastElementChild?.localName === 'noscript',
  };
}

/**
 * HTML parsers end the `<head>` at the first element or text that does not belong there; every
 * head element after it lands in the body, where search engines ignore it. This finds those
 * elements, and the element or text that ended the head.
 */
function findMisplacedHeadElements(document: Document): {
  misplaced: string[];
  headBreaker: string | null;
} {
  const body = document.body;
  const misplacedElements = Array.from(
    body.querySelectorAll('title, meta[name], link[rel]'),
  ).filter((element) => {
    if (element.localName === 'title') return isHtml(element);
    if (element.localName === 'meta') {
      return /^(description|robots|googlebot|viewport)$/i.test(
        element.getAttribute('name')?.trim() ?? '',
      );
    }
    const rel = tokens(element.getAttribute('rel'));
    return (
      rel.includes('canonical') || (rel.includes('alternate') && element.hasAttribute('hreflang'))
    );
  });
  const first = misplacedElements[0];
  if (first === undefined) return { misplaced: [], headBreaker: null };

  let headBreaker: string | null = null;
  const walker = document.createTreeWalker(body, SHOW_ELEMENT | SHOW_TEXT);
  for (let node = walker.nextNode(); node !== null && node !== first; node = walker.nextNode()) {
    if (node.nodeType === TEXT_NODE) {
      const value = (node.nodeValue ?? '').trim();
      const parent = node.parentElement?.localName ?? '';
      if (value !== '' && !HEAD_ELEMENTS.has(parent)) {
        headBreaker =
          value.length > SNIPPET_LENGTH ? `${value.slice(0, SNIPPET_LENGTH - 1)}…` : value;
        break;
      }
    } else if (node.nodeType === ELEMENT_NODE && !HEAD_ELEMENTS.has((node as Element).localName)) {
      headBreaker = startTag(node as Element);
      break;
    }
  }
  return { misplaced: misplacedElements.map(startTag), headBreaker };
}
