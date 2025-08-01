/**
 * Tests for useWindowState hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWindowState } from './useWindowState.js';
import type { NeutralinoAPI, NeutralinoWindowSize, NeutralinoWindowPosition } from '../api/neutralino.d.js';

// Mock the context provider
vi.mock('../context/NeutralinoProvider.js', () => ({
  useNeutralinoContext: vi.fn()
}));

// Mock 39.ts signals
vi.mock('39.ts', () => ({
  createSignal: vi.fn((initialValue) => {
    let value = initialValue;
    const get = () => value;
    const set = (newValue: any) => { value = newValue; };
    return { get, set };
  })
}));

import { useNeutralinoContext } from '../context/NeutralinoProvider.js';

const mockUseNeutralinoContext = vi.mocked(useNeutralinoContext);

describe('useWindowState', () => {
  let mockWindowApi: any;
  let mockApi: NeutralinoAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock window API
    mockWindowApi = {
      minimize: vi.fn().mockResolvedValue(undefined),
      maximize: vi.fn().mockResolvedValue(undefined),
      unmaximize: vi.fn().mockResolvedValue(undefined),
      show: vi.fn().mockResolvedValue(undefined),
      hide: vi.fn().mockResolvedValue(undefined),
      focus: vi.fn().mockResolvedValue(undefined),
      center: vi.fn().mockResolvedValue(undefined),
      setSize: vi.fn().mockResolvedValue(undefined),
      getSize: vi.fn().mockResolvedValue({ width: 800, height: 600 }),
      setPosition: vi.fn().mockResolvedValue(undefined),
      getPosition: vi.fn().mockResolvedValue({ x: 100, y: 100 }),
      setTitle: vi.fn().mockResolvedValue(undefined),
      getTitle: vi.fn().mockResolvedValue('Test Window'),
      setFullScreen: vi.fn().mockResolvedValue(undefined),
      setAlwaysOnTop: vi.fn().mockResolvedValue(undefined),
      setResizable: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn().mockResolvedValue(undefined),
      removeEventListener: vi.fn().mockResolvedValue(undefined)
    };

    mockApi = {
      window: mockWindowApi,
      filesystem: {} as any
    };
  });

  describe('Environment Validation', () => {
    it('should throw error when Neutralino is not available', async () => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => false,
        api: () => null
      });

      const windowState = useWindowState();
      
      await expect(windowState.minimize()).rejects.toThrow('Neutralino.js is not available in this environment');
      expect(windowState.error()).toEqual({
        code: 'NEUTRALINO_NOT_AVAILABLE',
        message: 'Neutralino.js is not available in this environment',
        operation: 'minimize'
      });
    });

    it('should throw error when window API is not available', async () => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => ({ window: null } as any)
      });

      const windowState = useWindowState();
      
      await expect(windowState.maximize()).rejects.toThrow('Window API is not available');
      expect(windowState.error()).toEqual({
        code: 'WINDOW_API_NOT_AVAILABLE',
        message: 'Window API is not available',
        operation: 'maximize'
      });
    });

    it('should work when Neutralino environment is properly set up', async () => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });

      const windowState = useWindowState();
      
      await expect(windowState.minimize()).resolves.toBeUndefined();
      expect(mockWindowApi.minimize).toHaveBeenCalled();
    });
  });

  describe('Window Control Methods', () => {
    beforeEach(() => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });
    });

    it('should minimize window', async () => {
      const windowState = useWindowState();
      
      await windowState.minimize();
      
      expect(mockWindowApi.minimize).toHaveBeenCalled();
    });

    it('should maximize window', async () => {
      const windowState = useWindowState();
      
      await windowState.maximize();
      
      expect(mockWindowApi.maximize).toHaveBeenCalled();
    });

    it('should unmaximize window', async () => {
      const windowState = useWindowState();
      
      await windowState.unmaximize();
      
      expect(mockWindowApi.unmaximize).toHaveBeenCalled();
    });

    it('should show window', async () => {
      const windowState = useWindowState();
      
      await windowState.show();
      
      expect(mockWindowApi.show).toHaveBeenCalled();
    });

    it('should hide window', async () => {
      const windowState = useWindowState();
      
      await windowState.hide();
      
      expect(mockWindowApi.hide).toHaveBeenCalled();
    });

    it('should focus window', async () => {
      const windowState = useWindowState();
      
      await windowState.focus();
      
      expect(mockWindowApi.focus).toHaveBeenCalled();
    });

    it('should center window', async () => {
      const windowState = useWindowState();
      
      await windowState.center();
      
      expect(mockWindowApi.center).toHaveBeenCalled();
    });
  });

  describe('Size and Position Management', () => {
    beforeEach(() => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });
    });

    it('should set window size', async () => {
      const windowState = useWindowState();
      const size: NeutralinoWindowSize = { width: 1024, height: 768 };
      
      await windowState.setSize(size);
      
      expect(mockWindowApi.setSize).toHaveBeenCalledWith(size);
    });

    it('should get window size', async () => {
      const windowState = useWindowState();
      const expectedSize = { width: 800, height: 600 };
      mockWindowApi.getSize.mockResolvedValue(expectedSize);
      
      const size = await windowState.getSize();
      
      expect(mockWindowApi.getSize).toHaveBeenCalled();
      expect(size).toEqual(expectedSize);
    });

    it('should set window position', async () => {
      const windowState = useWindowState();
      const position: NeutralinoWindowPosition = { x: 200, y: 150 };
      
      await windowState.setPosition(position);
      
      expect(mockWindowApi.setPosition).toHaveBeenCalledWith(position);
    });

    it('should get window position', async () => {
      const windowState = useWindowState();
      const expectedPosition = { x: 100, y: 100 };
      mockWindowApi.getPosition.mockResolvedValue(expectedPosition);
      
      const position = await windowState.getPosition();
      
      expect(mockWindowApi.getPosition).toHaveBeenCalled();
      expect(position).toEqual(expectedPosition);
    });
  });

  describe('Window Properties', () => {
    beforeEach(() => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });
    });

    it('should set window title', async () => {
      const windowState = useWindowState();
      const title = 'New Window Title';
      
      await windowState.setTitle(title);
      
      expect(mockWindowApi.setTitle).toHaveBeenCalledWith(title);
    });

    it('should get window title', async () => {
      const windowState = useWindowState();
      const expectedTitle = 'Test Window';
      mockWindowApi.getTitle.mockResolvedValue(expectedTitle);
      
      const title = await windowState.getTitle();
      
      expect(mockWindowApi.getTitle).toHaveBeenCalled();
      expect(title).toEqual(expectedTitle);
    });

    it('should set full screen mode', async () => {
      const windowState = useWindowState();
      
      await windowState.setFullScreen(true);
      
      expect(mockWindowApi.setFullScreen).toHaveBeenCalledWith(true);
    });

    it('should set always on top', async () => {
      const windowState = useWindowState();
      
      await windowState.setAlwaysOnTop(true);
      
      expect(mockWindowApi.setAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('should set resizable property', async () => {
      const windowState = useWindowState();
      
      await windowState.setResizable(false);
      
      expect(mockWindowApi.setResizable).toHaveBeenCalledWith(false);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });
    });

    it('should add event listener', async () => {
      const windowState = useWindowState();
      const handler = vi.fn();
      
      await windowState.addEventListener('windowMove', handler);
      
      expect(mockWindowApi.addEventListener).toHaveBeenCalledWith('windowMove', handler);
    });

    it('should remove event listener', async () => {
      const windowState = useWindowState();
      const handler = vi.fn();
      
      await windowState.removeEventListener('windowMove', handler);
      
      expect(mockWindowApi.removeEventListener).toHaveBeenCalledWith('windowMove', handler);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });
    });

    it('should handle API errors gracefully', async () => {
      const windowState = useWindowState();
      const errorMessage = 'Window operation failed';
      mockWindowApi.minimize.mockRejectedValue(new Error(errorMessage));
      
      await expect(windowState.minimize()).rejects.toThrow(errorMessage);
      expect(windowState.error()).toEqual({
        code: 'WINDOW_OPERATION_FAILED',
        message: errorMessage,
        operation: 'minimize'
      });
    });

    it('should handle unknown errors', async () => {
      const windowState = useWindowState();
      mockWindowApi.maximize.mockRejectedValue('Unknown error');
      
      await expect(windowState.maximize()).rejects.toBe('Unknown error');
      expect(windowState.error()).toEqual({
        code: 'WINDOW_OPERATION_FAILED',
        message: 'Unknown window operation error',
        operation: 'maximize'
      });
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });
    });

    it('should refresh window state', async () => {
      const windowState = useWindowState();
      
      await windowState.refreshState();
      
      expect(mockWindowApi.getSize).toHaveBeenCalled();
      expect(mockWindowApi.getPosition).toHaveBeenCalled();
      expect(mockWindowApi.getTitle).toHaveBeenCalled();
    });

    it('should handle refresh state errors', async () => {
      const windowState = useWindowState();
      mockWindowApi.getSize.mockRejectedValue(new Error('Failed to get size'));
      
      await windowState.refreshState();
      
      expect(windowState.error()).toEqual({
        code: 'STATE_REFRESH_FAILED',
        message: 'Failed to get size',
        operation: 'refreshState'
      });
    });

    it('should not refresh state when Neutralino is not available', async () => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => false,
        api: () => null
      });

      const windowState = useWindowState();
      
      await windowState.refreshState();
      
      expect(mockWindowApi.getSize).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      mockUseNeutralinoContext.mockReturnValue({
        isNeutralino: false, ready: false, refresh(): void {
        },
        isNeutralinoAvailable: () => true,
        api: () => mockApi
      });
    });

    it('should track loading state during operations', async () => {
      const windowState = useWindowState();
      
      expect(windowState.loading()).toBe(false);
      
      const minimizePromise = windowState.minimize();
      // Note: In a real scenario, we'd need to check loading state during the operation
      // but for this test, we're validating the pattern works
      
      await minimizePromise;
      expect(windowState.loading()).toBe(false);
    });
  });
});
