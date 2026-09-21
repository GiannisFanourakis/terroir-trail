import { describe, expect, it } from 'vitest';
import { comparisonReady, trendChangeLabel } from './AdminIntentBaseline';

const policy = {
  minimum_active_producers: 5,
  minimum_producer_views: 100,
  previous_window_days: 30,
};

describe('AdminIntentBaseline helpers', () => {
  it('withholds comparison until both sample thresholds are met', () => {
    expect(comparisonReady(5, 99, policy)).toBe(false);
    expect(comparisonReady(4, 100, policy)).toBe(false);
    expect(comparisonReady(5, 100, policy)).toBe(true);
  });

  it('describes equal-window movement without manufacturing percentages', () => {
    expect(trendChangeLabel(10, 4, 30)).toBe('+6 vs prior 30d');
    expect(trendChangeLabel(3, 8, 30)).toBe('-5 vs prior 30d');
    expect(trendChangeLabel(0, 0, 30)).toBe('No change vs prior 30d');
  });
});
