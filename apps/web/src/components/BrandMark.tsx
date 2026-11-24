/**
 * The SearchUnveil mark: the lens from the brand's photograph reduced to three shapes. A tilted
 * disc of rings, the loop standing beside it, and the bright core at its centre. Decorative;
 * the name next to it carries the meaning.
 */
export function BrandMark() {
  return (
    <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <ellipse
        class="brand-mark__loop"
        cx="10"
        cy="10.6"
        rx="4.6"
        ry="7.8"
        transform="rotate(-16 10 10.6)"
      />
      <ellipse class="brand-mark__disc" cx="17.4" cy="20.6" rx="12.8" ry="7.2" />
      <ellipse class="brand-mark__core" cx="18.2" cy="20.4" rx="5.4" ry="2.8" />
    </svg>
  );
}
