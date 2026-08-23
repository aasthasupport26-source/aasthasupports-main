const { chromium } = require("playwright-core");

(async () => {
  try {
    const browser = await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
    });
    const page = await browser.newPage();

    console.log("Navigating to shop...");
    await page.goto("http://localhost:8082/shop");

    console.log("Waiting for products to load...");
    await page.waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 });

    console.log("Clicking first 'Buy Now' button...");
    await page.click('button:has-text("Buy Now")');

    console.log("Waiting for cart page...");
    await page.waitForURL("**/cart**", { timeout: 10000 });
    console.log("On cart page!");

    console.log("Clicking 'Proceed to Checkout'...");

    // Intercept navigation to Shopify
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        console.log("Navigated to:", frame.url());
      }
    });

    await page.click('button:has-text("Proceed to Checkout")');

    console.log("Waiting for checkout redirect...");
    // Wait for the URL to change to something other than localhost
    await page.waitForURL(/.*myshopify\.com.*/, { timeout: 15000 });
    console.log("Successfully redirected to Shopify checkout!");

    await browser.close();
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
})();
