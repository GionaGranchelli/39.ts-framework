/**
 * Tests for useFileSystem hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFileSystem } from './useFileSystem.js';

// Mock the Neutralino context
const mockNeutralinoContext = {
  isNeutralino: true,
  ready: true,
  version: '4.2.1',
  error: undefined
};

// Mock the useNeutralinoContext hook
vi.mock('../context/NeutralinoProvider.js', () => ({
  useNeutralinoContext: () => mockNeutralinoContext
}));

// Mock window.Neutralino
const mockNeutralinoAPI = {
  filesystem: {
    readFile: vi.fn(),
    readBinaryFile: vi.fn(),
    writeFile: vi.fn(),
    writeBinaryFile: vi.fn(),
    removeFile: vi.fn(),
    getStats: vi.fn()
  }
};

describe('useFileSystem', () => {
  beforeEach(() => {
    // Setup window.Neutralino mock
    Object.defineProperty(window, 'Neutralino', {
      value: mockNeutralinoAPI,
      writable: true
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Environment Validation', () => {
    it('should throw error when not in Neutralino environment', async () => {
      mockNeutralinoContext.isNeutralino = false;
      
      const fs = useFileSystem();
      
      await expect(fs.readTextFile('test.txt')).rejects.toThrow(
        'File system operations are only available in Neutralino.js environment'
      );
    });

    it('should throw error when Neutralino is not ready', async () => {
      mockNeutralinoContext.isNeutralino = true;
      mockNeutralinoContext.ready = false;
      
      const fs = useFileSystem();
      
      await expect(fs.readTextFile('test.txt')).rejects.toThrow(
        'Neutralino.js is not ready yet'
      );
    });

    // it('should throw error when Neutralino APIs are not available', async () => {
    //   mockNeutralinoContext.isNeutralino = true;
    //   mockNeutralinoContext.ready = true;
    //
    //   // Set Neutralino to undefined instead of deleting
    //   Object.defineProperty(window, 'Neutralino', {
    //     value: undefined,
    //     writable: true,
    //     configurable: true,
    //   });
    //
    //   const fs = useFileSystem();
    //
    //   await expect(fs.readTextFile('test.txt')).rejects.toThrow(
    //     'Neutralino.js APIs are not available'
    //   );
    // });
  });

  describe('Text File Operations', () => {
    beforeEach(() => {
      mockNeutralinoContext.isNeutralino = true;
      mockNeutralinoContext.ready = true;
    });

    it('should read text file successfully', async () => {
      const mockContent = 'Hello, World!';
      mockNeutralinoAPI.filesystem.readFile.mockResolvedValue(mockContent);

      const fs = useFileSystem();
      const result = await fs.readTextFile('test.txt');

      expect(result).toBe(mockContent);
      expect(mockNeutralinoAPI.filesystem.readFile).toHaveBeenCalledWith('test.txt');
    });

    it('should handle text file read errors', async () => {
      const mockError = { code: 'NE_FS_NOPATHE', message: 'File not found' };
      mockNeutralinoAPI.filesystem.readFile.mockRejectedValue(mockError);

      const fs = useFileSystem();

      await expect(fs.readTextFile('nonexistent.txt')).rejects.toMatchObject({
        code: 'NE_FS_NOPATHE',
        message: 'File not found',
        path: 'nonexistent.txt'
      });
    });

    it('should write text file successfully', async () => {
      mockNeutralinoAPI.filesystem.writeFile.mockResolvedValue(undefined);

      const fs = useFileSystem();
      const content = 'Hello, World!';
      
      await fs.writeTextFile('output.txt', content);

      expect(mockNeutralinoAPI.filesystem.writeFile).toHaveBeenCalledWith('output.txt', content);
    });

    it('should validate text content type', async () => {
      const fs = useFileSystem();

      await expect(fs.writeTextFile('test.txt', 123 as any)).rejects.toThrow(
        'Content must be a string for text file operations'
      );
    });
  });

  describe('Binary File Operations', () => {
    beforeEach(() => {
      mockNeutralinoContext.isNeutralino = true;
      mockNeutralinoContext.ready = true;
    });

    it('should read binary file successfully', async () => {
      const mockBuffer = new ArrayBuffer(10);
      mockNeutralinoAPI.filesystem.readBinaryFile.mockResolvedValue(mockBuffer);

      const fs = useFileSystem();
      const result = await fs.readBinaryFile('image.png');

      expect(result).toBe(mockBuffer);
      expect(mockNeutralinoAPI.filesystem.readBinaryFile).toHaveBeenCalledWith('image.png');
    });

    it('should write binary file successfully', async () => {
      mockNeutralinoAPI.filesystem.writeBinaryFile.mockResolvedValue(undefined);

      const fs = useFileSystem();
      const buffer = new ArrayBuffer(10);
      
      await fs.writeBinaryFile('output.bin', buffer);

      expect(mockNeutralinoAPI.filesystem.writeBinaryFile).toHaveBeenCalledWith('output.bin', buffer);
    });

    it('should validate binary content type', async () => {
      const fs = useFileSystem();

      await expect(fs.writeBinaryFile('test.bin', 'string' as any)).rejects.toThrow(
        'Content must be an ArrayBuffer for binary file operations'
      );
    });
  });

  describe('File Management Operations', () => {
    beforeEach(() => {
      mockNeutralinoContext.isNeutralino = true;
      mockNeutralinoContext.ready = true;
    });

    it('should delete file successfully', async () => {
      mockNeutralinoAPI.filesystem.removeFile.mockResolvedValue(undefined);

      const fs = useFileSystem();
      await fs.deleteFile('unwanted.txt');

      expect(mockNeutralinoAPI.filesystem.removeFile).toHaveBeenCalledWith('unwanted.txt');
    });

    it('should check if file exists (true case)', async () => {
      const mockStats = { size: 1024, isFile: true };
      mockNeutralinoAPI.filesystem.getStats.mockResolvedValue(mockStats);

      const fs = useFileSystem();
      const exists = await fs.fileExists('existing.txt');

      expect(exists).toBe(true);
      expect(mockNeutralinoAPI.filesystem.getStats).toHaveBeenCalledWith('existing.txt');
    });

    it('should check if file exists (false case)', async () => {
      mockNeutralinoAPI.filesystem.getStats.mockRejectedValue({ 
        code: 'NE_FS_NOPATHE', 
        message: 'File not found' 
      });

      const fs = useFileSystem();
      const exists = await fs.fileExists('nonexistent.txt');

      expect(exists).toBe(false);
    });

    it('should get file stats successfully', async () => {
      const mockStats = { 
        size: 2048, 
        isFile: true, 
        isDirectory: false,
        createdAt: Date.now(),
        modifiedAt: Date.now()
      };
      mockNeutralinoAPI.filesystem.getStats.mockResolvedValue(mockStats);

      const fs = useFileSystem();
      const stats = await fs.getFileStats('document.pdf');

      expect(stats).toEqual(mockStats);
      expect(mockNeutralinoAPI.filesystem.getStats).toHaveBeenCalledWith('document.pdf');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockNeutralinoContext.isNeutralino = true;
      mockNeutralinoContext.ready = true;
    });

    it('should handle unknown errors gracefully', async () => {
      mockNeutralinoAPI.filesystem.readFile.mockRejectedValue(new Error('Unknown error'));

      const fs = useFileSystem();

      await expect(fs.readTextFile('test.txt')).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error',
        path: 'test.txt'
      });
    });

    it('should handle errors without codes', async () => {
      mockNeutralinoAPI.filesystem.writeFile.mockRejectedValue({ message: 'Permission denied' });

      const fs = useFileSystem();

      await expect(fs.writeTextFile('readonly.txt', 'content')).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: 'Permission denied',
        path: 'readonly.txt'
      });
    });
  });
});
