const puppeteer = require("puppeteer");

async function imgScrape(queries) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    var images;
    for (const query of queries) {
      await page.goto(`https://www.google.com/search?tbm=isch&q=${query}`);

      // Scroll to the bottom of the page to load more images
      await page.evaluate(async () => {
        for (let i = 0; i < 10; i++) {
          window.scrollBy(0, window.innerHeight);
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for more images to load
        }
      });

      // Wait for images to be loaded
      await page.waitForSelector("img");

      // Extract image URLs
      images = await page.evaluate(() => {
        const imageElements = document.querySelectorAll("img");
        const urls = [];
        const widths = [];
        imageElements.forEach((img) => {
          const url = img.src;
          if (url.startsWith("http") && !url.includes("google")) {
            urls.push(url);
            widths.push(img.width);
          }
        });
        return urls.slice(0, 3); // Limit to first 3 image URLs
      });
    }

    await browser.close();
    return images;
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

const urls = Promise.resolve(imgScrape(["文字游戏"]));

urls.then((urls) => {
  console.log(urls);
});
