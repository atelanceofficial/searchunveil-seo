import { finding, type Evidence, type Finding } from '../findings.ts';
import { code, decimal, list, message } from '../i18n/message.ts';
import { REFERENCES } from '../references.ts';

/**
 * What a web server said when a page was fetched by its address: facts the HTML alone cannot
 * show. The app's server collects them (see `apps/server`); the rules below turn the ones that
 * decide whether search engines can reach the page into findings.
 */
export interface HttpFacts {
  /** The address as the person gave it, normalized. */
  readonly requestedUrl: string;
  /** Where the redirects ended: the page that was reviewed. */
  readonly finalUrl: string;
  readonly status: number;
  /** Every redirect followed, in order: the address that answered and its status. */
  readonly redirects: readonly { readonly url: string; readonly status: number }[];
  /** Time until the whole HTML had arrived, in milliseconds. */
  readonly elapsedMs: number;
  /** Size of the HTML as sent, before decompression. */
  readonly bytes: number;
  readonly contentType: string | null;
  /** How the HTML was compressed (`gzip`, `br`), or `null`. */
  readonly contentEncoding: string | null;
  /** The X-Robots-Tag header, which works like a robots meta tag. */
  readonly xRobotsTag: string | null;
  /** Whether the server sends Strict-Transport-Security. */
  readonly hsts: boolean;
  /** The site's robots.txt, as it applies to Googlebot; `null` when it could not be read. */
  readonly robotsTxt: {
    readonly found: boolean;
    /** Whether Googlebot may crawl the final address. */
    readonly allowsPage: boolean;
    /** The rule that decided, such as `Disallow: /private`, when one matched. */
    readonly rule: string | null;
    readonly sitemaps: readonly string[];
  } | null;
}

/** Statuses that mean "here is the page". */
const isSuccess = (status: number) => status >= 200 && status < 300;

export function reviewHttp(facts: HttpFacts): Finding[] {
  const findings: Finding[] = [];
  const status: Evidence = { label: message('evidence.status'), value: code(String(facts.status)) };
  const address: Evidence = {
    label: message('evidence.final-address'),
    value: code(facts.finalUrl),
  };
  const https = facts.finalUrl.startsWith('https:');
  const header = (facts.xRobotsTag ?? '').toLowerCase();
  const noindex = /(^|[\s,:])(noindex|none)($|[\s,])/.test(header);
  const blocked = facts.robotsTxt?.allowsPage === false;

  if (!isSuccess(facts.status)) {
    findings.push(
      finding({
        rule: 'http.status',
        status: 'attention',
        title: message('http.status', { status: code(String(facts.status)) }),
        summary: message('http.status.summary'),
        evidence: [status, address],
        nextChecks: [message('http.check.status')],
        references: [REFERENCES.httpStatus],
      }),
    );
  }
  if (!https) {
    findings.push(
      finding({
        rule: 'http.https',
        status: 'attention',
        title: message('http.https'),
        summary: message('http.https.summary'),
        evidence: [address],
        nextChecks: [message('http.check.https')],
        references: [REFERENCES.https],
      }),
    );
  }
  if (noindex) {
    findings.push(
      finding({
        rule: 'http.x-robots-tag',
        status: 'attention',
        title: message('http.x-robots-tag'),
        summary: message('http.x-robots-tag.summary'),
        evidence: [
          {
            label: message('evidence.header'),
            value: code(`X-Robots-Tag: ${facts.xRobotsTag ?? ''}`),
          },
        ],
        nextChecks: [message('http.check.x-robots-tag')],
        references: [REFERENCES.robotsMeta],
      }),
    );
  }
  if (blocked) {
    findings.push(
      finding({
        rule: 'http.robots-txt',
        status: 'attention',
        title: message('http.robots-txt'),
        summary: message('http.robots-txt.summary'),
        evidence: [
          address,
          { label: message('evidence.robots-rule'), value: code(facts.robotsTxt.rule ?? '') },
        ],
        nextChecks: [message('http.check.robots-txt')],
        references: [REFERENCES.robotsTxt],
      }),
    );
  }
  if (facts.robotsTxt === null) {
    findings.push(
      finding({
        rule: 'http.robots-txt.unreadable',
        status: 'review',
        title: message('http.robots-txt.unreadable'),
        summary: message('http.robots-txt.unreadable.summary'),
        references: [REFERENCES.robotsTxt],
      }),
    );
  }
  if (facts.redirects.length >= 2) {
    findings.push(
      finding({
        rule: 'http.redirects',
        status: 'review',
        title: message('http.redirects', { count: facts.redirects.length }),
        summary: message('http.redirects.summary'),
        evidence: [
          {
            label: message('evidence.redirect'),
            value: list(facts.redirects.map((r) => `${String(r.status)} ${r.url}`)),
          },
          address,
        ],
        references: [REFERENCES.httpStatus],
      }),
    );
  }
  if (isSuccess(facts.status) && https && !noindex && facts.robotsTxt?.allowsPage === true) {
    findings.push(
      finding({
        rule: 'http.ok',
        status: 'good',
        title: message('http.ok'),
        summary: message('http.ok.summary'),
        evidence: [
          status,
          {
            label: message('evidence.response-time'),
            value: decimal(facts.elapsedMs / 1000, 2),
          },
        ],
      }),
    );
  }
  return findings;
}

/** The robots.txt that governs `url`: the one at the root of its host. */
export function robotsAddress(url: string): string {
  return new URL('/robots.txt', url).href;
}
