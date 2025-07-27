export interface Signal<T> {
    get(): T;
    set(newValue: T): void;
    subscribe(listener: (val: T) => void): () => void; // unsubscribe
}
