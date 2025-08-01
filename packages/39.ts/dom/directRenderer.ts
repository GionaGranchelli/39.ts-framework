/**
 * Direct DOM Renderer
 * 
 * High-performance renderer using direct DOM manipulation instead of virtual DOM.
 * Provides fine-grained reactivity with signal-to-DOM binding.
 */

import { Signal } from '../@types/state.js';
import { cleanupElement } from './directElements.js';
import { getDirectDOMAdapter } from './directDOM.js';

export interface DirectRenderOptions {
  /** Whether to clear the container before rendering */
  clear?: boolean;
  /** Whether to enable automatic cleanup of previous content */
  autoCleanup?: boolean;
}

/**
 * Render content directly to DOM with signal reactivity
 */
export function renderDirect(
  content: HTMLElement | (() => HTMLElement) | Signal<HTMLElement>,
  selector: string | HTMLElement = '#app',
  options: DirectRenderOptions = {}
): () => void {
  const { clear = true, autoCleanup = true } = options;
  
  // Get target container
  const container = typeof selector === 'string' 
    ? document.querySelector(selector) as HTMLElement
    : selector;
    
  if (!container) {
    throw new Error(`Render target not found: ${selector}`);
  }

  // Cleanup function for previous content
  let currentCleanup: (() => void) | null = null;

  const performRender = (element: HTMLElement) => {
    // Cleanup previous content if enabled
    if (autoCleanup && currentCleanup) {
      currentCleanup();
    }

    // Clear container if requested
    if (clear) {
      // Cleanup existing children before clearing
      if (autoCleanup) {
        for (const child of Array.from(container.children)) {
          if (child instanceof HTMLElement) {
            cleanupElement(child);
          }
        }
      }
      container.innerHTML = '';
    }

    // Append new content
    container.appendChild(element);

    // Set up cleanup for the new content
    if (autoCleanup) {
      currentCleanup = () => {
        if (element.parentNode === container) {
          cleanupElement(element);
          container.removeChild(element);
        }
      };
    }
  };

  if (isSignal(content)) {
    // Signal content - reactive rendering
    performRender(content.get());
    
    const unsubscribe = content.subscribe((newElement: HTMLElement) => {
      performRender(newElement);
    });

    // Return cleanup function
    return () => {
      unsubscribe();
      if (currentCleanup) {
        currentCleanup();
      }
    };
  } else {
    // Static content
    const element = typeof content === 'function' ? content() : content;
    performRender(element);

    // Return cleanup function
    return () => {
      if (currentCleanup) {
        currentCleanup();
      }
    };
  }
}

/**
 * Append content to DOM without clearing existing content
 */
export function appendDirect(
  content: HTMLElement | (() => HTMLElement) | Signal<HTMLElement>,
  selector: string | HTMLElement = '#app'
): () => void {
  return renderDirect(content, selector, { clear: false });
}

/**
 * Replace specific child element with new content
 */
export function replaceDirect(
  oldElement: HTMLElement,
  newContent: HTMLElement | (() => HTMLElement) | Signal<HTMLElement>,
  options: DirectRenderOptions = {}
): () => void {
  const { autoCleanup = true } = options;
  const parent = oldElement.parentNode as HTMLElement;
  
  if (!parent) {
    throw new Error('Cannot replace element: no parent found');
  }

  let currentCleanup: (() => void) | null = null;

  const performReplace = (newElement: HTMLElement) => {
    // Cleanup previous element
    if (autoCleanup && currentCleanup) {
      currentCleanup();
    }

    // Replace in DOM
    parent.replaceChild(newElement, oldElement);

    // Set up cleanup for new element
    if (autoCleanup) {
      currentCleanup = () => {
        cleanupElement(newElement);
      };
    }
  };

  if (isSignal(newContent)) {
    // Signal content - reactive replacement
    performReplace(newContent.get());
    
    const unsubscribe = newContent.subscribe((newElement: HTMLElement) => {
      performReplace(newElement);
    });

    return () => {
      unsubscribe();
      if (currentCleanup) {
        currentCleanup();
      }
    };
  } else {
    // Static content
    const element = typeof newContent === 'function' ? newContent() : newContent;
    
    // Cleanup old element
    if (autoCleanup) {
      cleanupElement(oldElement);
    }
    
    performReplace(element);

    return () => {
      if (currentCleanup) {
        currentCleanup();
      }
    };
  }
}

/**
 * Create a reactive container that updates its content based on a signal
 */
export function createReactiveContainer(
  contentSignal: Signal<HTMLElement>,
  containerProps?: Record<string, any>
): HTMLElement {
  const container = getDirectDOMAdapter().createElement('div');
  
  // Apply container properties
  if (containerProps) {
    Object.entries(containerProps).forEach(([key, value]) => {
      if (key === 'className') {
        container.className = String(value);
      } else if (key.startsWith('style.')) {
        const styleProp = key.slice(6);
        (container.style as any)[styleProp] = String(value);
      } else {
        container.setAttribute(key, String(value));
      }
    });
  }

  // Initial render
  let currentElement = contentSignal.get();
  container.appendChild(currentElement);

  // Subscribe to changes
  contentSignal.subscribe((newElement: HTMLElement) => {
    // Clean up old element
    cleanupElement(currentElement);
    container.removeChild(currentElement);
    
    // Add new element
    currentElement = newElement;
    container.appendChild(currentElement);
  });

  return container;
}

/**
 * Batch DOM updates for better performance
 */
export function batchDOMUpdates(updateFn: () => void): void {
  // Use requestAnimationFrame for batching DOM updates
  requestAnimationFrame(() => {
    updateFn();
  });
}

/**
 * Create a document fragment with direct elements
 */
export function createDirectFragment(elements: HTMLElement[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  elements.forEach(element => fragment.appendChild(element));
  return fragment;
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

// Legacy compatibility - re-export old render function as renderLegacy
export { render as renderLegacy, append as appendLegacy } from './renderer.js';
