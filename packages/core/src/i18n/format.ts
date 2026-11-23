import { LOCALE_INFO, type Locale, type TextDirection } from './locales.ts';
import type { Message, MessageParams, ParamValue } from './message.ts';

/**
 * A small, strict implementation of the ICU MessageFormat subset that natural translations
 * need: `{name}` arguments, `plural` (with `=n` exact matches, `offset:` and `#`) and
 * `select`, following ICU's apostrophe rules so that French and Turkish apostrophes stay
 * literal unless they quote syntax characters.
 */

type Part = string | ArgumentPart | PoundPart | PluralPart | SelectPart;

interface ArgumentPart {
  readonly type: 'argument';
  readonly name: string;
}

interface PoundPart {
  readonly type: 'pound';
}

interface PluralPart {
  readonly type: 'plural';
  readonly name: string;
  readonly offset: number;
  readonly options: ReadonlyMap<string, readonly Part[]>;
}

interface SelectPart {
  readonly type: 'select';
  readonly name: string;
  readonly options: ReadonlyMap<string, readonly Part[]>;
}

export class MessageSyntaxError extends Error {
  override readonly name = 'MessageSyntaxError';
}

class Parser {
  readonly #source: string;
  #index = 0;

  constructor(source: string) {
    this.#source = source;
  }

  parse(): readonly Part[] {
    const parts = this.#message(false, false);
    if (this.#index < this.#source.length) this.#fail('unexpected "}"');
    return parts;
  }

  #message(inPlural: boolean, nested: boolean): Part[] {
    const source = this.#source;
    const parts: Part[] = [];
    let text = '';
    const flush = () => {
      if (text !== '') parts.push(text);
      text = '';
    };

    while (this.#index < source.length) {
      const character = source.charAt(this.#index);
      if (character === '{') {
        flush();
        parts.push(this.#argument(inPlural));
      } else if (character === '}') {
        if (!nested) this.#fail('unexpected "}"');
        break;
      } else if (character === '#' && inPlural) {
        flush();
        parts.push({ type: 'pound' });
        this.#index++;
      } else if (character === "'") {
        text += this.#apostrophe(inPlural);
      } else {
        text += character;
        this.#index++;
      }
    }
    flush();
    return parts;
  }

  /** ICU apostrophe rules: `''` is an apostrophe; `'` quotes only before syntax characters. */
  #apostrophe(inPlural: boolean): string {
    const source = this.#source;
    const next = source.charAt(this.#index + 1);
    if (next === "'") {
      this.#index += 2;
      return "'";
    }
    if (next !== '{' && next !== '}' && !(inPlural && next === '#')) {
      this.#index++;
      return "'";
    }
    let quoted = '';
    this.#index++;
    while (this.#index < source.length) {
      const character = source.charAt(this.#index);
      if (character === "'") {
        if (source.charAt(this.#index + 1) === "'") {
          quoted += "'";
          this.#index += 2;
          continue;
        }
        this.#index++;
        return quoted;
      }
      quoted += character;
      this.#index++;
    }
    return quoted;
  }

  #argument(inPlural: boolean): Part {
    this.#expect('{');
    const name = this.#identifier();
    if (this.#peek() === '}') {
      this.#index++;
      return { type: 'argument', name };
    }
    this.#expect(',');
    const kind = this.#identifier();
    if (kind !== 'plural' && kind !== 'select') this.#fail(`unsupported argument type "${kind}"`);
    this.#expect(',');

    let offset = 0;
    this.#skipSpace();
    if (kind === 'plural' && this.#source.startsWith('offset:', this.#index)) {
      this.#index += 'offset:'.length;
      offset = Number(this.#token(/[0-9]/));
    }

    const options = new Map<string, readonly Part[]>();
    while (this.#peek() !== '}') {
      const selector = this.#selector();
      this.#expect('{');
      options.set(selector, this.#message(kind === 'plural' || inPlural, true));
      this.#expect('}');
    }
    this.#expect('}');
    if (!options.has('other')) this.#fail(`"${name}" needs an "other" option`);
    return kind === 'plural'
      ? { type: 'plural', name, offset, options }
      : { type: 'select', name, options };
  }

  #selector(): string {
    this.#skipSpace();
    if (this.#source.charAt(this.#index) === '=') {
      this.#index++;
      return `=${this.#token(/[0-9]/)}`;
    }
    return this.#identifier();
  }

  #identifier(): string {
    this.#skipSpace();
    return this.#token(/[\p{L}\p{N}_-]/u);
  }

  #token(pattern: RegExp): string {
    const start = this.#index;
    while (this.#index < this.#source.length && pattern.test(this.#source.charAt(this.#index))) {
      this.#index++;
    }
    if (start === this.#index) this.#fail('expected a name');
    return this.#source.slice(start, this.#index);
  }

  #peek(): string {
    this.#skipSpace();
    return this.#source.charAt(this.#index);
  }

  #expect(character: string): void {
    if (this.#peek() !== character) this.#fail(`expected "${character}"`);
    this.#index++;
  }

  #skipSpace(): void {
    while (/\s/.test(this.#source.charAt(this.#index))) this.#index++;
  }

  #fail(reason: string): never {
    throw new MessageSyntaxError(`${reason} at ${this.#index} in: ${this.#source}`);
  }
}

export function parseMessage(source: string): readonly Part[] {
  return new Parser(source).parse();
}

/** First Strong Isolate and Pop Directional Isolate: keep inserted text's direction intact. */
const FSI = String.fromCodePoint(0x2068);
const PDI = String.fromCodePoint(0x2069);

export function isolate(text: string): string {
  return `${FSI}${text}${PDI}`;
}

export interface Translator<K extends string> {
  readonly locale: Locale;
  readonly dir: TextDirection;
  /** Formats the catalog message `key`. */
  t(key: K, params?: MessageParams): string;
  /** Formats a message produced by the engine. */
  message(message: Message<K>): string;
  /** Formats one value (number, percentage, date…) the way this locale writes it. */
  value(value: ParamValue): string;
}

/**
 * Creates a translator over a complete catalog. Formatters and parsed messages are cached.
 * A missing parameter is rendered as `{name}` so the gap is visible rather than silent.
 */
export function createTranslator<K extends string>(
  locale: Locale,
  catalog: Readonly<Record<K, string>>,
): Translator<K> {
  const parsed = new Map<K, readonly Part[]>();
  const numberFormats = new Map<string, Intl.NumberFormat>();
  const pluralRules = new Intl.PluralRules(locale);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  const listFormat = new Intl.ListFormat(locale, { type: 'conjunction', style: 'long' });

  const numberFormat = (options: Intl.NumberFormatOptions): Intl.NumberFormat => {
    const cacheKey = JSON.stringify(options);
    let format = numberFormats.get(cacheKey);
    if (format === undefined) {
      format = new Intl.NumberFormat(locale, options);
      numberFormats.set(cacheKey, format);
    }
    return format;
  };

  const formatNumber = (value: number): string =>
    numberFormat({ maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);

  const value = (input: ParamValue): string => {
    if (typeof input === 'number') return formatNumber(input);
    if (typeof input === 'string') return isolate(input);
    switch (input.kind) {
      case 'percent': {
        const magnitude = Math.abs(input.value);
        const digits = magnitude !== 0 && magnitude < 0.1 ? 1 : 0;
        return numberFormat({
          style: 'percent',
          maximumFractionDigits: digits,
          signDisplay: input.signed === true ? 'exceptZero' : 'auto',
        }).format(input.value);
      }
      case 'decimal':
        return numberFormat({
          minimumFractionDigits: input.digits,
          maximumFractionDigits: input.digits,
          signDisplay: input.signed === true ? 'exceptZero' : 'auto',
        }).format(input.value);
      case 'date':
        return dateFormat.format(Date.parse(input.value));
      case 'dateRange':
        return dateFormat.formatRange(Date.parse(input.start), Date.parse(input.end));
      case 'list':
        return listFormat.format(input.values.map(isolate));
      case 'code':
        return isolate(input.value);
    }
  };

  const render = (parts: readonly Part[], params: MessageParams, pound: number | null): string => {
    let output = '';
    for (const part of parts) {
      if (typeof part === 'string') {
        output += part;
        continue;
      }
      switch (part.type) {
        case 'pound':
          output += pound === null ? '#' : formatNumber(pound);
          break;
        case 'argument': {
          const param = params[part.name];
          output += param === undefined ? `{${part.name}}` : value(param);
          break;
        }
        case 'plural': {
          const param = params[part.name];
          const count = typeof param === 'number' ? param : Number.NaN;
          const relative = count - part.offset;
          const branch =
            part.options.get(`=${count}`) ??
            part.options.get(Number.isNaN(count) ? 'other' : pluralRules.select(relative)) ??
            part.options.get('other') ??
            [];
          output += render(branch, params, relative);
          break;
        }
        case 'select': {
          const param = params[part.name];
          const branch =
            part.options.get(typeof param === 'string' ? param : '') ??
            part.options.get('other') ??
            [];
          output += render(branch, params, pound);
          break;
        }
      }
    }
    return output;
  };

  const t = (key: K, params: MessageParams = {}): string => {
    let parts = parsed.get(key);
    if (parts === undefined) {
      parts = parseMessage(catalog[key]);
      parsed.set(key, parts);
    }
    return render(parts, params, null);
  };

  return {
    locale,
    dir: LOCALE_INFO[locale].dir,
    t,
    message: (m) => t(m.key, m.params),
    value,
  };
}
