const { chromium } = require("playwright-core");

(async () => {
  try {
    const browser = await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
    });
    const page = await browser.newPage();

    await page.goto("http://localhost:8082/shop");
    await page.waitForSelector(".animate-spin", { state: "hidden", timeout: 10000 });
    await page.fill('input[placeholder*="Search"]', "rudraksha");
    await page.waitForTimeout(1000);

    const bodyText = await page.innerText("body");
    console.log(bodyText);

    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();
