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
    // Wait for the loader to disappear
    await page.waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 });

    console.log("Filling search...");
    await page.fill('input[placeholder*="Search"]', "rudraksha");

    // Wait a bit for the filter to run (client side, very fast)
    await page.waitForTimeout(1000);

    const titles = await page.$$eval("h3, p.font-bold, p.text-maroon-deep, p.text-xs", (els) =>
      els.map((e) => e.innerText),
    );
    console.log(
      "Found text elements:",
      titles.filter((t) => t.toLowerCase().includes("rudraksha")),
    );

    await page.screenshot({ path: "shop_search.png" });
    console.log("Screenshot saved to shop_search.png");

    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();
