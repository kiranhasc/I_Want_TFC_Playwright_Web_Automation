import { test, expect } from '../../src/fixtures/test-hooks';
import { verifySearchIconVisibilityOnAllPages, verifySearchQueryTyping, verifySearchResults, verifySearchAutoSuggestions, verifySearchNoResultsMessage, clearSearchTextFromSearchField, navigateAndVerifyTabs, verifySearchByActorOrGenre, verifySearchFreePremiumLabels, verifySearchLiveContentExclusion, verifySearchPartialKeyword, verifySearchResultRedirectsToDetailPage, verifySearchBackNavigationFromDetailPage, verifySearchSmoothScrolling } from '../../src/businessFunction/ott-auth-bfs';
import { addContentToWatchlistFromSearchPage, removeContentFromWatchlistFromSearchPage } from '../../src/businessFunction/ott-watchlist-bfs';
import { playPremiumContentFromSearch } from '../../src/businessFunction/ott-playback-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Search navigation', () => {
  test('@High IW3-T2060 : Verify the Search icon is visible in the top navigation bar on all pages', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
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

  test('@High IW3-T2062 : Verify that the user can type a search query in the input box', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-002-search-query'];
    const result = await verifySearchQueryTyping(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.searchInputValue).toContain(data.query);
  });

  test('@High IW3-T2064 : Verify the search results are shown when a valid title is entered in the Search field', async ({ page }) => {
    const data = testCaseData['tc-nav-003-search-results'];
    const result = await verifySearchResults(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.resultsVisible).toBe(true);
  });

  test('@Medium IW3-T2058 : Verify user is able to add content to My Watchlist via hover from search page', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-004-watchlist-hover'];
    const result = await addContentToWatchlistFromSearchPage(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.isVisibleInMyWatchlist).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('added');
  });

  test('@Medium IW3-T2059 : Verify user is able to remove content from my watchlist via hover from search page', async ({ page }) => {
        test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-005-watchlist-remove'];
    const result = await removeContentFromWatchlistFromSearchPage(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.removedFromWatchlist).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('removed');
  });

  test('@Medium IW3-T2063 : Verify the auto-suggestions while typing in the search field', async ({ page }) => {
    test.setTimeout(100000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-006-search-auto-suggestions'];
    const result = await verifySearchAutoSuggestions(page, {
      mode: data.mode,
      query: data.query,
      validationType: "",
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.suggestionsVisible).toBe(true);
    expect(result.suggestionsCount).toBeGreaterThan(0);
    expect(result.suggestionsList.length).toBeGreaterThan(0);
    expect(result.suggestionsContainQuery).toBe(true);
  });

  test('@Medium IW3-T2065 : Verify the message like "No results found." is shown for irrelevant search terms', async ({ page }) => {
    const data = testCaseData['tc-nav-007-search-no-results'];
    const result = await verifySearchNoResultsMessage(page, {
      mode: data.mode,
      searchQuery: data.searchQuery,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.searchQueryTyped).toBe(true);
    expect(result.noResultsMessageVisible).toBe(true);
    expect(result.messageText).toContain(data.expectedNoResultsMessage);
  });

  test('@Low IW3-T2083 : Verify if user enters junk characters with space in search field', async ({ page }) => {
    const data = testCaseData['tc-nav-016-search-junk-characters'];
    const result = await verifySearchNoResultsMessage(page, {
      mode: data.mode,
      searchQuery: data.searchQuery,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.searchQueryTyped).toBe(true);
    expect(result.noResultsMessageVisible).toBe(true);
    expect(result.messageText).toContain(data.expectedNoResultsMessage);
  });

  test('@Low IW3-T2085 : Verify if irrelevant search suggestions are being displayed which dont have valid results', async ({ page }) => {
    const data = testCaseData['tc-nav-017-search-invalid-suggestions'];
    const result = await verifySearchAutoSuggestions(page, {
      mode: data.mode,
      query: data.query,
      validationType: data.validationType,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.suggestionsVisible).toBe(true);
    expect(result.suggestionsCount).toBeGreaterThan(0);
  });

  test('@Low IW3-T2086 : Verify that live content is not displayed in search when user enters live content title', async ({ page }) => {
    const data = testCaseData['tc-nav-018-search-live-content-exclusion'];
    const result = await verifySearchLiveContentExclusion(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.liveContentTitle).toBeTruthy();
    expect(result.searchQueryTyped).toBe(true);
    expect(result.suggestionsVisible).toBe(true);
    expect(result.liveContentExcludedFromSuggestions).toBe(true);
    expect(result.liveContentTitleFoundInSearchResults).toBe(false);
  });

  test('@Medium IW3-T2087 : Verify that back navigation returns the user from content details to the search results page', async ({ page }) => {
    const data = testCaseData['tc-nav-019-search-back-navigation'];
    const result = await verifySearchBackNavigationFromDetailPage(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.collectionTitle).toBeTruthy();
    expect(result.searchQueryTyped).toBe(true);
    expect(result.searchResultsVisible).toBe(true);
    expect(result.detailsPageVisible).toBe(true);
  });

  test('@Low IW3-T2067 : Verify that the Clear All icon removes the Search text from the Search field', async ({ page }) => {
    const data = testCaseData['tc-nav-008-clear-search-input'];
    const result = await clearSearchTextFromSearchField(page, {
      mode: data.mode,
      query: data.query,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.queryTyped).toBe(true);
    expect(result.searchInputCleared).toBe(true);
    expect(result.searchInputValue).toBe('');
  });

  test('@Low IW3-T2070 : Verify placeholder text in search field', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-nav-010-search-placeholder'];
    const result = await navigateAndVerifyTabs(page, {
      mode: data.mode,
      expectedSearchPlaceholder: data.expectedSearchPlaceholder,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.searchBarPlaceholderMatches).toBe(true);
    expect(result.searchBarPlaceholder).toContain(data.expectedSearchPlaceholder);
  });

  test('@Low IW3-T2068 : Verify that the search supports typing of actor name or show genres in the Search field', async ({ page }) => {
    test.setTimeout(180000);
    const data = testCaseData['tc-nav-009-actor-or-genre-search'];
    const result = await verifySearchByActorOrGenre(page, {
      mode: data.mode,
      actorquery: data.actorquery,
      genrequery: data.genrequery,
      graphqlQueryName: data.graphqlQueryName,
    });
    console.log('[SEARCH DEBUG] Matched cast values:', result.matchedCastValues);
    console.log('[SEARCH DEBUG] Matched genre values:', result.matchedGenreValues);
    expect(result.isLoggedIn).toBe(true);
    expect(result.actorQueryTyped).toBe(true);
    expect(result.genreQueryTyped).toBe(true);
    expect(result.actorResultsVisible).toBe(true);
    expect(result.genreResultsVisible).toBe(true);
  });

  test('@Medium IW3-T2066 : Verify if subscribed users can play premium content from search results', async ({ page }) => {
    test.setTimeout(120000); // Set timeout to 100 seconds for this test
    const data = testCaseData['tc-nav-008-premium-playback'];
    const result = await playPremiumContentFromSearch(page, {
      mode: data?.mode,
      searchQuery: data?.searchQuery,
    });
    expect.soft(result.isLoggedIn).toBe(true);
    expect.soft(result.searchQueryTyped).toBe(true);
    expect.soft(result.searchResultsVisible).toBe(true);
    expect.soft(result.detailsVisible).toBe(true);
    expect.soft(result.playerVisible).toBe(true);
    expect.soft(result.playbackStarted).toBe(true);
  });

  test('@Low IW3-T2069 : Verify if free and premium content are labeled accordingly on the Search page', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-nav-011-free-premium-labels'];
    const result = await verifySearchFreePremiumLabels(page, {
      mode: data?.mode,
      graphqlQueryName: data?.graphqlQueryName,
    });
    expect.soft(result.isLoggedIn).toBe(true);
    if (result.freeContentTitle) {
      expect(result.freeLabelVisible).toBe(true);
    }
    if (result.premiumContentTitle) {
      expect.soft(result.premiumLabelVisible).toBe(true);
    }
  });

  test('@Low IW3-T2076 : Verify that tapping on any search result redirects to the Detail page', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-nav-013-search-result-redirect'];
    const result = await verifySearchResultRedirectsToDetailPage(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
    });
    expect.soft(result.isLoggedIn).toBe(true);
    expect.soft(result.collectionTitle).toBeTruthy();
    expect.soft(result.searchQueryTyped).toBe(true);
    expect.soft(result.searchResultsVisible).toBe(true);
    expect.soft(result.detailsPageVisible).toBe(true);
    expect.soft(result.titleMatch).toBe(true);
    if (result.expectedGenres?.length) {
      expect.soft(result.genresMatch).toBe(true);
    }
    if (result.expectedCast?.length) {
      expect.soft(result.castMatch).toBe(true);
    }
    if (result.expectedShortDescription) {
      expect.soft(result.shortDescriptionMatch).toBe(true);
    }
  });

  test('@Low IW3-T2077 : Verify that smooth scrolling is maintained when the user searches for content', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-nav-014-search-smooth-scrolling'];
    const result = await verifySearchSmoothScrolling(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      iterations: 6,
      pauseMs: 800,
    });
    expect.soft(result.isLoggedIn).toBe(true);
    expect.soft(result.collectionTitle).toBeTruthy();
    expect.soft(result.searchQueryTyped).toBe(true);
    expect.soft(result.searchResultsVisible).toBe(true);
    expect.soft(result.scrolled).toBe(true);
    expect.soft(result.positions.length).toBeGreaterThan(1);
  });

  test('@Medium IW3-T2073 : Verify if user can search with partial keyword in search field', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-nav-012-partial-search'];
    const result = await verifySearchPartialKeyword(page, {
      mode: data.mode,
    });
    expect.soft(result.isLoggedIn).toBe(true);
    expect.soft(result.partialQuery).toBeTruthy();
    expect.soft(result.queryTyped).toBe(true);
    expect.soft(result.resultsVisible).toBe(true);
    expect.soft(result.matchedSearchValues.length).toBeGreaterThan(0);
  });
})