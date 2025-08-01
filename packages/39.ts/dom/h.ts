import { eventBus } from '../core/eventBus.js';
import { defaultClassNames } from './defaultClassNames.js';
import { Signal } from "../@types/state.js";

export interface ElementProps {
  className?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  dispatch?: string;
  util?: string[];
  text?: string;
  [key: string]: unknown;
}

export type Children = string | number | boolean | null | undefined | HTMLElement | Signal<any> | Children[];

export type EventHandler<E extends Event = Event> = (event: E) => void;

export interface DOMAdapter {
  createElement(tag: string): HTMLElement;
  createTextNode(text: string): Text;
}

export const webDOMAdapter: DOMAdapter = {
  createElement: (tag: string) => {
    if (typeof document === 'undefined' || !document.createElement) {
      throw new Error('document is not defined. Provide a DOMAdapter for this environment.');
    }
    return document.createElement(tag);
  },
  createTextNode: (text: string) => {
    if (typeof document === 'undefined' || !document.createTextNode) {
      throw new Error('document is not defined. Provide a DOMAdapter for this environment.');
    }
    return document.createTextNode(text);
  }
};

export const noopDOMAdapter: DOMAdapter = {
  createElement: (tag: string) => {
    throw new Error('No DOM available: tried to createElement("' + tag + '") in a non-DOM environment.');
  },
  createTextNode: (text: string) => {
    throw new Error('No DOM available: tried to createTextNode in a non-DOM environment.');
  }
};

let currentDOMAdapter: DOMAdapter = webDOMAdapter;

export function setDOMAdapter(adapter: DOMAdapter): void {
  currentDOMAdapter = adapter;
}


export function h(
    tag: keyof HTMLElementTagNameMap,
    props: ElementProps = {},
    children: Children[] = []
): HTMLElement {
  if (tag === null) {
    throw new Error(`Invalid tag: expected string, got ${typeof tag}`);
  }
  if (typeof tag !== 'string') {
    throw new Error(`Invalid tag: expected string, got ${typeof tag}`);
  }
  if (props !== null && typeof props !== 'object') {
    throw new Error(`Invalid props: expected object or null, got ${typeof props}`);
  }

  const element = currentDOMAdapter.createElement(tag);
  applyProps(element, props, tag as string);
  appendChildren(element, children);
  return element;
}

function applyProps(element: HTMLElement, props: ElementProps, tag: string) {
  const { dispatch, className, style, util, text, ...attrs } = props;

  if (className) {
    element.className = className;
  } else if (tag in defaultClassNames) {
    const def = (defaultClassNames as any)[tag];
    if (def) element.className = def;
  }

  if (util && Array.isArray(util)) {
    element.className += (element.className ? ' ' : '') + util.join(' ');
  }

  if (style && typeof style === 'object') {
    Object.assign(element.style, style);
  }

  if (text !== undefined) {
    element.textContent = String(text);
  }

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, (evt) => {
        (value as EventHandler)(evt);
        if (dispatch) {
          eventBus.emit(dispatch, evt);
        }
      });
    } else {
      element.setAttribute(key, String(value));
    }
  }
}

function appendChildren(element: HTMLElement, children: Children[]) {
  for (const c of children) appendChild(element, c);
}

function appendChild(element: HTMLElement, child: Children) {
  if (Array.isArray(child)) {
    appendChildren(element, child);
  } else if (child instanceof HTMLElement) {
    element.appendChild(child);
  } else if (isSignal(child)) {
    const textNode = currentDOMAdapter.createTextNode(String(child.get()));
    element.appendChild(textNode);
    child.subscribe((v) => {
      textNode.textContent = String(v);
    });
  } else if (child !== null && child !== undefined && child !== false) {
    const textNode = currentDOMAdapter.createTextNode(String(child));
    element.appendChild(textNode);
  }
}

function isSignal(x: unknown): x is Signal<unknown> {
  return typeof x === 'object' && x !== null
      && typeof (x as any).get === 'function'
      && typeof (x as any).set === 'function'
      && typeof (x as any).subscribe === 'function';
}

/** @deprecated Use ElementProps instead */
export type Props = ElementProps;
