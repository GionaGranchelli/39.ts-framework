import { createStore, type Store } from '39.ts/core/store';
import { WebStorageDriver } from '39.ts';
import type { BaseAppState } from '39.ts/@types/Config';

export type AppState = BaseAppState;

let globalStore: Store<AppState> | null = null;

// @ts-ignore
export async function initGlobalStore(): Promise<Store<AppState>> {
    if (globalStore) return globalStore;

    globalStore = await createStore<AppState>({
        key: 'appState',
        initial: { theme: 'light' },
        persist: true,
        driver: new WebStorageDriver()
    });

    return globalStore;
}
