# OTT Automation Test Specifications

## General Rules
- Manually execute each testcase step before generating automation for it.
- Use .env-based credentials and runtime values; do not hardcode credentials in tests, business functions, or JSON data files.
- If a testcase is blocked by environment access or missing app behavior, record it as Blocked in the manual execution report.

## Authentication Test Specifications

### TC_AUTH_001 - Login with valid credentials
- Business Function: loginToOTT
- Inputs: VALID_LOGIN_EMAIL, VALID_LOGIN_PASSWORD
- Assertions: isLoggedIn === true, homeTabVisible === true

### TC_AUTH_002 - Mobile number login
- Business Function: loginWithMobileNumber
- Inputs: MOBILE_LOGIN_COUNTRY_CODE, MOBILE_LOGIN_MOBILE_NUMBER, MOBILE_LOGIN_PASSWORD
- Assertions: isLoggedIn === true, homeTabVisible === true

### TC_AUTH_009 - Continue Watching absent for new/no-history user (IW3-T1931)
- Business Function: verifyContinueWatchingAbsent
- Inputs: VALID_LOGIN_EMAIL, VALID_LOGIN_PASSWORD (via `mode: valid`)
- Assertions: isContinueWatchingVisible === false
- Test data key: `tc-auth-009-continue-watching-no-history` in `src/data/ott-test-cases.json`

## Search Test Specifications

### IW3-T2073 - Verify if user can search with partial keyword in search field
  - User is logged in with valid credentials
  - A content item is available from the Collection GraphQL API
  1. Login to OTT.
  2. Wait for the Collection GraphQL API response and select any content title from the returned assets.
  3. Build a partial query from the returned content title.
  4. Open search, enter the partial query, and submit.
  5. Wait for the Search GraphQL API response.
  6. Verify the partial query is retained in the search input.
  7. Verify search results are visible and the Search GraphQL payload contains matching values for the partial query.
  - `isLoggedIn === true`
  - `partialQuery` is not empty
  - `queryTyped === true`
  - `resultsVisible === true`
  - `matchedSearchValues.length > 0`

### IW3-T2083 - Verify if user enters junk characters with space in search field
  - User is logged in with valid credentials
  - A junk search query is entered containing alphanumeric characters and spaces
  1. Login to OTT.
  2. Tap on the Search icon.
  3. Enter a junk search query such as `gdfy 6487yhgf y98yfgjkb nbdjgh`.
  4. Submit the search.
  5. Verify the user sees the `No results found.` message.
  - `isLoggedIn === true`
  - `searchQueryTyped === true`
  - `noResultsMessageVisible === true`
  - `messageText` contains `No results found.`

### IW3-T2076 - Verify that tapping on any search result redirects to the Detail page
  - User is logged in with valid credentials
  - A content item is available from the Collection GraphQL API
  1. Login to OTT.
  2. Wait for the Collection GraphQL API response and select a content title from the returned assets.
  3. Open search and enter the selected content title.
  4. Submit the search and verify results are visible.
  5. Tap the first search result.
  6. Verify the content detail page is displayed.
  - `isLoggedIn === true`
  - `collectionTitle` is not empty
  - `searchQueryTyped === true`
  - `searchResultsVisible === true`
  - `detailsPageVisible === true`


**Business Function:** `verifySearchSmoothScrolling` (src/businessFunction/ott-auth-bfs.ts)

**Purpose:** Ensure that when a user performs a search, the search results can be scrolled smoothly without UI freezes, crashes, or blocking behavior.

**Preconditions:**
  - User is logged in (use `mode` from test data).
  - The app is on the Home page and Collection GraphQL responses are available.

**Steps (automation):**
  1. Call `verifySearchSmoothScrolling(page, { mode, graphqlQueryName: 'Collection' })`.
  2. The BF will: log in, obtain a content title from the `Collection` GraphQL operation, perform the search, and exercise smooth scrolling over the results.

**Assertions (returned from BF):**
  - `isLoggedIn` is `true`.
  - `searchQueryTyped` is `true`.
  - `searchResultsVisible` is `true`.
  - `scrolled` is `true` (indicates the page scrolled forward during the check).
  - `positions` contains monotonic increasing scroll offsets.

**Notes:**
  - This BF focuses on a high-level smoke/performance verification (scroll progress and responsiveness), not on pixel-perfect smoothness measurements.
  - If more precise telemetry is required (frame-rate or jank detection), integrate with browser performance APIs or custom instrumentation.


