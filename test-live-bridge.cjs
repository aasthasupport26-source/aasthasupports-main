const { chromium } = require("playwright-core");

(async () => {
  try {
    const browser = await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
    });
    const page = await browser.newPage();

    console.log("Navigating directly to Vite bridge route...");
    await page.goto("https://www.aasthasupports.com/cart/c/hWNFfBjcXGf3S2KwEoaXSnfW?_fd=0");

    // Watch URL changes
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        console.log("Navigated to:", frame.url());
      }
    });

    await page.waitForTimeout(10000);

    console.log("Final URL after wait:", page.url());
    await browser.close();
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
})();
