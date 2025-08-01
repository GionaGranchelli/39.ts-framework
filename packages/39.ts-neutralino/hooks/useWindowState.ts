/**
 * Window State Hook for Neutralino.js
 * 
 * Provides a reactive hook interface for window management operations
 * with type safety, state tracking, and event handling.
 */

import { createSignal } from '39.ts';
import { useNeutralinoContext } from '../context/NeutralinoProvider.js';
import type { 
  NeutralinoWindowSize, 
  NeutralinoWindowPosition, 
  NeutralinoWindowState 
} from '../api/neutralino.d.js';

export interface WindowError {
  code: string;
  message: string;
  operation?: string;
}

export interface UseWindowStateReturn {
  // State signals
  windowState: () => NeutralinoWindowState | null;
  loading: () => boolean;
  error: () => WindowError | null;

  // Window control methods
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  unmaximize: () => Promise<void>;
  show: () => Promise<void>;
  hide: () => Promise<void>;
  focus: () => Promise<void>;
  center: () => Promise<void>;

  // Size and position
  setSize: (size: NeutralinoWindowSize) => Promise<void>;
  getSize: () => Promise<NeutralinoWindowSize>;
  setPosition: (position: NeutralinoWindowPosition) => Promise<void>;
  getPosition: () => Promise<NeutralinoWindowPosition>;

  // Window properties
  setTitle: (title: string) => Promise<void>;
  getTitle: () => Promise<string>;
  setFullScreen: (enabled: boolean) => Promise<void>;
  setAlwaysOnTop: (enabled: boolean) => Promise<void>;
  setResizable: (enabled: boolean) => Promise<void>;

  // Event handling
  addEventListener: (event: string, handler: (data?: any) => void) => Promise<void>;
  removeEventListener: (event: string, handler: (data?: any) => void) => Promise<void>;

  // Utility methods
  refreshState: () => Promise<void>;
}

/**
 * Hook for managing window state and operations in Neutralino.js applications
 * 
 * @returns Object containing window state signals and control methods
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const window = useWindowState();
 * 
 *   const handleMinimize = () => {
 *     window.minimize();
 *   };
 * 
 *   const handleResize = () => {
 *     window.setSize({ width: 800, height: 600 });
 *   };
 * 
 *   return Div({}, [
 *     Button({ onclick: handleMinimize }, ['Minimize']),
 *     Button({ onclick: handleResize }, ['Resize'])
 *   ]);
 * }
 * ```
 */
export function useWindowState(): UseWindowStateReturn {
  const { isNeutralinoAvailable, api } = useNeutralinoContext();

  // State signals - renamed to avoid naming conflicts
  const windowStateSignal = createSignal<NeutralinoWindowState | null>(null);
  const loading = createSignal<boolean>(false);
  const error = createSignal<WindowError | null>(null);

  // Helper function to handle window operations
  const withErrorHandling = async <T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    if (!isNeutralinoAvailable()) {
      const err: WindowError = {
        code: 'NEUTRALINO_NOT_AVAILABLE',
        message: 'Neutralino.js is not available in this environment',
        operation
      };
      error.set(err);
      throw new Error(err.message);
    }

    if (!api()?.window) {
      const err: WindowError = {
        code: 'WINDOW_API_NOT_AVAILABLE',
        message: 'Window API is not available',
        operation
      };
      error.set(err);
      throw new Error(err.message);
    }

    try {
      loading.set(true);
      error.set(null);
      const result = await fn();
      loading.set(false);
      return result;
    } catch (e) {
      const err: WindowError = {
        code: 'WINDOW_OPERATION_FAILED',
        message: e instanceof Error ? e.message : 'Unknown window operation error',
        operation
      };
      error.set(err);
      loading.set(false);
      throw e;
    }
  };

  // Window control methods
  const minimize = async (): Promise<void> => {
    return withErrorHandling('minimize', async () => {
      await api()!.window.minimize();
      // Update local state
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isMinimized: true });
      }
    });
  };

  const maximize = async (): Promise<void> => {
    return withErrorHandling('maximize', async () => {
      await api()!.window.maximize();
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isMaximized: true, isMinimized: false });
      }
    });
  };

  const unmaximize = async (): Promise<void> => {
    return withErrorHandling('unmaximize', async () => {
      await api()!.window.unmaximize();
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isMaximized: false });
      }
    });
  };

  const show = async (): Promise<void> => {
    return withErrorHandling('show', async () => {
      await api()!.window.show();
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isVisible: true });
      }
    });
  };

  const hide = async (): Promise<void> => {
    return withErrorHandling('hide', async () => {
      await api()!.window.hide();
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isVisible: false });
      }
    });
  };

  const focus = async (): Promise<void> => {
    return withErrorHandling('focus', async () => {
      await api()!.window.focus();
    });
  };

  const center = async (): Promise<void> => {
    return withErrorHandling('center', async () => {
      await api()!.window.center();
    });
  };

  // Size and position methods
  const setSize = async (size: NeutralinoWindowSize): Promise<void> => {
    return withErrorHandling('setSize', async () => {
      await api()!.window.setSize(size);
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, width: size.width, height: size.height });
      }
    });
  };

  const getSize = async (): Promise<NeutralinoWindowSize> => {
    return withErrorHandling('getSize', async () => {
      const size = await api()!.window.getSize();
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, width: size.width, height: size.height });
      }
      return size;
    });
  };

  const setPosition = async (position: NeutralinoWindowPosition): Promise<void> => {
    return withErrorHandling('setPosition', async () => {
      await api()!.window.setPosition(position);
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, x: position.x, y: position.y });
      }
    });
  };

  const getPosition = async (): Promise<NeutralinoWindowPosition> => {
    return withErrorHandling('getPosition', async () => {
      const position = await api()!.window.getPosition();
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, x: position.x, y: position.y });
      }
      return position;
    });
  };

  // Window properties
  const setTitle = async (title: string): Promise<void> => {
    return withErrorHandling('setTitle', async () => {
      await api()!.window.setTitle(title);
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, title });
      }
    });
  };

  const getTitle = async (): Promise<string> => {
    return withErrorHandling('getTitle', async () => {
      const title = await api()!.window.getTitle();
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, title });
      }
      return title;
    });
  };

  const setFullScreen = async (enabled: boolean): Promise<void> => {
    return withErrorHandling('setFullScreen', async () => {
      await api()!.window.setFullScreen(enabled);
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isFullScreen: enabled });
      }
    });
  };

  const setAlwaysOnTop = async (enabled: boolean): Promise<void> => {
    return withErrorHandling('setAlwaysOnTop', async () => {
      await api()!.window.setAlwaysOnTop(enabled);
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isAlwaysOnTop: enabled });
      }
    });
  };

  const setResizable = async (enabled: boolean): Promise<void> => {
    return withErrorHandling('setResizable', async () => {
      await api()!.window.setResizable(enabled);
      const current = windowStateSignal.get();
      if (current) {
        windowStateSignal.set({ ...current, isResizable: enabled });
      }
    });
  };

  // Event handling
  const addEventListener = async (event: string, handler: (data?: any) => void): Promise<void> => {
    return withErrorHandling('addEventListener', async () => {
      await api()!.window.addEventListener(event, handler);
    });
  };

  const removeEventListener = async (event: string, handler: (data?: any) => void): Promise<void> => {
    return withErrorHandling('removeEventListener', async () => {
      await api()!.window.removeEventListener(event, handler);
    });
  };

  // Utility method to refresh window state
  const refreshState = async (): Promise<void> => {
    if (!isNeutralinoAvailable() || !api()?.window) return;

    try {
      loading.set(true);
      error.set(null);

      const [size, position, title] = await Promise.all([
        api()!.window.getSize(),
        api()!.window.getPosition(),
        api()!.window.getTitle()
      ]);

      // Create a basic window state (some properties may need to be tracked differently)
      const state: NeutralinoWindowState = {
        title,
        width: size.width,
        height: size.height,
        x: position.x,
        y: position.y,
        isVisible: true, // Default assumption
        isFullScreen: false, // Would need event tracking for accurate state
        isMaximized: false, // Would need event tracking for accurate state
        isMinimized: false, // Would need event tracking for accurate state
        isAlwaysOnTop: false, // Default assumption
        isResizable: true // Default assumption
      };

      windowStateSignal.set(state);
      loading.set(false);
    } catch (e) {
      const err: WindowError = {
        code: 'STATE_REFRESH_FAILED',
        message: e instanceof Error ? e.message : 'Failed to refresh window state',
        operation: 'refreshState'
      };
      error.set(err);
      loading.set(false);
    }
  };

  return {
    // State signals - use .get() to return the getter function
    windowState: windowStateSignal.get,
    loading: loading.get,
    error: error.get,

    // Window control methods
    minimize,
    maximize,
    unmaximize,
    show,
    hide,
    focus,
    center,

    // Size and position
    setSize,
    getSize,
    setPosition,
    getPosition,

    // Window properties
    setTitle,
    getTitle,
    setFullScreen,
    setAlwaysOnTop,
    setResizable,

    // Event handling
    addEventListener,
    removeEventListener,

    // Utility methods
    refreshState
  };
}
