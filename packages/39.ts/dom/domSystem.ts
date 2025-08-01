/**
 * 39.ts DOM System - Consolidated
 * 
 * All DOM functionality in one place to eliminate circular dependencies:
 * - Virtual DOM (h, render, html)
 * - Direct DOM (high-performance signal binding)
 * - DOM utilities and adapters
 * - Element creation and manipulation
 */

import { Signal } from '../@types/state.js';
import { createSignal, createEffect } from '../core/reactiveSystem.js';

// ============================================================================
// DOM ADAPTERS (Environment Independence)
// ============================================================================

export interface DOMAdapter {
  createElement(tag: string): HTMLElement;
  createTextNode(text: string): Text;
  setAttribute(element: HTMLElement, name: string, value: string): void;
  removeAttribute(element: HTMLElement, name: string): void;
  setTextContent(element: HTMLElement | Text, text: string): void;
  addEventListener(element: HTMLElement, event: string, handler: EventListener): void;
  removeEventListener(element: HTMLElement, event: string, handler: EventListener): void;
  appendChild(parent: HTMLElement, child: HTMLElement | Text): void;
  removeChild(parent: HTMLElement, child: HTMLElement | Text): void;
  querySelector(selector: string): HTMLElement | null;
  insertAdjacentHTML(element: HTMLElement, position: InsertPosition, html: string): void;
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
  },
  
  setAttribute: (element: HTMLElement, name: string, value: string) => {
    element.setAttribute(name, value);
  },
  
  removeAttribute: (element: HTMLElement, name: string) => {
    element.removeAttribute(name);
  },
  
  setTextContent: (element: HTMLElement | Text, text: string) => {
    element.textContent = text;
  },
  
  addEventListener: (element: HTMLElement, event: string, handler: EventListener) => {
    element.addEventListener(event, handler);
  },
  
  removeEventListener: (element: HTMLElement, event: string, handler: EventListener) => {
    element.removeEventListener(event, handler);
  },
  
  appendChild: (parent: HTMLElement, child: HTMLElement | Text) => {
    parent.appendChild(child);
  },
  
  removeChild: (parent: HTMLElement, child: HTMLElement | Text) => {
    parent.removeChild(child);
  },
  
  querySelector: (selector: string) => {
    if (typeof document === 'undefined') {
      throw new Error('document is not defined. Provide a DOMAdapter for this environment.');
    }
    return document.querySelector(selector) as HTMLElement | null;
  },
  
  insertAdjacentHTML: (element: HTMLElement, position: InsertPosition, html: string) => {
    element.insertAdjacentHTML(position, html);
  }
};

export const noopDOMAdapter: DOMAdapter = {
  createElement: () => ({} as HTMLElement),
  createTextNode: () => ({} as Text),
  setAttribute: () => {},
  removeAttribute: () => {},
  setTextContent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  appendChild: () => {},
  removeChild: () => {},
  querySelector: () => null,
  insertAdjacentHTML: () => {}
};

let currentDOMAdapter: DOMAdapter = webDOMAdapter;

export function setDOMAdapter(adapter: DOMAdapter): void {
  currentDOMAdapter = adapter;
}

export function getDOMAdapter(): DOMAdapter {
  return currentDOMAdapter;
}

// ============================================================================
// TYPES
// ============================================================================

export type Children = string | number | VNode | HTMLElement | Array<Children>;
export type EventHandler = (event: Event) => void;

export interface ElementProps {
  [key: string]: any;
  children?: Children;
  onclick?: EventHandler;
  onchange?: EventHandler;
  oninput?: EventHandler;
  onsubmit?: EventHandler;
  onkeydown?: EventHandler;
  onkeyup?: EventHandler;
  onfocus?: EventHandler;
  onblur?: EventHandler;
}

export interface VNode {
  tag: string;
  props: ElementProps;
  children: Children[];
  element?: HTMLElement;
}

export interface DOMBinding {
  element: HTMLElement;
  signal: Signal<any>;
  cleanup: () => void;
}

// ============================================================================
// VIRTUAL DOM SYSTEM
// ============================================================================

export function h(tag: string, props: ElementProps = {}, children: Children[] = []): VNode {
  return {
    tag,
    props,
    children
  };
}

export function html(strings: TemplateStringsArray, ...values: any[]): VNode {
  // Simple template literal to VNode conversion
  // This is a basic implementation - could be enhanced
  const htmlString = strings.reduce((result, string, i) => {
    return result + string + (values[i] || '');
  }, '');

  // For now, create a div with innerHTML - this could be improved
  return h('div', { innerHTML: htmlString });
}

export function renderVNode(vnode: VNode): HTMLElement {
  const adapter = getDOMAdapter();
  const element = adapter.createElement(vnode.tag);

  // Set attributes and properties
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key === 'children') return;

    if (key.startsWith('on') && typeof value === 'function') {
      // Event listeners
      const event = key.slice(2).toLowerCase();
      adapter.addEventListener(element, event, value as EventListener);
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      adapter.setAttribute(element, key, String(value));
    }
  });

  // Render children
  vnode.children.forEach(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      const textNode = adapter.createTextNode(String(child));
      adapter.appendChild(element, textNode);
    } else if (Array.isArray(child)) {
      child.forEach(nestedChild => {
        if (typeof nestedChild === 'object' && 'tag' in nestedChild) {
          adapter.appendChild(element, renderVNode(nestedChild));
        }
      });
    } else if (typeof child === 'object' && child && 'tag' in child) {
      adapter.appendChild(element, renderVNode(child));
    }
  });

  vnode.element = element;
  return element;
}

// ============================================================================
// DIRECT DOM BINDING (High Performance)
// ============================================================================

const activeDOMBindings: Set<DOMBinding> = new Set();

export function bindSignalToDOM<T>(
  signal: Signal<T>, 
  element: HTMLElement,
  property: string = 'textContent'
): DOMBinding {
  const cleanup = signal.subscribe((value) => {
    if (property === 'textContent') {
      currentDOMAdapter.setTextContent(element, String(value));
    } else {
      currentDOMAdapter.setAttribute(element, property, String(value));
    }
  });

  const binding: DOMBinding = {
    element,
    signal,
    cleanup
  };

  activeDOMBindings.add(binding);

  // Initial sync
  if (property === 'textContent') {
    currentDOMAdapter.setTextContent(element, String(signal.get()));
  } else {
    currentDOMAdapter.setAttribute(element, property, String(signal.get()));
  }

  return binding;
}

// ============================================================================
// ELEMENT CREATORS
// ============================================================================

export function createElement(tag: string, props: ElementProps = {}, children: Children[] = []): HTMLElement {
  return renderVNode(h(tag, props, children));
}

// Specific element creators
export const Div = (props: ElementProps = {}, children: Children[] = []) => h('div', props, children);
export const Span = (props: ElementProps = {}, children: Children[] = []) => h('span', props, children);
export const Button = (props: ElementProps = {}, children: Children[] = []) => h('button', props, children);
export const Input = (props: ElementProps = {}, children: Children[] = []) => h('input', props, children);
export const H1 = (props: ElementProps = {}, children: Children[] = []) => h('h1', props, children);
export const H2 = (props: ElementProps = {}, children: Children[] = []) => h('h2', props, children);
export const H3 = (props: ElementProps = {}, children: Children[] = []) => h('h3', props, children);
export const P = (props: ElementProps = {}, children: Children[] = []) => h('p', props, children);
export const A = (props: ElementProps = {}, children: Children[] = []) => h('a', props, children);
export const Ul = (props: ElementProps = {}, children: Children[] = []) => h('ul', props, children);
export const Li = (props: ElementProps = {}, children: Children[] = []) => h('li', props, children);
export const Form = (props: ElementProps = {}, children: Children[] = []) => h('form', props, children);
export const Label = (props: ElementProps = {}, children: Children[] = []) => h('label', props, children);
export const Select = (props: ElementProps = {}, children: Children[] = []) => h('select', props, children);
export const Option = (props: ElementProps = {}, children: Children[] = []) => h('option', props, children);
export const Textarea = (props: ElementProps = {}, children: Children[] = []) => h('textarea', props, children);
export const Section = (props: ElementProps = {}, children: Children[] = []) => h('section', props, children);
export const Article = (props: ElementProps = {}, children: Children[] = []) => h('article', props, children);
export const Header = (props: ElementProps = {}, children: Children[] = []) => h('header', props, children);
export const Footer = (props: ElementProps = {}, children: Children[] = []) => h('footer', props, children);
export const Nav = (props: ElementProps = {}, children: Children[] = []) => h('nav', props, children);
export const Main = (props: ElementProps = {}, children: Children[] = []) => h('main', props, children);
export const Aside = (props: ElementProps = {}, children: Children[] = []) => h('aside', props, children);

// ============================================================================
// RENDERING SYSTEM
// ============================================================================

export function render(vnode: VNode, container: HTMLElement): void {
  const element = renderVNode(vnode);
  currentDOMAdapter.appendChild(container, element);
}

export function append(parent: HTMLElement, child: HTMLElement | VNode): void {
  if (typeof child === 'object' && 'tag' in child) {
    const element = renderVNode(child);
    currentDOMAdapter.appendChild(parent, element);
  } else {
    currentDOMAdapter.appendChild(parent, child as HTMLElement);
  }
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

export function cleanupAllDOMBindings(): void {
  activeDOMBindings.forEach(binding => binding.cleanup());
  activeDOMBindings.clear();
}

export function getActiveDOMBindingCount(): number {
  return activeDOMBindings.size;
}
