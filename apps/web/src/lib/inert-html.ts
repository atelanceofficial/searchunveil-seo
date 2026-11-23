/**
 * Parses pasted HTML into an inert document.
 *
 * `DOMParser` documents never run scripts or load images, styles or frames, so a page can be
 * inspected safely. The production security policy enforces Trusted Types; this module owns
 * the only policy it allows, and the policy is used for nothing but this parser.
 */

interface TrustedHtmlPolicy {
  createHTML(input: string): unknown;
}

interface TrustedTypesFactory {
  createPolicy(name: string, rules: { createHTML(input: string): string }): TrustedHtmlPolicy;
}

const factory = (globalThis as { trustedTypes?: TrustedTypesFactory }).trustedTypes;
const policy = factory?.createPolicy('searchunveil-inert-html', { createHTML: (input) => input });

export function parseInertHtml(html: string): Document {
  const markup = policy === undefined ? html : (policy.createHTML(html) as string);
  return new DOMParser().parseFromString(markup, 'text/html');
}
