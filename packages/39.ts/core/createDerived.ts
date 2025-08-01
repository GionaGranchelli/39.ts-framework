import { eventBus } from './eventBus';
import {Signal} from "../@types/state";

let derivedIdCounter = 0;

export function createDerived<T>(
    compute: () => T,
    deps: Signal<any>[]
): Signal<T> {
    const id = `derived:${derivedIdCounter++}`;
    let value = compute();

    // Subscribe to each dependency
    deps.forEach((dep) => {
        dep.subscribe(() => {
            value = compute();
            eventBus.emit(id, value);
        });
    });

    return {
        get() {
            return value;
        },
        set() {
            throw new Error('❌ Cannot set value of a derived signal.');
        },
        subscribe(listener: (val: T) => void): () => void {
            eventBus.on(id, listener);
            return () => eventBus.off(id, listener);
        },
    };
}
