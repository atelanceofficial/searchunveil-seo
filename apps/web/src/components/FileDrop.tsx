import { useId, useState } from 'preact/hooks';
import { Icon } from './Icon.tsx';

/**
 * A native file input with a generous drop zone around it. Dropping files is a convenience;
 * the real, keyboard-accessible control is always the input itself.
 */
export function FileDrop(props: {
  readonly label: string;
  readonly dropText: string;
  readonly hint: string;
  readonly accept: string;
  readonly multiple?: boolean;
  readonly disabled?: boolean;
  readonly onFiles: (files: File[]) => void;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const take = (list: FileList | null | undefined) => {
    const files = Array.from(list ?? []);
    if (files.length > 0) props.onFiles(props.multiple === true ? files : files.slice(0, 1));
  };

  return (
    <div
      class="dropzone"
      data-dragging={dragging}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => {
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (props.disabled !== true) take(event.dataTransfer?.files);
      }}
    >
      <Icon name="upload" class="dropzone__icon" />
      <input
        id={id}
        class="visually-hidden"
        type="file"
        accept={props.accept}
        multiple={props.multiple === true}
        disabled={props.disabled === true}
        aria-describedby={`${id}-hint`}
        onChange={(event) => {
          take(event.currentTarget.files);
          event.currentTarget.value = '';
        }}
      />
      <label for={id} class="button button--primary">
        {props.label}
      </label>
      <span class="dropzone__or">{props.dropText}</span>
      <p id={`${id}-hint`} class="hint">
        {props.hint}
      </p>
    </div>
  );
}
