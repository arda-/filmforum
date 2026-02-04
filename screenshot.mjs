import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4321';

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Use URL params to set view state directly
  const url = `${BASE_URL}/?timeline=1&fit-width=0&image=1&year-director=1&runtime=1`;
  await page.goto(url);
  await page.waitForSelector('.movie');

  // Brief wait for render
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved to screenshot.png');

  await browser.close();
}

takeScreenshot().catch(console.error);
