const axios = require("axios");
const { load } = require("cheerio");

const fs = require("fs");

const getUri = (hanzi) => `https://eng.ichacha.net/mzj/${hanzi}.html`;

async function scrapeSentence(hanzi) {
  try {
    const uri = getUri(hanzi);

    const response = await axios.get(uri);
    const html = response.data;

    const $ = load(html);

    let resultArray = [];

    $("ol li").each((_, element) => {
      let englishText = "";
      let chineseText = "";
      let isChinesePart = false;

      $(element)
        .contents()
        .each((_, el) => {
          if (el.type === "text" && !isChinesePart) {
            englishText += el.data;
            isChinesePart = true;
          } else if (el.type === "text" && isChinesePart) {
            chineseText += el.data;
          } else if (el.children?.[0]?.data) {
            chineseText += el.children[0].data;
          }
        });

      resultArray.push({ english: englishText.trim(), chinese: chineseText.trim() });
    });

    resultArray = resultArray.filter((result) => result.english !== "" && result.chinese !== "");

    if (resultArray.length === 0) {
      console.log(`No sentences found for ${hanzi}`);

      const notFound = JSON.parse(fs.readFileSync("./not-found.json", "utf8"));

      notFound.push(hanzi);

      fs.writeFileSync("./not-found.json", JSON.stringify(notFound, null, 2));

      return;
    }

    fs.writeFileSync(`./examples/${hanzi}.json`, JSON.stringify(resultArray, null, 2));

    console.log(`Success: ${hanzi}`);
  } catch {
    console.log(`No sentences found for ${hanzi}`);

    const notFound = JSON.parse(fs.readFileSync("./not-found.json", "utf8"));

    notFound.push(hanzi);

    fs.writeFileSync("./not-found.json", JSON.stringify(notFound, null, 2));
  }
}

function removeChinesePunctuation(text) {
  return text.replace(/[^\u4e00-\u9fa5]/g, "");
}

async function main() {
  const hanzisToScrape = JSON.parse(fs.readFileSync("./to-scrape.json", "utf8"));

  for (let i = 0; i < hanzisToScrape.length; i += 20) {
    const batch = hanzisToScrape.slice(i, i + 20);
    await Promise.all(batch.map((hanzi) => scrapeSentence(removeChinesePunctuation(hanzi))));
  }
}

main().catch(console.error);
