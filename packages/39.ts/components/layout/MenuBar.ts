/**
 * Desktop MenuBar Component for 39.ts Framework
 *
 * Provides native-style menu bar functionality with keyboard shortcuts,
 * nested menus, and platform-specific styling for desktop applications.
 *
 * @example
 * ```typescript
 * import { MenuBar, createMenuStructure } from '39.ts';
 *
 * const menuStructure = createMenuStructure([
 *   {
 *     label: 'File',
 *     items: [
 *       { label: 'New', action: () => newFile(), shortcut: 'Ctrl+N' },
 *       { label: 'Open', action: () => openFile(), shortcut: 'Ctrl+O' },
 *       { type: 'separator' },
 *       { label: 'Exit', action: () => app.quit() }
 *     ]
 *   },
 *   {
 *     label: 'Edit',
 *     items: [
 *       { label: 'Copy', action: () => copy(), shortcut: 'Ctrl+C' },
 *       { label: 'Paste', action: () => paste(), shortcut: 'Ctrl+V' }
 *     ]
 *   }
 * ]);
 *
 * const app = Div({}, [
 *   MenuBar({
 *     structure: menuStructure,
 *     theme: 'auto', // 'light' | 'dark' | 'auto'
 *     platform: 'auto' // 'windows' | 'macos' | 'linux' | 'auto'
 *   }),
 *   // Rest of app content
 * ]);
 * ```
 */

import { createSignal, createEffect } from '../../core/reactiveSystem.js';
import { Div, Span, Button } from '../../dom/directElements.js';
import { useNeutralinoContext } from '../../../39.ts-neutralino/context/NeutralinoProvider.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MenuItem {
  label?: string;
  action?: () => void | Promise<void>;
  shortcut?: string;
  icon?: string;
  disabled?: boolean;
  items?: MenuItem[]; // For nested menus
  type?: 'item' | 'separator' | 'submenu';
}

export interface MenuStructure {
  label: string;
  items: MenuItem[];
  disabled?: boolean;
}

export interface MenuBarProps {
  structure: MenuStructure[];
  theme?: 'light' | 'dark' | 'auto';
  platform?: 'windows' | 'macos' | 'linux' | 'auto';
  onMenuAction?: (action: string, item: MenuItem) => void;
  className?: string;
  style?: Record<string, string>;
}

export interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  action: () => void | Promise<void>;
  menuPath: string[];
}

// ============================================================================
// KEYBOARD SHORTCUT MANAGER
// ============================================================================

class KeyboardShortcutManager {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private registered = false;

  register(shortcut: KeyboardShortcut): void {
    const key = this.createShortcutKey(shortcut.key, shortcut.modifiers);
    this.shortcuts.set(key, shortcut);

    if (!this.registered) {
      this.setupGlobalListener();
      this.registered = true;
    }
  }

  unregister(key: string, modifiers: string[]): void {
    const shortcutKey = this.createShortcutKey(key, modifiers);
    this.shortcuts.delete(shortcutKey);
  }

  clear(): void {
    this.shortcuts.clear();
  }

  private createShortcutKey(key: string, modifiers: string[]): string {
    return [...modifiers.sort(), key].join('+').toLowerCase();
  }

  private setupGlobalListener(): void {
    document.addEventListener('keydown', (event) => {
      const modifiers: string[] = [];
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.altKey) modifiers.push('alt');
      if (event.shiftKey) modifiers.push('shift');
      if (event.metaKey) modifiers.push('meta');

      const key = event.key.toLowerCase();
      const shortcutKey = this.createShortcutKey(key, modifiers);

      const shortcut = this.shortcuts.get(shortcutKey);
      if (shortcut) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
      }
    });
  }
}

const globalShortcutManager = new KeyboardShortcutManager();

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

function detectPlatform(): 'windows' | 'macos' | 'linux' {
  if (typeof navigator === 'undefined') return 'linux'; // Default for testing
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('win')) return 'windows';
  return 'linux';
}

function getPlatformModifierKey(platform: string): string {
  return platform === 'macos' ? 'Cmd' : 'Ctrl';
}

// ============================================================================
// BROWSER API COMPATIBILITY
// ============================================================================

function isMatchMediaSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function getSystemTheme(): 'light' | 'dark' {
  if (!isMatchMediaSupported()) return 'light'; // Default for testing/SSR
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ============================================================================
// MENU UTILITIES
// ============================================================================

export function createMenuStructure(menus: MenuStructure[]): MenuStructure[] {
  return menus.map(menu => ({
    ...menu,
    items: menu.items.map(item => ({
      type: 'item',
      disabled: false,
      ...item
    }))
  }));
}

function parseShortcut(shortcut: string): { key: string; modifiers: string[] } {
  const parts = shortcut.split('+').map(part => part.trim());
  const key = parts[parts.length - 1].toLowerCase();
  const modifiers = parts.slice(0, -1).map(mod => {
    switch (mod.toLowerCase()) {
      case 'ctrl': return 'ctrl';
      case 'cmd': return 'meta';
      case 'alt': return 'alt';
      case 'shift': return 'shift';
      default: return mod.toLowerCase();
    }
  });

  return { key, modifiers };
}

// ============================================================================
// MENU BAR COMPONENT
// ============================================================================

export function MenuBar(props: MenuBarProps): HTMLElement {
  const neutralinoContext = useNeutralinoContext();
  const platform = props.platform === 'auto' ? detectPlatform() : (props.platform || 'windows');
  const theme = createSignal(props.theme || 'auto');
  const activeMenu = createSignal<string | null>(null);
  const activeMenuPath = createSignal<string[]>([]);

  // Store reference to the main menu container for manual updates
  let menuBarContainer: HTMLElement;

  // Register keyboard shortcuts
  createEffect(() => {
    registerShortcuts(props.structure, props.onMenuAction);
  });

  // Cleanup shortcuts on unmount
  createEffect(() => {
    return () => {
      globalShortcutManager.clear();
    };
  });

  function registerShortcuts(structure: MenuStructure[], onMenuAction?: (action: string, item: MenuItem) => void): void {
    globalShortcutManager.clear();

    structure.forEach((menu, menuIndex) => {
      menu.items.forEach((item, itemIndex) => {
        if (item.shortcut && item.action) {
          const { key, modifiers } = parseShortcut(item.shortcut);
          const menuPath = [menu.label, item.label];

          globalShortcutManager.register({
            key,
            modifiers,
            action: async () => {
              if (onMenuAction) {
                onMenuAction('shortcut', item);
              }
              if (item.action) {
                await item.action();
              }
            },
            menuPath
          });
        }

        // Register shortcuts for nested items
        if (item.items) {
          registerNestedShortcuts(item.items, [menu.label, item.label], onMenuAction);
        }
      });
    });
  }

  function registerNestedShortcuts(items: MenuItem[], menuPath: string[], onMenuAction?: (action: string, item: MenuItem) => void): void {
    items.forEach(item => {
      if (item.shortcut && item.action) {
        const { key, modifiers } = parseShortcut(item.shortcut);
        const currentPath = [...menuPath, item.label];

        globalShortcutManager.register({
          key,
          modifiers,
          action: async () => {
            if (onMenuAction) {
              onMenuAction('shortcut', item);
            }
            if (item.action) {
              await item.action();
            }
          },
          menuPath: currentPath
        });
      }

      if (item.items) {
        registerNestedShortcuts(item.items, [...menuPath, item.label], onMenuAction);
      }
    });
  }

  function handleMenuClick(menuLabel: string): void {
    const current = activeMenu.get();
    if (current === menuLabel) {
      activeMenu.set(null);
      activeMenuPath.set([]);
    } else {
      activeMenu.set(menuLabel);
      activeMenuPath.set([menuLabel]);
    }
  }

  function handleItemClick(item: MenuItem, menuPath: string[]): void {
    if (item.disabled) return;

    if (item.action) {
      activeMenu.set(null);
      activeMenuPath.set([]);

      if (props.onMenuAction) {
        props.onMenuAction('click', item);
      }

      item.action();
    }
  }

  function toggleSubmenu(path: string[]): void {
    const current = activeMenuPath.get();
    const pathStr = path.join('>');
    const currentStr = current.join('>');
    
    if (currentStr.startsWith(pathStr) && current.length >= path.length) {
      // Collapse if already open or deeper
      activeMenuPath.set(path.slice(0, path.length - 1));
    } else {
      // Open this submenu
      activeMenuPath.set(path);
    }

    // Force immediate re-render of the active menu
    refreshActiveMenu();
  }

  function refreshActiveMenu(): void {
    const activeMenuLabel = activeMenu.get();
    if (!activeMenuLabel || !menuBarContainer) return;

    const menuContainer = Array.from(menuBarContainer.querySelectorAll('.menu-container'))
      .find(container => {
        const trigger = container.querySelector('.menu-trigger');
        return trigger?.textContent === activeMenuLabel;
      });

    if (menuContainer) {
      const menuStructure = props.structure.find(m => m.label === activeMenuLabel);
      if (menuStructure) {
        const dropdown = menuContainer.querySelector('.menu-dropdown');
        if (dropdown) {
          // Clear and rebuild the dropdown
          dropdown.innerHTML = '';
          menuStructure.items.forEach(menuItem => {
            dropdown.appendChild(renderMenuItem(menuItem, [menuStructure.label]));
          });
        }
      }
    }
  }

  function isPathActive(path: string[]): boolean {
    const current = activeMenuPath.get();
    const pathStr = path.join('>');
    const currentStr = current.join('>');
    return currentStr.startsWith(pathStr);
  }

  function renderMenuItem(item: MenuItem, menuPath: string[], depth = 0): HTMLElement {
    if (item.type === 'separator') {
      return Div({
        className: 'menu-separator',
        style: {
          height: '1px',
          backgroundColor: 'var(--menu-separator-color)',
          margin: '4px 0'
        }
      });
    }

    const hasSubmenu = item.items && item.items.length > 0;
    const menuItemPath = [...menuPath, item.label];
    const isOpen = isPathActive(menuItemPath);

    const container = Div({
      className: `menu-item ${item.disabled ? 'disabled' : ''} ${hasSubmenu ? 'has-submenu' : ''}`,
      style: {
        padding: '8px 12px',
        cursor: item.disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        margin: '2px 4px',
        opacity: item.disabled ? '0.5' : '1',
        position: 'relative'
      },
      onclick: hasSubmenu
        ? () => toggleSubmenu(menuItemPath)
        : () => handleItemClick(item, menuItemPath)
    }, [
      Div({
        style: {
          display: 'flex',
          alignItems: 'center',
          flex: '1'
        }
      }, [
        ...(item.icon ? [
          Span({
            className: 'menu-item-icon',
            text: item.icon,
            style: { marginRight: '8px', width: '16px' }
          })
        ] : []),
        Span({
          className: 'menu-item-label',
          text: item.label
        })
      ]),

      ...(item.shortcut ? [
        Span({
          className: 'menu-item-shortcut',
          text: item.shortcut.replace('Ctrl', getPlatformModifierKey(platform)),
          style: {
            fontSize: '12px',
            opacity: '0.7',
            marginLeft: '24px'
          }
        })
      ] : [])
    ]);

    // Add arrow for submenu items
    if (hasSubmenu) {
      const arrow = Span({
        className: 'menu-item-arrow',
        text: '▶',
        style: {
          fontSize: '10px',
          opacity: '0.7',
          marginLeft: '8px',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }
      });
      
      container.appendChild(arrow);

      // Add submenu if open - this is now synchronous based on current path state
      if (isOpen && item.items) {
        const submenu = Div({
          className: 'submenu',
          style: {
            position: 'absolute',
            top: '0',
            left: '100%',
            minWidth: '200px',
            backgroundColor: 'var(--menu-bg)',
            border: '1px solid var(--menu-border)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '4px 0',
            zIndex: '1000'
          }
        }, item.items.map(subItem => renderMenuItem(subItem, menuItemPath, depth + 1)));

        container.appendChild(submenu);
      }
    }

    return container;
  }

  function renderMenu(menu: MenuStructure): HTMLElement {
    const container = Div({
      className: `menu-container`,
      style: { position: 'relative', display: 'inline-block' }
    }, []);

    const button = Button({
      className: `menu-trigger`,
      text: menu.label,
      disabled: menu.disabled,
      onclick: () => handleMenuClick(menu.label),
      style: {
        padding: '8px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: menu.disabled ? 'default' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--menu-text-color)',
        transition: 'background-color 0.2s ease',
        opacity: menu.disabled ? '0.5' : '1'
      }
    });

    container.appendChild(button);

    // Use createEffect to reactively update the entire menu based on path changes
    createEffect(() => {
      const isActive = activeMenu.get() === menu.label;

      // Update button styling
      button.className = `menu-trigger ${isActive ? 'active' : ''}`;
      button.style.backgroundColor = isActive ? 'var(--menu-active-bg)' : 'transparent';
      
      // Remove existing dropdown
      const existingDropdown = container.querySelector('.menu-dropdown');
      if (existingDropdown) {
        container.removeChild(existingDropdown);
      }
      
      // Add dropdown if active - this will regenerate the entire menu tree
      if (isActive) {
        const dropdown = Div({
          className: 'menu-dropdown',
          style: {
            position: 'absolute',
            top: '100%',
            left: '0',
            minWidth: '200px',
            backgroundColor: 'var(--menu-bg)',
            border: '1px solid var(--menu-border)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '4px 0',
            zIndex: '100',
            marginTop: '2px'
          }
        }, menu.items.map(item => renderMenuItem(item, [menu.label])));
        
        container.appendChild(dropdown);
      }
    });

    return container;
  }

  // Apply platform and theme styles
  const menuBarStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: platform === 'macos' ? '4px 12px' : '2px 8px',
    backgroundColor: 'var(--menu-bar-bg)',
    borderBottom: '1px solid var(--menu-bar-border)',
    fontFamily: platform === 'macos' ? '-apple-system, BlinkMacSystemFont, sans-serif' : 'system-ui, sans-serif',
    fontSize: '14px',
    userSelect: 'none',
    position: 'sticky',
    top: '0',
    zIndex: '50',
    ...props.style
  };

  menuBarContainer = Div({
    className: `menu-bar platform-${platform} theme-${theme.get()} ${props.className || ''}`,
    style: menuBarStyles
  }, props.structure.map(menu => renderMenu(menu)));

  return menuBarContainer;
}

// ============================================================================
// CSS CUSTOM PROPERTIES (for theming)
// ============================================================================

export function applyMenuBarTheme(theme: 'light' | 'dark' | 'auto' = 'auto'): void {
  const root = document.documentElement;
  const actualTheme = theme === 'auto' ? getSystemTheme() : theme;

  if (actualTheme === 'dark') {
    root.style.setProperty('--menu-bar-bg', '#2d2d2d');
    root.style.setProperty('--menu-bar-border', '#404040');
    root.style.setProperty('--menu-bg', '#3d3d3d');
    root.style.setProperty('--menu-border', '#555555');
    root.style.setProperty('--menu-text-color', '#ffffff');
    root.style.setProperty('--menu-active-bg', '#4d4d4d');
    root.style.setProperty('--menu-separator-color', '#555555');
  } else {
    root.style.setProperty('--menu-bar-bg', '#f8f9fa');
    root.style.setProperty('--menu-bar-border', '#dee2e6');
    root.style.setProperty('--menu-bg', '#ffffff');
    root.style.setProperty('--menu-border', '#dee2e6');
    root.style.setProperty('--menu-text-color', '#212529');
    root.style.setProperty('--menu-active-bg', '#e9ecef');
    root.style.setProperty('--menu-separator-color', '#dee2e6');
  }
}

// Initialize theme on module load
applyMenuBarTheme();

// Watch for system theme changes
if (isMatchMediaSupported()) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    applyMenuBarTheme();
  });
}
