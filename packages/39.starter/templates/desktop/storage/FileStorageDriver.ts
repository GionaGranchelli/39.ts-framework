

import {filesystem} from "@neutralinojs/lib";
import {ensureBasePath} from "./fileStorage";
import {StorageDriver} from "39.ts/dist/storage/storageDriver";

export class FileStorageDriver extends StorageDriver {
    async get(key: any) {
        try {
            const dir = await ensureBasePath();
            const filePath = `${dir}/${key}.json`;
            return await filesystem.readFile(filePath);
        } catch (err) {
            console.warn(`[FileStorageDriver] Failed to read ${key}:`, err);
            return null;
        }
    }

    async set(key: any, value: string) {
        try {
            const dir = await ensureBasePath();
            const filePath = `${dir}/${key}.json`;
            await filesystem.writeFile(filePath, value);
        } catch (err) {
            console.error(`[FileStorageDriver] Failed to write ${key}:`, err);
            throw err;
        }
    }

    async remove(key: any) {
        try {
            const dir = await ensureBasePath();
            const filePath = `${dir}/${key}.json`;
            await filesystem.remove(filePath);
        } catch (err) {
            console.warn(`[FileStorageDriver] Failed to remove ${key}:`, err);
        }
    }
}