/**
 * Neutralino.js API Type Definitions
 *
 * This file provides TypeScript interfaces and types for Neutralino.js APIs.
 * @see https://neutralino.js.org/docs/api/overview
 */

export interface NeutralinoFileSystem {
  /**
   * Reads a file from the filesystem.
   * @param path Absolute or relative file path
   * @returns Promise resolving to file content (string or ArrayBuffer)
   */
  readFile(path: string): Promise<string | ArrayBuffer>;

  /**
   * Writes data to a file.
   * @param path File path
   * @param data Content to write
   * @returns Promise<void>
   */
  writeFile(path: string, data: string | ArrayBuffer): Promise<void>;

  /**
   * Deletes a file.
   * @param path File path
   * @returns Promise<void>
   */
  deleteFile(path: string): Promise<void>;

  // ...other methods as per Neutralino.js FileSystem API
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

export interface Neutralino {
  filesystem: NeutralinoFileSystem;
  window: NeutralinoWindow;
  // ...other APIs (os, app, etc.)
}

/**
 * Global Neutralino object
 */
declare global {
  interface Window {
    Neutralino?: Neutralino;
  }
}

