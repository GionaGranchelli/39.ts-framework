/**
 * Neutralino.js API Type Definitions
 *
 * This file provides TypeScript interfaces and types for Neutralino.js APIs.
 * @see https://neutralino.js.org/docs/api/overview
 */

export interface NeutralinoFileStats {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  createdAt: number;
  modifiedAt: number;
}

export interface NeutralinoFileSystem {
  /**
   * Reads a file from the filesystem.
   * @param path Absolute or relative file path
   * @returns Promise resolving to file content as string
   */
  readFile(path: string): Promise<string>;

  /**
   * Reads a binary file from the filesystem.
   * @param path Absolute or relative file path
   * @returns Promise resolving to file content as ArrayBuffer
   */
  readBinaryFile(path: string): Promise<ArrayBuffer>;

  /**
   * Writes text data to a file.
   * @param path File path
   * @param data Content to write
   * @returns Promise<void>
   */
  writeFile(path: string, data: string): Promise<void>;

  /**
   * Writes binary data to a file.
   * @param path File path
   * @param data Binary content to write
   * @returns Promise<void>
   */
  writeBinaryFile(path: string, data: ArrayBuffer): Promise<void>;

  /**
   * Deletes a file.
   * @param path File path
   * @returns Promise<void>
   */
  removeFile(path: string): Promise<void>;

  /**
   * Gets file statistics.
   * @param path File path
   * @returns Promise resolving to file stats
   */
  getStats(path: string): Promise<NeutralinoFileStats>;
}

export interface NeutralinoWindow {
  /**
   * Minimizes the window.
   */
  minimize(): Promise<void>;

  /**
   * Maximizes the window.
   */
  maximize(): Promise<void>;

  /**
   * Sets window to full screen.
   */
  setFullScreen(full: boolean): Promise<void>;

  // ...other methods as per Neutralino.js Window API
}

export interface NeutralinoAPI {
  filesystem: NeutralinoFileSystem;
  window: NeutralinoWindow;
}

// Global window extension
declare global {
  interface Window {
    Neutralino?: NeutralinoAPI;
  }
}
