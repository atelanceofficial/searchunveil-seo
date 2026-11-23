import type { ComponentChildren } from 'preact';

export interface Column {
  readonly label: ComponentChildren;
  readonly numeric?: boolean;
}

/**
 * A table that scrolls inside its own frame on narrow screens, so the page itself never
 * scrolls sideways. The frame is focusable so keyboard users can scroll it too.
 */
export function DataTable(props: {
  readonly caption: string;
  readonly columns: readonly Column[];
  readonly rows: readonly (readonly ComponentChildren[])[];
  readonly captionHidden?: boolean;
}) {
  return (
    <div class="table-frame" role="region" aria-label={props.caption} tabIndex={0}>
      <table>
        <caption class={props.captionHidden === true ? 'visually-hidden' : undefined}>
          {props.caption}
        </caption>
        <thead>
          <tr>
            {props.columns.map((column, i) => (
              <th key={i} scope="col" class={column.numeric === true ? 'numeric' : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} class={props.columns[c]?.numeric === true ? 'numeric' : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
