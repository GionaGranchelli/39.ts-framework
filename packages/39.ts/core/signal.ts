import { eventBus } from './eventBus.js';
import { Signal } from '../@types/state.js';

/**
 * Batch system state - integrated directly into signal system
 */
let isBatching = false;
let batchedEvents: Array<{ id: string; value: unknown }> = [];

/**
 * Optional global logger hook for every signal change.
 */
export let signalLogFn: ((name: string, value: unknown) => void) | null = null;

export function setSignalLogger(fn: typeof signalLogFn): void {
    signalLogFn = fn;
}

// Export batch control functions
export function setBatchingState(batching: boolean): void {
  isBatching = batching;
}

export function getBatchingState(): boolean {
  return isBatching;
}

export function getBatchedEventsCount(): number {
  return batchedEvents.length;
}

export function addToBatch(id: string, value: unknown): void {
  const existingIndex = batchedEvents.findIndex(event => event.id === id);
  if (existingIndex !== -1) {
    batchedEvents[existingIndex] = { id, value };
  } else {
    batchedEvents.push({ id, value });
  }
}

export function flushBatch(): void {
  for (const event of batchedEvents) {
    eventBus.emit(event.id, event.value);
  }
  batchedEvents = [];
}

let signalIdCounter = 0;

export function createSignal<T>(initial: T): Signal<T> {
    if (initial === undefined) {
        throw new Error('Signal initial value cannot be undefined. Use null instead.');
    }

    let value = initial;
    const signalId = `signal:${signalIdCounter++}`;
    const listeners: Array<(val: T) => void> = [];

    const signal: Signal<T> = {
        get() {
            return value;
        },
        set(newValue: T) {
            if (newValue === undefined) {
                throw new Error('Signal value cannot be set to undefined. Use null instead.');
            }

            if (!Object.is(value, newValue)) {
                value = newValue;

                // Log if logger is set
                if (signalLogFn) {
                    signalLogFn(signalId, newValue);
                }

                // Emit change event (batched or immediate)
                if (isBatching) {
                    addToBatch(signalId, newValue);
                } else {
                    eventBus.emit(signalId, newValue);
                }

                // Notify direct subscribers
                for (const listener of listeners) {
                    listener(newValue);
                }
            }
        },
        subscribe(listener: (val: T) => void) {
            listeners.push(listener);

            // Return unsubscribe function
            return () => {
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            };
        }
    };

    return signal;
}
