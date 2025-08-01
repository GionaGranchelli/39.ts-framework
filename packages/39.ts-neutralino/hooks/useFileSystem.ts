/**
 * File System Hook for Neutralino.js
 * 
 * Provides a reactive hook interface for file system operations
 * with type safety and error handling.
 */

import { createSignal } from '39.ts';
import { useNeutralinoContext } from '../context/NeutralinoProvider.js';
import type { NeutralinoFileStats } from '../api/neutralino.d.js';

export interface FileSystemError {
  code: string;
  message: string;
  path?: string;
}

export interface FileOperation<T = any> {
  data: T | null;
  loading: boolean;
  error: FileSystemError | null;
}

export interface UseFileSystemReturn {
  /**
   * Read a text file from the filesystem
   * @param path File path to read
   * @returns Promise resolving to file content
   */
  readTextFile: (path: string) => Promise<string>;
  
  /**
   * Read a binary file from the filesystem
   * @param path File path to read
   * @returns Promise resolving to ArrayBuffer
   */
  readBinaryFile: (path: string) => Promise<ArrayBuffer>;
  
  /**
   * Write text content to a file
   * @param path File path to write
   * @param content Text content to write
   * @returns Promise resolving when write completes
   */
  writeTextFile: (path: string, content: string) => Promise<void>;
  
  /**
   * Write binary content to a file
   * @param path File path to write
   * @param content Binary content to write
   * @returns Promise resolving when write completes
   */
  writeBinaryFile: (path: string, content: ArrayBuffer) => Promise<void>;
  
  /**
   * Delete a file
   * @param path File path to delete
   * @returns Promise resolving when delete completes
   */
  deleteFile: (path: string) => Promise<void>;
  
  /**
   * Check if a file exists
   * @param path File path to check
   * @returns Promise resolving to boolean
   */
  fileExists: (path: string) => Promise<boolean>;
  
  /**
   * Get file statistics
   * @param path File path to stat
   * @returns Promise resolving to file stats
   */
  getFileStats: (path: string) => Promise<any>;
}

/**
 * Hook for file system operations in Neutralino.js applications
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const fs = useFileSystem();
 *   
 *   const handleSave = async () => {
 *     try {
 *       await fs.writeTextFile('./config.json', JSON.stringify(config));
 *       console.log('File saved!');
 *     } catch (error) {
 *       console.error('Save failed:', error);
 *     }
 *   };
 *   
 *   return h('button', { onclick: handleSave }, ['Save Config']);
 * }
 * ```
 */
export function useFileSystem(): UseFileSystemReturn {
  const { isNeutralino, ready } = useNeutralinoContext();
  
  const ensureNeutralinoReady = () => {
    if (!isNeutralino) {
      throw new Error('File system operations are only available in Neutralino.js environment');
    }
    
    if (!ready) {
      throw new Error('Neutralino.js is not ready yet');
    }
    
    if (typeof window === 'undefined' || !window.Neutralino) {
      throw new Error('Neutralino.js APIs are not available');
    }
  };

  const createFileSystemError = (error: any, path?: string): FileSystemError => {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown file system error occurred',
      path
    };
  };

  const readTextFile = async (path: string): Promise<string> => {
    ensureNeutralinoReady();
    
    try {
      const content = await window.Neutralino!.filesystem.readFile(path);
      if (typeof content !== 'string') {
        throw new Error('Expected text content but received binary data');
      }
      return content;
    } catch (error) {
      throw createFileSystemError(error, path);
    }
  };

  const readBinaryFile = async (path: string): Promise<ArrayBuffer> => {
    ensureNeutralinoReady();
    
    try {
      const content = await window.Neutralino!.filesystem.readBinaryFile(path);
      if (!(content instanceof ArrayBuffer)) {
        throw new Error('Expected binary content but received text data');
      }
      return content;
    } catch (error) {
      throw createFileSystemError(error, path);
    }
  };

  const writeTextFile = async (path: string, content: string): Promise<void> => {
    ensureNeutralinoReady();
    
    if (typeof content !== 'string') {
      throw new Error('Content must be a string for text file operations');
    }
    
    try {
      await window.Neutralino!.filesystem.writeFile(path, content);
    } catch (error) {
      throw createFileSystemError(error, path);
    }
  };

  const writeBinaryFile = async (path: string, content: ArrayBuffer): Promise<void> => {
    ensureNeutralinoReady();
    
    if (!(content instanceof ArrayBuffer)) {
      throw new Error('Content must be an ArrayBuffer for binary file operations');
    }
    
    try {
      await window.Neutralino!.filesystem.writeBinaryFile(path, content);
    } catch (error) {
      throw createFileSystemError(error, path);
    }
  };

  const deleteFile = async (path: string): Promise<void> => {
    ensureNeutralinoReady();
    
    try {
      await window.Neutralino!.filesystem.removeFile(path);
    } catch (error) {
      throw createFileSystemError(error, path);
    }
  };

  const fileExists = async (path: string): Promise<boolean> => {
    ensureNeutralinoReady();
    
    try {
      await window.Neutralino!.filesystem.getStats(path);
      return true;
    } catch (error: any) {
      // If file doesn't exist, getStats throws an error
      if (error.code === 'NE_FS_NOPATHE' || error.code === 'ENOENT') {
        return false;
      }
      throw createFileSystemError(error, path);
    }
  };

  const getFileStats = async (path: string): Promise<NeutralinoFileStats> => {
    ensureNeutralinoReady();
    
    try {
      return await window.Neutralino!.filesystem.getStats(path);
    } catch (error) {
      throw createFileSystemError(error, path);
    }
  };

  return {
    readTextFile,
    readBinaryFile,
    writeTextFile,
    writeBinaryFile,
    deleteFile,
    fileExists,
    getFileStats
  };
}
