const { chromium } = require("playwright-core");

(async () => {
  try {
    const browser = await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
    });
    const page = await browser.newPage();

    await page.goto("https://www.aasthasupports.com/shop");
    await page.waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 });

    // add to cart
    await page.click('button:has-text("Buy Now")');
    await page.waitForURL("**/cart**");

    // click checkout
    await page.click('button:has-text("Proceed to Checkout")');

    // Watch URL changes
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        console.log("Navigated to:", frame.url());
      }
    });

    await page.waitForTimeout(10000);

    await browser.close();
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
})();
