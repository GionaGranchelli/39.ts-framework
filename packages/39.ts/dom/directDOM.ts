/**
 * Direct DOM Manipulation System
 * 
 * Replaces virtual DOM with direct signal-to-DOM binding for better performance.
 * This system provides fine-grained reactivity without the overhead of virtual DOM diffing.
 */

import { Signal } from '../@types/state.js';
import { eventBus } from '../core/eventBus.js';

export interface DOMBinding {
  element: HTMLElement | Text;
  signal: Signal<any>;
  property: string;
  cleanup: () => void;
}

export interface DirectDOMAdapter {
  createElement(tag: string): HTMLElement;
  createTextNode(text: string): Text;
  setAttribute(element: HTMLElement, name: string, value: string): void;
  removeAttribute(element: HTMLElement, name: string): void;
  setTextContent(element: HTMLElement | Text, text: string): void;
  addEventListener(element: HTMLElement, event: string, handler: EventListener): void;
  removeEventListener(element: HTMLElement, event: string, handler: EventListener): void;
}

export const webDirectDOMAdapter: DirectDOMAdapter = {
  createElement: (tag: string) => {
    if (typeof document === 'undefined' || !document.createElement) {
      throw new Error('document is not defined. Use setDirectDOMAdapter for this environment.');
    }
    return document.createElement(tag);
  },
  
  createTextNode: (text: string) => {
    if (typeof document === 'undefined' || !document.createTextNode) {
      throw new Error('document is not defined. Use setDirectDOMAdapter for this environment.');
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
  }
};

export const noopDirectDOMAdapter: DirectDOMAdapter = {
  createElement: (tag: string) => {
    throw new Error(`No DOM available: tried to createElement("${tag}") in a non-DOM environment.`);
  },
  createTextNode: (text: string) => {
    throw new Error('No DOM available: tried to createTextNode in a non-DOM environment.');
  },
  setAttribute: () => {
    throw new Error('No DOM available: tried to setAttribute in a non-DOM environment.');
  },
  removeAttribute: () => {
    throw new Error('No DOM available: tried to removeAttribute in a non-DOM environment.');
  },
  setTextContent: () => {
    throw new Error('No DOM available: tried to setTextContent in a non-DOM environment.');
  },
  addEventListener: () => {
    throw new Error('No DOM available: tried to addEventListener in a non-DOM environment.');
  },
  removeEventListener: () => {
    throw new Error('No DOM available: tried to removeEventListener in a non-DOM environment.');
  }
};

let currentDirectDOMAdapter: DirectDOMAdapter = webDirectDOMAdapter;

/**
 * Set the DOM adapter for the direct DOM system
 */
export function setDirectDOMAdapter(adapter: DirectDOMAdapter): void {
  currentDirectDOMAdapter = adapter;
}

/**
 * Get the current DOM adapter
 */
export function getDirectDOMAdapter(): DirectDOMAdapter {
  return currentDirectDOMAdapter;
}

// Global registry for DOM bindings to enable cleanup
const domBindings = new WeakMap<HTMLElement | Text, DOMBinding[]>();

/**
 * Create a direct DOM binding between a signal and a DOM property
 */
export function createDOMBinding<T>(
  element: HTMLElement | Text,
  signal: Signal<T>,
  property: string,
  transform?: (value: T) => string
): DOMBinding {
  let lastValue: string | undefined;

  const updateDOM = (value: T) => {
    const stringValue = transform ? transform(value) : String(value);
    
    // Only update if value actually changed
    if (stringValue === lastValue) {
      return;
    }
    lastValue = stringValue;

    if (property === 'textContent') {
      currentDirectDOMAdapter.setTextContent(element, stringValue);
    } else if (element instanceof HTMLElement) {
      if (property === 'className') {
        element.className = stringValue;
      } else if (property.startsWith('style.')) {
        const styleProp = property.slice(6);
        (element.style as any)[styleProp] = stringValue;
      } else if (stringValue === '' || stringValue === 'false') {
        currentDirectDOMAdapter.removeAttribute(element, property);
      } else {
        currentDirectDOMAdapter.setAttribute(element, property, stringValue);
      }
    }
  };

  // Initial update
  updateDOM(signal.get());

  // Subscribe to signal changes
  const unsubscribe = signal.subscribe(updateDOM);

  const binding: DOMBinding = {
    element,
    signal,
    property,
    cleanup: unsubscribe
  };

  // Register binding for cleanup
  const existingBindings = domBindings.get(element) || [];
  existingBindings.push(binding);
  domBindings.set(element, existingBindings);

  return binding;
}

/**
 * Clean up all DOM bindings for an element
 */
export function cleanupDOMBindings(element: HTMLElement | Text): void {
  const bindings = domBindings.get(element);
  if (bindings) {
    bindings.forEach(binding => binding.cleanup());
    domBindings.delete(element);
  }
}

/**
 * Create a text node bound to a signal
 */
export function createBoundTextNode<T>(signal: Signal<T>, transform?: (value: T) => string): Text {
  const textNode = currentDirectDOMAdapter.createTextNode(
    transform ? transform(signal.get()) : String(signal.get())
  );
  
  createDOMBinding(textNode, signal, 'textContent', transform);
  
  return textNode;
}

/**
 * Bind a signal to an element property with optional transformation
 */
export function bindSignalToProperty<T>(
  element: HTMLElement,
  property: string,
  signal: Signal<T>,
  transform?: (value: T) => string
): () => void {
  const binding = createDOMBinding(element, signal, property, transform);
  return binding.cleanup;
}

/**
 * Create an element with signal bindings
 */
export function createElement(
  tag: keyof HTMLElementTagNameMap,
  bindings?: Record<string, Signal<any> | any>
): HTMLElement {
  const element = currentDirectDOMAdapter.createElement(tag);
  
  if (bindings) {
    for (const [property, binding] of Object.entries(bindings)) {
      if (isSignal(binding)) {
        createDOMBinding(element, binding, property);
      } else {
        // Static value
        if (property === 'textContent') {
          currentDirectDOMAdapter.setTextContent(element, String(binding));
        } else if (property === 'className') {
          element.className = String(binding);
        } else if (property.startsWith('style.')) {
          const styleProp = property.slice(6);
          (element.style as any)[styleProp] = String(binding);
        } else {
          currentDirectDOMAdapter.setAttribute(element, property, String(binding));
        }
      }
    }
  }
  
  return element;
}

/**
 * Check if a value is a signal
 */
function isSignal(value: unknown): value is Signal<unknown> {
  return typeof value === 'object' && value !== null
    && typeof (value as any).get === 'function'
    && typeof (value as any).set === 'function'
    && typeof (value as any).subscribe === 'function';
}
