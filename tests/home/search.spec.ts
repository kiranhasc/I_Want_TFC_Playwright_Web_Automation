import { test, expect } from '@playwright/test';
import { verifySearchIconVisibilityOnAllPages, verifySearchQueryTyping, verifySearchResults } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Search navigation', () => {
  test('@High - IW3-T2060 : Verify the Search icon is visible in the top navigation bar on all pages', async ({ page }) => {
    const data = testCaseData['tc-nav-001-search-icon'];
    const result = await verifySearchIconVisibilityOnAllPages(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.homePageSearchIconVisible).toBe(true);
    expect(result.moviesPageSearchIconVisible).toBe(true);
    expect(result.showsPageSearchIconVisible).toBe(true);
    expect(result.watchlistPageSearchIconVisible).toBe(true);
    expect(result.gmaPageSearchIconVisible).toBe(true);
  });

  test('@High - IW3-T2062 : Verify that the user can type a search query in the input box', async ({ page }) => {
    const data = testCaseData['tc-nav-002-search-query'];
    const result = await verifySearchQueryTyping(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.searchInputValue).toContain(data.query);
  });

  test('@High - IW3-T2064 : Verify the search results are shown when a valid title is entered in the Search field', async ({ page }) => {
    const data = testCaseData['tc-nav-003-search-results'];
    const result = await verifySearchResults(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.resultsVisible).toBe(true);
  });
});