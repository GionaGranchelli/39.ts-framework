// Core Framework - Signal System
export { createSignal, setSignalLogger, signalLogFn } from './core/signal.js';
export { createDerived } from './core/createDerived.js';
export { createEffect } from './core/createEffect.js';
export { eventBus } from './core/eventBus.js';
export { createApp } from './core/createApp.js';
export { router, createRouter, navigateTo } from './core/router.js';
export { createStore, createStoreSelector } from './core/store.js';
export { createSignalList } from './core/signalList.js';
export { bind } from './core/bind.js';
export { useLoadingOverlay } from './core/useLoadingOverlay.js';

// Types
export { Signal } from './@types/state.js';

// NEW: High-Performance Direct DOM System
export {
  setDirectDOMAdapter,
  getDirectDOMAdapter,
  webDirectDOMAdapter,
  noopDirectDOMAdapter,
  createDOMBinding,
  cleanupDOMBindings,
  createBoundTextNode,
  bindSignalToProperty
} from './dom/directDOM.js';

export {
  createDirectElement,
  Div,
  Span,
  Button,
  Input,
  Form,
  Label,
  H1, H2, H3,
  P,
  A,
  Img,
  Ul, Li,
  Section,
  Article,
  Header,
  Footer,
  Nav,
  Main,
  Table, Tr, Td, Th, Thead, Tbody,
  Select,
  Option,
  Textarea,
  cleanupElement
} from './dom/directElements.js';

export {
  renderDirect,
  appendDirect,
  replaceDirect,
  createReactiveContainer,
  batchDOMUpdates,
  createDirectFragment
} from './dom/directRenderer.js';

// Legacy DOM System (Backward Compatibility)
export { h, setDOMAdapter, webDOMAdapter, noopDOMAdapter } from './dom/h.js';
export { render, append } from './dom/renderer.js';
export { html } from './dom/html.js';

// DOM Utilities
export * from './dom/breadcrumbs.js';
export * from './dom/className.js';
export * from './dom/defaultClassNames.js';
export * from './dom/loading.js';

// Built-in Components
export * from './components/breadcrumbs.js';
export * from './components/component.js';
export * from './components/InputFields.js';
export * from './components/link.js';
export * from './components/loadingOverlay.js';
export * from './components/modal.js';
export * from './components/PasswordField.js';
export * from './components/PhoneNumberField.js';
export * from './components/RichSelectField.js';
export * from './components/toast.js';
export * from './components/useForm.js';

// Layout Components (if they exist)
export * from './components/layout/MainHeader.js';
export * from './components/layout/Layout.js';
export * from './components/layout/Sidebar.js';
export * from './components/layout/MainFooter.js';

// Storage
export * from './storage/webStorage.js';
export * from './storage/storageDriver.js';
export * from './storage/NoopStorageDriver.js';

// Types
export * from './@types/Bridge.js';
export * from './@types/Config.js';
export * from './@types/PlatformAdapter.js';
