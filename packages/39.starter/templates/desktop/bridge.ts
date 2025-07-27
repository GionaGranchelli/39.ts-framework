import {Bridge} from "39.ts/@types/Bridge";

let Neutralino: any = null;
let neutralinoInitialized = false;

function isNeutralino() {
    return typeof window !== 'undefined' && window.hasOwnProperty('NL_APPID');
}

export async function initBridge() {
    try {
        if (isNeutralino()) {
            const nl = await import('@neutralinojs/lib');
            Neutralino = nl;
            await nl.init();
            neutralinoInitialized = true;
            console.log("Neutralino initialized successfully");
        } else {
            console.warn('⚠️ Not running in Neutralino: skipping bridge init');
        }
    } catch (error) {
        console.error("Failed to initialize Neutralino:", error);
        neutralinoInitialized = false;
    }

    return neutralinoInitialized;
}

export const bridge: Bridge = {
    isNeutralino: () => neutralinoInitialized,

    showMessage: (title: string, content: string) => {
        if (neutralinoInitialized && Neutralino) {
            return Neutralino.os.showMessageBox(title, content);
        } else {
            alert(`${title}: ${content}`);
            return Promise.resolve();
        }
    },

    readDir: async (path: string): Promise<string[]> => {
        if (neutralinoInitialized && Neutralino) {
            return await Neutralino.filesystem.readDirectory(path);
        } else {
            // Return mock data for browser environment instead of throwing
            console.warn('File system operations not available in browser, returning mock data');
            return [
                 'mock-file-1.txt' ,
                 'mock-file-2.txt' ,
                 'mock-folder'
            ];
        }
    }
};
