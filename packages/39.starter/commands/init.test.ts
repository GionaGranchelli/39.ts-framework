import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initCommand, ProjectTemplate, InitOptions } from './init';
import * as fs from 'fs';
import * as childProcess from 'child_process';

// Mock external dependencies
vi.mock('prompts');
vi.mock('fs');
vi.mock('child_process');

const mockPrompts = vi.mocked(await import('prompts')).default;
const mockFs = vi.mocked(fs);
const mockChildProcess = vi.mocked(childProcess);

describe('CLI init command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default fs mocks
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.readdirSync.mockReturnValue([]);
    mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);
    mockFs.copyFileSync.mockImplementation(() => undefined);
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock process.exit
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('project name validation', () => {
    it('should reject empty project names', async () => {
      mockPrompts.mockResolvedValue({
        projectName: '',
        template: 'web',
        install: true
      });

      await expect(initCommand()).rejects.toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Project name cannot be empty')
      );
    });

    it('should reject project names with invalid characters', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'my@app!',
        template: 'web',
        install: true
      });

      await expect(initCommand()).rejects.toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('can only contain letters, numbers, dots, hyphens, and underscores')
      );
    });

    it('should reject reserved project names', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'node_modules',
        template: 'web',
        install: true
      });

      await expect(initCommand()).rejects.toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('is reserved')
      );
    });

    it('should accept valid project names', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'my-valid-app',
        template: 'web',
        install: false
      });

      await initCommand();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('template selection', () => {
    it('should reject unknown templates', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'unknown',
        install: false
      });

      await expect(initCommand()).rejects.toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown template: unknown')
      );
    });

    it('should accept valid templates', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'web',
        install: false
      });

      await initCommand();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('directory handling', () => {
    it('should reject existing directories', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockPrompts.mockResolvedValue({
        projectName: 'existing-app',
        template: 'web',
        install: false
      });

      await expect(initCommand()).rejects.toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Directory "existing-app" already exists')
      );
    });

    it('should create new directories', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockPrompts.mockResolvedValue({
        projectName: 'new-app',
        template: 'web',
        install: false
      });

      await initCommand();
      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('dependency installation', () => {
    it('should install dependencies when requested', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'web',
        install: true
      });

      mockChildProcess.execSync.mockImplementation(() => Buffer.from(''));

      await initCommand();
      expect(mockChildProcess.execSync).toHaveBeenCalledWith(
        'pnpm install',
        expect.objectContaining({
          stdio: 'inherit',
          timeout: 120000
        })
      );
    });

    it('should skip dependency installation when not requested', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'web',
        install: false
      });

      await initCommand();
      expect(mockChildProcess.execSync).not.toHaveBeenCalled();
    });

    it('should handle dependency installation failures gracefully', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'test-app',
        template: 'web',
        install: true
      });

      mockChildProcess.execSync.mockImplementation(() => {
        throw new Error('Installation failed');
      });

      await initCommand();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to install dependencies automatically')
      );
    });
  });

  describe('non-interactive mode', () => {
    it('should work with provided options', async () => {
      const options: InitOptions = {
        skipPrompts: true,
        projectName: 'cli-app',
        template: 'desktop',
        installDeps: false
      };

      await initCommand(options);
      
      expect(mockPrompts).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Creating project "cli-app"')
      );
    });

    it('should use defaults when options are missing', async () => {
      const options: InitOptions = {
        skipPrompts: true
      };

      await initCommand(options);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Creating project "my-39ts-app"')
      );
    });
  });

  describe('user cancellation', () => {
    it('should handle user cancellation gracefully', async () => {
      mockPrompts.mockResolvedValue({
        projectName: undefined, // Simulates Ctrl+C
        template: 'web',
        install: true
      });

      await expect(initCommand()).rejects.toThrow('process.exit called');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Project creation cancelled')
      );
    });
  });

  describe('success messages', () => {
    it('should show appropriate success messages', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'success-app',
        template: 'web',
        install: false
      });

      await initCommand();
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Project "success-app" created successfully!')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('cd success-app')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('pnpm install')
      );
    });

    it('should skip install instruction when dependencies were installed', async () => {
      mockPrompts.mockResolvedValue({
        projectName: 'success-app',
        template: 'web',
        install: true
      });

      mockChildProcess.execSync.mockImplementation(() => Buffer.from(''));

      await initCommand();
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('cd success-app')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('pnpm dev')
      );
      // Should not show pnpm install instruction
      const installCalls = vi.mocked(console.log).mock.calls
        .some(call => call[0]?.includes('pnpm install'));
      expect(installCalls).toBe(false);
    });
  });
});
