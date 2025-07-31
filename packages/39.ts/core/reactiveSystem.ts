/**
 * 39.ts Reactive System - Consolidated Implementation
 *
 * This file consolidates all reactive primitives into a single module
 * to match the exports expected by the main index.ts file.
 */

import { Signal } from '../@types/state.js';

// ============================================================================
// DEPENDENCY TRACKING SYSTEM
// ============================================================================

export interface Effect {
  run: () => void;
  cleanup: () => void;
  dependencies: Set<Signal<any>>;
  addDependency: (signal: Signal<any>) => void;
  isActive: () => boolean;
}

export interface Resource<T> {
  data: Signal<T | undefined>;
  loading: Signal<boolean>;
  error: Signal<Error | null>;
  refetch: () => Promise<void>;
}

export interface ResourceOptions<T> {
  initialValue?: T;
  onError?: (error: Error) => void;
}

let currentEffect: Effect | null = null;
let effectIdCounter = 0;
let activeEffects: Set<Effect> = new Set();

// ============================================================================
// BATCHING SYSTEM
// ============================================================================

let isBatching = false;
let batchedUpdates: Set<() => void> = new Set();

export function batch<T>(fn: () => T): T {
  if (isBatching) {
    return fn();
  }

  isBatching = true;
  try {
    const result = fn();

    // Execute all batched updates
    const updates = Array.from(batchedUpdates);
    batchedUpdates.clear();
    updates.forEach(update => update());

    return result;
  } finally {
    isBatching = false;
  }
}

export function isBatchingActive(): boolean {
  return isBatching;
}

export function getBatchSize(): number {
  return batchedUpdates.size;
}

// ============================================================================
// SIGNAL SYSTEM
// ============================================================================

let signalIdCounter = 0;
export let signalLogFn: ((name: string, value: unknown) => void) | null = null;

export function setSignalLogger(fn: typeof signalLogFn): void {
  signalLogFn = fn;
}

export function createSignal<T>(initial: T): Signal<T> {
  if (initial === undefined) {
    throw new Error('Signal initial value cannot be undefined. Use null instead.');
  }

  let value = initial;
  const signalId = `signal:${signalIdCounter++}`;
  const dependentEffects: Set<Effect> = new Set();
  const subscribers: Array<(val: T) => void> = [];

  const signal: Signal<T> = {
    get() {
      // Track dependency if we're inside an effect
      if (currentEffect) {
        dependentEffects.add(currentEffect);
        currentEffect.addDependency(signal);
      }
      return value;
    },

    set(newValue: T) {
      if (newValue === undefined) {
        throw new Error('Signal value cannot be set to undefined. Use null instead.');
      }

      // Only notify if value actually changed (using Object.is for proper comparison)
      if (!Object.is(value, newValue)) {
        value = newValue;

        // Log if logger is set
        if (signalLogFn) {
          signalLogFn(signalId, newValue);
        }

        // Notify direct subscribers
        subscribers.forEach(subscriber => {
          try {
            subscriber(newValue);
          } catch (error) {
            console.error('Subscriber error:', error);
          }
        });

        // Notify dependent effects
        const notifyEffects = () => {
          dependentEffects.forEach(effect => {
            try {
              effect.run();
            } catch (error) {
              console.error('Effect execution error:', error);
            }
          });
        };

        if (isBatching) {
          batchedUpdates.add(notifyEffects);
        } else {
          notifyEffects();
        }
      }
    },

    subscribe(listener: (val: T) => void) {
      if (typeof listener !== 'function') {
        throw new Error('Signal subscribe() requires a function listener');
      }

      subscribers.push(listener);

      // Return unsubscribe function
      return () => {
        const index = subscribers.indexOf(listener);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      };
    }
  };

  return signal;
}

// ============================================================================
// DERIVED SIGNALS
// ============================================================================

export function createDerived<T>(fn: () => T): Signal<T> {
  const derivedSignal = createSignal(fn());

  createEffect(() => {
    const newValue = fn();
    derivedSignal.set(newValue);
  });

  return derivedSignal;
}

// ============================================================================
// EFFECTS SYSTEM
// ============================================================================

export function createEffect(fn: () => void): Effect {
  const dependencies: Set<Signal<any>> = new Set();

  const effect: Effect = {
    run() {
      // Clear existing dependencies
      dependencies.clear();

      // Set as current effect for dependency tracking
      const prevEffect = currentEffect;
      currentEffect = effect;

      try {
        fn();
      } finally {
        currentEffect = prevEffect;
      }
    },

    cleanup() {
      activeEffects.delete(effect);
      dependencies.clear();
    },

    dependencies,

    addDependency(signal: Signal<any>) {
      dependencies.add(signal);
    },

    isActive() {
      return activeEffects.has(effect);
    }
  };

  activeEffects.add(effect);

  // Run the effect initially
  effect.run();

  return effect;
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

export function getActiveEffectCount(): number {
  return activeEffects.size;
}

export function cleanupAllEffects(): void {
  activeEffects.forEach(effect => effect.cleanup());
  activeEffects.clear();
}

export function untracked<T>(fn: () => T): T {
  const prevEffect = currentEffect;
  currentEffect = null;
  try {
    return fn();
  } finally {
    currentEffect = prevEffect;
  }
}

// ============================================================================
// ADVANCED SIGNAL FUNCTIONS (ST-006 Features)
// ============================================================================

export function getEffectStats() {
  return {
    active: activeEffects.size,
    batching: isBatching,
    batchSize: batchedUpdates.size
  };
}

export function createComputed<T>(fn: () => T): Signal<T> {
  return createDerived(fn);
}

export function createValidatedSignal<T>(
  initial: T,
  validator: (value: T) => boolean
): Signal<T> {
  const signal = createSignal(initial);
  const originalSet = signal.set;

  signal.set = (newValue: T) => {
    if (!validator(newValue)) {
      throw new Error('Signal validation failed');
    }
    originalSet(newValue);
  };

  return signal;
}

export function createPersistedSignal<T>(
  key: string,
  initial: T
): Signal<T> {
  // Get initial value from localStorage if available
  let storedValue = initial;
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        storedValue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to parse stored value for key:', key);
    }
  }

  const signal = createSignal(storedValue);

  // Persist changes to localStorage
  if (typeof localStorage !== 'undefined') {
    createEffect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(signal.get()));
      } catch (error) {
        console.warn('Failed to persist signal value for key:', key);
      }
    });
  }

  return signal;
}

export function createDebouncedSignal<T>(
  initial: T,
  delay: number = 300
): Signal<T> {
  const signal = createSignal(initial);
  const debouncedSignal = createSignal(initial);
  let timeoutId: NodeJS.Timeout | null = null;

  createEffect(() => {
    const value = signal.get();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      debouncedSignal.set(value);
    }, delay);
  });

  return {
    get: debouncedSignal.get,
    set: signal.set,
    subscribe: debouncedSignal.subscribe
  };
}

export function createResource<T>(
  fetcher: () => Promise<T>,
  options: ResourceOptions<T> = {}
): Resource<T> {
  const data = createSignal<T | undefined>(options.initialValue);
  const loading = createSignal(false);
  const error = createSignal<Error | null>(null);

  const refetch = async () => {
    loading.set(true);
    error.set(null);

    try {
      const result = await fetcher();
      data.set(result);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.set(errorObj);
      if (options.onError) {
        options.onError(errorObj);
      }
    } finally {
      loading.set(false);
    }
  };

  // Initial fetch
  refetch();

  return { data, loading, error, refetch };
}
