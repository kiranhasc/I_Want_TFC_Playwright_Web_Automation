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


