// Main exports for 39.ts-neutralino package
export { NeutralinoProvider, useNeutralinoContext } from './context/NeutralinoProvider.js';
export type { NeutralinoContextState, NeutralinoContextValue } from './context/NeutralinoContext.types.js';

// Re-export Neutralino API types
export * from './api/neutralino.d.js';

// Export hooks
export { useFileSystem } from './hooks/useFileSystem.js';
export type {
  FileSystemError,
  FileOperation,
  UseFileSystemReturn
} from './hooks/useFileSystem.js';

export { useWindowState } from './hooks/useWindowState.js';
export type {
  WindowError,
  UseWindowStateReturn
} from './hooks/useWindowState.js';
