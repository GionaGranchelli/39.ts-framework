/**
 * Neutralino Context Types
 * Provides context state for Neutralino.js integration.
 */

export interface NeutralinoContextState {
  /** True if running inside Neutralino.js */
  isNeutralino: boolean;
  /** True when Neutralino APIs are ready */
  ready: boolean;
  /** Neutralino.js version string, if available */
  version?: string;
  /** Error if Neutralino is missing or fails to initialize */
  error?: Error;
}

/**
 * Context value for NeutralinoProvider
 */
export interface NeutralinoContextValue extends NeutralinoContextState {
  /** Refreshes Neutralino state (re-checks environment) */
  refresh(): void;
}

