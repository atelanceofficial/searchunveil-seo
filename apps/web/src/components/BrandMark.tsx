import { useId } from 'preact/hooks';

/** The S the three threads follow, drawn on a 32-unit square. */
const THREAD = 'M25 6.2C18 2.8 6.6 5 8.6 11.8S25 18.8 23.2 25.4C21.6 30.4 11 30 7 26.2';

/**
 * The SearchUnveil mark: three fine threads running together as one S, with a bead where the
 * S turns, the point a search brings to light. The threads echo the cover's photograph; the
 * bead stands clear of them by a gap cut from the threads, so it works on any ground.
 * Decorative: the name next to it carries the meaning.
 */
export function BrandMark() {
  const mask = `${useId()}-threads`;
  return (
    <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <g fill="none">
            <path d={THREAD} stroke="#fff" stroke-width="6.8" />
            <path d={THREAD} stroke="#000" stroke-width="4" />
            <path d={THREAD} stroke="#fff" stroke-width="2" />
          </g>
          <circle cx="16" cy="16" r="3.4" fill="#000" />
        </mask>
      </defs>
      <rect class="brand-mark__threads" width="32" height="32" mask={`url(#${mask})`} />
      <circle class="brand-mark__bead" cx="16" cy="16" r="2.5" />
    </svg>
  );
}
