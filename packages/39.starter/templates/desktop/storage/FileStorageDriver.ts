import type {StorageDriver} from "39.ts/dist/storage/storageDriver";
import {filesystem} from "@neutralinojs/lib";

export class FileStorageDriver extends StorageDriver {
    async get(key) {
        try {
            const dir = await ensureBasePath();
            const filePath = `${dir}/${key}.json`;
            return await filesystem.readFile(filePath);
        } catch (err) {
            console.warn(`[FileStorageDriver] Failed to read ${key}:`, err);
            return null;
        }
    }

    async set(key, value) {
        try {
            const dir = await ensureBasePath();
            const filePath = `${dir}/${key}.json`;
            await filesystem.writeFile(filePath, value);
        } catch (err) {
            console.error(`[FileStorageDriver] Failed to write ${key}:`, err);
            throw err;
        }
    }

    async remove(key) {
        try {
            const dir = await ensureBasePath();
            const filePath = `${dir}/${key}.json`;
            await filesystem.remove(filePath);
        } catch (err) {
            console.warn(`[FileStorageDriver] Failed to remove ${key}:`, err);
        }
    }
}