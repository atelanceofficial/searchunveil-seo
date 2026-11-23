/**
 * The lens mark: three rings, a dashed crosshair and the two arcs of the cover art, reduced to
 * a small symbol. Decorative; the brand name next to it carries the meaning.
 */
export function BrandMark() {
  return (
    <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path class="brand-mark__cross" d="M20 1.5v37M1.5 20h37" />
      <circle class="brand-mark__ring" cx="20" cy="20" r="17" />
      <circle class="brand-mark__ring brand-mark__ring--mid" cx="20" cy="20" r="12" />
      <circle class="brand-mark__ring brand-mark__ring--inner" cx="20" cy="20" r="6.5" />
      <path class="brand-mark__arc" d="M3 20A17 17 0 0 1 36.43 15.64" />
      <path class="brand-mark__arc brand-mark__arc--mist" d="M23.97 8.68A12 12 0 0 1 30.62 25.6" />
      <circle class="brand-mark__dot" cx="20" cy="20" r="2.2" />
    </svg>
  );
}
