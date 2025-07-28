/**
 * A reactive signal that holds a value and notifies subscribers when it changes.
 */
export interface Signal<T> {
    /** Get the current value */
    get(): T;
    /** Set a new value and notify subscribers */
    set(newValue: T): void;
    /** Subscribe to value changes. Returns unsubscribe function. */
    subscribe(listener: (val: T) => void): () => void;
}
