/**
 * NeutralinoProvider - Signal-based context for Neutralino.js state
 *
 * Usage:
 *   import { NeutralinoProvider, useNeutralinoContext } from './NeutralinoProvider';
 *   NeutralinoProvider(); // call once at app startup
 *   const ctx = useNeutralinoContext();
 *
 * This is NOT a React context. It uses 39.ts signals for state management.
 */
import { createSignal } from '39.ts';
import type { NeutralinoContextState, NeutralinoContextValue } from './NeutralinoContext.types.js';
import type { NeutralinoAPI } from '../api/neutralino.d.js';

// Internal signal for context state
const neutralinoSignal = createSignal<NeutralinoContextState>({
  isNeutralino: false,
  ready: false,
  version: undefined,
  error: undefined,
});

/**
 * Initializes Neutralino context state. Call once at app startup.
 */
export function NeutralinoProvider() {
  function detectNeutralino() {
    try {
      const n = typeof window !== 'undefined' ? (window as any).Neutralino : undefined;
      if (!n) throw new Error('Neutralino.js not detected');
      neutralinoSignal.set({
        isNeutralino: true,
        ready: true,
        version: n.os ? n.os.version : undefined,
        error: undefined,
      });
    } catch (err) {
      neutralinoSignal.set({
        isNeutralino: false,
        ready: false,
        version: undefined,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  detectNeutralino();

  // Expose refresh method
  return {
    refresh: detectNeutralino,
  } as Pick<NeutralinoContextValue, 'refresh'>;
}

/**
 * Check if Neutralino is available and ready for use
 */
function isNeutralinoAvailable(): boolean {
  const state = neutralinoSignal.get();
  return state.isNeutralino && state.ready && !state.error;
}

/**
 * Get the Neutralino API instance if available
 */
function getNeutralinoAPI(): NeutralinoAPI | null {
  if (!isNeutralinoAvailable()) {
    return null;
  }

  try {
    const neutralino = typeof window !== 'undefined' ? (window as any).Neutralino : undefined;
    return neutralino || null;
  } catch {
    return null;
  }
}

/**
 * Accessor for Neutralino context state
 * @returns Current context state (signal)
 */
export function useNeutralinoContext(): NeutralinoContextValue {
  const state = neutralinoSignal.get();
  return {
    ...state,
    refresh: () => NeutralinoProvider().refresh(),
    isNeutralinoAvailable,
    api: getNeutralinoAPI,
  };
}
