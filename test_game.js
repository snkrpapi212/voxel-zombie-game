const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`BROWSER CONSOLE ERROR: ${msg.text()}`);
    } else {
      console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`BROWSER PAGE ERROR: ${err.message}`);
  });

  console.log('Navigating to http://localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Navigation error:', e.message);
    process.exit(1);
  }

  // Check if canvas exists
  const canvasExists = await page.evaluate(() => {
    return !!document.querySelector('canvas');
  });
  console.log(`Canvas exists: ${canvasExists}`);

  if (!canvasExists) {
    console.error('FAILURE: Canvas element not found.');
  }

  // Wait for loading screen to disappear (if present)
  try {
    const loadingScreen = await page.$('#loading-screen');
    if (loadingScreen) {
      console.log('Waiting for loading screen to hide...');
      await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
      console.log('Loading screen hidden.');
    } else {
      console.log('No loading screen element found.');
    }
  } catch (e) {
    console.error('Loading screen did not hide within timeout:', e.message);
  }

  // Wait for game object
  await page.waitForFunction(() => window.game && window.game.player);

  // Enable force update for testing
  await page.evaluate(() => {
    window.game.forceUpdate = true;
  });

  // Wait for game to settle
  console.log('Waiting for 5 seconds for game to render...');
  await page.waitForTimeout(5000);

  // Log player position
  const playerPos = await page.evaluate(() => {
    const p = window.game.player.position;
    return { x: p.x, y: p.y, z: p.z };
  });
  console.log('Player Position:', playerPos);

  // Simulate movement
  console.log('Simulating movement...');
  await page.keyboard.down('w');
  await page.waitForTimeout(1000);
  await page.keyboard.up('w');
  
  await page.keyboard.press('Space');
  await page.waitForTimeout(1000);

  // Log player position again
  const playerPos2 = await page.evaluate(() => {
    const p = window.game.player.position;
    return { x: p.x, y: p.y, z: p.z };
  });
  console.log('Player Position after movement:', playerPos2);

  // Take final screenshot
  await page.screenshot({ path: 'screenshot_gameplay.png' });
  console.log('Screenshot saved to screenshot_gameplay.png');

  await browser.close();
})();
