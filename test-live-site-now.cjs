const { chromium } = require("playwright-core");

(async () => {
  try {
    const browser = await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
    });
    const page = await browser.newPage();

    console.log("Navigating to live site cart...");
    await page.goto("https://www.aasthasupports.com/cart");

    // Check if cart has items or if we can force checkout
    // Let's just go directly to the cart route with a mock id to see if _fd=0 gets appended
    console.log("Navigating directly to Vite bridge route...");
    await page.goto("https://www.aasthasupports.com/cart/c/hWNFfBjcXGf3S2KwEoaXSnfW?_fd=0");

    // Watch URL changes
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        console.log("Navigated to:", frame.url());
      }
    });

    await page.waitForTimeout(5000);

    console.log("Final URL after wait:", page.url());

    // Check if the final URL contains _fd=0 and is myshopify
    if (page.url().includes("myshopify.com") && page.url().includes("_fd=0")) {
      console.log("SUCCESS: It successfully redirected to Shopify checkouts without a loop!");
    } else {
      console.log("FAILED: It is still looping or missing _fd=0.");
    }

    await page.screenshot({ path: "live_site_checkout_test.png" });
    await browser.close();
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
})();
