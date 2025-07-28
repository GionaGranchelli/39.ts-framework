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

export interface NeutralinoWindowSize {
  width: number;
  height: number;
}

export interface NeutralinoWindowPosition {
  x: number;
  y: number;
}

export interface NeutralinoWindowState {
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  isVisible: boolean;
  isFullScreen: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  isAlwaysOnTop: boolean;
  isResizable: boolean;
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
   * Unmaximizes the window (restores from maximized state).
   */
  unmaximize(): Promise<void>;

  /**
   * Shows the window.
   */
  show(): Promise<void>;

  /**
   * Hides the window.
   */
  hide(): Promise<void>;

  /**
   * Sets window to full screen.
   */
  setFullScreen(enabled: boolean): Promise<void>;

  /**
   * Exits full screen mode.
   */
  exitFullScreen(): Promise<void>;

  /**
   * Sets the window to always be on top.
   */
  setAlwaysOnTop(enabled: boolean): Promise<void>;

  /**
   * Sets the window size.
   */
  setSize(size: NeutralinoWindowSize): Promise<void>;

  /**
   * Gets the current window size.
   */
  getSize(): Promise<NeutralinoWindowSize>;

  /**
   * Sets the window position.
   */
  setPosition(position: NeutralinoWindowPosition): Promise<void>;

  /**
   * Gets the current window position.
   */
  getPosition(): Promise<NeutralinoWindowPosition>;

  /**
   * Sets the window title.
   */
  setTitle(title: string): Promise<void>;

  /**
   * Gets the window title.
   */
  getTitle(): Promise<string>;

  /**
   * Centers the window on the screen.
   */
  center(): Promise<void>;

  /**
   * Sets whether the window is resizable.
   */
  setResizable(enabled: boolean): Promise<void>;

  /**
   * Moves the window to the front.
   */
  focus(): Promise<void>;

  /**
   * Creates a window event listener.
   */
  addEventListener(event: string, handler: (data?: any) => void): Promise<void>;

  /**
   * Removes a window event listener.
   */
  removeEventListener(event: string, handler: (data?: any) => void): Promise<void>;
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
