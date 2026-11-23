import { useEffect, useRef } from 'preact/hooks';
import { useI18n } from '../lib/i18n.tsx';

/**
 * A confirmation built on the native modal <dialog>, which traps focus, closes with Escape
 * and returns focus to the control that opened it.
 */
export function ConfirmDialog(props: {
  readonly open: boolean;
  readonly message: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (props.open && !dialog.open) dialog.showModal();
    if (!props.open && dialog.open) dialog.close();
  }, [props.open]);

  return (
    <dialog
      ref={ref}
      class="dialog"
      aria-describedby="confirm-message"
      onClose={() => {
        if (props.open) props.onCancel();
      }}
    >
      <p id="confirm-message" class="dialog__message">
        {props.message}
      </p>
      <div class="dialog__actions">
        <button type="button" class="button" onClick={props.onCancel} autofocus>
          {t.t('ui.mentions.cancel')}
        </button>
        <button type="button" class="button button--danger" onClick={props.onConfirm}>
          {props.confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
