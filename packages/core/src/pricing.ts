/**
 * How SearchUnveil is sold, for the notices that depend on it: a subscription paid monthly,
 * whose first days are free.
 *
 * Neither the subscription nor the free trial covers the paid tools that the AI visibility
 * check asks AI engines with. Their fees are billed per call by whoever provides the tools,
 * and every notice about them says so.
 */
export const PRICING = Object.freeze({
  /** How often the subscription is paid. */
  period: 'month',
  /** How many days of a new subscription are free. */
  freeTrialDays: 14,
});
