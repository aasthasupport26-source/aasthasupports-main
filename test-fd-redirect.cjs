const { chromium } = require("playwright-core");

(async () => {
  try {
    const browser = await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
    });
    const page = await browser.newPage();

    // First let's get a fresh cart URL using the node API script we had earlier, or just hardcode one?
    // Let's create a fresh cart URL by hitting the local server
    await page.goto("http://localhost:8082/shop");
    await page.waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 });
    await page.click('button:has-text("Buy Now")');
    await page.waitForURL("**/cart**");

    let targetUrl = "";
    page.on("response", async (res) => {
      if (res.url().includes("createShopifyCheckout")) {
        try {
          const body = await res.json();
          if (body && body.checkoutUrl) {
            targetUrl = body.checkoutUrl;
            console.log("Got checkout URL from API:", targetUrl);
          }
        } catch (e) {}
      }
    });

    await page.click('button:has-text("Proceed to Checkout")');

    // wait for it to navigate
    await page.waitForURL(/cart\/c/, { timeout: 15000 });

    // At this point we are probably on the VITE bridge page
    console.log("On bridge page:", page.url());

    // Let's see where it eventually settles
    await page.waitForTimeout(5000);
    console.log("Settled on URL:", page.url());

    await browser.close();
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
})();
