import { createSignal } from './signal';
import type { StorageDriver } from '../storage/storageDriver';
import { WebStorageDriver } from '../storage/webStorage';

export type StoreConfig<T> = {
    key: string;
    initial: T;
    persist?: boolean;
    driver?: StorageDriver;
};

export interface Store<T> {
    state: ReturnType<typeof createSignal<T>>;
    set<K extends keyof T>(field: K, value: T[K]): void;
    get<K extends keyof T>(field: K): T[K];
}

export async function createStore<T extends Record<string, any>>(config: StoreConfig<T>): Promise<Store<T>> {
    const {
        key,
        initial,
        persist = false,
        driver = new WebStorageDriver() // default to web
    } = config;

    if (!driver) {
        console.warn(`[store] No storage driver provided. Falling back to in-memory only.`);
    }

    let stateObj = initial;

    if (persist) {
        try {
            const raw = await driver.get(key);
            if (raw) {
                stateObj = { ...initial, ...JSON.parse(raw) };
            }
        } catch (err) {
            console.warn(`[store] Failed to load persisted state for ${key}:`, err);
        }
    }

    const signal = createSignal<T>(stateObj);

    const set = <K extends keyof T>(field: K, value: T[K]): void => {
        const current = signal.get();
        const updated = { ...current, [field]: value };
        signal.set(updated);
        if (persist) {
            driver.set(key, JSON.stringify(updated)).catch(err => {
                console.error(`[store] Failed to persist state for ${key}:`, err);
            });
        }
    };

    const get = <K extends keyof T>(field: K): T[K] => {
        return signal.get()[field];
    };

    return {
        state: signal,
        set,
        get
    };
}
