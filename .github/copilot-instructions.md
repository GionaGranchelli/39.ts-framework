# GitHub Copilot Custom Instructions for the 39.ts Monorepo

## 🧠 Project Context

This repository is a monorepo built to support a TypeScript-native UI framework (`39.ts`) and a dedicated CLI tool (`39.starter`) to scaffold applications using this framework.

The ecosystem targets:
- Modern **web applications**
- Lightweight **desktop applications** using [Neutralino.js](https://neutralino.js.org/)
- Hybrid apps (web + desktop)

We aim to deliver a minimal but powerful developer experience with a clean architecture, modular components, and reactive primitives — similar in spirit to early React, SolidJS, or Vite.

---

## 📦 Repository Structure
```
/
├── packages/
│ ├── 39.ts/ # Core framework library (npm package)
│ └── 39.starter/ # CLI scaffolding tool
├── examples/
│ └── demo-app/ # Sample app for testing
├── README.md
└── copilot.md # Copilot instructions (this file)
```


---

## 🎯 Objectives


## 🎯 39.ts Framework Objectives

- Use modern functional patterns (signals, derived state)
- Be platform-agnostic (no Neutralino, no browser assumptions)
- Modular exports (tree-shakable, individually importable)
- ESM-first, TypeScript-firs
- 
### 39.ts (framework library)
- Provide a **TypeScript-native** UI framework with:
    - `createSignal`, `createDerived` for state management
    - `render` and `html` for virtual DOM abstraction
    - Reusable field components like `RichSelectField`
- Be **framework-agnostic** and **platform-independent** (no browser or Neutralino-specific logic inside)
- Be **modular and tree-shakable**
- Export a simple API surface via `index.ts`

### 39.starter (CLI tool)
- Scaffold full apps using `39.ts`
- Commands:
    - `npx 39.ts init <project>` → interactive project creation
    - `npx 39.ts new-page <name>` → adds page and updates router
- Support `web`, `desktop`, and `both` modes
- Only inject Neutralino-related files if user chooses desktop mode

---

---

## ✅ Testing Strategy

### Preferred Framework
- Use [**Vitest**](https://vitest.dev/) for all unit/integration testing

### File Placement
- Test files must be colocated:
    - `core/signal.test.ts`
    - `dom/render.test.ts`
    - `commands/init.test.ts`
- Avoid `__tests__` folders

### Framework Tests
- Use unit tests with fake DOM elements (no real browser dependencies)
- Test signals, render output, component composition

### CLI Tests
- Test CLI behavior via spawn/exec or mocked prompts
- Validate file output and CLI arguments

---

## ❗ Error Handling Guidelines

### In `39.ts` Framework
- Use clean, idiomatic `throw new Error(message)` for logic errors
- Create custom errors where needed (e.g., `InvalidSignalUsageError`)
- Never assume environment (no `window`, no `process`)

### In `39.starter` CLI
- Show helpful, colored output to user (e.g., with `chalk`)
- Catch fatal errors and exit gracefully with message
- Prefer `try/catch` around file writes, prompts, and async actions
- Use exit codes (`process.exit(1)`) for build-breaking issues

---

## 📝 Documentation Standards

### Code Comments
- Use **JSDoc** for all public methods and exports
- Private functions: minimal inline comments
- Components and fields should include usage example

### Files
- Each `packages/*` should have:
    - `README.md` (purpose, usage, example)
    - `CHANGELOG.md` (auto or manual)

### CLI Usage
- Help output should match README
- Add inline CLI doc in `init.ts`, `new-page.ts`

---

## 📦 Dependency Management

### Allowed
- Minimal runtime deps (framework ideally has 0)
- CLI can use:
    - `cac` (for command parsing)
    - `prompts` (for interactive setup)
    - `fs-extra`, `chalk`, etc. (if small and purposeful)

### Restricted
- No framework deps in `39.ts` that require bundling
- No UI libraries, no CSS-in-JS
- Avoid any large, unused toolchains

---

## 🧮 Versioning and Release

### Semantic Versioning (SemVer)
- `39.ts` and `39.starter` are versioned independently
- Follows: `MAJOR.MINOR.PATCH`

### Changelogs
- Each package has its own `CHANGELOG.md`
- Prefer [Conventional Commits](https://www.conventionalcommits.org/) to generate changelogs

### Publishing
- `npm publish` from each `packages/` dir
- Consider using `changeset` or `release-it` in future

---

## 🤝 Contribution Guidelines

- Open PRs against `main` branch
- Use feature branches (`feature/add-router`, `fix/signal-error`)
- Include or update tests when modifying behavior
- Ensure `pnpm build` or `npm run build` passes
- Follow code style (TS strict mode, consistent naming)
- PRs must have a clear description of what, why, and how


## 📐 Code Conventions

### General
- TypeScript only
- Use ES Modules (`.ts`, `import/export`)
- Follow consistent casing and descriptive naming (`camelCase`, `PascalCase`)
- Prefer named exports over default exports unless a component is the primary export of a file

### File Naming
- `createSignal.ts`, `RichSelectField.ts` – describe purpose clearly
- Use folders to group by purpose (`core/`, `dom/`, `components/`, `templates/`, `commands/`)

### Code Style
- Use functional components: `function ComponentName() { ... }`
- Prefer signals and derivations over mutable state
- No side effects in framework code — separate bridge logic to application templates

### Component Example (39.ts)
```ts
import { createSignal, Div, Button } from '39.ts';

export function Counter() {
  const count = createSignal(0);

  return Div({}, [
    Button({ onclick: () => count.set(count() + 1) }, ['+']),
    Div({}, [`Count: ${count()}`])
  ]);
}
```

### ⚠️ Architectural Boundaries

    Do not import Neutralino or any platform-specific logic inside 39.ts

    Do not scaffold app-specific behavior inside the framework

    All templates (e.g., bridge.ts, neutralino.config.json) go into packages/39.starter/templates/

    Only the CLI should decide whether to include desktop-specific setup

### 📁 Templates (in CLI)

Each template includes:
```text
main.ts
index.html
bridge.ts (if desktop)
neutralino.config.json (if desktop)
router.ts
components/App.ts
pages/Home.ts
main.css

```

### 🧪 Examples

The examples/demo-app folder is for testing the library and CLI. It should not contain any reusable logic that bleeds into the framework.
🧭 How Copilot Should Behave

    Autocomplete component boilerplate and reactive logic using createSignal, render, and html utilities

    Suggest component generation using functional syntax (function Page())

    Avoid suggesting Neutralino-specific logic unless editing template files

    Avoid app logic inside 39.ts

    Prioritize clean modular exports (export { ... }) in index.ts

    When editing CLI commands, suggest prompt-based workflows and file writing using fs/promises and prompts packages

### 🔚 Summary

This repository is structured to support a clean separation of concerns:
Package	Purpose
39.ts	The core TypeScript framework
39.starter	The CLI for scaffolding apps
examples/	Test ground for usage
Copilot should assist in writing minimal, composable, and well-typed code consistent with the architectural rules above.

## 🧭 Copilot Instructions

- Suggest functional UI code using `createSignal`, `render`, `Div`, etc.
- Use `Vitest` for all test files
- Use `cac` and `prompts` when writing CLI logic
- Do not suggest Neutralino code in `39.ts` — only in CLI templates
- Avoid unnecessary dependencies
- Prefer clean modular code with strong typing and reusable exports

---