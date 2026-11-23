import {
  ASSISTANT_SUGGESTIONS,
  createMention,
  dateRange,
  isWebAddress,
  MENTION_CERTAINTY,
  MENTION_KINDS,
  MENTION_METHODS,
  mentionsToCsv,
  normalizeDraft,
  parseMentionLog,
  serializeMentionLog,
  summarizeMentions,
  validateMention,
  type AiMention,
  type Diagnostic,
  type FieldError,
  type MentionCertainty,
  type MentionDraft,
  type MentionField,
  type MentionKind,
  type MentionMethod,
} from '@searchunveil/core';
import type { ComponentChildren } from 'preact';
import { useId, useMemo, useRef, useState } from 'preact/hooks';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { DataTable } from '../components/DataTable.tsx';
import { DiagnosticList } from '../components/Diagnostics.tsx';
import { Icon } from '../components/Icon.tsx';
import { PageHeading } from '../components/PageHeading.tsx';
import { useAnnounce } from '../lib/announce.tsx';
import { localToday, nowIso } from '../lib/dates.ts';
import { downloadText } from '../lib/download.ts';
import { useI18n } from '../lib/i18n.tsx';
import { newId } from '../lib/ids.ts';
import { readStored, writeStored } from '../lib/storage.ts';

interface Form {
  readonly observedOn: string;
  readonly assistant: string;
  readonly kind: MentionKind;
  readonly citedUrl: string;
  readonly prompt: string;
  readonly excerpt: string;
  readonly evidenceUrl: string;
  readonly method: MentionMethod;
  readonly certainty: MentionCertainty;
  readonly notes: string;
}

const FIELD_ORDER: readonly MentionField[] = [
  'observedOn',
  'assistant',
  'kind',
  'citedUrl',
  'prompt',
  'excerpt',
  'evidenceUrl',
  'method',
  'certainty',
  'notes',
];

function emptyForm(today: string): Form {
  return {
    observedOn: today,
    assistant: '',
    kind: 'citation',
    citedUrl: '',
    prompt: '',
    excerpt: '',
    evidenceUrl: '',
    method: 'own-check',
    certainty: 'confirmed',
    notes: '',
  };
}

function toForm(mention: AiMention): Form {
  return {
    observedOn: mention.observedOn,
    assistant: mention.assistant,
    kind: mention.kind,
    citedUrl: mention.citedUrl ?? '',
    prompt: mention.prompt ?? '',
    excerpt: mention.excerpt ?? '',
    evidenceUrl: mention.evidenceUrl ?? '',
    method: mention.method,
    certainty: mention.certainty,
    notes: mention.notes ?? '',
  };
}

function loadMentions(today: string): AiMention[] {
  const stored = readStored('mentions');
  if (stored === null) return [];
  const parsed = parseMentionLog(stored, { today });
  return parsed.ok ? [...parsed.value] : [];
}

function byNewest(a: AiMention, b: AiMention): number {
  return b.observedOn.localeCompare(a.observedOn) || b.createdAt.localeCompare(a.createdAt);
}

type Confirm = { readonly kind: 'one'; readonly id: string } | { readonly kind: 'all' } | null;

export function MentionsView() {
  const { t, locale } = useI18n();
  const announce = useAnnounce();
  const id = useId();
  const today = localToday();
  const [mentions, setMentions] = useState<AiMention[]>(() => loadMentions(today).sort(byNewest));
  const [form, setForm] = useState<Form>(() => emptyForm(today));
  const [editing, setEditing] = useState<string | null>(null);
  const [errors, setErrors] = useState<readonly FieldError[]>([]);
  const [storageFailed, setStorageFailed] = useState(false);
  const [importDiagnostics, setImportDiagnostics] = useState<readonly Diagnostic[]>([]);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const summary = useMemo(() => summarizeMentions(mentions), [mentions]);

  const persist = (next: AiMention[]) => {
    const sorted = [...next].sort(byNewest);
    setMentions(sorted);
    setStorageFailed(!writeStored('mentions', serializeMentionLog(sorted, nowIso())));
  };

  const fieldId = (field: MentionField) => `${id}-${field}`;
  const errorFor = (field: MentionField) => errors.find((error) => error.field === field);
  const update = (field: keyof Form) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    const draft: MentionDraft = normalizeDraft(form);
    const found = validateMention(draft, today);
    setErrors(found);
    if (found.length > 0) {
      announce(t.t('ui.mentions.fix'));
      const first = FIELD_ORDER.find((field) => found.some((error) => error.field === field));
      if (first !== undefined) document.getElementById(fieldId(first))?.focus();
      return;
    }
    const now = nowIso();
    if (editing === null) {
      persist([...mentions, createMention(draft, newId(), now)]);
    } else {
      persist(
        mentions.map((mention) =>
          mention.id === editing
            ? { ...mention, ...normalizeDraft(draft), updatedAt: now }
            : mention,
        ),
      );
    }
    setEditing(null);
    setForm(emptyForm(today));
    announce(t.t('ui.mentions.saved'));
    formHeading.current?.focus();
  };

  const importLog = async (file: File | undefined) => {
    if (file === undefined) return;
    const parsed = parseMentionLog(await file.text(), { today });
    setImportDiagnostics(parsed.diagnostics);
    if (!parsed.ok) return;
    const known = new Set(mentions.map((mention) => mention.id));
    const added = parsed.value.filter((mention) => !known.has(mention.id));
    persist([...mentions, ...added]);
    announce(t.t('ui.mentions.imported', { count: added.length }));
  };

  const monthFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

  return (
    <>
      <PageHeading lead={t.t('ui.mentions.lead')}>{t.t('ui.mentions.title')}</PageHeading>
      <p class="callout">{t.t('mentions.limit.scope')}</p>
      {storageFailed ? (
        <p class="alert" role="alert">
          {t.t('ui.mentions.storage-error')}
        </p>
      ) : null}

      <form
        class="panel form"
        noValidate
        aria-labelledby={`${id}-form-title`}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <h2 id={`${id}-form-title`} ref={formHeading} tabIndex={-1}>
          {t.t(editing === null ? 'ui.mentions.add' : 'ui.mentions.edit-title')}
        </h2>
        {errors.length > 0 ? <p class="alert">{t.t('ui.mentions.fix')}</p> : null}
        <div class="form-grid">
          <Field
            id={fieldId('observedOn')}
            label={t.t('ui.mentions.observedOn')}
            error={errorFor('observedOn')}
          >
            {(props) => (
              <input
                {...props}
                type="date"
                max={today}
                required
                value={form.observedOn}
                onInput={(event) => {
                  update('observedOn')(event.currentTarget.value);
                }}
              />
            )}
          </Field>
          <Field
            id={fieldId('assistant')}
            label={t.t('ui.mentions.assistant')}
            hint={t.t('ui.mentions.assistant.hint')}
            error={errorFor('assistant')}
          >
            {(props) => (
              <>
                <input
                  {...props}
                  type="text"
                  list={`${id}-assistants`}
                  required
                  maxLength={80}
                  value={form.assistant}
                  onInput={(event) => {
                    update('assistant')(event.currentTarget.value);
                  }}
                />
                <datalist id={`${id}-assistants`}>
                  {ASSISTANT_SUGGESTIONS.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
          <Choice
            id={fieldId('kind')}
            legend={t.t('ui.mentions.kind')}
            name={`${id}-kind`}
            options={MENTION_KINDS.map((kind) => ({
              value: kind,
              label: t.t(`mentions.kind.${kind}`),
            }))}
            value={form.kind}
            onChange={update('kind')}
          />
          <Field
            id={fieldId('citedUrl')}
            label={t.t('ui.mentions.citedUrl')}
            hint={t.t('ui.mentions.citedUrl.hint')}
            error={errorFor('citedUrl')}
            optional={form.kind !== 'citation'}
          >
            {(props) => (
              <input
                {...props}
                type="url"
                inputMode="url"
                dir="ltr"
                placeholder="https://"
                value={form.citedUrl}
                onInput={(event) => {
                  update('citedUrl')(event.currentTarget.value);
                }}
              />
            )}
          </Field>
          <Field
            id={fieldId('prompt')}
            label={t.t('ui.mentions.prompt')}
            error={errorFor('prompt')}
            optional
            wide
          >
            {(props) => (
              <textarea
                {...props}
                rows={2}
                dir="auto"
                value={form.prompt}
                onInput={(event) => {
                  update('prompt')(event.currentTarget.value);
                }}
              />
            )}
          </Field>
          <Field
            id={fieldId('excerpt')}
            label={t.t('ui.mentions.excerpt')}
            error={errorFor('excerpt')}
            optional
            wide
          >
            {(props) => (
              <textarea
                {...props}
                rows={3}
                dir="auto"
                value={form.excerpt}
                onInput={(event) => {
                  update('excerpt')(event.currentTarget.value);
                }}
              />
            )}
          </Field>
          <Field
            id={fieldId('evidenceUrl')}
            label={t.t('ui.mentions.evidenceUrl')}
            hint={t.t('ui.mentions.evidenceUrl.hint')}
            error={errorFor('evidenceUrl')}
            optional
          >
            {(props) => (
              <input
                {...props}
                type="url"
                inputMode="url"
                dir="ltr"
                placeholder="https://"
                value={form.evidenceUrl}
                onInput={(event) => {
                  update('evidenceUrl')(event.currentTarget.value);
                }}
              />
            )}
          </Field>
          <Field
            id={fieldId('method')}
            label={t.t('ui.mentions.method')}
            error={errorFor('method')}
          >
            {(props) => (
              <select
                {...props}
                value={form.method}
                onChange={(event) => {
                  update('method')(event.currentTarget.value);
                }}
              >
                {MENTION_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {t.t(`mentions.method.${method}`)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Choice
            id={fieldId('certainty')}
            legend={t.t('ui.mentions.certainty')}
            name={`${id}-certainty`}
            options={MENTION_CERTAINTY.map((value) => ({
              value,
              label: t.t(`mentions.certainty.${value}`),
            }))}
            value={form.certainty}
            onChange={update('certainty')}
          />
          <Field
            id={fieldId('notes')}
            label={t.t('ui.mentions.notes')}
            error={errorFor('notes')}
            optional
            wide
          >
            {(props) => (
              <textarea
                {...props}
                rows={2}
                dir="auto"
                value={form.notes}
                onInput={(event) => {
                  update('notes')(event.currentTarget.value);
                }}
              />
            )}
          </Field>
        </div>
        <div class="actions">
          <button type="submit" class="button button--primary">
            {t.t(editing === null ? 'ui.mentions.save' : 'ui.mentions.update')}
          </button>
          {editing === null ? null : (
            <button
              type="button"
              class="button"
              onClick={() => {
                setEditing(null);
                setErrors([]);
                setForm(emptyForm(today));
              }}
            >
              {t.t('ui.mentions.cancel')}
            </button>
          )}
        </div>
      </form>

      <section class="section" aria-labelledby={`${id}-list`}>
        <h2 id={`${id}-list`} ref={listHeading} tabIndex={-1}>
          {t.t('ui.mentions.list')}
        </h2>
        {mentions.length === 0 ? (
          <p class="muted">{t.t('ui.mentions.empty')}</p>
        ) : (
          <ul class="mention-list" role="list">
            {mentions.map((mention) => (
              <li key={mention.id} class="mention">
                <MentionEntry
                  mention={mention}
                  onEdit={() => {
                    setEditing(mention.id);
                    setErrors([]);
                    setForm(toForm(mention));
                    formHeading.current?.focus();
                  }}
                  onDelete={() => {
                    setConfirm({ kind: 'one', id: mention.id });
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {mentions.length === 0 ? null : (
        <section class="section" aria-labelledby={`${id}-summary`}>
          <h2 id={`${id}-summary`}>{t.t('ui.mentions.summary')}</h2>
          <dl class="stats">
            <div>
              <dt>{t.t('ui.mentions.total')}</dt>
              <dd>{t.value(summary.total)}</dd>
            </div>
            <div>
              <dt>{t.t('ui.mentions.citations')}</dt>
              <dd>{t.value(summary.citations)}</dd>
            </div>
            <div>
              <dt>{t.t('ui.mentions.uncertain')}</dt>
              <dd>{t.value(summary.uncertain)}</dd>
            </div>
            {summary.firstObserved === null || summary.lastObserved === null ? null : (
              <div>
                <dt>{t.t('ui.mentions.period')}</dt>
                <dd>{t.value(dateRange(summary.firstObserved, summary.lastObserved))}</dd>
              </div>
            )}
          </dl>
          <div class="summary-tables">
            <DataTable
              caption={t.t('ui.mentions.by-assistant')}
              columns={[
                { label: t.t('ui.mentions.assistant') },
                { label: t.t('ui.mentions.count'), numeric: true },
              ]}
              rows={summary.byAssistant.map((row) => [
                <bdi key="name">{row.value}</bdi>,
                t.value(row.count),
              ])}
            />
            <DataTable
              caption={t.t('ui.mentions.by-month')}
              columns={[
                { label: t.t('ui.table.date') },
                { label: t.t('ui.mentions.count'), numeric: true },
              ]}
              rows={summary.byMonth.map((row) => [
                monthFormat.format(Date.parse(`${row.value}-01`)),
                t.value(row.count),
              ])}
            />
            {summary.citedPages.length === 0 ? null : (
              <DataTable
                caption={t.t('ui.mentions.cited-pages')}
                columns={[
                  { label: t.t('table.page') },
                  { label: t.t('ui.mentions.count'), numeric: true },
                ]}
                rows={summary.citedPages.map((row) => [
                  <code key="url" dir="ltr">
                    {row.value}
                  </code>,
                  t.value(row.count),
                ])}
              />
            )}
          </div>
        </section>
      )}

      <section class="section" aria-labelledby={`${id}-export`}>
        <h2 id={`${id}-export`}>{t.t('ui.mentions.export')}</h2>
        <div class="actions">
          <button
            type="button"
            class="button"
            disabled={mentions.length === 0}
            onClick={() => {
              downloadText(
                `searchunveil-ai-mentions-${today}.json`,
                serializeMentionLog(mentions, nowIso()),
                'application/json',
              );
            }}
          >
            <Icon name="download" />
            {t.t('ui.mentions.export.json')}
          </button>
          <button
            type="button"
            class="button"
            disabled={mentions.length === 0}
            onClick={() => {
              downloadText(
                `searchunveil-ai-mentions-${today}.csv`,
                mentionsToCsv(mentions),
                'text/csv',
              );
            }}
          >
            <Icon name="download" />
            {t.t('ui.mentions.export.csv')}
          </button>
          <label class="button" for={`${id}-import`}>
            <Icon name="upload" />
            {t.t('ui.mentions.import')}
          </label>
          <input
            id={`${id}-import`}
            class="visually-hidden"
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              void importLog(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }}
          />
          <button
            type="button"
            class="button button--danger"
            disabled={mentions.length === 0}
            onClick={() => {
              setConfirm({ kind: 'all' });
            }}
          >
            <Icon name="trash" />
            {t.t('ui.mentions.clear')}
          </button>
        </div>
        {importDiagnostics.length === 0 ? null : <DiagnosticList diagnostics={importDiagnostics} />}
      </section>

      <ConfirmDialog
        open={confirm !== null}
        message={
          confirm?.kind === 'all'
            ? t.t('ui.mentions.clear.confirm', { count: mentions.length })
            : t.t('ui.mentions.delete.confirm')
        }
        confirmLabel={t.t(confirm?.kind === 'all' ? 'ui.mentions.clear' : 'ui.mentions.delete')}
        onCancel={() => {
          setConfirm(null);
        }}
        onConfirm={() => {
          if (confirm?.kind === 'all') persist([]);
          else if (confirm?.kind === 'one')
            persist(mentions.filter((mention) => mention.id !== confirm.id));
          setConfirm(null);
          announce(t.t('ui.mentions.deleted'));
          listHeading.current?.focus();
        }}
      />
    </>
  );
}

interface ControlProps {
  readonly id: string;
  readonly 'aria-invalid': boolean;
  readonly 'aria-describedby'?: string;
}

function Field(props: {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly error: FieldError | undefined;
  readonly optional?: boolean;
  readonly wide?: boolean;
  readonly children: (control: ControlProps) => ComponentChildren;
}) {
  const { t } = useI18n();
  const described = [
    props.hint === undefined ? null : `${props.id}-hint`,
    props.error === undefined ? null : `${props.id}-error`,
  ].filter((value): value is string => value !== null);
  const control: ControlProps =
    described.length === 0
      ? { id: props.id, 'aria-invalid': props.error !== undefined }
      : {
          id: props.id,
          'aria-invalid': props.error !== undefined,
          'aria-describedby': described.join(' '),
        };
  return (
    <div class={props.wide === true ? 'field field--wide' : 'field'}>
      <label for={props.id}>
        {props.label}
        {props.optional === true ? (
          <span class="optional"> ({t.t('ui.mentions.optional')})</span>
        ) : null}
      </label>
      {props.hint === undefined ? null : (
        <p id={`${props.id}-hint`} class="hint">
          {props.hint}
        </p>
      )}
      {props.children(control)}
      {props.error === undefined ? null : (
        <p id={`${props.id}-error`} class="field-error">
          <Icon name="attention" />
          {t.t(`mentions.error.${props.error.code}`, { max: props.error.max ?? 0 })}
        </p>
      )}
    </div>
  );
}

function Choice<T extends string>(props: {
  readonly id: string;
  readonly legend: string;
  readonly name: string;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}) {
  return (
    <fieldset id={props.id} class="field choice" tabIndex={-1}>
      <legend>{props.legend}</legend>
      {props.options.map((option) => (
        <label key={option.value} class="choice__option">
          <input
            type="radio"
            name={props.name}
            value={option.value}
            checked={props.value === option.value}
            onChange={() => {
              props.onChange(option.value);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function MentionEntry(props: {
  readonly mention: AiMention;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}) {
  const { t } = useI18n();
  const { mention } = props;
  const link = (url: string | null) =>
    url !== null && isWebAddress(url) ? (
      <a href={url} target="_blank" rel="noopener noreferrer" dir="ltr">
        {url}
        <span class="visually-hidden"> {t.t('ui.finding.new-tab')}</span>
      </a>
    ) : null;
  return (
    <article
      aria-label={`${mention.assistant}, ${t.value({ kind: 'date', value: mention.observedOn })}`}
    >
      <div class="mention__head">
        <strong>
          <bdi>{mention.assistant}</bdi>
        </strong>
        <span class="muted">{t.value({ kind: 'date', value: mention.observedOn })}</span>
        <span class="tag">{t.t(`mentions.kind.${mention.kind}`)}</span>
        <span class={mention.certainty === 'uncertain' ? 'tag tag--uncertain' : 'tag'}>
          {t.t(`mentions.certainty.${mention.certainty}`)}
        </span>
      </div>
      {mention.citedUrl === null ? null : <p class="mention__url">{link(mention.citedUrl)}</p>}
      {mention.prompt === null ? null : (
        <p>
          <span class="muted">{t.t('ui.mentions.prompt')}: </span>
          <bdi>{mention.prompt}</bdi>
        </p>
      )}
      {mention.excerpt === null ? null : <blockquote dir="auto">{mention.excerpt}</blockquote>}
      <p class="muted">{t.t(`mentions.method.${mention.method}`)}</p>
      {mention.evidenceUrl === null ? null : (
        <p class="mention__url">{link(mention.evidenceUrl)}</p>
      )}
      {mention.notes === null ? null : <p dir="auto">{mention.notes}</p>}
      <div class="actions actions--compact">
        <button type="button" class="button button--small" onClick={props.onEdit}>
          <Icon name="edit" />
          {t.t('ui.mentions.edit')}
        </button>
        <button type="button" class="button button--small button--danger" onClick={props.onDelete}>
          <Icon name="trash" />
          {t.t('ui.mentions.delete')}
        </button>
      </div>
    </article>
  );
}
