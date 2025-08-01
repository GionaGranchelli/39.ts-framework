export interface Bridge {
    showMessage(title: string, content: string): void;
    readDir(path: string) : Promise<string[]>;
    isNeutralino(): boolean;
}