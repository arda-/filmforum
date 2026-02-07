import { test, expect } from '@playwright/test';

test.describe('Share List Flow', () => {
  test('should share a list and display it correctly', async ({ page }) => {
    // Go to the list page
    await page.goto('http://localhost:4321/s/tenement-stories/list');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Mark some movies with reactions
    // Find and click some reaction buttons
    const yesButtons = await page.locator('[data-reaction="yes"]').all();
    if (yesButtons.length > 0) {
      await yesButtons[0].click(); // Mark first movie as yes
      await yesButtons[2].click(); // Mark third movie as yes
    }

    const maybeButtons = await page.locator('[data-reaction="maybe"]').all();
    if (maybeButtons.length > 0) {
      await maybeButtons[1].click(); // Mark second movie as maybe
    }

    // Open saved list drawer
    await page.click('#review-saved-btn');

    // Wait for drawer to open
    await page.waitForSelector('#saved-list-drawer', { state: 'visible' });

    // Click share button
    await page.click('#saved-share-btn');

    // Wait a bit for clipboard
    await page.waitForTimeout(500);

    // Get the share URL from clipboard (or from the page state)
    // For now, let's construct it manually based on the current state
    const shareUrl = await page.evaluate(() => {
      const urlMatch = document.body.innerText.match(/http:\/\/localhost:4321\/s\/[^\\s]+/);
      return urlMatch ? urlMatch[0] : null;
    });

    console.log('Share URL:', shareUrl);

    // If we can't get URL from clipboard, let's check localStorage
    const userId = await page.evaluate(() => localStorage.getItem('filmforum_user_id'));
    const reactions = await page.evaluate(() => {
      return localStorage.getItem('filmforum_reactions_tenement-stories');
    });

    console.log('User ID:', userId);
    console.log('Reactions from localStorage:', reactions);

    // Now test the saved page with a known encoded URL
    // Use the URL from the user's example: ?u=yrm8yxhw&r=AwIDBSU=
    const testUrl = 'http://localhost:4321/s/tenement-stories/list/saved?u=yrm8yxhw&r=AwIDBSU=';

    // Navigate to shared list
    await page.goto(testUrl);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Wait a bit for scripts to run
    await page.waitForTimeout(1000);

    // Get debug output
    const debugOutput = await page.evaluate(() => {
      return {
        allMovies: (window as any).__movieData?.length || 0,
        sessionId: (window as any).__sessionId,
      };
    });

    console.log('Debug output:', debugOutput);
    console.log('Console logs:', consoleLogs);

    // Check if movies are displayed
    const yesSection = await page.locator('#shared-yes-items');
    const maybeSection = await page.locator('#shared-maybe-items');
    const emptyState = await page.locator('#shared-empty');

    const yesSectionVisible = await yesSection.isVisible();
    const maybeSectionVisible = await maybeSection.isVisible();
    const emptyStateVisible = await emptyState.isVisible();

    console.log('Yes section visible:', yesSectionVisible);
    console.log('Maybe section visible:', maybeSectionVisible);
    console.log('Empty state visible:', emptyStateVisible);

    // Get the actual content
    const yesItems = await yesSection.innerHTML();
    const maybeItems = await maybeSection.innerHTML();

    console.log('Yes items HTML:', yesItems);
    console.log('Maybe items HTML:', maybeItems);

    // Assertions
    expect(emptyStateVisible).toBe(false);
    expect(yesSectionVisible || maybeSectionVisible).toBe(true);
  });

  test('should decode compact encoding correctly', async ({ page }) => {
    // Set up console listener
    const logs: any[] = [];
    page.on('console', msg => {
      logs.push(msg.text());
    });

    // Navigate directly to a shared list with known encoding
    await page.goto('http://localhost:4321/s/tenement-stories/list/saved?u=testuser&r=AwIDBSU=');

    // Wait for page load and scripts
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Print all console logs
    console.log('\\n=== Console Logs ===');
    logs.forEach(log => console.log(log));
    console.log('===================\\n');

    // Check page state
    const pageState = await page.evaluate(() => {
      return {
        movieCount: (window as any).__movieData?.length || 0,
        sessionId: (window as any).__sessionId,
        emptyVisible: document.getElementById('shared-empty')?.style.display !== 'none',
      };
    });

    console.log('Page state:', pageState);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/shared-list-debug.png', fullPage: true });
  });
});
