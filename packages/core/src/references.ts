import type { Reference } from './findings.ts';
import { message } from './i18n/message.ts';

/**
 * Every external page SearchUnveil cites, in one place.
 *
 * Findings point people to primary sources so they can verify what we say. Sources move,
 * so `npm run check:links` confirms each address still resolves; CI runs it on a schedule.
 */
export const REFERENCES = {
  gscMetrics: {
    title: message('ref.gsc-metrics'),
    url: 'https://support.google.com/webmasters/answer/7042828',
  },
  gscPerformance: {
    title: message('ref.gsc-performance'),
    url: 'https://support.google.com/webmasters/answer/7576553',
  },
  titleLinks: {
    title: message('ref.title-links'),
    url: 'https://developers.google.com/search/docs/appearance/title-link',
  },
  snippets: {
    title: message('ref.snippets'),
    url: 'https://developers.google.com/search/docs/appearance/snippet',
  },
  robotsMeta: {
    title: message('ref.robots-meta'),
    url: 'https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag',
  },
  canonical: {
    title: message('ref.canonical'),
    url: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
  },
  hreflang: {
    title: message('ref.hreflang'),
    url: 'https://developers.google.com/search/docs/specialty/international/localized-versions',
  },
  structuredData: {
    title: message('ref.structured-data'),
    url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
  },
  richResultsTest: {
    title: message('ref.rich-results-test'),
    url: 'https://search.google.com/test/rich-results',
  },
  images: {
    title: message('ref.images'),
    url: 'https://developers.google.com/search/docs/appearance/google-images',
  },
  validMetadata: {
    title: message('ref.valid-metadata'),
    url: 'https://developers.google.com/search/docs/crawling-indexing/valid-page-metadata',
  },
  crawlableLinks: {
    title: message('ref.crawlable-links'),
    url: 'https://developers.google.com/search/docs/crawling-indexing/links-crawlable',
  },
  wcagLanguage: {
    title: message('ref.wcag-language'),
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html',
  },
  wcagNonText: {
    title: message('ref.wcag-non-text'),
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
  },
  wcagResize: {
    title: message('ref.wcag-resize'),
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html',
  },
  wcagLinkPurpose: {
    title: message('ref.wcag-link-purpose'),
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html',
  },
  wcagStructure: {
    title: message('ref.wcag-structure'),
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
  },
  viewport: {
    title: message('ref.viewport'),
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag',
  },
  openGraph: {
    title: message('ref.open-graph'),
    url: 'https://ogp.me/',
  },
  robotsTxt: {
    title: message('ref.robots-txt'),
    url: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro',
  },
  httpStatus: {
    title: message('ref.http-status'),
    url: 'https://developers.google.com/search/docs/crawling-indexing/http-network-errors',
  },
  https: {
    title: message('ref.https'),
    url: 'https://web.dev/articles/why-https-matters',
  },
} as const satisfies Record<string, Reference>;
