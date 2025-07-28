import { filesystem, os } from '@neutralinojs/lib';

let basePath = '';

export async function ensureBasePath(){
    if (basePath) return basePath;

    try {
        const dataDir = await os.getPath('data');
        basePath = `${dataDir}/.babylon_store`;

        console.log('[FileStorageDriver] Attempting to create directory at:', basePath);
        await filesystem.createDirectory(basePath);
    } catch (err) {
        // @ts-ignore
        if (!err.message.includes('EEXIST')) {
            console.error('[FileStorageDriver] Failed to create base path:', err);
            throw err;
        }
    }

    return basePath;
}

