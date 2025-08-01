/**
 * Abstract base for storage drivers.
 * Extend this class and implement all methods.
 */
export abstract class StorageDriver {
    abstract get(key: string): Promise<string | null>;
    abstract set(key: string, value: string): Promise<void>;
    abstract remove(key: string): Promise<void>;
}