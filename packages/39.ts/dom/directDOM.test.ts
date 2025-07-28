/**
 * Tests for Direct DOM System
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSignal } from '../core/signal.js';
import {
  setDirectDOMAdapter,
  getDirectDOMAdapter,
  webDirectDOMAdapter,
  noopDirectDOMAdapter,
  createDOMBinding,
  cleanupDOMBindings,
  createBoundTextNode,
  createElement,
  bindSignalToProperty
} from './directDOM.js';

describe('Direct DOM System', () => {
  beforeEach(() => {
    // Reset to web adapter before each test
    setDirectDOMAdapter(webDirectDOMAdapter);
  });

  describe('DOM Adapter Management', () => {
    it('should set and get DOM adapter', () => {
      expect(getDirectDOMAdapter()).toBe(webDirectDOMAdapter);
      
      setDirectDOMAdapter(noopDirectDOMAdapter);
      expect(getDirectDOMAdapter()).toBe(noopDirectDOMAdapter);
    });

    it('should throw error when using noop adapter', () => {
      setDirectDOMAdapter(noopDirectDOMAdapter);
      
      expect(() => getDirectDOMAdapter().createElement('div')).toThrow(
        'No DOM available: tried to createElement("div") in a non-DOM environment.'
      );
    });
  });

  describe('Signal to DOM Binding', () => {
    it('should create basic DOM binding for textContent', () => {
      const signal = createSignal('Hello');
      const element = document.createElement('div');
      
      const binding = createDOMBinding(element, signal, 'textContent');
      
      expect(element.textContent).toBe('Hello');
      expect(binding.element).toBe(element);
      expect(binding.signal).toBe(signal);
      expect(binding.property).toBe('textContent');
    });

    it('should update DOM when signal changes', () => {
      const signal = createSignal('Initial');
      const element = document.createElement('div');
      
      createDOMBinding(element, signal, 'textContent');
      expect(element.textContent).toBe('Initial');
      
      signal.set('Updated');
      expect(element.textContent).toBe('Updated');
    });

    it('should handle className binding', () => {
      const signal = createSignal('test-class');
      const element = document.createElement('div');
      
      createDOMBinding(element, signal, 'className');
      expect(element.className).toBe('test-class');
      
      signal.set('new-class');
      expect(element.className).toBe('new-class');
    });

    it('should handle style property binding', () => {
      const signal = createSignal('red');
      const element = document.createElement('div');
      
      createDOMBinding(element, signal, 'style.color');
      expect(element.style.color).toBe('red');
      
      signal.set('blue');
      expect(element.style.color).toBe('blue');
    });

    it('should handle attribute binding', () => {
      const signal = createSignal('test-id');
      const element = document.createElement('div');
      
      createDOMBinding(element, signal, 'id');
      expect(element.getAttribute('id')).toBe('test-id');
      
      signal.set('new-id');
      expect(element.getAttribute('id')).toBe('new-id');
    });

    it('should remove attribute when value is empty', () => {
      const signal = createSignal('test-value');
      const element = document.createElement('div');
      
      createDOMBinding(element, signal, 'data-test');
      expect(element.getAttribute('data-test')).toBe('test-value');
      
      signal.set('');
      expect(element.hasAttribute('data-test')).toBe(false);
    });

    it('should use transform function when provided', () => {
      const signal = createSignal(42);
      const element = document.createElement('div');
      
      createDOMBinding(element, signal, 'textContent', (value) => `Count: ${value}`);
      expect(element.textContent).toBe('Count: 42');
      
      signal.set(100);
      expect(element.textContent).toBe('Count: 100');
    });
  });

  describe('Bound Text Nodes', () => {
    it('should create bound text node', () => {
      const signal = createSignal('Hello World');
      
      const textNode = createBoundTextNode(signal);
      expect(textNode.textContent).toBe('Hello World');
      
      signal.set('Updated Text');
      expect(textNode.textContent).toBe('Updated Text');
    });

    it('should create bound text node with transform', () => {
      const signal = createSignal(5);
      
      const textNode = createBoundTextNode(signal, (value) => `Items: ${value}`);
      expect(textNode.textContent).toBe('Items: 5');
      
      signal.set(10);
      expect(textNode.textContent).toBe('Items: 10');
    });
  });

  describe('Element Creation with Bindings', () => {
    it('should create element with static bindings', () => {
      const element = createElement('div', {
        className: 'test-class',
        id: 'test-id',
        textContent: 'Hello'
      });
      
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('test-class');
      expect(element.id).toBe('test-id');
      expect(element.textContent).toBe('Hello');
    });

    it('should create element with signal bindings', () => {
      const classSignal = createSignal('dynamic-class');
      const textSignal = createSignal('Dynamic Text');
      
      const element = createElement('div', {
        className: classSignal,
        textContent: textSignal
      });
      
      expect(element.className).toBe('dynamic-class');
      expect(element.textContent).toBe('Dynamic Text');
      
      classSignal.set('new-class');
      textSignal.set('New Text');
      
      expect(element.className).toBe('new-class');
      expect(element.textContent).toBe('New Text');
    });

    it('should create element with style bindings', () => {
      const colorSignal = createSignal('red');
      
      const element = createElement('div', {
        'style.color': colorSignal,
        'style.fontSize': '16px'
      });
      
      expect(element.style.color).toBe('red');
      expect(element.style.fontSize).toBe('16px');
      
      colorSignal.set('blue');
      expect(element.style.color).toBe('blue');
    });
  });

  describe('Binding Management', () => {
    it('should provide cleanup function', () => {
      const signal = createSignal('test');
      const element = document.createElement('div');
      
      const cleanup = bindSignalToProperty(element, 'textContent', signal);
      expect(element.textContent).toBe('test');
      
      signal.set('updated');
      expect(element.textContent).toBe('updated');
      
      cleanup();
      signal.set('after cleanup');
      expect(element.textContent).toBe('updated'); // Should not update after cleanup
    });

    it('should cleanup all bindings for an element', () => {
      const signal1 = createSignal('text1');
      const signal2 = createSignal('text2');
      const element = document.createElement('div');
      
      createDOMBinding(element, signal1, 'textContent');
      createDOMBinding(element, signal2, 'id');
      
      expect(element.textContent).toBe('text1');
      expect(element.id).toBe('text2');
      
      cleanupDOMBindings(element);
      
      signal1.set('updated1');
      signal2.set('updated2');
      
      expect(element.textContent).toBe('text1'); // Should not update
      expect(element.id).toBe('text2'); // Should not update
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid signal objects gracefully', () => {
      const fakeSignal = { get: () => 'test' }; // Missing set and subscribe
      const element = document.createElement('div');
      
      // Should not treat it as a signal since it's incomplete
      expect(() => {
        createElement('div', { textContent: fakeSignal });
      }).not.toThrow();
    });
  });

  describe('Performance Characteristics', () => {
    it('should only update DOM when signal value actually changes', () => {
      const signal = createSignal('test');
      const element = document.createElement('div');
      
      const setSpy = vi.spyOn(element, 'textContent', 'set');
      
      createDOMBinding(element, signal, 'textContent');
      expect(setSpy).toHaveBeenCalledTimes(1); // Initial set
      
      signal.set('test'); // Same value
      expect(setSpy).toHaveBeenCalledTimes(1); // Should not update
      
      signal.set('different'); // Different value
      expect(setSpy).toHaveBeenCalledTimes(2); // Should update
    });
  });
});
