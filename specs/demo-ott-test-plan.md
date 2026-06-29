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
