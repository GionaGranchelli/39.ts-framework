/**
 * Desktop Toolbar Component Type Definitions
 * Part of ST-008: Desktop Toolbar Component
 */

export type ToolbarItemType = 'button' | 'separator';

export interface ToolbarButton {
  type?: 'button';
  id: string;                     // unique key for tracking order
  icon?: string;                  // emoji, SVG path, or URL
  label?: string;                 // visible label (optional)
  tooltip?: string;               // hover text
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

export interface ToolbarSeparator {
  type: 'separator';
  id: string;
}

export type ToolbarItem = ToolbarButton | ToolbarSeparator;

export interface ToolbarProps {
  items: ToolbarItem[];
  draggable?: boolean;              // enable drag & drop reordering (default true)
  overflowMode?: 'wrap' | 'scroll' | 'menu';  // how to handle overflow
  className?: string;
  style?: Record<string, string>;
  onOrderChange?: (newOrder: string[]) => void;
  platform?: 'windows' | 'macos' | 'linux' | 'auto';
  theme?: 'light' | 'dark' | 'auto';
}

export interface ToolbarOverflowState {
  visibleItems: ToolbarItem[];
  overflowItems: ToolbarItem[];
  showOverflowMenu: boolean;
}
