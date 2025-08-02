/**
 * Toolbar Component Usage Example
 * Demonstrates all features of the ST-008 Desktop Toolbar Component
 */

import { Toolbar } from '39.ts';
import { ToolbarItem } from '39.ts';

// Example toolbar configuration for a text editor application
const editorToolbarItems: ToolbarItem[] = [
  // File operations group
  { id: 'new', icon: '📄', tooltip: 'New Document', onClick: () => console.log('New document') },
  { id: 'open', icon: '📂', tooltip: 'Open File', onClick: () => console.log('Open file') },
  { id: 'save', icon: '💾', tooltip: 'Save', onClick: () => console.log('Save') },

  // Separator
  { id: 'sep1', type: 'separator' },

  // Edit operations group
  { id: 'undo', icon: '↩️', tooltip: 'Undo', disabled: true, onClick: () => console.log('Undo') },
  { id: 'redo', icon: '↪️', tooltip: 'Redo', disabled: true, onClick: () => console.log('Redo') },

  // Separator
  { id: 'sep2', type: 'separator' },

  // Formatting group
  { id: 'bold', icon: '𝐁', tooltip: 'Bold', onClick: () => console.log('Bold') },
  { id: 'italic', icon: '𝐼', tooltip: 'Italic', onClick: () => console.log('Italic') },
  { id: 'underline', icon: '𝐔', tooltip: 'Underline', onClick: () => console.log('Underline') },

  // Separator
  { id: 'sep3', type: 'separator' },

  // View operations
  { id: 'zoom-in', icon: '🔍', label: 'Zoom In', onClick: () => console.log('Zoom in') },
  { id: 'zoom-out', icon: '🔎', label: 'Zoom Out', onClick: () => console.log('Zoom out') },

  // Help
  { id: 'help', icon: '❓', tooltip: 'Help', onClick: () => console.log('Help') }
];

// Create the toolbar
export function createEditorToolbar(): HTMLElement {
  return Toolbar({
    items: editorToolbarItems,
    draggable: true,
    overflowMode: 'menu',
    platform: 'auto',
    theme: 'auto',
    onOrderChange: (newOrder) => {
      console.log('Toolbar reordered:', newOrder);
      // Save the new order to user preferences
      localStorage.setItem('toolbar-order', JSON.stringify(newOrder));
    }
  });
}

// Usage in an application
export function initializeApp(): void {
  const toolbar = createEditorToolbar();

  // Add to the page
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.appendChild(toolbar);
  }
}

// Example of different overflow modes
export function createCompactToolbar(): HTMLElement {
  const compactItems: ToolbarItem[] = [
    { id: 'action1', icon: '⚡', onClick: () => console.log('Action 1') },
    { id: 'action2', icon: '🎯', onClick: () => console.log('Action 2') },
    { id: 'action3', icon: '🚀', onClick: () => console.log('Action 3') }
  ];

  return Toolbar({
    items: compactItems,
    overflowMode: 'wrap', // Items wrap to next line
    className: 'compact-toolbar',
    style: { backgroundColor: '#f0f0f0', padding: '4px' }
  });
}

export function createScrollableToolbar(): HTMLElement {
  const manyItems: ToolbarItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: `tool${i}`,
    icon: '🔧',
    tooltip: `Tool ${i + 1}`,
    onClick: () => console.log(`Tool ${i + 1} clicked`)
  }));

  return Toolbar({
    items: manyItems,
    overflowMode: 'scroll', // Horizontal scrolling
    draggable: false // No reordering in scroll mode
  });
}
