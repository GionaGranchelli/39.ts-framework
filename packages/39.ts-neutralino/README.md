# 39.ts Neutralino Integration

TypeScript-native Neutralino.js integration for the 39.ts framework, providing reactive context and hooks for desktop application development.

## Features

- 🔌 **Neutralino Context Provider** - Centralized state management for Neutralino capabilities
- 🎯 **TypeScript-First** - Complete type safety for all Neutralino APIs
- ⚡ **Reactive State** - Signal-based state management for platform detection and initialization
- 🛡️ **Error Handling** - Graceful fallbacks when Neutralino is not available

## Installation

```bash
npm install 39.ts-neutralino
```

## Usage

### Basic Setup

Wrap your application with the `NeutralinoProvider` to enable Neutralino context:

```typescript
import { createApp } from '39.ts';
import { NeutralinoProvider } from '39.ts-neutralino';
import { App } from './components/App.js';

function main() {
  createApp(
    NeutralinoProvider({}, [
      App()
    ])
  );
}

main();
```

### Using the Context

Access Neutralino state and capabilities using the `useNeutralino` hook:

```typescript
import { useNeutralino } from '39.ts-neutralino';
import { Div, Button } from '39.ts';

export function MyComponent() {
  const neutralino = useNeutralino();

  return Div({}, [
    Div({}, [`Platform: ${neutralino.isNeutralino() ? 'Desktop' : 'Web'}`]),
    Div({}, [`Ready: ${neutralino.ready()}`]),
    neutralino.version() && Div({}, [`Version: ${neutralino.version()}`]),
    
    Button({
      onclick: () => {
        if (neutralino.isNeutralino()) {
          // Neutralino-specific functionality
          console.log('Running in Neutralino environment');
        }
      }
    }, ['Check Platform'])
  ]);
}
```

## API Reference

### NeutralinoProvider

The main context provider component that initializes and manages Neutralino state.

**Props:** None

**Usage:**
```typescript
NeutralinoProvider({}, [
  // Your app components
])
```

### useNeutralino()

Hook that returns the Neutralino context with reactive state.

**Returns:**
```typescript
{
  isNeutralino: Signal<boolean>;     // Whether running in Neutralino
  ready: Signal<boolean>;            // Whether Neutralino is initialized
  version: Signal<string | null>;    // Neutralino version
  error: Signal<string | null>;      // Initialization error if any
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Development mode with watch
pnpm dev
```

## Requirements

- **39.ts** framework
- **@neutralinojs/lib** (peer dependency)
- **TypeScript 5.0+**

## License

MIT
