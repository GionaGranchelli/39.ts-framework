import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSignal, setSignalLogger } from '39.ts';

describe('createSignal', () => {
  beforeEach(() => {
    // Reset logger before each test
    setSignalLogger(null);
  });

  it('should create a signal with initial value', () => {
    const signal = createSignal(42);
    expect(signal.get()).toBe(42);
  });

  it('should update signal value', () => {
    const signal = createSignal(0);
    signal.set(10);
    expect(signal.get()).toBe(10);
  });

  it('should notify subscribers when value changes', () => {
    const signal = createSignal(0);
    const listener = vi.fn();
    
    signal.subscribe(listener);
    signal.set(5);
    
    expect(listener).toHaveBeenCalledWith(5);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  // it('should not notify subscribers when value remains the same', () => {
  //   const signal = createSignal(42);
  //   const listener = vi.fn();
  //
  //   signal.subscribe(listener);
  //   signal.set(42); // Same value
  //
  //   expect(listener).not.toHaveBeenCalled();
  // });

  it('should handle multiple subscribers', () => {
    const signal = createSignal('initial');
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    
    signal.subscribe(listener1);
    signal.subscribe(listener2);
    signal.set('updated');
    
    expect(listener1).toHaveBeenCalledWith('updated');
    expect(listener2).toHaveBeenCalledWith('updated');
  });

  it('should allow unsubscribing', () => {
    const signal = createSignal(0);
    const listener = vi.fn();
    
    const unsubscribe = signal.subscribe(listener);
    signal.set(1);
    expect(listener).toHaveBeenCalledTimes(1);
    
    unsubscribe();
    signal.set(2);
    expect(listener).toHaveBeenCalledTimes(1); // Not called again
  });

  it('should work with complex objects', () => {
    interface User {
      name: string;
      age: number;
    }
    
    const user = createSignal<User>({ name: 'Alice', age: 30 });
    const listener = vi.fn();
    
    user.subscribe(listener);
    user.set({ name: 'Bob', age: 25 });
    
    expect(user.get().name).toBe('Bob');
    expect(listener).toHaveBeenCalledWith({ name: 'Bob', age: 25 });
  });

  // it('should throw error for undefined initial value', () => {
  //   expect(() => createSignal(undefined)).toThrow(
  //     'Signal initial value cannot be undefined. Use null instead.'
  //   );
  // });

  it('should throw error when setting undefined value', () => {
    const signal = createSignal(42);
    expect(() => signal.set(undefined as any)).toThrow(
      'Signal value cannot be set to undefined. Use null instead.'
    );
  });

  it('should throw error for invalid listener', () => {
    const signal = createSignal(0);
    expect(() => signal.subscribe('not a function' as any)).toThrow(
      'Signal subscribe() requires a function listener'
    );
  });

  it('should allow null values', () => {
    const signal = createSignal<string | null>(null);
    expect(signal.get()).toBe(null);

    signal.set('value');
    expect(signal.get()).toBe('value');

    signal.set(null);
    expect(signal.get()).toBe(null);
  });

  it('should work with boolean values', () => {
    const flag = createSignal(false);
    const listener = vi.fn();
    
    flag.subscribe(listener);
    flag.set(true);
    
    expect(flag.get()).toBe(true);
    expect(listener).toHaveBeenCalledWith(true);
  });

  it('should work with arrays', () => {
    const list = createSignal<number[]>([1, 2, 3]);
    const listener = vi.fn();
    
    list.subscribe(listener);
    list.set([4, 5, 6]);
    
    expect(list.get()).toEqual([4, 5, 6]);
    expect(listener).toHaveBeenCalledWith([4, 5, 6]);
  });
});

describe('signal logging', () => {
  beforeEach(() => {
    setSignalLogger(null);
  });

  it('should call logger when signal changes', () => {
    const logger = vi.fn();
    setSignalLogger(logger);
    
    const signal = createSignal(0);
    signal.set(42);
    
    expect(logger).toHaveBeenCalledWith(expect.stringMatching(/^signal:\d+$/), 42);
  });

  it('should not call logger when no logger is set', () => {
    const signal = createSignal(0);
    // Should not throw or cause issues
    signal.set(42);
    expect(signal.get()).toBe(42);
  });

  it('should not call logger when value does not change', () => {
    const logger = vi.fn();
    setSignalLogger(logger);
    
    const signal = createSignal(42);
    signal.set(42); // Same value
    
    expect(logger).not.toHaveBeenCalled();
  });
});
