import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NeutralinoProvider, useNeutralinoContext } from './NeutralinoProvider';

function setNeutralinoMock(version = '3.0.0') {
  (globalThis as any).window = {
    Neutralino: {
      os: { version },
    },
  };
}

function clearNeutralinoMock() {
  (globalThis as any).window = {};
}

describe('NeutralinoProvider', () => {
  beforeEach(() => {
    clearNeutralinoMock();
  });

  it('should detect Neutralino and set ready state', () => {
    setNeutralinoMock('4.2.1');
    NeutralinoProvider();
    const ctx = useNeutralinoContext();
    expect(ctx.isNeutralino).toBe(true);
    expect(ctx.ready).toBe(true);
    expect(ctx.version).toBe('4.2.1');
    expect(ctx.error).toBeUndefined();
  });

  it('should set error state if Neutralino is missing', () => {
    clearNeutralinoMock();
    NeutralinoProvider();
    const ctx = useNeutralinoContext();
    expect(ctx.isNeutralino).toBe(false);
    expect(ctx.ready).toBe(false);
    expect(ctx.version).toBeUndefined();
    expect(ctx.error).toBeInstanceOf(Error);
    expect(ctx.error?.message).toMatch(/Neutralino.js not detected/);
  });

  it('should refresh and update state', () => {
    clearNeutralinoMock();
    NeutralinoProvider();
    let ctx = useNeutralinoContext();
    expect(ctx.isNeutralino).toBe(false);
    setNeutralinoMock('5.0.0');
    ctx.refresh();
    ctx = useNeutralinoContext();
    expect(ctx.isNeutralino).toBe(true);
    expect(ctx.version).toBe('5.0.0');
  });
});

