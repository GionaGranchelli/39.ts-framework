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
│   ├── 39.ts-neutralino/       # Neutralino.js desktop integration
│   └── 39.starter/             # CLI + project templates (web & desktop)
├── examples/                   # Showcase apps
├── pnpm-workspace.yaml        # Monorepo configuration
└── README.md                   # Main documentation
```

---

## Packages

### 🎯 **39.ts** - Core Framework
The main framework package providing:
- Signal-based reactivity system
- Declarative DOM primitives
- Component composition utilities
- Platform-agnostic state management

### 🖥️ **39.ts-neutralino** - Desktop Integration
TypeScript-native Neutralino.js integration providing:
- NeutralinoProvider for desktop context management
- useNeutralinoContext hook for accessing platform state
- Type-safe Neutralino API bindings
- Graceful fallbacks for web environments

### 🛠️ **39.starter** - Project Scaffolding
CLI tool for creating new projects with:
- Interactive project setup
- Web and desktop templates
- Development workflow automation

---

## Core Concepts

### 1. **Signal-Based Reactivity**

The entire state system is based on **signals** — reactive, lightweight, and fine-grained.

```ts
import { createSignal } from '39.ts';

const count = createSignal(0);
count.set(count() + 1);
```

Derived values can be created via `createDerived`:

```ts
import { createDerived } from '39.ts';

const double = createDerived(() => count() * 2);
```

### 2. **Declarative DOM API**

Instead of JSX or templates, DOM elements are constructed using composable, functional primitives:

```ts
import { Div, H1, Button } from '39.ts';

const view = Div({ className: 'container' }, [
  H1({}, ['39.ts Framework']),
  Button({ 
    onclick: () => count.set(count() + 1) 
  }, [`Count: ${count()}`])
]);
```

### 3. **Desktop Integration**

For desktop applications, use the neutralino integration:

```ts
import { createApp } from '39.ts';
import { NeutralinoProvider, useNeutralinoContext } from '39.ts-neutralino';
import { App } from './components/App.js';

function MyApp() {
  const neutralino = useNeutralinoContext();
  
  return Div({}, [
    Div({}, [`Platform: ${neutralino.isNeutralino() ? 'Desktop' : 'Web'}`]),
    App()
  ]);
}

function main() {
  // Initialize Neutralino context
  NeutralinoProvider();
  
  // Create and mount the app
  createApp(MyApp());
}

main();
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

## Architecture Principles

### ✅ **What 39.ts IS**
- **TypeScript-native**: First-class TypeScript support with full type safety
- **Platform-agnostic**: Core framework works on web, desktop, and potentially mobile
- **Signal-based**: Fine-grained reactivity without virtual DOM overhead
- **Modular**: Tree-shakable exports, use only what you need
- **Minimal**: Small bundle size, minimal abstractions

### ❌ **What 39.ts is NOT**
- **Not React**: No JSX, no hooks, different mental model
- **Not opinionated**: Doesn't enforce specific project structure
- **Not framework-heavy**: No built-in routing, state management libs, etc.

---

## TypeScript Monorepo Setup

This repository uses a shared `tsconfig.base.json` at the root, which is extended by each package's `tsconfig.json`. This ensures strict type checking, consistent module resolution, and IDE compatibility across all packages.

- Each package uses `"composite": true` and `"references"` for project references, enabling incremental builds and type safety.
- Path aliases (`39.ts`, `39.ts-neutralino`) are defined in the base config for clean imports.
- Declaration files (`.d.ts`) and declaration maps are generated for better IDE support and cross-package type sharing.

### Example: Package tsconfig.json
```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "../39.ts" }
  ]
}
```

## Testing Strategy

- All unit and integration tests use [Vitest](https://vitest.dev/).
- Test files are colocated with source files (e.g., `core/signal.test.ts`).
- No `__tests__` folders; tests live next to the code they verify.
- Desktop-specific logic is only tested in the `39.ts-neutralino` package.

## Architectural Boundaries

- The core framework (`39.ts`) is platform-agnostic: no browser or Neutralino-specific logic.
- Desktop integration is isolated in `39.ts-neutralino`.
- The CLI (`39.starter`) scaffolds projects and injects platform-specific files only when needed.

---

## Contributing

This is a monorepo managed with pnpm workspaces. See [Development Journal](./.github/DEVELOPMENT_JOURNAL.md) for detailed development progress and architectural decisions.

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build packages: `pnpm build`
4. Run tests: `pnpm test`

### Package Development

Each package can be developed independently:

```bash
# Work on core framework
cd packages/39.ts && pnpm dev

# Work on neutralino integration
cd packages/39.ts-neutralino && pnpm dev

# Work on CLI tool
cd packages/39.starter && pnpm dev
```

---

## License

MIT License - see individual package.json files for details.
