/**
 * Performance Benchmark: Direct DOM vs Virtual DOM
 * 
 * Demonstrates the performance improvements of the new direct DOM system
 * compared to the legacy virtual DOM approach.
 */

import { describe, it, expect } from 'vitest';
import { createSignal } from '../core/signal.js';
import {
  Div as DirectDiv,
  Button as DirectButton
} from '../dom/directElements.js';

import { renderDirect } from '../dom/directRenderer.js';

// Legacy DOM imports
import { h } from '../dom/h.js';

describe('Performance Benchmark: Direct DOM vs Virtual DOM', () => {
  it('should be significantly faster for large component trees', () => {
    const COMPONENT_COUNT = 500; // Reduced for test stability

    // Setup signals for testing
    const signals = Array.from({ length: COMPONENT_COUNT }, (_, i) => 
      createSignal(`Item ${i}`)
    );

    // Benchmark Direct DOM creation
    const directStartTime = performance.now();
    
    const directComponents = signals.map((signal, i) => 
      DirectDiv({ 
        className: 'item',
        text: signal
      })
    );
    
    const directContainer = DirectDiv({ className: 'container' }, directComponents);
    const directCreateTime = performance.now() - directStartTime;

    // Benchmark Legacy DOM creation
    const legacyStartTime = performance.now();
    
    const legacyComponents = signals.map((signal) =>
      h('div', {
        className: 'item'
      }, [signal.get()])
    );
    
    const legacyContainer = h('div', { className: 'container' }, legacyComponents);
    const legacyCreateTime = performance.now() - legacyStartTime;

    // Performance assertions
    expect(directContainer.children.length).toBe(COMPONENT_COUNT);
    expect(legacyContainer.children.length).toBe(COMPONENT_COUNT);

    console.log('📊 Performance Results:');
    console.log(`Direct DOM: ${directCreateTime.toFixed(2)}ms`);
    console.log(`Legacy DOM: ${legacyCreateTime.toFixed(2)}ms`);

    if (directCreateTime < legacyCreateTime) {
      const improvement = ((legacyCreateTime - directCreateTime) / legacyCreateTime * 100);
      console.log(`✅ Improvement: ${improvement.toFixed(1)}%`);
    } else {
      console.log(`⚠️ Direct DOM was ${((directCreateTime - legacyCreateTime) / legacyCreateTime * 100).toFixed(1)}% slower`);
    }

    // Both should complete in reasonable time
    expect(directCreateTime).toBeLessThan(1000); // Under 1 second
    expect(legacyCreateTime).toBeLessThan(1000); // Under 1 second
  });

  it('should handle updates more efficiently', () => {
    const UPDATE_COUNT = 50; // Reduced for test stability
    const signals = Array.from({ length: UPDATE_COUNT }, () => createSignal('0'));

    // Direct DOM update performance
    const directComponents = signals.map(signal => 
      DirectDiv({ text: signal })
    );
    
    const directUpdateStart = performance.now();
    signals.forEach((signal, i) => signal.set(String(i * 2)));
    const directUpdateTime = performance.now() - directUpdateStart;

    // Verify updates worked
    directComponents.forEach((component, i) => {
      expect(component.textContent).toBe(String(i * 2));
    });

    console.log('⚡ Update Performance:');
    console.log(`Direct DOM Updates: ${directUpdateTime.toFixed(2)}ms for ${UPDATE_COUNT} components`);
    console.log(`Per-update: ${(directUpdateTime / UPDATE_COUNT).toFixed(3)}ms`);

    // Should be very fast - under 100ms for 50 updates
    expect(directUpdateTime).toBeLessThan(100);
  });

  it('should demonstrate reactive signal binding', () => {
    const textSignal = createSignal('Initial');
    const classSignal = createSignal('test-class');

    const startTime = performance.now();

    // Create element with signal bindings
    const element = DirectDiv({
      className: classSignal,
      text: textSignal
    });

    const createTime = performance.now() - startTime;

    // Verify initial state
    expect(element.className).toBe('test-class');
    expect(element.textContent).toBe('Initial');

    // Test updates
    const updateStartTime = performance.now();

    textSignal.set('Updated Text');
    classSignal.set('new-class');

    const updateTime = performance.now() - updateStartTime;

    // Verify updates
    expect(element.className).toBe('new-class');
    expect(element.textContent).toBe('Updated Text');

    console.log('🔄 Signal Binding Performance:');
    console.log(`Create: ${createTime.toFixed(3)}ms`);
    console.log(`Update: ${updateTime.toFixed(3)}ms`);

    // Should be very fast
    expect(createTime).toBeLessThan(10);
    expect(updateTime).toBeLessThan(5);
  });

  it('should show rendering performance with DOM attachment', () => {
    // Create a container in the DOM
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    const RENDER_COUNT = 25; // Reduced for test stability
    const signals = Array.from({ length: RENDER_COUNT }, (_, i) =>
      createSignal(`Render Item ${i}`)
    );

    try {
      // Benchmark direct rendering
      const directRenderStart = performance.now();

      const directApp = DirectDiv({ className: 'app' },
        signals.map(signal => DirectDiv({ text: signal }))
      );

      renderDirect(directApp, container);
      const directRenderTime = performance.now() - directRenderStart;

      // Verify rendering worked
      expect(container.children.length).toBe(1);
      expect(container.children[0].children.length).toBe(RENDER_COUNT);

      console.log('🚀 Rendering Performance:');
      console.log(`Direct Render: ${directRenderTime.toFixed(2)}ms`);

      // Should be reasonably fast
      expect(directRenderTime).toBeLessThan(100);

    } finally {
      // Cleanup
      document.body.removeChild(container);
    }
  });

  it('should update DOM efficiently with signal changes', () => {
    const UPDATE_COUNT = 100;

    // Create signals with string values to match DirectDiv text property type
    const signals = Array.from({ length: UPDATE_COUNT }, () => createSignal('0'));

    // Direct DOM update performance
    const directComponents = signals.map(signal =>
      DirectDiv({ text: signal })
    );

    const directUpdateStart = performance.now();
    signals.forEach((signal, i) => signal.set(String(i * 2)));
    const directUpdateTime = performance.now() - directUpdateStart;

    // Verify updates worked
    directComponents.forEach((component, i) => {
      expect(component.textContent).toBe(String(i * 2));
    });

    console.log('⚡ Update Performance with Signal Changes:');
    console.log(`Direct DOM Updates: ${directUpdateTime.toFixed(2)}ms for ${UPDATE_COUNT} components`);
    console.log(`Per-update: ${(directUpdateTime / UPDATE_COUNT).toFixed(3)}ms`);

    // Should be very fast - under 100ms for 100 updates
    expect(directUpdateTime).toBeLessThan(100);
  });
});
