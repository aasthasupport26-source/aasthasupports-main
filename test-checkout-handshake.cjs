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

    console.log("Clicking 'Buy Now'...");
    await page.click('button:has-text("Buy Now")');

    console.log("Waiting for cart page...");
    await page.waitForURL("**/cart**", { timeout: 10000 });

    console.log("Clicking 'Proceed to Checkout'...");
    await page.click('button:has-text("Proceed to Checkout")');

    console.log("Waiting for redirect to Shopify...");
    // wait until the domain changes from localhost
    await page.waitForURL(/.*myshopify\.com.*/, { timeout: 15000 });

    const finalUrl = page.url();
    console.log("Arrived at:", finalUrl);

    console.log("Waiting for page load...");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    console.log("Dumping page text:");
    const text = await page.innerText("body");
    console.log(text.substring(0, 500) + (text.length > 500 ? "..." : ""));

    await page.screenshot({ path: "checkout_handshake.png", fullPage: true });
    console.log("Saved screenshot to checkout_handshake.png");

    await browser.close();
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
})();
