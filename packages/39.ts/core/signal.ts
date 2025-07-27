// /core/signal.ts
import { eventBus } from './eventBus';
import { Signal} from "../@types/state";

export let signalLogFn: ((name: string, value: any) => void) | null = null;

export function setSignalLogger(fn: typeof signalLogFn) {
    signalLogFn = fn;
}

let signalIdCounter = 0;

export function createSignal<T>(initial: T): Signal<T> {
    const id = `signal:${signalIdCounter++}`;
    let value = initial;

    return {
        get() {
            return value;
        },
        set(newValue: T) {
            value = newValue;
            if (signalLogFn) signalLogFn(id, newValue);
            eventBus.emit(id, value);
        },
        subscribe(listener: (val: T) => void): () => void {
            eventBus.on(id, listener);
            return () => eventBus.off(id, listener);
        }
    };
}
