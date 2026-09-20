import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { FilterState } from '../../types/terroir';
import { FilterBar } from './FilterBar';

describe('FilterBar progressive disclosure logic', () => {
  const initialFilters: FilterState = {
    destination: 'all',
    category: 'all',
    roadAccess: 'all',
    ethos: 'all',
    foodOption: 'all',
    dogFriendlyOnly: false,
    walkInOnly: false,
    campervanOnly: false,
    searchQuery: '',
    favoritesOnly: false,
  };

  const computeFilterState = (filters: FilterState) => {
    const activeSecondaryCount = [
      filters.roadAccess !== 'all',
      filters.ethos !== 'all',
      filters.foodOption !== 'all',
      filters.dogFriendlyOnly,
      filters.walkInOnly,
      filters.campervanOnly,
    ].filter(Boolean).length;

    const totalActiveFilterCount = (filters.category !== 'all' ? 1 : 0) + activeSecondaryCount;

    const isFiltered =
      filters.category !== 'all' ||
      filters.destination !== 'all' ||
      activeSecondaryCount > 0 ||
      filters.searchQuery !== '' ||
      filters.favoritesOnly;

    return { activeSecondaryCount, totalActiveFilterCount, isFiltered };
  };

  it('reports zero active filters on default state and hides reset', () => {
    const state = computeFilterState(initialFilters);
    expect(state.activeSecondaryCount).toBe(0);
    expect(state.totalActiveFilterCount).toBe(0);
    expect(state.isFiltered).toBe(false);
  });

  it('increments total filter count and enables reset when category is selected', () => {
    const state = computeFilterState({ ...initialFilters, category: 'winery' });
    expect(state.activeSecondaryCount).toBe(0);
    expect(state.totalActiveFilterCount).toBe(1);
    expect(state.isFiltered).toBe(true);
  });

  it('correctly aggregates category and secondary filters into active filter count', () => {
    const state = computeFilterState({
      ...initialFilters,
      category: 'brewery',
      roadAccess: 'paved',
      dogFriendlyOnly: true,
      campervanOnly: true,
    });
    expect(state.activeSecondaryCount).toBe(3);
    expect(state.totalActiveFilterCount).toBe(4);
    expect(state.isFiltered).toBe(true);
  });

  it('shows reset button when search query or favorites filter is active', () => {
    const stateSearch = computeFilterState({ ...initialFilters, searchQuery: 'assyrtiko' });
    expect(stateSearch.isFiltered).toBe(true);

    const stateFavs = computeFilterState({ ...initialFilters, favoritesOnly: true });
    expect(stateFavs.isFiltered).toBe(true);
  });
});

describe('FilterBar horizontal category scrollbar and fixed right controls layout', () => {
  const defaultFilters: FilterState = {
    destination: 'all',
    category: 'all',
    roadAccess: 'all',
    ethos: 'all',
    foodOption: 'all',
    dogFriendlyOnly: false,
    walkInOnly: false,
    campervanOnly: false,
    searchQuery: '',
    favoritesOnly: false,
  };

  it('renders category chips in a dedicated scroll container with visible scrollbar styling', () => {
    const html = renderToString(
      React.createElement(FilterBar, {
        filters: defaultFilters,
        onFilterChange: () => {},
        onResetFilters: () => {},
        totalFiltered: 147,
        totalCount: 147,
      })
    );

    // Dedicated scroll container
    expect(html).toContain('category-scroll-area');
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('aria-label="Producer categories"');
    // Does not hide scrollbar
    expect(html).not.toContain('scrollbar-none');
    // Live maker count is visible on desktop without hidden xl:inline restriction
    expect(html).toMatch(/147<\/span>\s*of.*147.*makers/);
    expect(html).not.toContain('hidden xl:inline');
    // Right actions are pinned with shrink-0
    expect(html).toContain('shrink-0');
    expect(html).toContain('Filters');
  });

  it('defines custom category scrollbar styling in index.css', () => {
    const css = readFileSync('src/index.css', 'utf8');

    expect(css).toContain('.category-scroll-area');
    expect(css).toContain('scrollbar-width: thin;');
    expect(css).toContain('.category-scroll-area::-webkit-scrollbar');
    expect(css).toContain('height: 4px;');
    expect(css).toContain('.category-scroll-area::-webkit-scrollbar-thumb');
  });
});

