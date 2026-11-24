import {
  decimal,
  FACT_HEADINGS,
  isValidLanguageTag,
  type HttpFacts,
  type PageFacts,
  type PageReport,
} from '@searchunveil/core';
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import type { AppTranslator } from '../lib/i18n.tsx';
import { useI18n } from '../lib/i18n.tsx';

/**
 * What the page tells search engines, at a glance: how it might look in Google's results, the
 * facts the checks read, the server's answer when the page was fetched by its address, and
 * its heading outline.
 */
export function PageOverview(props: { readonly report: PageReport }) {
  const { t } = useI18n();
  const id = useId();
  const { facts, http } = props.report;
  const address = http?.finalUrl ?? props.report.url;
  const pageLang = facts.lang !== null && isValidLanguageTag(facts.lang) ? facts.lang : undefined;

  return (
    <section class="overview" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>{t.t('ui.overview.title')}</h3>

      <figure class="serp">
        <figcaption class="serp__caption">{t.t('ui.overview.serp')}</figcaption>
        <div class="serp__result" lang={pageLang} dir="auto">
          {address === null ? null : (
            <p class="serp__site" dir="ltr">
              <span class="serp__host">{hostOf(address)}</span>
              <span class="serp__path">{breadcrumb(address)}</span>
            </p>
          )}
          <p class="serp__title">{facts.title ?? t.t('ui.site.untitled')}</p>
          {facts.description === null ? (
            <p class="serp__description serp__description--missing" lang={undefined}>
              {t.t('ui.overview.serp.no-description')}
            </p>
          ) : (
            <p class="serp__description">{facts.description}</p>
          )}
        </div>
        <p class="hint">{t.t('ui.overview.serp.note')}</p>
      </figure>

      <div class="overview__columns">
        <FactList title={t.t('ui.overview.page')}>{pageFactRows(t, facts)}</FactList>
        {http === null ? null : (
          <FactList title={t.t('ui.overview.server')}>{serverFactRows(t, http)}</FactList>
        )}
      </div>

      <details class="outline">
        <summary>
          {t.t('ui.overview.outline')}{' '}
          <span class="outline__count">({t.value(facts.headingCount)})</span>
        </summary>
        {facts.headings.length === 0 ? (
          <p class="muted">{t.t('ui.overview.outline.empty')}</p>
        ) : (
          <ol class="outline__list" lang={pageLang} dir="auto">
            {facts.headings.map((heading, index) => (
              <li key={index} class={`outline__item outline__item--h${String(heading.level)}`}>
                <span class="outline__level" dir="ltr">
                  H{heading.level}
                </span>
                <span class="outline__text">{heading.text === '' ? '—' : heading.text}</span>
              </li>
            ))}
          </ol>
        )}
        {facts.headingCount > FACT_HEADINGS ? (
          <p class="muted">
            {t.t('ui.overview.outline.more', { count: facts.headingCount - FACT_HEADINGS })}
          </p>
        ) : null}
      </details>
    </section>
  );
}

function FactList(props: { readonly title: string; readonly children: ComponentChildren }) {
  const id = useId();
  return (
    <div class="overview__group">
      <h4 id={id}>{props.title}</h4>
      <dl class="fact-list" aria-labelledby={id}>
        {props.children}
      </dl>
    </div>
  );
}

function Row(props: { readonly label: string; readonly children: ComponentChildren }) {
  return (
    <div class="fact-list__row">
      <dt>{props.label}</dt>
      <dd>{props.children}</dd>
    </div>
  );
}

/** A value taken from the page or the server: shown as written, left to right. */
function Literal(props: { readonly children: string }) {
  return (
    <code class="fact-list__code" dir="ltr">
      {props.children}
    </code>
  );
}

function pageFactRows(t: AppTranslator, facts: PageFacts) {
  const none = t.t('ui.overview.none');
  const social = [facts.social.title, facts.social.description, facts.social.image].filter(
    (value) => value !== null,
  ).length;
  return [
    <Row key="lang" label={t.t('ui.overview.language')}>
      {facts.lang === null ? t.t('ui.overview.not-set') : <Literal>{facts.lang}</Literal>}
    </Row>,
    <Row key="canonical" label={t.t('ui.overview.canonical')}>
      {facts.canonical === null ? t.t('ui.overview.not-set') : <Literal>{facts.canonical}</Literal>}
    </Row>,
    <Row key="robots" label={t.t('ui.overview.robots')}>
      {facts.robots === null ? none : <Literal>{facts.robots}</Literal>}
    </Row>,
    <Row key="words" label={t.t('ui.overview.words')}>
      {t.value(facts.words)}
    </Row>,
    <Row key="headings" label={t.t('ui.overview.headings')}>
      {t.value(facts.headingCount)}
    </Row>,
    <Row key="images" label={t.t('ui.overview.images')}>
      {facts.images.total === 0
        ? none
        : t.t('ui.overview.images.value', {
            total: facts.images.total,
            missing: facts.images.missingAlt,
          })}
    </Row>,
    <Row key="links" label={t.t('ui.overview.links')}>
      {facts.links.total === 0
        ? none
        : t.t('ui.overview.links.value', {
            internal: facts.links.internal,
            external: facts.links.external,
          })}
    </Row>,
    <Row key="structured-data" label={t.t('ui.overview.structured-data')}>
      {facts.structuredData.length === 0 ? (
        none
      ) : (
        <Literal>{facts.structuredData.join(', ')}</Literal>
      )}
    </Row>,
    <Row key="social" label={t.t('ui.overview.social')}>
      {social === 3
        ? t.t('ui.overview.social.complete')
        : social === 0
          ? none
          : t.t('ui.overview.social.partial')}
    </Row>,
    <Row key="languages" label={t.t('ui.overview.languages')}>
      {facts.languageVersions === 0 ? none : t.value(facts.languageVersions)}
    </Row>,
  ];
}

function serverFactRows(t: AppTranslator, http: HttpFacts) {
  const none = t.t('ui.overview.none');
  const https = http.finalUrl.startsWith('https:');
  const robots = http.robotsTxt;
  return [
    <Row key="status" label={t.t('ui.overview.status')}>
      <Literal>{String(http.status)}</Literal>
    </Row>,
    <Row key="final" label={t.t('ui.overview.final-address')}>
      <Literal>{http.finalUrl}</Literal>
    </Row>,
    <Row key="redirects" label={t.t('ui.overview.redirects')}>
      {http.redirects.length === 0 ? none : t.value(http.redirects.length)}
    </Row>,
    <Row key="time" label={t.t('ui.overview.time')}>
      {t.t('ui.overview.time.value', { seconds: decimal(http.elapsedMs / 1000, 2) })}
    </Row>,
    <Row key="size" label={t.t('ui.overview.size')}>
      {t.t('ui.overview.size.value', { kilobytes: decimal(http.bytes / 1024, 1) })}
    </Row>,
    <Row key="compression" label={t.t('ui.overview.compression')}>
      {http.contentEncoding === null ? none : <Literal>{http.contentEncoding}</Literal>}
    </Row>,
    <Row key="https" label={t.t('ui.overview.https')}>
      {!https
        ? t.t('ui.overview.https.off')
        : http.hsts
          ? t.t('ui.overview.https.hsts')
          : t.t('ui.overview.https.on')}
    </Row>,
    <Row key="robots" label={t.t('ui.overview.robots-txt')}>
      {robots === null ? (
        t.t('ui.overview.robots-txt.unknown')
      ) : !robots.found ? (
        t.t('ui.overview.robots-txt.missing')
      ) : robots.allowsPage ? (
        t.t('ui.overview.robots-txt.allows')
      ) : (
        <>
          {t.t('ui.overview.robots-txt.blocks')}
          {robots.rule === null ? null : (
            <>
              {' '}
              <Literal>{robots.rule}</Literal>
            </>
          )}
        </>
      )}
    </Row>,
    ...(robots?.found === true
      ? [
          <Row key="sitemaps" label={t.t('ui.overview.sitemaps')}>
            {robots.sitemaps.length === 0 ? none : t.value(robots.sitemaps.length)}
          </Row>,
        ]
      : []),
  ];
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** The address as Google prints it under a result: `example.com › shop › shoes`. */
function breadcrumb(url: string): string {
  try {
    const parts = new URL(url).pathname
      .split('/')
      .filter((part) => part !== '')
      .map((part) => {
        try {
          return decodeURIComponent(part);
        } catch {
          return part;
        }
      });
    return parts.length === 0 ? '' : ` › ${parts.join(' › ')}`;
  } catch {
    return '';
  }
}
