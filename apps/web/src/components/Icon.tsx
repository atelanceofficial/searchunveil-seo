/** Decorative line icons, drawn with the current text color. Meaning always comes from text. */

const PATHS = {
  attention: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM12 7.5V13M12 16.5v.01',
  review: 'M11 4.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM16 16l4.5 4.5',
  good: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM8 12.5l2.8 2.8L16.5 9',
  info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM12 11v5.5M12 7.5v.01',
  upload:
    'M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15',
  download:
    'M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15',
  arrow: 'M5 12h14m0 0-5-5m5 5-5 5',
  external:
    'M14 5h5v5M19 5l-8 8M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10',
  trash: 'M5 7h14M10 4h4M8 7l.8 12.2a1.5 1.5 0 0 0 1.5 1.3h3.4a1.5 1.5 0 0 0 1.5-1.3L16 7',
  edit: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z',
  lock: 'M7 10.5h10a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5.5a2 2 0 0 1 2-2ZM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5',
  chart: 'M4 19.5h16M6.5 16l4-5 3 3 4.5-6.5',
  page: 'M7 3.5h7l4.5 4.5v12H6.5V3.5ZM14 3.5V8h4.5M9.5 12.5h5M9.5 16h5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  quote:
    'M9.5 7.5C6.8 8.4 5 10.6 5 13.6V17h4.5v-4.4H7.2c.2-1.8 1.2-3 2.8-3.6l-.5-1.5ZM18.5 7.5c-2.7.9-4.5 3.1-4.5 6.1V17h4.5v-4.4h-2.3c.2-1.8 1.2-3 2.8-3.6l-.5-1.5Z',
  globe:
    'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3.5 12h17M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9s1.2-6.5 3.6-9Z',
  moon: 'M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1Z',
  spark:
    'M10.5 4c.7 4.3 2.7 6.3 7 7-4.3.7-6.3 2.7-7 7-.7-4.3-2.7-6.3-7-7 4.3-.7 6.3-2.7 7-7ZM18 3.5c.3 1.6 1 2.3 2.5 2.5-1.5.2-2.2.9-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon(props: { readonly name: IconName; readonly class?: string }) {
  return (
    <svg
      class={props.class === undefined ? 'icon' : `icon ${props.class}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[props.name]} />
    </svg>
  );
}
