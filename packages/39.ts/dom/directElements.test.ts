/**
 * Tests for Direct Elements System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createSignal } from '../core/signal.js';
import { setDirectDOMAdapter, webDirectDOMAdapter } from './directDOM.js';
import {
  createDirectElement,
  Div,
  Button,
  Input,
  Span,
  cleanupElement
} from './directElements.js';

describe('Direct Elements System', () => {
  beforeEach(() => {
    setDirectDOMAdapter(webDirectDOMAdapter);
  });

  describe('createDirectElement', () => {
    it('should create basic element', () => {
      const element = createDirectElement('div');
      
      expect(element.tagName).toBe('DIV');
    });

    it('should throw error for invalid tag type', () => {
      expect(() => {
        createDirectElement(null as any);
      }).toThrow('Invalid tag: expected string, got object');
    });

    it('should throw error for invalid props type', () => {
      expect(() => {
        createDirectElement('div', 'invalid' as any);
      }).toThrow('Invalid props: expected object or null, got string');
    });

    it('should apply static className', () => {
      const element = createDirectElement('div', { className: 'test-class' });
      
      expect(element.className).toBe('test-class');
    });

    it('should apply signal className', () => {
      const classSignal = createSignal('dynamic-class');
      const element = createDirectElement('div', { className: classSignal });
      
      expect(element.className).toBe('dynamic-class');
      
      classSignal.set('updated-class');
      expect(element.className).toBe('updated-class');
    });

    it('should apply utility classes', () => {
      const element = createDirectElement('div', { 
        className: 'base-class',
        util: ['util1', 'util2'] 
      });
      
      expect(element.className).toBe('base-class util1 util2');
    });

    it('should combine signal className with utility classes', () => {
      const classSignal = createSignal('dynamic');
      const element = createDirectElement('div', { 
        className: classSignal,
        util: ['util1', 'util2'] 
      });
      
      expect(element.className).toBe('dynamic util1 util2');
      
      classSignal.set('updated');
      expect(element.className).toBe('updated util1 util2');
    });

    it('should apply static styles', () => {
      const element = createDirectElement('div', {
        style: {
          color: 'red',
          fontSize: '16px'
        }
      });
      
      expect(element.style.color).toBe('red');
      expect(element.style.fontSize).toBe('16px');
    });

    it('should apply signal styles', () => {
      const colorSignal = createSignal('blue');
      const element = createDirectElement('div', {
        style: {
          color: colorSignal,
          fontSize: '14px'
        }
      });
      
      expect(element.style.color).toBe('blue');
      expect(element.style.fontSize).toBe('14px');
      
      colorSignal.set('green');
      expect(element.style.color).toBe('green');
    });

    it('should apply static text content', () => {
      const element = createDirectElement('div', { text: 'Hello World' });
      
      expect(element.textContent).toBe('Hello World');
    });

    it('should apply signal text content', () => {
      const textSignal = createSignal('Dynamic Text');
      const element = createDirectElement('div', { text: textSignal });
      
      expect(element.textContent).toBe('Dynamic Text');
      
      textSignal.set('Updated Text');
      expect(element.textContent).toBe('Updated Text');
    });

    it('should apply static attributes', () => {
      const element = createDirectElement('input', {
        type: 'text',
        placeholder: 'Enter text'
      });
      
      expect(element.getAttribute('type')).toBe('text');
      expect(element.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should apply signal attributes', () => {
      const placeholderSignal = createSignal('Dynamic placeholder');
      const element = createDirectElement('input', {
        placeholder: placeholderSignal
      });
      
      expect(element.getAttribute('placeholder')).toBe('Dynamic placeholder');
      
      placeholderSignal.set('Updated placeholder');
      expect(element.getAttribute('placeholder')).toBe('Updated placeholder');
    });

    it('should handle event listeners', () => {
      let clicked = false;
      const element = createDirectElement('button', {
        onclick: () => { clicked = true; }
      });
      
      element.click();
      expect(clicked).toBe(true);
    });

    it('should skip null and undefined attributes', () => {
      const element = createDirectElement('div', {
        'data-test': null,
        'data-undefined': undefined,
        'data-false': false,
        'data-valid': 'value'
      });
      
      expect(element.hasAttribute('data-test')).toBe(false);
      expect(element.hasAttribute('data-undefined')).toBe(false);
      expect(element.hasAttribute('data-false')).toBe(false);
      expect(element.getAttribute('data-valid')).toBe('value');
    });
  });

  describe('Children Handling', () => {
    it('should append string children', () => {
      const element = createDirectElement('div', {}, ['Hello', ' World']);
      
      expect(element.textContent).toBe('Hello World');
    });

    it('should append number children', () => {
      const element = createDirectElement('div', {}, [42, ' items']);
      
      expect(element.textContent).toBe('42 items');
    });

    it('should append HTMLElement children', () => {
      const child = document.createElement('span');
      child.textContent = 'Child';
      
      const element = createDirectElement('div', {}, [child]);
      
      expect(element.children.length).toBe(1);
      expect(element.children[0]).toBe(child);
    });

    it('should append signal children', () => {
      const textSignal = createSignal('Signal Text');
      const element = createDirectElement('div', {}, [textSignal]);
      
      expect(element.textContent).toBe('Signal Text');
      
      textSignal.set('Updated Signal');
      expect(element.textContent).toBe('Updated Signal');
    });

    it('should handle nested arrays of children', () => {
      const element = createDirectElement('div', {}, [
        'Start',
        [' middle ', ['nested']],
        ' end'
      ]);
      
      expect(element.textContent).toBe('Start middle nested end');
    });

    it('should skip null, undefined, and false children', () => {
      const element = createDirectElement('div', {}, [
        'visible',
        null,
        undefined,
        false,
        'also visible'
      ]);
      
      expect(element.textContent).toBe('visiblealso visible');
    });
  });

  describe('Direct Element Builders', () => {
    it('should create Div element', () => {
      const div = Div({ className: 'test' }, ['Content']);
      
      expect(div.tagName).toBe('DIV');
      expect(div.className).toBe('test');
      expect(div.textContent).toBe('Content');
    });

    it('should create Button element', () => {
      let clicked = false;
      const button = Button({ 
        onclick: () => { clicked = true; }
      }, ['Click me']);
      
      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent).toBe('Click me');
      
      button.click();
      expect(clicked).toBe(true);
    });

    it('should create Input element', () => {
      const input = Input({ type: 'text', placeholder: 'Enter text' });
      
      expect(input.tagName).toBe('INPUT');
      expect(input.getAttribute('type')).toBe('text');
      expect(input.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should create Span element', () => {
      const textSignal = createSignal('Dynamic');
      const span = Span({ text: textSignal });
      
      expect(span.tagName).toBe('SPAN');
      expect(span.textContent).toBe('Dynamic');
    });
  });

  describe('Signal Integration', () => {
    it('should create reactive component with multiple signals', () => {
      const titleSignal = createSignal('Hello');
      const countSignal = createSignal(0);
      const visibleSignal = createSignal('block');
      
      const component = Div({
        className: 'container',
        style: { display: visibleSignal }
      }, [
        Div({ text: titleSignal }),
        Button({
          onclick: () => countSignal.set(countSignal.get() + 1)
        }, ['Count: ', countSignal])
      ]);
      
      expect(component.children.length).toBe(2);
      expect(component.style.display).toBe('block');
      
      const titleDiv = component.children[0] as HTMLElement;
      const button = component.children[1] as HTMLElement;
      
      expect(titleDiv.textContent).toBe('Hello');
      expect(button.textContent).toBe('Count: 0');
      
      // Update signals
      titleSignal.set('Updated');
      countSignal.set(5);
      visibleSignal.set('none');
      
      expect(titleDiv.textContent).toBe('Updated');
      expect(button.textContent).toBe('Count: 5');
      expect(component.style.display).toBe('none');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup element and all children bindings', () => {
      const signal1 = createSignal('text1');
      const signal2 = createSignal('text2');
      
      const parent = Div({}, [
        Div({ text: signal1 }),
        Span({ text: signal2 })
      ]);
      
      const childDiv = parent.children[0] as HTMLElement;
      const childSpan = parent.children[1] as HTMLElement;
      
      expect(childDiv.textContent).toBe('text1');
      expect(childSpan.textContent).toBe('text2');
      
      cleanupElement(parent);
      
      signal1.set('updated1');
      signal2.set('updated2');
      
      // Should not update after cleanup
      expect(childDiv.textContent).toBe('text1');
      expect(childSpan.textContent).toBe('text2');
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of elements efficiently', () => {
      const signals = Array.from({ length: 1000 }, (_, i) => createSignal(`Item ${i}`));
      
      const startTime = performance.now();
      
      const container = Div({}, signals.map((signal, i) => 
        Div({ 
          key: i,
          text: signal,
          className: 'item'
        })
      ));
      
      const createTime = performance.now() - startTime;
      
      expect(container.children.length).toBe(1000);
      expect(createTime).toBeLessThan(100); // Should be fast
      
      // Test bulk updates
      const updateStartTime = performance.now();
      
      signals.forEach((signal, i) => {
        signal.set(`Updated Item ${i}`);
      });
      
      const updateTime = performance.now() - updateStartTime;
      expect(updateTime).toBeLessThan(50); // Updates should be very fast
    });
  });
});
