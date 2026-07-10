# OTT Home Page Navigation Test Plan

## Application Overview

This test plan covers validation of application launch behavior for the OTT platform. The objective is to verify that users can successfully access the application URL and are navigated to the Home page after application initialization.

## Test Scenarios

### 1. Happy Path - Home Page Launch Validation
**Seed:** `tests/seed.spec.ts`

#### 1.1. IW3-T1859: Verify the message displayed on entering invalid credentials during login.
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   3. Click on Email field
   4. Enter invalid email as "abcd@gmail.com" in email field.
   5. Click on Password field
   6. Enter invalid password as "Hello@123" in password field
   7. Tap on "Continue" button.
      * expect "Your login credentials are incorrect" error message     should be displayed. 

#### 1.2. IW3-T1860 Verify the navigation on tapping "Forgot Password?" option.
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. User should be navigated to "Forgot Password?" screen.
      * expect "Confirm Email Address" page should be displayed

#### 1.3. IW3-T1861 Verify the navigation on entering "Email" and tapping on "Proceed" button on the "Forgot Password?" screen.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. Enter the "Email Address" in Email Address field.
   6. Tap on "Proceed" CTA and observe.
   7. User should be navigated to "Verify OTP" screen.

#### 1.4. IW3-T1864 Verify the message displayed on entering the mobile number on "Forgot Password?" screen.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. In Email field enter mobile number as 9876543210
   6. Tap on "Proceed" CTA.
   7. User should be able to see "Please enter a valid email continue." error message


#### 1.4. IW3-T1869 Verify the UI/UX of the "Welcome to iWant" screen for PH region.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
      * expect "Welcome to iWant" and "Home of Filipino Feels" should be displayed
      * expect "Email" field should be displayed.
      * expect "Password" field should be displayed.
      * expect "Continue" button should be displayed.
      * expect "Login with Facebook" button should be displayed.
      * expect "Login with TV Provider" button should be displayed.
   4. Scroll down 
      * expect "New here?" link should be displayed.
      * expect "Create Account" link should be displayed.

#### 1.5. IW3-T1870 Verify user is able to login with valid credentials.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Wait until "Loading.." disappered
      * expect "Home" Tab should be displayed

   #### 1.6. IW3-T1880 Verify smooth navigation between Home, Shows, Movies, GMA, Search, and Profile icons.
   **File:** ``tests/home/home-page-launch.spec.ts`
   **Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. When user is on "Home" tab
      * expect "Continue Watching" rail should be displayed
   6. When user is on "Movies" tab
      * expect "Trending Movies Worldwide" rail should be displayed
   7. When user is on "Shows" tab
      * expect "Trending Shows Worldwide" rail should be displayed
   8. When user is on "My Watchlist" tab
      * expect "My Watchlist" rail should be displayed
   9. When user is on "GMA" tab
      * expect "Top Streamed" rail should be displayed
   10. Click on Search bar
      * expect the search bar should display inner text as "Search by title, actor, genre..."
   11.  Click on Account icon
      * expect "Sign Out" option should be displayed

### 1.7. IW3-T1867 Verify the "Login with TV Provider" functionality.
 
**File:** `tests/home/landing-page-launch.spec.ts`
 
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Click on "Login with TV Provider" option
   5. Select the Frontier from available options and Click on Continue
   6. Input the TV Provider credentials (Ex: ftrfios1@frontier.com/Frontier1)
   6. Click on "Continue" CTA.
      * User should be successfully landed on the "Home" screen.


### 1.8. IW3-T1895 Verify the user navigates to content details page post tapping on any Movie/Show contents from Home, Shows, Movies, search, My Space pages.
 
**File:** ``tests/details/details-page-validation.spec.ts`
 
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   3. Click on Email field
   4. Enter valid email as "abhilash584@gmail.com" in email field.
   5. Click on Password field
   6. Enter valid password as "Test1234" in password field
   7. Tap on "Continue" button.
   8. Tap on "Shows" option from home page.
   9. Click on the first content from first rail
   *expect User should navigate to the respective content Details Page
   *expect validate the details page
 
 ### 1.9. IW3-T1865 Verify the mobile number login functionality.
 
**File:** ``tests/home/home-page-launch.spec.ts`
 
**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Click here to use mobile number" link.
5. Select the country code as "63"
6. Enter the mobile number and password (Ex: 63| 9178039002/Password123!)
7. Click on "Continue" CTA.
   *expect : User should be able to login with mobile number and navigated to "Home" screen.
 
#### 1.10. IW3-T1871 Verify the content starts playing on tapping the "Play" button for a free asset.

**File:** `tests/home/home-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Login with free user credentials.
5. Click on any free movie or show displayed on the homepage.
6. Click on the "Play" button.
7. Observe the playback screen for 10s.
   * expect the content should start playing successfully on tapping the "Play" button.

### 1.11. IW3-T1931 Verify the Continue Watching tray for the loggedin user who has not watched any content.

**File:** `tests/home/continue-watching-no-watch-history.spec.ts`

**Steps**

1. **Precondition:** User should not have watched any content.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page after successful login.
6. Observe the available content trays on the Home page.
   * **Expect** The **"Continue Watching"** tray **should not be displayed** for a logged-in user with no watch history.

### 1.12. IW3-T1960 Verify that movie content gets removed from CW tray post completely watching the same content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have partially watched a movie so that it appears in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://uat.iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Select the partially watched movie from the **Continue Watching** tray.
7. Click the **Play** button to resume playback.
8. Watch the movie until playback is completed.
9. Return to the **Home** page
10. Osbserve the **Continue Watching** tray.
   - **Expect:** Once the movie has been watched completely, it should be removed from the **Continue Watching** tray.

### 1.13. IW3-T2025 Verify the message displayed when user try to play premium content.

**File:** `tests/playback/premium-content.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to any **premium** movie or show.
5. Click the **Play** button to attempt playback.
6. Observe the player screen.
   - **Expect** A subscription prompt should be displayed with the message:
     > **"A valid subscription is required to view this content. Please subscribe or renew your plan."**
   - **Expect** The following action buttons should be displayed:
     - **"Maybe Later"**
     - **"Subscribe to Watch"**

### 1.14. IW3-T2010 Verify that the pause and resume buttons function correctly during live playback.

# File: `tests/live-tv/live-tv.spec.ts`

## Steps

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid user credentials.
4. Navigate to the **Live TV** section.
5. Select and play any live TV channel.
6. Verify the playback.
7. Tap the **Pause** button.
8. Verify that the live stream is paused.
9. Tap the **Play/Resume** button.
10. Observe the playback.
    - **Expect:** Tapping the **Pause** button should pause the live playback, and tapping the **Play/Resume** button should continue the stream from the current live position.

### 1.15. IW3-T2030	Verify that the user is able to initiate video playback directly from the 'My Watchlist' page by selecting any listed content.

**File:** `tests/watchlist/watchlist-play-content.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **My Watchlist** page.
5. Select any content from the watchlist.
6. Click the **Play** or **Resume** button on the content details page.
7. Observe the player screen.
   - **Expect** The user should be successfully redirected to the player screen, and the selected content should start playing successfully.

### 1.16. IW3-T2032 Verify that "Subscribe to watch" CTA is displayed for premium carousel contents for free user

**File:** `tests/playback/premium-content.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **Home** page.
5. Observe the premium content carousels.
   - **Expect:** The **"Subscribe to Watch"** button should be displayed for all premium content cards visible to free users.

### 1.17. IW3-T2035 Verify the message displayed on "Subscribe to watch" CTA from Home/Shows/Movies/GMA tabs from "Carousel".

**File:** `tests/subscription/subscribe-to-watch-carousel.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://uat.iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **Home**, **Shows**, **Movies**, or **GMA** page.
5. Locate a premium content card displaying the **"Subscribe to Watch"** button.
6. Click the **"Subscribe to Watch"** button.
7. Observe the subscription prompt.
   - **Expect:** A subscription prompt should be displayed with the message:
     > **"A valid subscription is required to view this content. Please subscribe or renew your plan."**
   - **Expect:** The following action buttons should be displayed:
     - **"Maybe Later"**
     - **"Subscribe to Watch"**

### 1.18. IW3-T1932 Verify the UI/UX of the Continue Watching tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate the **Continue Watching** tray.
7. Observe the tray and its contents.
   - **Expect:** The **Continue Watching** tray title should be displayed.
   - **Expect:** The tray should display the available content cards.
   - **Expect:** Each content card should display its **thumbnail** and **content title**.
   - **Expect:** A **progress bar** should be displayed below each content thumbnail indicating the watch progress.

### 1.19. IW3-T1933 Verify the scroll functionality for the contents under Continue Watching tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate the **Continue Watching** tray.
7. Scroll the **Continue Watching** tray from **right to left**.
8. Verify that additional content cards are displayed.
9. Scroll the **Continue Watching** tray from **left to right**.
10. Observe the tray behavior.
    - **Expect:** The **Continue Watching** tray should scroll smoothly in both directions, and all available content cards should be accessible without any UI or functionality issues.

### 1.20. IW3-T1936 Verify the functionality of "Remove From Continue Watching" CTA displayed on the CW tray bottom bar popup from Home screen.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate and hover on a content card in the **Continue Watching** tray.
7. Click the **X** icon on the content card.
8. Observe the **Continue Watching** tray.
   - **Expect:** The selected content should be removed from the **Continue Watching** tray.

### 1.21. T1937IW3- Verify that "Resume" CTA turns to "Play" button and retains to default season number and episode number on removing the content from CW tray.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have partially watched episodes from **Season 1** of a series, and the series should be available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate the series in the **Continue Watching** tray.
7. Click the **X** icon on the content card.
8. Open the same series from the Home page or Search and navigate to the **Content Details** page.
9. Observe the playback action and episode information.
    - **Expect:** The **"Resume"** button should be replaced with the **"Play"** button.
    - **Expect:** The series should revert to the **default season and episode** instead of the previously watched episode.

### 1.22. IW3-T1960 Verify that movie content gets removed from CW tray post completely watching the same content.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have a partially watched movie available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Select the partially watched movie from the **Continue Watching** tray.
7. Click the **Resume** button to continue playback.
8. Drag the seekbar at the end and let the movie finish.
9. Return to the **Home** page.
10. Observe the **Continue Watching** tray.
    - **Expect:** The completed movie should no longer be displayed in the **Continue Watching** tray.
=======
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Click on "Click here to use mobile number" link.
   5. Select the country code as "63"
   6. Enter the mobile number and password (Ex: 63| 9178039002/Password123!)
   7. Click on "Continue" CTA.
      *expect : User should be able to login with mobile number and navigated to "Home" screen.

### 7.1. IW3-T2060 VVerify the Search icon is visible in the top navigation bar on all pages (Home, Movies,Shows,My Watchlist, GMA)
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. When user is on "Home" tab
      * expect Search icon should be visible in the top Navigation bar
   6. When user is on "Movies" tab
      * expect Search icon should be visible in the top Navigation bar
   7. When user is on "Shows" tab
      * expect Search icon should be visible in the top Navigation bar
   8. When user is on "My Watchlist" tab
      * expect Search icon should be visible in the top Navigation bar
   9. When user is on "GMA" tab
      * expect Search icon should be visible in the top Navigation bar

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type 'Abandoned' in search field 
      * expect Observe 'Abandoned' text should appear clearly in the input box

**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type 'Abandoned' in search field 
   7. Observe the Search result
      * expect Observe 'Abandoned' related results should appear with thumbnails and labels

### 8.1. IW3-T2094 Verify Parental pin option will be available is Settings page
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings".
   6. Scroll to bottom of the page.
      * except Observe "Parental Controls" section in bottom of the page

### 8.2. IW3-T2095 Verify Parental pin toggle will be in disable state by default
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings".
   6. Scroll to bottom of the page.
      * except Observe "Parental PIN" toggle should be in disabled/off state by default.

### 8.3. IW3-T2097 Verify Password text field will be display when user click on parental pin toggle
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button
      * except Password input text field should be displayed

### 8.4. IW3-T2098 Verify Password text field will be display when user click on parental pin toggle
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
   9. Click on submit cta and Observe
      * except 'Set an account owner PIN' should be display when user entered correct password

### 8.5. IW3-T2099 Verify "eye" icon will be display in password text field and user is able to see entered value when  enables the eye icon
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
      * except "eye" icon should be displayed in password input field
   9. Click on Eye Icon
      * except Entered password should be shown when user enables eye icon
   
### 8.6. IW3-T2100 Verify "Invalid credentials. Please try again." error message will be display when user enter incorrect login credentails
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button
   9. Enter Incorrect passord
   10. Click on Submit button
      * except "Invalid credentials. Please try again." error message should be display when user entered incorrect password
      * except Assert text "Invalid credentials. Please try again."

### 8.7. IW3-T2101 Verify 4 digit numeric pin will be display when user enable the parental pin toggle
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
   9. Click on Submit cta
   10. Enter the value PARENTAL_PIN_PASSWORD from .env file in input field and Observe the Input field
      * except Input boxes should accept only 4-digit numeric input.

### 8.8. IW3-T2102 Verify parental pin will be  accept numbers only
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   4. Click on "Account" icon.
   5. Click on "Account & Settings"
   6. Scroll to bottom of the page
   7. Observe "Parental Controls" section
   8. Click on toggle "Off" button and Enter Password
   9. Click on Submit cta
   10. Enter the value in input field and Observe the Input field.
   11. Try entering alphabets or special characters in the PIN fields.
      * except Input fields should restrict to numeric values only (0�9).

### 8.9. IW3-T2103 Verify success message is display when user setup the parental pin
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Click on "Account & Settings"
   7. Scroll to bottom of the page
   8. Observe "Parental Controls" section
   9. Click on toggle "Off" button and Enter Password
   10. Click on Submit cta
   11. Enter pin in input box(ex:1111)
   12. Click Save CTA and Observe
      * except "Parental Controls Updated" pop up header should appear.
      * except "Your changes to the parental controls have been saved successfully." pop up details should appear.
      * except "Continue" button should be displayed in the pop-up.

### 8.10. IW3-T2104 Verify "Parental Pin" promt is displayed when user try to play any content post setup the pin
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. If the toggle button is in Off condition:
      - Enter the account password.
      - Click Submit CTA.
      - Enter a PIN
      - Click Save CTA.
      - Click Continue CTA.
   9. If the toggle button is already in On condition, proceed to the next step.
   10. Navigate to the Home page.
   11. Tap on any content under Continue Watching.
   12. Play the content
      - except 'Enter the PIN to Access' page should be displayed when user try to play any content post setup the pin.

### 8.11. IW3-T2108 Verify Proper error message "Invalid Pin" is displayed when user enter incorrect parental pin in playback screen
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. If the toggle button is in Off condition:
      - Enter the account password.
      - Click Submit CTA.
      - Enter a PIN
      - Click Save CTA.
      - Click Continue CTA.
   9. If the toggle button is already in On condition, proceed to the next step.
   10. Navigate to the Home page.
   11. Tap on any content under Continue Watching.
   12. Play the content
   13. Enter Incorrect Parental pin - Invalid Pin
      - except 'Invalid Pin' error message is displayed. The user remains on the same page with the ability to retry.

### 8.12. IW3-T2105 Verify parental pin gets dispabled post entering the password
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. Click the toggle On button
   9. Enter the password.
   10. Tap on "Submit" CTA.
   11. Observe "Parental controls Updated" popup is displayed.
      * except "Parental Controls Updated" pop up header should appear.
      * except "Your changes to the parental controls have been saved successfully." pop up details should appear.
      * except "Continue" button should be displayed in the pop-up.
   12. Click Continue and parental pin id should be in Off Condition.
      * except Parental Pin toggle should be disabled post entering the password.


<!--### 3.2. NAV-002: Verify navigation to "Create an Account" screen on tapping "Create Account"

**File:** `tests/home/create-account-navigation.spec.ts`

**Steps:**

1. Launch application successfully
   * expect: Home page is displayed
   * Tap on Account icon
   * expect: Profile menu/screen is displayed
2. Tap on Sign In option
   * expect: Sign In screen is displayed
   * If cookie pop up appeared accept the cookies with "Confirm" button
   * after accepting the cookie validate welcome test as "Welcome to iWant"
   * Tap on "Create Account" link
   * expect: Navigation to Create Account flow is initiated 
3. Verify Create an Account screen is displayed
   * expect: "Create an Account" screen is displayed successfully
   * expect: User can view account creation fields/options
   * expect: No navigation errors occur -->
