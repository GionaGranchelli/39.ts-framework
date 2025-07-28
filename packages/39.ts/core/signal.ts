import { eventBus } from './eventBus.js';
import { Signal } from '../@types/state.js';

/**
 * Optional global logger hook for every signal change.
 * Tests will drive this via setSignalLogger().
 */
export let signalLogFn: ((name: string, value: unknown) => void) | null = null;

/**
 * Install (or clear) a logger callback.
 */
export function setSignalLogger(fn: typeof signalLogFn): void {
    signalLogFn = fn;
}

let signalIdCounter = 0;

export function createSignal<T>(initial: T): Signal<T> {
    if (initial === undefined) {
        throw new Error('Signal initial value cannot be undefined. Use null instead.');
    }

    const id = `signal:${signalIdCounter++}`;
    let value = initial;

    return {
        get() {
            return value;
        },
        set(newValue: T) {
            if (newValue === undefined) {
                throw new Error('Signal value cannot be set to undefined. Use null instead.');
            }

            const prev = value;

            // only fire if truly changed
            if (!Object.is(prev, newValue)) {
                value = newValue;

                console.log("newValue");
                console.log(newValue);

                // 1) logger
                if (signalLogFn) {
                    signalLogFn(id, newValue);
                }
                // 2) subscribers
                eventBus.emit(id, newValue);
            }
        },
        subscribe(listener) {
            if (typeof listener !== 'function') {
                throw new Error('Signal subscribe() requires a function listener');
            }
            eventBus.on(id, listener);
            // return unsubscribe
            return () => {
                eventBus.off(id, listener);
            };
        }
    };
}
