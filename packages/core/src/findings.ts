import type { CoreMessageKey } from './i18n/catalogs/en.ts';
import type { Message, ParamValue } from './i18n/message.ts';

/**
 * A finding is one explainable statement about the data a person provided.
 *
 * Every finding states what was observed and shows the evidence it rests on. It names its
 * limitations before they can mislead, and suggests what to check next. Its `rule` identifies
 * the exact, documented rule that produced it (see docs/FINDINGS.md).
 */

export type CoreMessage = Message<CoreMessageKey>;

/**
 * - `attention`: likely to hurt how the site is found; worth acting on first.
 * - `review`: worth a closer look; may be an opportunity.
 * - `good`: a healthy result or a positive change.
 * - `info`: context that helps read the other findings.
 */
export type FindingStatus = 'attention' | 'review' | 'good' | 'info';

export interface Evidence {
  readonly label: CoreMessage;
  readonly value: ParamValue;
}

export interface FindingTable {
  readonly columns: readonly { readonly label: CoreMessage; readonly numeric: boolean }[];
  readonly rows: readonly (readonly ParamValue[])[];
}

export interface Reference {
  readonly title: CoreMessage;
  readonly url: string;
}

export interface Finding {
  readonly rule: string;
  readonly status: FindingStatus;
  readonly title: CoreMessage;
  /** What the finding means, in one or two plain sentences. */
  readonly summary?: CoreMessage;
  readonly evidence: readonly Evidence[];
  readonly table?: FindingTable;
  readonly limitations: readonly CoreMessage[];
  readonly nextChecks: readonly CoreMessage[];
  readonly references: readonly Reference[];
}

/** Display order: what needs attention first, then opportunities, then good news and context. */
export const STATUS_ORDER: readonly FindingStatus[] = ['attention', 'review', 'good', 'info'];

export function sortFindings(findings: readonly Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );
}

type FindingInput = Pick<Finding, 'rule' | 'status' | 'title'> &
  Partial<Omit<Finding, 'rule' | 'status' | 'title'>>;

/** Builds a finding, defaulting every list to empty. */
export function finding(input: FindingInput): Finding {
  return {
    evidence: [],
    limitations: [],
    nextChecks: [],
    references: [],
    ...input,
  };
}
