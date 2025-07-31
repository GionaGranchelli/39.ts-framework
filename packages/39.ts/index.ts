// ============================================================================
// 39.ts Framework - Clean Architecture (Post-Consolidation)
// ============================================================================

// Core Reactive System (Consolidated - No More Circular Dependencies!)
export {
  // Signal primitives
  createSignal,
  createDerived,
  createEffect,

  // Batch operations (ST-006 Enhanced Features)
  batch,
  isBatchingActive,
  getBatchSize,

  // Memory management
  getActiveEffectCount,
  cleanupAllEffects,
  untracked,

  // Signal utilities
  setSignalLogger,
  signalLogFn,

  // Advanced signal functions (ST-006)
  getEffectStats,
  createComputed,
  createValidatedSignal,
  createPersistedSignal,
  createDebouncedSignal,
  createResource,

  // Types
  Effect,
  Resource,
  ResourceOptions
} from './core/reactiveSystem.js';

// DOM System (Consolidated - Virtual + Direct DOM)
export {
  // DOM adapters
  setDOMAdapter,
  getDOMAdapter,
  webDOMAdapter,
  noopDOMAdapter,

  // Virtual DOM
  h,
  renderVNode,
  html,

  // Direct DOM (high-performance)
  bindSignalToDOM,
  createElement,

  // Rendering
  render,
  append,

  // Element creators
  Div, Span, Button, Input, H1, H2, H3, P, A, Ul, Li,
  Form, Label, Select, Option, Textarea, Section, Article,
  Header, Footer, Nav, Main, Aside,

  // Memory management
  cleanupAllDOMBindings,
  getActiveDOMBindingCount,

  // Types
  ElementProps,
  Children,
  EventHandler,
  VNode,
  DOMBinding
} from './dom/domSystem.js';

// Navigation System (Consolidated - Router + Breadcrumbs)
export {
  // Router
  Router,
  router,
  createRoute,
  navigateTo,
  goBack,
  goForward,
  replacePath,

  // Route state
  currentRoute,
  currentRouteParams,
  useRouteParams,
  useCurrentRoute,
  navigationState,

  // Breadcrumbs
  useCrumbs,
  pushCrumb,
  resetCrumbs,
  removeCrumb,
  navigateToCrumb,

  // Utilities
  generatePath,
  isCurrentRoute,
  extractParams,

  // Types
  Route,
  Crumb,
  NavigationState
} from './navigation/navigationSystem.js';

// Independent Systems (No Circular Dependencies)
export { createApp } from './core/createApp.js';
export { createStore, createStoreSelector } from './core/store.js';
export { createSignalList } from './core/signalList.js';
export { bind } from './core/bind.js';
export { useLoadingOverlay } from './core/useLoadingOverlay.js';

// Types
export { Signal } from './@types/state.js';

// Component System
export * from './components/index.js';
export {
  createComponent,
  createVNodeComponent,
  createDOMComponent,
  Component,
  ComponentWithProps,
  ComponentContext
} from './components/component.js';

// Storage System
export * from './storage/index.js';
