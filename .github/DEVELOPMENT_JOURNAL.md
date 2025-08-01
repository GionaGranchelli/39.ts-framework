# 39.ts Monorepo Development Journal

## July 2025

### TypeScript Monorepo Refactor
- Updated all package `tsconfig.json` files to extend the root `tsconfig.base.json`.
- Enabled `composite`, `declaration`, and `declarationMap` for all packages to support project references and IDE type sharing.
- Added `references` in each package to ensure correct dependency graph and incremental builds.
- Improved IDE compatibility (IntelliJ, VSCode) for cross-package type resolution and test discovery.

### Testing Strategy
- Standardized on [Vitest](https://vitest.dev/) for all unit/integration tests.
- Test files are colocated with source files (no `__tests__` folders).
- Desktop-specific logic is only tested in the `39.ts-neutralino` package.

### Architectural Boundaries
- Core framework (`39.ts`) remains platform-agnostic (no browser or Neutralino-specific logic).
- Desktop integration is isolated in `39.ts-neutralino`.
- CLI (`39.starter`) scaffolds projects and injects platform-specific files only when needed.

### Next Steps
- Continue modularization and strict separation of platform concerns.
- Expand test coverage and add more example apps.
- Document further architectural decisions and refactors in this journal.

---

*This journal is updated as major changes and decisions are made. Please add entries for significant refactors, new features, or architectural shifts.*

