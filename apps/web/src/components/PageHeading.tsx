import type { ComponentChildren } from 'preact';

/**
 * The page's single h1. It can receive focus, so that after navigating, keyboard and screen
 * reader users start at the top of the new page instead of somewhere in the old one.
 * The ruler beneath it is drawn by the stylesheet.
 */
export function PageHeading(props: {
  readonly children: ComponentChildren;
  readonly lead?: string;
}) {
  return (
    <div class="page-heading">
      <h1 tabIndex={-1} data-page-heading>
        {props.children}
      </h1>
      {props.lead === undefined ? null : <p class="lead">{props.lead}</p>}
    </div>
  );
}
