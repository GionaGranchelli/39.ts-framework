import { StorageDriver } from './storageDriver';

export class WebStorageDriver extends StorageDriver {

    async get(key: string) {
        return localStorage.getItem(key);
    }
    async set(key: string, value: string) {
        localStorage.setItem(key, value);
    }
    async remove(key: string) {
        localStorage.removeItem(key);
    }
}