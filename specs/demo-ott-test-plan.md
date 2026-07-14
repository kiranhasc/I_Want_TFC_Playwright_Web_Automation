# OTT Home Page Navigation Test Plan

## Application Overview

This test plan covers validation of application launch behavior for the OTT platform. The objective is to verify that users can successfully access the application URL and are navigated to the Home page after application initialization.

## Test Scenarios

### 1. Happy Path - Home Page Launch Validation
**Seed:** `tests/seed.spec.ts`

#### 10.1. IW3-T1859: Verify the message displayed on entering invalid credentials during login.
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

#### 10.2. IW3-T1860 Verify the navigation on tapping "Forgot Password?" option.
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. User should be navigated to "Forgot Password?" screen.
      * expect "Confirm Email Address" page should be displayed

#### 10.3. IW3-T1861 Verify the navigation on entering "Email" and tapping on "Proceed" button on the "Forgot Password?" screen.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. Enter the "Email Address" in Email Address field.
   6. Tap on "Proceed" CTA and observe.
   7. User should be navigated to "Verify OTP" screen.

#### 10.4. IW3-T1864 Verify the message displayed on entering the mobile number on "Forgot Password?" screen.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Tap on "Forgot Password?"
   5. In Email field enter mobile number as 9876543210
   6. Tap on "Proceed" CTA.
   7. User should be able to see "Please enter a valid email continue." error message


#### 10.4. IW3-T1869 Verify the UI/UX of the "Welcome to iWant" screen for PH region.
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

#### 10.5. IW3-T1880 Verify smooth navigation between Home, Shows, Movies, GMA, Search, and Profile icons.
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

### 10.6. IW3-T1867 Verify the "Login with TV Provider" functionality.
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
 
### 10.7. IW3-T1865 Verify the mobile number login functionality.
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Click on "Click here to use mobile number" link.
   5. Select the country code as "63"
   6. Enter the mobile number and password (Ex: 63| 9178039002/Password123!)
   7. Click on "Continue" CTA.
      *expect:* User should be able to login with mobile number and navigated to "Home" screen.

### 10.8. IW3-T4332 Verify that **Welcome to iWant**, **Terms and Conditions**, **Cookie Policy**, and **Privacy Policy** pages are displayed when the user taps their respective links
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Help and Support** link.  
      *expect:* User should be navigated to the **Welcome to iWant / Help and Support** page and the **page title** should be validated.
   6. Navigate back to the previous page.
   7. Tap the **Terms and Conditions** link.  
      *expect:* User should be navigated to the **Terms and Conditions** page and the **page title** should be validated.
   8. Navigate back to the previous page.
   9. Tap the **Privacy Policy** link.  
      *expect:* User should be navigated to the **Privacy Policy** page and the **page title** should be validated.
   10. Navigate back to the previous page.
   11. Tap the **Cookie Policy** link.  
      *expect:* User should be navigated to the **Cookie Policy** page and the **page title** should be validated.
   12. Verify that each link consistently opens the correct page and that the user can return to the previous page after viewing it.  
      *expect:* The **Welcome to iWant / Help and Support**, **Terms and Conditions**, **Privacy Policy**, and **Cookie Policy** pages should be displayed successfully, and the **page title** should match the expected title for each page.

### 10.9. IW3-T4333 Verify that the user can navigate to any section from the left navigation menu on the **Terms and Conditions** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.  
      *expect:* User should be navigated to the **Terms and Conditions** page and the **page title** should be validated.
   6. Tap on **iWant Terms and Conditions** button from the left navigation menu 
      *expect* link **For customers in the Philippines** should be diaplayed 
   7. Tap on **Customers in the Philippines** link
      *expect* **Customers in the Philippines** text should be displayed

### 10.10. IW3-T4334 Verify that the corresponding page details are displayed when the user taps any link from the **Terms and Conditions** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL.
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.  
      *expect:* User should be navigated to the **Terms and Conditions** page.
   6. Tap any link from the left navigation menu (e.g., **The Data We Collect About You**).
   7. Verify that the corresponding section is displayed.  
      *expect:* The page should navigate to the selected section, and the corresponding details should be displayed correctly.
   8. Verify that the selected navigation link consistently displays the correct content.  
      *expect:* The respective **Terms and Conditions** section and its details should be displayed successfully.

### 10.11. IW3-T4337 Verify that the user is able to search any page via the search field from the **Terms and Conditions** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL.
   3. Login with valid credentials.
   4. Scroll to the bottom of the page.
   5. Tap the **Terms and Conditions** link.  
   *expect:* User should be navigated to the **Terms and Conditions** page.
   6. Tap the **Search Documentation** search field displayed at the top-right corner.
   7. Enter a search query (e.g., **For the customers in the Philippines**).
   8. Verify that the corresponding search results are displayed.  
   *expect:* Search results relevant to the entered query should be displayed successfully.
   9. Verify that the user is able to search for any page using the search field.  
   *expect:* The user should be able to search any page via the search field, and the corresponding results should be displayed correctly.

### 10.12. IW3-T4339 Verify that the respective page is displayed when the user taps any link in the **Introduction** page
**File:** `tests/home/home-page-launch.spec.ts`
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
 
### 1.10. IW3-T1871 Verify the content starts playing on tapping the "Play" button for a free asset.

**File:** `tests/home/home-page.spec.ts`

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

**File:** `tests/home/continue-watching.spec.ts`

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

**File:** `tests/playback/subscription.spec.ts`

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

**File:** `tests/home/playback.spec.ts`

**Steps**

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

**File:** `tests/watchlist/watchlist.spec.ts`

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

**File:** `tests/home/subscription.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **Home** page.
5. Observe the premium content carousels.
   - **Expect:** The **"Subscribe to Watch"** button should be displayed for all premium content cards visible to free users.

### 1.17. IW3-T2035 Verify the message displayed on "Subscribe to watch" CTA from Home/Shows/Movies/GMA tabs from "Carousel".

**File:** `tests/home/subscription.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
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

### 1.21. IW3-T1937- Verify that "Resume" CTA turns to "Play" button and retains to default season number and episode number on removing the content from CW tray.

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

### 8.13. IW3-T2109 Verify user is able to play any content if parental pin is turn off
**File:** `tests/home/parential-pin.spec.ts`
**Steps:**
  1. Open the browser.
   2. Enter the URL (https://uat.iwanttfc.com/).
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on "Account" icon.
   6. Tap on Account and Settings.
   7. Scroll down to the Parental Controls section.
   8. If the toggle button is in On condition:
      - Click on toggle Off button
      - Enter the account password.
      - Click Submit CTA.
   9. If the toggle button is already in Off condition, proceed to the next step.
   10. Navigate to the Home page.
   11. Tap on any content under Continue Watching.
   12. Play the content
      * except The content should play directly without prompting for PIN

#### 2.1. IW3-T1967 Verify that tapping the play button from the content detail page NFvigates the user to the player screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A Family affair" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The episode name and content title are displayed at the top left corner of the Player screen.
   - expect: The title and episode name displayed at the top of the playback should match the selected content and episode.
   - expect: The seek bar and playback controls are visible.
   - expect: The playback time is displayed at the end of the progress bar.

#### 2.2. IW3-T1907 Verify that playback starts post tapping on 'Play/Resume' CTA

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "The Secrets of Hotel 88" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The seek bar and playback controls are visible.
12. Add wait for 10sec timeout 
13. Click the Pause button and add wait for 10sec timeout 
   - expect: The seek bar and playback controls are visible. 

#### 2.3. IW3-T1968 Verify that the video playback starts successfully and plays smoothly without any interruption.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "The blood sisters" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The episode name and content title are displayed at the top left corner of the Player screen.
   - expect: The title and episode name displayed at the top of the playback should match the selected content and episode.
   - expect: The seek bar and playback controls are visible.
   - expect: The playback time is displayed at the end of the progress bar.
12. Wait for 20 sec 

#### 2.4. IW3-T1999 Verify that dragging the seek bar updates the video playback position accurately to the selected timestamp.

**File:** `tests/home/playback.spec.ts`

**Steps:**


1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A love to last" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
   - expect: The seek bar and playback controls are visible.
12. Drag the seek bar for few minutes and store the value of the player time 
13. wait for 10sec and assert the player time  
14. Stored player time should not be equal to the player time after waiting for 10sec 

#### 2.5. IW3-T2008 Verify user is not able to seek forward/backward in true live stream

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the "TFC Asia" live channel content in the home screen
9. Verify that 10s rewind button and 10s forward button is not visible    

#### 2.6. IW3-T2000 Verify that the seek bar functions correctly on all supported browsers, allowing smooth seeking and accurate playback position updates.

**File:** `tests/home/playback.spec.ts`

**Steps:**


1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A love to last" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. verify the seek bar is visible
12. Drag the seek bar for few minutes and store the value of the player time 
13. wait for 10sec and assert the player time  
14. Stored player time should not be equal to the player time after waiting for 10sec 

#### 2.7 IW3-T2002 Verify that the player controls appear when the user taps once on the screen during playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**


1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "A love to last" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. verify the seek bar, playback time, rewind 10s, forward 10s, volume, subtitle and fullscreen button are visible

#### 2.8 IW3-T2012 Verify that live playback begins on tapping "Go Live" CTA.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the "TFC Asia" live channel content in the home screen
9. Click on pause button and wait for 5sec
10. click on GO live button
11. Verify live button is visible 

#### 2.9 IW3-T2013 Verify that a pre-roll ad plays automatically and completely before the main content starts playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Nurse the dead" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. Verify there is a AD tag on the play screen 
13. Add wait for 90sec
14. Verify the playback is playing by asserting the title of the episode   

#### 2.10 IW3-T3978 Verify that pause ad appears on player screen for all type of contents during pause state

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Nurse the dead" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. Verify there is a ADD tag on the play screen 
13. Add wait for 90sec
14. Verify the playback is playing by asserting the title of the episode   
15. Add wait for 10sec and pause the content 
16. Verify the 3 dot on the banner screen is visible   

#### 2.11 IW3-T1974 Verify that the video playback pauses immediately when the pause action is triggered by the user .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Nurse the dead" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. wait for 20sec and click pause button
13. Store the time value and wait for 10sec 
14. Again store the time value and both the stored value should be same  

#### 2.12 IW3-T1975 Verify that the video playback resumes smoothly from the paused position when the user triggers the resume action.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Nurse the dead" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button
12. wait for 20sec and click pause button
13. Store the time value 
14. Click paly button and wait for 10sec
15. Again store the time value and both the stored value should be same  

#### 2.13 IW3-T1977 Verify that the forward and backward button controls function correctly even when the video is in a paused state.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Anak" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button and store the time value 
12. Click the pause button
12. Click on forward 10sec and store the time value
13. both stored value should not be equal 

IW3-T1976 Verify that tapping the seek forward or backward button (CTA) skips the video playback ahead or back by exactly 10 seconds in movies or TV shows.

#### 2.14 IW3-T1976 Verify that tapping the seek forward or backward button (CTA) skips the video playback ahead or back by exactly 10 seconds in movies or TV shows.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Anak" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button and store the time value 
12. Click on forward 10sec and store the time value
13. both stored value should not be equal 

#### 2.15 IW3-T1980 Verify that "Full screen" icon is displayed on the player screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Momay" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Verify full screen button is visible  

#### 2.16 IW3-T1978 Verify that the video player displays the timestamp in HH:MM:SS format when the total video duration exceeds one hour.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "captain barbell" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar upto 60% and click pause
13. Store the time value and verify stored time value is in format HH:MM:SS 

#### 2.17 IW3-T1979 Verify that the video player displays the playback time in MM:SS format when the total video duration is less than one hour.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Sin Island" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar upto 20% and click pause
13. Store the time value and verify stored time value is in format MM:SS 

#### 2.18 IW3-T1981 Verify that user can able to select the available subtitle during playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Sin Island" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. verify and click English(Phillippines) language

#### 2.19 IW3-T1982 Verify that selected subtitle option from the current episode continues for the next epiosde.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Blood vs duty" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. Just verify English(Phillippines) language is selected
14. Click on next episode button 
15. Click on Sub title button
16. Just Verify English(Phillippines) language is selected

#### 2.20 IW3-T1983 Verify that selected subtitle option from one content carry to any other content if the same subtitle is available.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Miss behave" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. Select English(Phillippines) language
14. Click back button 
15. Click on the search icon 
16. Type "will you fake marry me" in the search box and Click "Enter"
17. Click on the first content from first rail
18. Click the play button 
19. Click on Sub title button
20. verify English(Phillippines) language is already selected

#### 2.21 IW3-T1984 Verify that subtitles are set to 'Off' by default.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "fractured" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. Verify off option is set by default 

#### 2.22 IW3-T1985 Verify that selected subtitles are displayed on the player screen.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "doble kara" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. click on English(Phillippines) language option 
14. verify subtitle is visible post selecting the language on playback screen

#### 2.23 IW3-T1986 Verify that subtitles display correctly and remain synchronized with the video during seeking operations.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Beauty and the bestie" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on Sub title button
13. click on English(Phillippines) language option 
14. verify subtitle is visible post selecting the language on playback screen
15. Click on forward button, rewind button and drag the seek bar
16. Verify subtitle is visible post selecting each button and dragging seek bar 

#### 2.24 IW3-T1987	Verify the functioNFlity on tapping "Full screen" icon .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ang Panday" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on full screen button
13. Verify the title of content is visible 
14. store the time value and wait for 10sec 
15. Store the time value and verify both time should not be equal  

#### 2.25 IW3-T1988 Verify the UI of the player screen .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ang Panday" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on full screen button
13. Verify the following buttons are visible
   - Back button
   - Content title
   - Seek bar
   - Pause/play 
   - Forward and rewind
   - Subtitle (condition: If visible)
   - Next episode (Condition: If visible)
   - Content duration time in HH:MM:SS or MM:SS
 
#### 2.26 IW3-T1927 Verify the Continue Watching tray on the "Home Page" for the new users upon watching 5% of the content.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click the content in Kapamilya Show Picks rail which is have only play button by hovering on the content 
9. Click on the play button
9. Drag the seek  bar upto 5%
10. Click back button 
11. navigate to home page
12. Verify that played content is visible in the first place of continue watching rail in home page 

#### 2.27 IW3-T1989 Verify that the 'Next Episode' CTA appears under the seek bar of the player scree when next episode exists.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Altar" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Verify the Next episode buttons are visible(have a condition)

#### 2.28 IW3-T1990 Verify that the "Up Next" binge marker appears at the end of the content playback.

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ghosting" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Drag the seek  bar till end 
13. Verify for the appearance of the 'Up next wedge' button CTA at the end

#### 2.29 IW3-T1992	Verify that user Navigates to previous screen on tapping back button

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ghosting" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click the back button 
13. Verify that post clicking the back button goes to back screen 

#### 2.30 IW3-T1997 Verify that the player controls auto-dismiss automatically after a 5 seconds of infectivity during video playback

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "ekstra" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Wait for 5sec
13. Verify that player control is not visible after 5sec of playing content 

#### 2.31 IW3-T1998 Verify that the player controls are dismissed when the user hovers on the screen while controls are visible 

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ma" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
13. Verify that player control is not visible after hover the screen 

#### 2.32 IW3-T2005 Verify that user can increase or decrease the volume using volume button .

**File:** `tests/home/playback.spec.ts`

**Steps:**

1. Open the browser.
2. Enter the URL(https://iwanttfc.com/)
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on Email field
4. Enter valid email as "abhilash584@gmail.com" in email field.
5. Click on Password field
6. Enter valid password as "Test1234" in password field
7. Tap on "Continue" button.
8. Click on the search icon 
9. Type "Ma" in the search box and Click "Enter"
10. Click on the first content from first rail
11. Click the play button 
12. Click on volume button 
14. Verify you volume can mute and unmute by clicking on volume button

<!--### 3.2. NAV-002: Verify navigation to "Create an Account" screen on tapping "Create Account"

**File:** `tests/home/create-account-navigation.spec.ts`

### 10.14. IW3-T3663 Verify Synacor user is able to logout from the application
**File:** `tests/home/synacor-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Click on "Login with TV Provider" option
   5. Select the Frontier from available options and Click on Continue
   6. Input the TV Provider credentials (Ex: ftrfios1@frontier.com/Frontier1)
   6. Click on "Continue" CTA.
      **expect** User should be successfully landed on the "Home" screen.
   7. Click on "Account" icon in the home page
      **expect** Sign out popup should be displayed
   8. Click on Sign out
      **expect** "Welcome to iWant" page header should be displayed

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


#### 1.1. IW3-T1846 Verify that user NFvigates to "Welcome to iwant" screen on entering the URL "https://iwanttfc.com/" from Non-PH region.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`)

* expect: 
- User should be navigated to the **"Welcome to iWant"** screen on launching the application.


#### 1.2. IW3-T1847 Verify the UI/UX of the "Welcome to iWant" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Observe the "Login" screen.

* expect:
- Text "Welcome to iWant" and "Home of Filipino Stories" displayed at the top middle of the screen.
- "Email or Mobile Number" text field.
- "Password" text field.
- "Login" CTA highlighted in dark blue color.
- "Login with Facebook" option highlighted in blue color.
- "Login with TV Provider" option.
- "New here? Create Account" label displayed.


#### 1.3. IW3-T1848 Verify the NFvigation on tapping of "Create Account"

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
* expect: 
- User should be navigated to the **"Create an Account"** screen.

#### 1.1.4 IW3-T1849 Verify the UI/UX of the "Lets Get Started" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
   - User should be navigated to the **"Create an Account"** screen.
   - expect: The "Create an Account" heading is displayed.
   - expect: The "Email Address" text field is displayed.
   - expect: The "Password" text field is displayed.
   - expect: The checkbox with text "I agree to the Terms and Conditions and Privacy Policy" is displayed.
   - expect: The checkbox with text "I agree to receive marketing communication (until I Unsubscribe)" is displayed.
   - expect: The "Continue" CTA is displayed.
   - expect: The text "Already Have an Account?" and the "Login" link are displayed.

#### 1.4. IW3-T1850 Verify the functioNFlity of entering the email id and Password in the 'Let's Get Started' screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
5. Click on the "Email" text field.
6. Enter a valid email address.(e.g abhilash584@gmail.com)
* expect: 
- User should be able to enter and view the entered email address in the "Email" text field.

#### 1.5. IW3-T1855 Verify the error message on entering invalid email/phone number and password on the "Email" text field on "Get Started" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Click on "Create Account" option.
5. Click on the "Email" text field.
6. Enter an invalid email address (e.g., `bb11`).
7. Select 1 checkbox.
8. Click on "Continue" CTA.
* expect: 
- User should see a valid error message indicating that the entered email address is invalid.


#### 1.6. IW3-T1857 Verify the message displayed when new user try to login without registration.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Enter a new email address (not registered) and a password.(e.g: abcd@gmail.com, abcd)
5. Select one checkbox.
6. Tap on the "Continue" CTA.
* expect: 
   - A valid error message should be displayed.


#### 1.7. IW3-T1858 Verify the password visibility toggle.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Enter the email address and password.
5. Click on the password visibility icon.
   * expect the entered password should be visible.


#### 1.8. IW3-T1859 Verify the message displayed on entering invalid credentials during login.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://uat.iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Enter an invalid email address and password.(e.g: b11, abcd)
5. Select checkbox.
6. Tap on the "Continue" CTA.
   * expect a valid error message should be displayed.


#### 1.9. IW3-T1864 Verify the message displayed on entering the mobile number on "Forgot Password?" screen.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Tap on "Forgot Password?".
5. Enter the "Mobile number".
6. Tap on the "Continue" CTA.
   * expect the user should get "Invalid email".


#### 1.10. IW3-T1865 Verify the mobile number login functioNFlity.

**File:** `tests/home/login-page-launch.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL (`https://iwanttfc.com/`).
3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
4. Tap on the "Click here to use mobile number" link.
5. Select the country code as "63".
6. Enter the mobile number and password (e.g., `9178039002` / `Password123!`).
7. Tap on the "Continue" CTA.
   * expect the user should be successfully logged in and navigated to the "Home" screen.


#### 2. IW3-T1921 Verify that respective episode playback starts post tapping on episode cards in detail page

**File:** `tests\ott-app\details_page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Enter valid email as "abhilash584@gmail.com" in email field.
4. Click on Password field
5. Enter valid password as "Test1234" in password field
6. Click on the search icon in the top right.
7. Enter the text: 'the blood sisters'
8. Press enter.
9. Select the content that matches the name entered in the search box.
10. Scroll down and find the list of episodes.
11. Click on first episode.
   - expect: The user is redirected to the Player screen and playback starts.
   - expect: The episode name and content title are displayed at the top left corner of the Player screen along with back arrow.


#### 3.IW3-T1936 Verify the functioNFlity of "Remove From Continue Watching" CTA displayed on the  CW tray bottom bar popup from Home screen.

**File:** `tests\ott-app\continue_watching.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Enter the valid email address `abhilash584@gmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Clcik on Contuinue button
6. Click on the Search icon at the top right corner.
7. Search for the content **"The Blood Sisters"**.
8. Press Enter.
9. Select the content that matches the search text.
10. Scroll down to the Episodes section.
11. Click on the first episode.
12. Click on the Forward button in the player controls.
13. Click on the Back arrow at the top of the Player screen.
14. Click on the Home tab.
15. Scroll down to the Continue Watching tray.
16. Hover over the first content thumbnail.
17. Click on the **X** icon.
    - expect: The content is no longer displayed in the Continue Watching tray.
  


#### 4.IW3-T2033 Verify that "Subscribe to watch" CTA is displayed for premium contents inside content details
screen.

**File:** `tests\home\subscription.spec.ts`

**Steps:**

1. Open the browser and navigate to https://www.iwanttfc.com/
2. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
3. Click on the Email Address field.
4. Enter the valid email address `sanitycheck@yopmail.com`.
5. Click on the Password field.
6. Enter the valid password `Test1234`.
7. Click on the Continue CTA.
8. Click on the Search icon.
9. Search for **"Karnal"** and press Enter.
10. Click on the first content from the first rail.
    - expect: The "Subscribe to Watch" CTA is displayed on the Content Details
    - expect: The content is marked as premium.



#### 4.1 IW3-T2039 Verify the NFvigation on tapping "Upgrade Plan" button from the subscription blocker screen.

**File:** `tests\home\subscription.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Log in with free user credentials (e.g., `sanitycheck@yopmail.com` / `Test1234`).
4. Navigate to the GMA tab.
5. Click on the "Subscribe to Watch" CTA in the carousel.
6. Click on the "Subscribe to Watch" CTA.
7. Click on the "Upgrade Plan" button.
   - expect: The user is navigated to the Plans page.
   - expect: The "Plans & Payment" page is displayed.



#### 5.bIW3-T2112 Verify presence of Skip Intro marker during intial content Playback

**File:** `tests\ott-app\Skip_Intro.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the Email Address field.
4. Enter the valid email address.
5. Click on the Password field.
6. Enter the valid password.
7. Click on the Continue CTA.
8. Click on the Search icon.
9. Search for **"Lavender Fields"** and press Enter.
10. Click on the first content from the first rail.
11. Click on the Play button.
    - expect: The "Skip Intro" button is displayed during the initial content playback.



#### 5.1 IW3-T2114 Verify presence of Skip Recap marker during intial content Playback.

**File:** `tests\ott-app\Skip_Intro.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the Email Address field.
4. Enter the valid email address
5. Click on the Password field.
6. Enter the valid password.
7. Click on the Continue CTA.
8. Click on the Search icon.
9. Search for **"Incognito"** and press Enter.
10. Click on the first content from the first rail.
11. Scroll to episode list.
12. Click on episode2.
13. Click on the Play button.
    - expect: The "Skip Recap" button is displayed during the initial content playback.



### 6. IW3-T3658 Verify the user is able see the Account & subscriptions details in My Space/Profile sections

**File:** `tests\ott-app\Sychor_Changes.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the "Login with TV Provider" option.
4. Select **Frontier** from the available TV Provider options 
5. Click on Continue.
Click on the Email Address field.
6. Enter the valid email address (e.g ftrfios1@frontier.com)
7. Click on the Password field.
8. Enter the valid password. (e.g:Frontier1)
9. Click on the Continue CTA.
10. Click on the Account icon at the top right corner.
11. Click on **Account & Settings**.
   - expect: The user is able to view the **Account & Subscription** entitlements.



#### 6.1 IW3-T3659 Verify the user is able to add/remove any contents to the My watchlist page using Add/Remove from watchlist

**File:** `tests\ott-app\Sychor_Changes.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the "Login with TV Provider" option.
4. Select **Frontier** from the available TV Provider options 
5. Click on Continue.
6. Click on the username field.
7. Enter the valid username (e.g ftrfios1@frontier.com)
8. Click on the Password field.
9. Enter the valid password. (e.g:Frontier1)
10. Click on the Sign In CTA.
11. Click on the Search icon.
12. Search for **"Nurse The Dead"** and press Enter.
13. Click on the first content from the first rail.
14. Click on the **+** (Add to Watchlist) icon.
    - expect: A popup with the message **"Added to Watchlist"** is displayed.
15. Click on the **X** (Remove from Watchlist) icon.
    - expect: A popup with the message **"Removed from Watchlist"** is displayed.



#### 1.11 IW3-T4024 Verify the validation of first NFme and last NFme fields inside the "Edit Profiel" screen.

**File:** `tests\ott-app\login-page.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `abhilash584@gmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Account icon.
8. Click on the **Account & Settings** option.
9. Click on the **Edit Profile** option.
10. Enter alphanumeric values in the **First Name** and **Last Name** text fields.
   - expect: The **First Name** and **Last Name** fields accept only alphabetic characters.
   - expect: A validation error message is displayed.




#### 1.12 IW3-T1872 Verify the NFvigation on tapping "Watchlist" icon for the PH region guest user. (PH REGION)

**File:** `tests\home\ph_region.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on any free asset.
3. Click on the Watchlist icon.
   - expect: The user is navigated to the Login screen.



#### 1.13 IW3-T1876 Verify the search functioNFlity for the PH region guest user (PH REGION)

**File:** `tests\home\ph_region.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Search icon.
3. Search for a content keyword (e.g., **"Lavender Fields"**).
   - expect: The user is able to fill the text in the search bar for the content.
4. Click on the first content from the first rail.
   - expect: The user is navigated to the Content Details page.
   - expect: The title displayed on the Content Details page matches the searched content title.


#### 1.14 Verify the NFvigation on "Subscribe" CTA  for the PH region guest user.

**File:** `tests\home\ph_region.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
3. Click on the **Cinema One PH** section in the homepage.
4. If the **Try Again** CTA is displayed, end the test and mark it as **Passed**.
5. Otherwise, click on the **Login** CTA.
   - expect: The user is navigated to the Login screen.



####  1.15 IW3-T1856 Verify the error message on tapping "Get Started" by leaving the "Email and Password" screen blank and without password criteria in "Get Started" screen.

**File:** `tests\create-account-navigation.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Click on the **Create Account** link.
4. Select both consent checkboxes.
5. Click on the **Get Started** CTA without entering any details.
   - expect: A valid error message is displayed.


#### 7. IW3-T2047 Verify Add to Watchlist option is not displayed for Live content

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Navigate to the **Live Channels** tray.
8. Click on **DZMM Teleradyo** live content.
   - expect: The **Live** icon is visible in the playback.
   - expect: The **Add to Watchlist** option is not displayed for live content.


#### 7.1.  IW3-T2046 Verify content can be played directly from my watchlist.


**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser.
2. Enter the URL(https://uat.iwanttfc.com/)
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
4. Add some content to my watchlist
5. NFvigate to my watchlist page
6. Play same content from my watchlist (NAutomated)


#### 7.2 IW3-T2049 Verify that "Free" tag is displayed for free content in my watchlist

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Search icon.
8. Search for **"My Illegal Wife"** and press Enter.
9. Click on the first content from the first rail.
10. Click on the Watchlist icon.
11. Navigate to the **My Watchlist** page.
   - expect: The title of the first content in **My Watchlist** matches the title of the searched content.
   - expect: The added content card displays the **"Free"** tag.


#### 7.3 IW3-T2050 Verify that user is able to add free content into my watchlist

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Search icon.
8. Search for **"Kuan on One"** and press Enter.
9. Click on the first content from the first rail.
10. Click on the Watchlist icon.
11. - expect: A popup with the message **"Added to Watchlist"** is displayed.



#### 7.4 IW3-T2051 Verify that user is able to remove free content from my watchlist

**File:** `tests\home\watchlist.spec.ts`

**Steps:**
1. Open the browser and navigate to https://www.iwanttfc.com/
2. Click on the Confirm button in the cookies popup window.
3. Enter the valid email address `sanitycheck@yopmail.com` in the Email Address field.
4. Click on the Password field.
5. Enter the valid password `Test1234` in the Password field.
6. Click on the Continue CTA.
7. Click on the Search icon.
8. Search for **"Kuan on One"** and press Enter.
9. Click on the first content from the first rail.
10. Click on the Watchlist icon.
   - expect: A popup with the message **"Removed from Watchlist"** is displayed.


### 5.5 IW3-T1951	Verify the Continue Watching tray upon logout and login with same account.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Verify that the **Continue Watching** tray is displayed with existing content.
6. Log out of the application.
7. Log in again using the same user credentials.
8. Navigate to the **Home** page.
9. Observe the **Continue Watching** tray.
   - **Expect:** The **Continue Watching** tray should remain unchanged after logout and login.
   - **Expect:** The previously available content and its watch progress should be preserved.

### 5.6 IW3-T1935 Verify the Navigation on tapping 3 dots and "Details and More" option displayed on the  CW tray bottom bar popup.

**File:** `tests/home/continue-watching.spec.ts`

**Steps**

1. **Precondition:** The user should have content available in the **Continue Watching** tray.
2. Open the browser.
3. Enter the URL (https://iwanttfc.com/).
4. Log in with valid user credentials.
5. Navigate to the **Home** page.
6. Locate a content card in the **Continue Watching** tray.
7. Hover on the content card.
8. Click on **View More**
9. Observe the navigation.
   - **Expect:** The user should be navigated to the **Content Details** page for the selected content.

### 5.7 IW3-T1945 Verify the content under Continue watching tray upon watching the content from different tabs.

**File:** `tests/home/continue-watching-across-tabs.spec.ts`

**Steps**

1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Log in with valid **free user** credentials.
4. Navigate to the **Movies** or **Shows** tab.
5. Select any playable content and start playback.
6. Watch the content partially, then exit the player.
7. Navigate back to the **Home** page.
8. Locate the **Continue Watching** tray.
9. Observe the tray contents.
   - **Expect:** The partially watched content should be displayed in the **Continue Watching** tray.
   - **Expect:** Content watched from different tabs (such as **Movies** and **Shows**) should appear in the **Continue Watching** tray.