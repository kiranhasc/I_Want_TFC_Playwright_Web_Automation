import { test, expect } from '@playwright/test';
import { verifyAccountAndSubscriptionDetails, validateEditProfileNameFields } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.setTimeout(120000);
test.describe('Profile and account details', () => {
  test('@high IW3-T3658: Verify the user is able see the Account & subscriptions details in My Space/Profile sections', async ({ page }) => {
    const data = testCaseData['tc-auth-015-account-subscriptions'];
    
    const result = await verifyAccountAndSubscriptionDetails(page, {
      mode: data.mode,
      providerName: data.providerName,
      expectedSectionName: data.expectedSectionName,
      expectedSubscriptionText: data.expectedSubscriptionText,
    });

    expect(result.isProfileSectionVisible).toBe(true);
    expect(result.isAccountAndSubscriptionDetailsVisible).toBe(true);
    expect(result.profileSectionText).toContain(data.expectedSectionName);
    expect(result.accountDetailsText).toContain(data.expectedSubscriptionText);
  });

  test(' @medium IW3-T4024 Verify the validation of first name and last name fields inside the Edit Profile screen', async ({ page }) => {
    const data = testCaseData['tc-auth-017-edit-profile-name-validation'];
    const result = await validateEditProfileNameFields(page, {
      mode: data.mode,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    //expect(result.isEditProfileScreenVisible).toBe(true);
    expect(result.isFirstNameFieldVisible).toBe(true);
    expect(result.isLastNameFieldVisible).toBe(true);
    expect(result.isValidationErrorDisplayed).toBe(true);
  });
});
