# 39.ts Framework Documentation

## Overview

**39.ts** is a lightweight, TypeScript-native UI framework designed for high-performance applications on both web and desktop environments. It emphasizes minimal abstractions, signal-based reactivity, declarative UI composition, and seamless developer experience.

Built with modern tooling like Vite, TypeScript, and Neutralino.js (for desktop), 39.ts is ideal for developers who want full control over their UI stack while retaining excellent ergonomics.

---

## Project Structure

```
39.ts-framework/
├── packages/
│   ├── 39.ts/                  # Core framework (UI, state, DOM, components)
│   └── 39.starter/             # CLI + project templates (web & desktop)
├── examples/                   # Showcase apps
├── pnpm-workspace.yaml        # Monorepo configuration
└── README.md                   # Main documentation
```

---

## Core Concepts

### 1. **Signal-Based Reactivity**

The entire state system is based on **signals** — reactive, lightweight, and fine-grained.

```ts
import { signal } from '39.ts';

const count = signal(0);
count.set(count.get() + 1);
```

Derived values can be created via `createDerived`:

```ts
const double = createDerived(() => count.get() * 2, [count]);
```

### 2. **Declarative DOM API**

Instead of JSX or templates, DOM elements are constructed using composable, functional primitives:

```ts
import { Div, H1, Button } from '39.ts';

const view = Div({ className: 'container' }, [
  H1({}, ['Hello']),
  Button({ onclick: () => alert('Clicked!') }, ['Click me'])
]);
```

These are enhanced by `defaultClassNames` and utility-first styles.

### 3. **Stores**

Stateful global stores with built-in persistence and plugin drivers:

```ts
const store = await createStore({
  key: 'appState',
  initial: { theme: 'dark' },
  persist: true,
  driver: new WebStorageDriver()
});
```

### 4. **Routing System**

Fully declarative, single-page router:

```ts
router.registerRoutes([
  createRouter('/', () => HomePage(), 'Home', '🏠'),
  createRouter('/settings', () => SettingsPage(), 'Settings', '⚙️')
]);
```

Supports route components, names, icons, and live rerendering.

### 5. **Component System**

Components are plain functions returning DOM elements. Utility wrappers like `createComponent()` and `useForm()` exist for form state, modals, and reusable fields.

```ts
export function PasswordField(label: string) {
  return Div({}, [
    Label({}, [label]),
    Input({ type: 'password' })
  ]);
}
```

---

## CLI Tool (`39.starter`)

Use the CLI to scaffold new apps or pages.

### Commands

* `npx 39.ts init`

    * Interactive app generator (choose web or desktop)
* `npx 39.ts new-page`

    * Adds a new page route to an existing app

Templates live in `packages/39.starter/templates/`.

---

## Web Template

### Structure

```
templates/web/
├── index.html
├── main.ts
├── router.ts
├── storage/
├── pages/
└── components/
```

### Entry Point (`main.ts`)

* Initializes the global store
* Boots the app
* Listens for theme changes
* Renders layout + router view

```ts
await createApp({
  store,
  platform: { init: () => console.log('Web ready') },
  options: {
    onReady: () => render(AppLayout)
  }
});
```

---

## Desktop Template (Neutralino.js)

### Highlights

* `bridge.ts` abstracts Neutralino functions like filesystem, dialog
* `FileStorageDriver` uses local filesystem for persistence
* All features work offline

```ts
const initialized = await initBridge();
bridge.showMessage('Hello', 'This is a native dialog');
```

---

## Styling System

All components use default classes from `defaultClassNames.ts` and shared styles in `styles/`.

### Core Themes

* Light/Dark theme toggle via `theme` in store
* Sidebar layouts and transitions
* Responsive sidebar modes: `full`, `icon`, `bottom`

---

## Roadmap

### Short-Term

* [x] CLI commands
* [x] Templates (Web & Desktop)
* [x] Examples & docs

### Mid-Term

* [ ] Add test suite
* [ ] Add components: Tab, ListGroup, FieldGroup
* [ ] i18n system

### Long-Term

* [ ] Docs website
* [ ] Plugin system
* [ ] Beta launch

---

## Credits

Created and maintained by **Giona Granchelli**

MIT License · Lightweight UI framework for TypeScript lovers
