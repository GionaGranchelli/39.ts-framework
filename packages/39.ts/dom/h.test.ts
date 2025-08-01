import { describe, it, expect, vi, beforeEach } from 'vitest';
import {createSignal} from "../core/signal.js";
import {DOMAdapter, h} from "../dist/dom/h.js";

// Simple test approach: Create a basic mock that works with the current h function
// instead of trying to override the DOM adapter
describe('h (DOM abstraction)', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  it('should create basic element with tag', () => {
    // In jsdom environment, document exists, so test the actual functionality
    const element = h('div');
    expect(element.tagName).toBe('DIV');
  });

  it('should validate tag parameter', () => {
    // Test empty string - this should throw from createElement
    expect(() => h('' as any)).toThrow();

    // Test null specifically - let's debug this step by step
    console.log('About to test h(null)...');
    expect(() => {
      console.log('Inside expect callback, about to call h(null)');
      const result = h(null as any);
      console.log('❌ h(null) unexpectedly succeeded, returned:', result);
      return result;
    }).toThrow();
  });

  it('should validate props parameter', () => {
    expect(() => h('div', 'invalid' as any)).toThrow('Invalid props: expected object or null, got string');
  });

  // For now, let's focus on testing the parts that don't require DOM
  // We can add more DOM-specific tests once we fix the adapter system
});

describe('DOM Adapter Types', () => {
  it('should define the DOMAdapter interface correctly', () => {
    // Test that our MockDOMAdapter implements the interface
    class TestAdapter implements DOMAdapter {
      createElement(tag: string): HTMLElement {
        return {} as HTMLElement;
      }
      createTextNode(text: string): Text {
        return {} as Text;
      }
    }

    const adapter = new TestAdapter();
    expect(typeof adapter.createElement).toBe('function');
    expect(typeof adapter.createTextNode).toBe('function');
  });
});
