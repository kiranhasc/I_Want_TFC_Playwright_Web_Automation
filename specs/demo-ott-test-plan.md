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

<!-- #### 10.5. IW3-T1890 Verify user is able to login with valid credentials.
**File:** ``tests/home/home-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Wait until "Loading.." disappered
      * expect "Home" Tab should be displayed -->

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
2. Enter the URL.
3. Login with valid credentials.
4. Scroll to the bottom of the page.
5. Tap the **Terms and Conditions** link.  
   *expect:* User should be navigated to the **Terms and Conditions** page.
6. Tap the **Introduction** link from the left navigation menu.  
   *expect:* User should be navigated to the **Introduction** section.
7. Tap link **For customers in Canada** available within the **Introduction** page
   *expect:* The user should be navigated to the respective page and the relevant details should be displayed correctly **Customers in the Canada**.

### 10.13. IW3-T4341 Verify that the respective page is displayed when the user taps any link on the **Terms and Conditions** page
**File:** `tests/home/home-page-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL.
3. Login with valid credentials.
4. Scroll to the bottom of the page.
5. Tap the **Terms and Conditions** link.  
   *expect:* User should be navigated to the **Terms and Conditions** page.
6. Tap any link from the left navigation menu (e.g. **Introduction**).  
   *expect:* User should be navigated to the selected section.
7. Tap link **Customers in the Japan and South Korea** available within the **Introduction** page
   *expect:* The user should be navigated to the respective page and the relevant details should be displayed correctly **Customers in the Japan and South Korea**.

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

### 10.15. IW3-T3664 Verify  Synacor user will not be able to edit the profile in account page
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
   8. Click on Account & Settings
      **expect** "Edit Profile" button should not be displayed

### 10.16. IW3-T3657 Verify the user is able log in with any TV provider credentials
**File:** `tests/home/synacor-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Click on "Login with TV Provider" option
   5. Select the Frontier from available options and Click on Continue
   6. Input the TV Provider credentials (Ex: ftrfios1@frontier.com/Frontier1)
   6. Click on "Continue" CTA.
      **expect** verify "Movies" should be displayed

### 10.17. IW3-T4699 Verify that a VPN-specific user-friendly error message is displayed when a user attempts to play content using a VPN network.
**File:** `tests/home/vpn-page-launch.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL.
   3. Login with valid credentials.
   4. Search for **"Incognito"**  show using the search bar.
   5. Open the **Incognito** content details page.
   6. Attempt to play the content.
      *expect:* The message **"We detected that you're using a VPN or proxy. Please disable it and try again."** should be displayed, and video playback should not start.
   7. If the video starts playing instead of displaying the VPN restriction message,
      *expect:* Fail the test with the error: **"Connected to a non-VPN network or connected to a region other than PH."**

### 10.18. IW3-T3667 Verify that the "Early Access" tag is displayed on the content thumbnail for "On Air" shows on the Home page.
**File:** `tests/home/early-access-launch.spec.ts`
**Steps:**
1. Open the browser.
2. Enter the URL (https://iwanttfc.com/).
3. Accept the **Cookie & Notification Settings** popup by clicking the **Confirm** button.
4. Login with a valid Email and Password.
5. Wait until the **Loading...** indicator disappears.
   *expect:* The **Home** tab should be displayed.
6. Wait for the GraphQL operation **Collection** to complete.
7. Capture the GraphQL response for the **Collection** operation.
8. Create a `CollectionParser` instance using the captured response.
9. Search the parsed collection for an asset whose label is **"Early Access"**.
10. If a matching asset is found:
    - Store the asset details.
    - Retrieve the **Rail Title** containing the asset.
    - Retrieve the **Asset Title**.
    - Retrieve the **Asset ID**.
11. Navigate to the retrieved rail on the **Home** page.
12. Locate the content thumbnail using the retrieved **Asset Title** or **Asset ID**.
    *expect:* The content thumbnail should be visible in the identified rail.
13. Verify that the content thumbnail displays the **"Early Access"** tag.
    *expect:* The **"Early Access"** tag should be displayed on the corresponding content thumbnail.