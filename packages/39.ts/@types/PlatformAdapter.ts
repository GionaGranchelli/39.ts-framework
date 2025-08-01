
export interface PlatformAdapter {
    init?(): Promise<void>;
    showMessage?(title: string, content: string): void;
    readFile?(path: string): Promise<string>;
    writeFile?(path: string, content: string): Promise<void>;
}