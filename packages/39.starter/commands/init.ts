import prompts from 'prompts';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

/**
 * Available project templates
 */
export interface ProjectTemplate {
  title: string;
  value: string;
  description: string;
  path: string;
}

/**
 * User responses from project initialization prompts
 */
export interface InitPromptResponse {
  projectName: string;
  template: string;
  install: boolean;
}

/**
 * Project initialization options
 */
export interface InitOptions {
  targetDir?: string;
  skipPrompts?: boolean;
  template?: string;
  projectName?: string;
  installDeps?: boolean;
}

/**
 * Available project templates with metadata
 */
const TEMPLATES: Record<string, ProjectTemplate> = {
  web: {
    title: 'Web App (Vite)',
    value: 'web',
    description: 'Modern web application with Vite bundler',
    path: 'templates/web'
  },
  desktop: {
    title: 'Desktop App (Neutralino.js)',
    value: 'desktop',
    description: 'Cross-platform desktop application with Neutralino.js',
    path: 'templates/desktop'
  }
};

/**
 * Validates a project name for common issues
 * @param name - Project name to validate
 * @returns Error message if invalid, null if valid
 */
function validateProjectName(name: string): string | null {
  if (!name || name.trim() === '') {
    return 'Project name cannot be empty';
  }

  if (name.length > 214) {
    return 'Project name too long (max 214 characters)';
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return 'Project name can only contain letters, numbers, dots, hyphens, and underscores';
  }

  if (name.startsWith('.') || name.startsWith('-')) {
    return 'Project name cannot start with a dot or hyphen';
  }

  const reserved = ['node_modules', 'package.json', 'package-lock.json', 'pnpm-lock.yaml'];
  if (reserved.includes(name.toLowerCase())) {
    return `Project name "${name}" is reserved`;
  }

  return null;
}

/**
 * Recursively copies files and directories from source to destination
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
async function copyRecursive(src: string, dest: string): Promise<void> {
  try {
    if (!existsSync(src)) {
      throw new Error(`Source directory does not exist: ${src}`);
    }

    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src);
    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);

      const stat = statSync(srcPath);
      if (stat.isDirectory()) {
        await copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the absolute path to a template directory
 * @param templateKey - Template identifier
 * @returns Absolute path to template directory
 */
function getTemplatePath(templateKey: string): string {
  const template = TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unknown template: ${templateKey}`);
  }

  // Get the directory of the current module
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);

  // Resolve template path relative to the commands directory
  return resolve(currentDir, '..', template.path);
}

/**
 * Installs project dependencies using pnpm
 * @param projectPath - Path to the project directory
 */
async function installDependencies(projectPath: string): Promise<void> {
  try {
    console.log('📦 Installing dependencies...');
    execSync('pnpm install', {
      cwd: projectPath,
      stdio: 'inherit',
      timeout: 120000 // 2 minute timeout
    });
  } catch (error) {
    console.warn('⚠️  Failed to install dependencies automatically.');
    console.log('You can install them manually by running: pnpm install');
  }
}

/**
 * Prompts user for project initialization options
 * @returns User responses
 */
async function promptForOptions(): Promise<InitPromptResponse> {
  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'What is your project called?',
      initial: 'my-39ts-app',
      validate: (value: string) => {
        const error = validateProjectName(value);
        return error || true;
      }
    },
    {
      type: 'select',
      name: 'template',
      message: 'Choose a template:',
      choices: Object.values(TEMPLATES).map(template => ({
        title: template.title,
        description: template.description,
        value: template.value
      }))
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies?',
      initial: true
    }
  ]);

  // Handle user cancellation (Ctrl+C)
  if (!response.projectName) {
    console.log('\n❌ Project creation cancelled.');
    process.exit(0);
  }

  return response as InitPromptResponse;
}

/**
 * Initializes a new 39.ts project with the specified options
 * @param options - Initialization options (optional)
 *
 * @example
 * ```bash
 * # Interactive mode
 * npx 39.ts init
 *
 * # Non-interactive mode
 * npx 39.ts init --name my-app --template web --no-install
 * ```
 */
export async function initCommand(options: InitOptions = {}): Promise<void> {
  try {
    console.log('🚀 Welcome to 39.ts project generator!\n');

    let { projectName, template, install } = options.skipPrompts
      ? {
          projectName: options.projectName || 'my-39ts-app',
          template: options.template || 'web',
          install: options.installDeps ?? true
        }
      : await promptForOptions();

    // Validate project name
    const nameError = validateProjectName(projectName);
    if (nameError) {
      console.error(`❌ ${nameError}`);
      process.exit(1);
    }

    // Validate template
    if (!TEMPLATES[template]) {
      console.error(`❌ Unknown template: ${template}`);
      console.log(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`);
      process.exit(1);
    }

    // Check if project directory already exists
    const projectPath = resolve(options.targetDir || process.cwd(), projectName);
    if (existsSync(projectPath)) {
      console.error(`❌ Directory "${projectName}" already exists.`);
      console.log('Please choose a different name or remove the existing directory.');
      process.exit(1);
    }

    // Get template path
    const templatePath = getTemplatePath(template);
    if (!existsSync(templatePath)) {
      console.error(`❌ Template directory not found: ${templatePath}`);
      process.exit(1);
    }

    // Create project
    console.log(`📁 Creating project "${projectName}" in ${projectPath}`);
    console.log(`📋 Using template: ${TEMPLATES[template].title}`);

    await copyRecursive(templatePath, projectPath);

    // Install dependencies if requested
    if (install) {
      await installDependencies(projectPath);
    }

    // Success message
    console.log(`\n✅ Project "${projectName}" created successfully!`);
    console.log('\n👉 Next steps:');
    console.log(`   cd ${projectName}`);
    if (!install) {
      console.log('   pnpm install');
    }
    console.log('   pnpm dev');
    console.log('\n🎯 Happy coding with 39.ts!');

  } catch (error) {
    console.error('\n❌ Failed to create project:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
