import { createStore } from '39.ts/core/store';
import type { StorageDriver } from '39.ts/storage/storageDriver';
import { WebStorageDriver } from '39.ts/storage/webStorage';

let globalStore: Awaited<ReturnType<typeof createStore>> | null = null;

export async function initGlobalStore(driver?: StorageDriver) {
    if (globalStore) return globalStore;

    globalStore = await createStore({
        key: 'appState',
        initial: { theme: 'dark', user: '' },
        persist: true,
        driver: driver ?? new WebStorageDriver()
    });

    return globalStore;
}