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


