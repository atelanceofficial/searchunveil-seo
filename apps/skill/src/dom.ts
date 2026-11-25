import { parse, type DefaultTreeAdapterMap } from 'parse5';

/**
 * Just enough of the DOM for the engine's page review, built from parse5: a parser that follows
 * the HTML standard, as browsers do. The review depends on exact parsing (a stray tag ends the
 * `<head>` and pushes what follows into the body), so a lenient parser would change its findings.
 * The full DOM of a browser is not needed, and the skill must stay small and text only.
 *
 * Parsing follows `DOMParser`, which the web app uses: scripting off, so `<noscript>` content is
 * parsed as markup, and template contents are not part of the tree.
 */

type SourceNode = DefaultTreeAdapterMap['childNode'];

const HTML_NS = 'http://www.w3.org/1999/xhtml';
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const SHOW_ELEMENT = 0x1;
const SHOW_TEXT = 0x4;

interface Attribute {
  readonly name: string;
  readonly value: string;
}

abstract class MiniNode {
  abstract readonly nodeType: number;
  abstract readonly nodeValue: string | null;
  parentNode: MiniParent | null = null;

  get parentElement(): MiniElement | null {
    return this.parentNode instanceof MiniElement ? this.parentNode : null;
  }
}

class MiniText extends MiniNode {
  readonly nodeType = TEXT_NODE;
  readonly data: string;
  readonly nodeValue: string;
  readonly textContent: string;

  constructor(data: string) {
    super();
    this.data = data;
    this.nodeValue = data;
    this.textContent = data;
  }
}

class MiniComment extends MiniNode {
  readonly nodeType = COMMENT_NODE;
  readonly data: string;
  readonly nodeValue: string;
  readonly textContent: string;

  constructor(data: string) {
    super();
    this.data = data;
    this.nodeValue = data;
    this.textContent = data;
  }
}

/** One simple selector: a tag name, optionally with an attribute that must be present. */
interface Simple {
  readonly tag: string;
  readonly attribute: string | null;
}

const selectorCache = new Map<string, readonly Simple[]>();

/** Reads selector lists such as `title, meta[name], link[rel]`, the only kind the review uses. */
function compile(selectors: string): readonly Simple[] {
  let compiled = selectorCache.get(selectors);
  if (compiled !== undefined) return compiled;
  compiled = selectors.split(',').map((part) => {
    const match = /^\s*([a-z][a-z0-9]*)(?:\[([a-z][a-z0-9-]*)\])?\s*$/i.exec(part);
    if (match === null) throw new SyntaxError(`Unsupported selector: ${part.trim()}`);
    return { tag: (match[1] ?? '').toLowerCase(), attribute: match[2]?.toLowerCase() ?? null };
  });
  selectorCache.set(selectors, compiled);
  return compiled;
}

abstract class MiniParent extends MiniNode {
  readonly childNodes: MiniNode[] = [];

  /** Every descendant, in document order. */
  *descendants(): Generator<MiniNode> {
    const stack: MiniNode[] = [...this.childNodes].reverse();
    for (let node = stack.pop(); node !== undefined; node = stack.pop()) {
      yield node;
      if (node instanceof MiniParent) {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          const child = node.childNodes[i];
          if (child !== undefined) stack.push(child);
        }
      }
    }
  }

  *elements(): Generator<MiniElement> {
    for (const node of this.descendants()) if (node instanceof MiniElement) yield node;
  }

  querySelectorAll(selectors: string): MiniElement[] {
    const simple = compile(selectors);
    return [...this.elements()].filter((element) =>
      simple.some(
        ({ tag, attribute }) =>
          element.localName === tag && (attribute === null || element.hasAttribute(attribute)),
      ),
    );
  }

  querySelector(selectors: string): MiniElement | null {
    return this.querySelectorAll(selectors)[0] ?? null;
  }

  getElementsByTagName(name: string): MiniElement[] {
    const lower = name.toLowerCase();
    return [...this.elements()].filter((element) =>
      element.namespaceURI === HTML_NS ? element.localName === lower : element.localName === name,
    );
  }

  get lastElementChild(): MiniElement | null {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      const child = this.childNodes[i];
      if (child instanceof MiniElement) return child;
    }
    return null;
  }

  /** Whether `node` is this node or one of its descendants. */
  contains(node: MiniNode | null): boolean {
    for (let current = node; current !== null; current = current.parentNode) {
      if (current === this) return true;
    }
    return false;
  }
}

class MiniElement extends MiniParent {
  readonly nodeType = ELEMENT_NODE;
  readonly nodeValue = null;
  readonly localName: string;
  readonly namespaceURI: string;
  readonly attributes: readonly Attribute[];

  constructor(localName: string, namespaceURI: string, attributes: readonly Attribute[]) {
    super();
    this.localName = localName;
    this.namespaceURI = namespaceURI;
    this.attributes = attributes;
  }

  #find(name: string): Attribute | undefined {
    const wanted = this.namespaceURI === HTML_NS ? name.toLowerCase() : name;
    return this.attributes.find((attribute) => attribute.name === wanted);
  }

  getAttribute(name: string): string | null {
    return this.#find(name)?.value ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.#find(name) !== undefined;
  }

  get textContent(): string {
    let text = '';
    for (const node of this.descendants()) if (node instanceof MiniText) text += node.data;
    return text;
  }
}

class MiniDocument extends MiniParent {
  readonly nodeType = DOCUMENT_NODE;
  readonly nodeValue = null;
  readonly textContent = null;

  get documentElement(): MiniElement {
    const root = this.childNodes.find((node) => node instanceof MiniElement);
    if (!(root instanceof MiniElement)) throw new Error('The document has no root element.');
    return root;
  }

  #child(names: readonly string[]): MiniElement | null {
    const found = this.documentElement.childNodes.find(
      (node) =>
        node instanceof MiniElement &&
        node.namespaceURI === HTML_NS &&
        names.includes(node.localName),
    );
    return found instanceof MiniElement ? found : null;
  }

  get head(): MiniElement | null {
    return this.#child(['head']);
  }

  get body(): MiniElement | null {
    return this.#child(['body', 'frameset']);
  }

  getElementById(id: string): MiniElement | null {
    if (id === '') return null;
    for (const element of this.elements()) if (element.getAttribute('id') === id) return element;
    return null;
  }

  /** Walks `root`'s descendants in document order, showing elements, text or both. */
  createTreeWalker(root: MiniParent, whatToShow: number): { nextNode(): MiniNode | null } {
    const nodes = root.descendants();
    const shown = (node: MiniNode) =>
      (node.nodeType === ELEMENT_NODE && (whatToShow & SHOW_ELEMENT) !== 0) ||
      (node.nodeType === TEXT_NODE && (whatToShow & SHOW_TEXT) !== 0);
    return {
      nextNode() {
        for (let next = nodes.next(); next.done !== true; next = nodes.next()) {
          if (shown(next.value)) return next.value;
        }
        return null;
      },
    };
  }
}

/** The attribute's qualified name, as the DOM's `getAttribute` matches it: `xlink:href`, not `href`. */
function attributesOf(source: DefaultTreeAdapterMap['element']): Attribute[] {
  return source.attrs.map(({ name, value, prefix }) => ({
    name: prefix === undefined || prefix === '' ? name : `${prefix}:${name}`,
    value,
  }));
}

/** Copies parse5's tree, without recursion, so that deeply nested pages cannot exhaust the stack. */
function build(source: DefaultTreeAdapterMap['document']): MiniDocument {
  const document = new MiniDocument();
  const pending: { from: readonly SourceNode[]; to: MiniParent }[] = [
    { from: source.childNodes, to: document },
  ];
  for (let job = pending.pop(); job !== undefined; job = pending.pop()) {
    for (const node of job.from) {
      let copy: MiniNode | null = null;
      if (node.nodeName === '#text' && 'value' in node) copy = new MiniText(node.value);
      else if (node.nodeName === '#comment' && 'data' in node) copy = new MiniComment(node.data);
      else if ('tagName' in node) {
        const element = new MiniElement(node.tagName, node.namespaceURI, attributesOf(node));
        // A template's contents live in a separate fragment, outside the tree, as in the DOM.
        pending.push({ from: node.childNodes, to: element });
        copy = element;
      }
      if (copy === null) continue;
      copy.parentNode = job.to;
      job.to.childNodes.push(copy);
    }
  }
  return document;
}

/**
 * Parses HTML the way `DOMParser` does, into a document the engine's page review can read. The
 * result has only the parts of the DOM the review uses; anything else is missing.
 */
export function parseHtml(html: string): Document {
  return build(parse(html, { scriptingEnabled: false })) as unknown as Document;
}
