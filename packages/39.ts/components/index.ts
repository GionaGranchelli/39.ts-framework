/**
 * Components Index - Re-exports all component functionality
 * 
 * This consolidates all UI components and form utilities for easy importing
 */

// Form components and utilities
export * from './useForm.js';
export * from './InputFields.js';
export * from './PasswordField.js';
export * from './PhoneNumberField.js';
export * from './RichSelectField.js';

// UI components
export * from './component.js';
export * from './modal.js';
export * from './toast.js';
export * from './loadingOverlay.js';

// Navigation components (these might have dependencies on the old router system)
// We'll re-enable these once we update them to use the consolidated navigation system
// export * from './breadcrumbs.js';
// export * from './link.js';

// Layout components
export { MenuBar, createMenuStructure, applyMenuBarTheme } from './layout/MenuBar.js';
export { Toolbar, applyToolbarTheme } from './layout/Toolbar.js';

// Layout component types
export type {
  MenuItem,
  MenuStructure,
  MenuBarProps,
  KeyboardShortcut
} from './layout/MenuBar.js';

export type {
  ToolbarItem,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarProps,
  ToolbarOverflowState
} from './layout/Toolbar.types.js';
