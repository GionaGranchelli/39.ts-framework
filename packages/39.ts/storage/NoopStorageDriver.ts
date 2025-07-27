import  { StorageDriver } from './storageDriver';

export class NoopStorageDriver implements StorageDriver {
    async get(_: string): Promise<string | null> {
        return null;
    }

    async set(_: string, __: string): Promise<void> {
        // No-op
    }

    async remove(_: string): Promise<void> {

    }
}
