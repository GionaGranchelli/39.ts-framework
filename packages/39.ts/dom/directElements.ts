/**
 * Direct Element Builders
 * 
 * High-performance element creation with direct signal-to-DOM binding.
 * Replaces the virtual DOM h() system with direct DOM manipulation.
 */

import { Signal } from '../@types/state.js';
import { 
  getDirectDOMAdapter, 
  createDOMBinding, 
  cleanupDOMBindings,
  createBoundTextNode 
} from './directDOM.js';
import { eventBus } from '../core/eventBus.js';
import { defaultClassNames } from './defaultClassNames.js';

export type DirectChildren = string | number | boolean | null | undefined | HTMLElement | Text | Signal<any> | DirectChildren[];

export interface DirectElementProps {
  className?: string | Signal<string>;
  style?: Partial<CSSStyleDeclaration> | Record<string, string | Signal<string>>;
  dispatch?: string;
  util?: string[];
  text?: string | Signal<string>;
  [key: string]: unknown;
}

export type DirectEventHandler<E extends Event = Event> = (event: E) => void;

/**
 * Create an element with direct DOM binding (replaces h() function)
 */
export function createDirectElement(
  tag: keyof HTMLElementTagNameMap,
  props: DirectElementProps = {},
  children: DirectChildren[] = []
): HTMLElement {
  if (typeof tag !== 'string') {
    throw new Error(`Invalid tag: expected string, got ${typeof tag}`);
  }
  if (props !== null && typeof props !== 'object') {
    throw new Error(`Invalid props: expected object or null, got ${typeof props}`);
  }

  const adapter = getDirectDOMAdapter();
  const element = adapter.createElement(tag);
  
  // Apply default classes if no className provided
  const { dispatch, className, style, util, text, ...attrs } = props;
  
  // Handle className (can be static or signal)
  if (className) {
    if (isSignal(className)) {
      createDOMBinding(element, className, 'className');
    } else {
      element.className = className;
    }
  } else if (tag in defaultClassNames) {
    const defaultClass = (defaultClassNames as any)[tag];
    if (defaultClass) element.className = defaultClass;
  }

  // Handle utility classes
  if (util && Array.isArray(util)) {
    const utilClasses = util.join(' ');
    if (className) {
      if (isSignal(className)) {
        // For signal className, we need to combine with utils using a transform
        createDOMBinding(element, className, 'className', (value) => `${value} ${utilClasses}`);
      } else {
        element.className = `${className} ${utilClasses}`;
      }
    } else {
      element.className = utilClasses;
    }
  } else if (className) {
    // Handle className without utility classes
    if (isSignal(className)) {
      createDOMBinding(element, className, 'className');
    } else {
      element.className = className;
    }
  }

  // Handle styles (can be static or contain signals)
  if (style && typeof style === 'object') {
    for (const [styleProp, styleValue] of Object.entries(style)) {
      if (isSignal(styleValue)) {
        createDOMBinding(element, styleValue, `style.${styleProp}`);
      } else {
        (element.style as any)[styleProp] = styleValue;
      }
    }
  }

  // Handle text content (can be static or signal)
  if (text !== undefined) {
    if (isSignal(text)) {
      createDOMBinding(element, text, 'textContent');
    } else {
      element.textContent = String(text);
    }
  }

  // Handle other attributes and events
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    
    if (key.startsWith('on') && typeof value === 'function') {
      // Event handler
      const eventName = key.slice(2).toLowerCase();
      const handler = (evt: Event) => {
        (value as DirectEventHandler)(evt);
        if (dispatch) {
          eventBus.emit(dispatch, evt);
        }
      };
      adapter.addEventListener(element, eventName, handler);
    } else if (isSignal(value)) {
      // Signal-bound attribute
      createDOMBinding(element, value, key);
    } else {
      // Static attribute
      adapter.setAttribute(element, key, String(value));
    }
  }

  // Append children
  appendDirectChildren(element, children);
  
  return element;
}

/**
 * Append children to an element using direct DOM manipulation
 */
function appendDirectChildren(element: HTMLElement, children: DirectChildren[]): void {
  for (const child of children) {
    appendDirectChild(element, child);
  }
}

/**
 * Append a single child to an element
 */
function appendDirectChild(element: HTMLElement, child: DirectChildren): void {
  if (Array.isArray(child)) {
    appendDirectChildren(element, child);
  } else if (child instanceof HTMLElement || child instanceof Text) {
    element.appendChild(child);
  } else if (isSignal(child)) {
    // Create a bound text node for signal content
    const textNode = createBoundTextNode(child);
    element.appendChild(textNode);
  } else if (child !== null && child !== undefined && child !== false) {
    // Static text content
    const textNode = getDirectDOMAdapter().createTextNode(String(child));
    element.appendChild(textNode);
  }
}

/**
 * Helper function to check if a value is a signal
 */
function isSignal(value: unknown): value is Signal<unknown> {
  return typeof value === 'object' && value !== null
    && typeof (value as any).get === 'function'
    && typeof (value as any).set === 'function'
    && typeof (value as any).subscribe === 'function';
}

// Direct element builder functions (replaces h() with individual tag functions)

export function Div(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('div', props, children);
}

export function Span(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('span', props, children);
}

export function Button(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('button', props, children);
}

export function Input(props?: DirectElementProps): HTMLElement {
  return createDirectElement('input', props);
}

export function Form(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('form', props, children);
}

export function Label(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('label', props, children);
}

export function H1(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('h1', props, children);
}

export function H2(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('h2', props, children);
}

export function H3(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('h3', props, children);
}

export function P(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('p', props, children);
}

export function A(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('a', props, children);
}

export function Img(props?: DirectElementProps): HTMLElement {
  return createDirectElement('img', props);
}

export function Ul(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('ul', props, children);
}

export function Li(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('li', props, children);
}

export function Section(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('section', props, children);
}

export function Article(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('article', props, children);
}

export function Header(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('header', props, children);
}

export function Footer(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('footer', props, children);
}

export function Nav(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('nav', props, children);
}

export function Main(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('main', props, children);
}

export function Table(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('table', props, children);
}

export function Tr(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('tr', props, children);
}

export function Td(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('td', props, children);
}

export function Th(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('th', props, children);
}

export function Thead(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('thead', props, children);
}

export function Tbody(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('tbody', props, children);
}

export function Select(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('select', props, children);
}

export function Option(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('option', props, children);
}

export function Textarea(props?: DirectElementProps, children?: DirectChildren[]): HTMLElement {
  return createDirectElement('textarea', props, children);
}

/**
 * Cleanup function to remove all DOM bindings for an element and its children
 */
export function cleanupElement(element: HTMLElement): void {
  // Cleanup bindings for this element
  cleanupDOMBindings(element);
  
  // Recursively cleanup children
  for (const child of Array.from(element.children)) {
    if (child instanceof HTMLElement) {
      cleanupElement(child);
    }
  }
  
  // Cleanup text nodes
  for (const node of Array.from(element.childNodes)) {
    if (node instanceof Text) {
      cleanupDOMBindings(node);
    }
  }
}
