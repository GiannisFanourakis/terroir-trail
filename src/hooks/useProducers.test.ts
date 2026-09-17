import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { producerService } from '../services/producerService';

// Accurate dependency-tracking React mock harness
let stateMap: any[] = [];
let stateIndex = 0;
interface EffectSlot {
  cleanup?: void | (() => void);
  deps?: any[];
}
let effectSlots: EffectSlot[] = [];
let effectIndex = 0;

const areDepsEqual = (prevDeps?: any[], nextDeps?: any[]) => {
  if (!prevDeps || !nextDeps) return false;
  if (prevDeps.length !== nextDeps.length) return false;
  return prevDeps.every((d, i) => Object.is(d, nextDeps[i]));
};

vi.mock('react', () => ({
  useState: (initial: any) => {
    const idx = stateIndex++;
    if (stateMap[idx] === undefined) {
      stateMap[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setState = (valOrFn: any) => {
      stateMap[idx] = typeof valOrFn === 'function' ? valOrFn(stateMap[idx]) : valOrFn;
    };
    return [stateMap[idx], setState];
  },
  useEffect: (effect: () => void | (() => void), deps?: any[]) => {
    const idx = effectIndex++;
    const slot = effectSlots[idx] || {};
    if (!areDepsEqual(slot.deps, deps)) {
      if (typeof slot.cleanup === 'function') {
        slot.cleanup();
      }
      slot.cleanup = effect();
      slot.deps = deps;
    }
    effectSlots[idx] = slot;
  },
  useCallback: (fn: any, deps?: any[]) => {
    const idx = stateIndex++;
    const prev = stateMap[idx];
    if (!prev || !areDepsEqual(prev.deps, deps)) {
      stateMap[idx] = { fn, deps };
      return fn;
    }
    return prev.fn;
  },
}));

import { useProducers } from './useProducers';

describe('useProducers hook', () => {
  beforeEach(() => {
    stateMap = [];
    stateIndex = 0;
    effectSlots = [];
    effectIndex = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('loads producers on initialization', async () => {
    const getProducersSpy = vi.spyOn(producerService, 'getProducers');

    stateIndex = 0;
    effectIndex = 0;
    const hook = useProducers({ destination: 'crete' });

    expect(hook.producers.length).toBeGreaterThan(0);
    expect(getProducersSpy).toHaveBeenCalledWith(
      expect.objectContaining({ destination: 'crete' })
    );
  });

  it('debounces rapid search query changes before calling getProducers', async () => {
    const getProducersSpy = vi.spyOn(producerService, 'getProducers');

    // Initial render
    stateIndex = 0;
    effectIndex = 0;
    useProducers({ destination: 'crete', searchQuery: 'v' });
    const initialCalls = getProducersSpy.mock.calls.length;

    // Simulate typing: 'vi' at t=50ms
    stateIndex = 0;
    effectIndex = 0;
    useProducers({ destination: 'crete', searchQuery: 'vi' });
    vi.advanceTimersByTime(50);

    // Simulate typing: 'vin' at t=100ms
    stateIndex = 0;
    effectIndex = 0;
    useProducers({ destination: 'crete', searchQuery: 'vin' });
    vi.advanceTimersByTime(50);

    // Simulate typing: 'vine' at t=150ms
    stateIndex = 0;
    effectIndex = 0;
    useProducers({ destination: 'crete', searchQuery: 'vine' });
    vi.advanceTimersByTime(50);

    // Debounce threshold (250ms) not reached for 'vine'; no extra network call yet
    expect(getProducersSpy.mock.calls.length).toBe(initialCalls);

    // Advance past the 250ms debounce timeout (250ms from 'vine' set)
    vi.advanceTimersByTime(250);

    // Rerender with the debounced state applied
    stateIndex = 0;
    effectIndex = 0;
    useProducers({ destination: 'crete', searchQuery: 'vine' });

    // Exactly one new network call for 'vine'
    expect(getProducersSpy.mock.calls.length).toBe(initialCalls + 1);
    expect(getProducersSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ searchQuery: 'vine' })
    );
  });
});
