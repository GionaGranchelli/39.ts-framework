/**
 * Basic Signal System Tests - Simple Implementation
 *
 * Starting with the absolute basics and building up gradually
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createSignal,
  createDerived,
  createEffect,
  batch,
  isBatchingActive,
  getBatchSize,
  cleanupAllEffects,
  getActiveEffectCount,
} from '../reactiveSystem.js';

describe('Basic Signal System', () => {
  beforeEach(() => {
    cleanupAllEffects();
  });

  afterEach(() => {
    cleanupAllEffects();
  });

  describe('Basic Signals', () => {
    it('should create and read signals', () => {
      const count = createSignal(0);
      expect(count.get()).toBe(0);
    });

    it('should update signal values', () => {
      const count = createSignal(0);
      count.set(5);
      expect(count.get()).toBe(5);
    });

    it('should notify subscribers when value changes', () => {
      const count = createSignal(0);
      let notified = false;

      count.subscribe(() => {
        notified = true;
      });

      count.set(1);
      expect(notified).toBe(true);
    });

    it('should not notify when value is the same', () => {
      const count = createSignal(0);
      let notifyCount = 0;

      count.subscribe(() => {
        notifyCount++;
      });

      count.set(0); // Same value
      expect(notifyCount).toBe(0);
    });
  });

  describe('Derived Signals', () => {
    it('should create derived signals from other signals', () => {
      const a = createSignal(2);
      const b = createSignal(3);
      const sum = createDerived(() => a.get() + b.get());

      expect(sum.get()).toBe(5);
    });

    it('should update when dependencies change', () => {
      const a = createSignal(2);
      const double = createDerived(() => a.get() * 2);

      expect(double.get()).toBe(4);

      a.set(5);
      expect(double.get()).toBe(10);
    });
  });

  describe('Simple Effects', () => {
    it('should run effects immediately', () => {
      let runCount = 0;

      createEffect(() => {
        runCount++;
      });

      expect(runCount).toBe(1);
    });

    it('should cleanup effects', () => {
      let runCount = 0;

      const effect = createEffect(() => {
        runCount++;
      });

      expect(runCount).toBe(1);
      expect(effect.isActive()).toBe(true);

      effect.cleanup();
      expect(effect.isActive()).toBe(false);
    });

    it('should track active effects', () => {
      expect(getActiveEffectCount()).toBe(0);

      const effect1 = createEffect(() => {});
      expect(getActiveEffectCount()).toBe(1);

      const effect2 = createEffect(() => {});
      expect(getActiveEffectCount()).toBe(2);

      effect1.cleanup();
      expect(getActiveEffectCount()).toBe(1);

      effect2.cleanup();
      expect(getActiveEffectCount()).toBe(0);
    });
  });

  describe('Simple Batching', () => {
    it('should indicate when batching is active', () => {
      expect(isBatchingActive()).toBe(false);

      batch(() => {
        expect(isBatchingActive()).toBe(true);
      });

      expect(isBatchingActive()).toBe(false);
    });

    it('should return values from batch function', () => {
      const result = batch(() => {
        return 42;
      });

      expect(result).toBe(42);
    });

    it('should handle nested batches', () => {
      let outerBatch = false;
      let innerBatch = false;

      batch(() => {
        outerBatch = isBatchingActive();

        batch(() => {
          innerBatch = isBatchingActive();
        });
      });

      expect(outerBatch).toBe(true);
      expect(innerBatch).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should cleanup all effects', () => {
      createEffect(() => {});
      createEffect(() => {});
      createEffect(() => {});

      expect(getActiveEffectCount()).toBe(3);

      cleanupAllEffects();

      expect(getActiveEffectCount()).toBe(0);
    });
  });
});
