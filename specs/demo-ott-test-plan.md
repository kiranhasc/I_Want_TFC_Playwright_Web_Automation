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
#### 7.1. IW3-T2060 VVerify the Search icon is visible in the top navigation bar on all pages (Home, Movies,Shows,My Watchlist, GMA)
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

#### 7.2. IW3-T2062 Verify that the user can type a search query in the input box
**File:** `tests/home/search.spec.ts`
**Steps:**
   1. Open the browser.
   2. Enter the URL(https://iwanttfc.com/)
   3. Accept the cookie popup "Cookie & Notification    Settings" with "Confirm" button
   4. Login with valid Email and Password
   5. Click on search icon
   6. Type 'Abandoned' in search field 
      * expect Observe 'Abandoned' text should appear clearly in the input box

#### 7.3. IW3-T2064 Verify the search results are shown when a valid title is entered in the Search field
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
4. Enter valid email as "sanitycheck@yopmail.com" in email field.
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
