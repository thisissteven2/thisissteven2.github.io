const axios = require("axios");
const { load } = require("cheerio");
const fs = require("fs");
const path = require("path");

// const uri = "https://langeek.co/en/vocab/topic-related";

// TODO: Get all categories per id by parsing html
/**
 * structure:
 *  {
      "id": 525,
      "title": "Large Mammals",
      "wordsCount": 25,
      "estimatedLearningTime": 750,
    },
 */

const folderPath = path.join(__dirname, "category");

async function processData(id, name) {
  const uri = `https://langeek.co/en/vocab/category/${id}/${name}`;
  const { data } = await axios.get(uri);

  const $ = load(data);

  // Select the <main> element
  const mainElement = $("main");

  // Get the first two children
  const firstChild = mainElement.children().eq(0);
  const secondChild = mainElement.children().eq(1);

  // Extract the text from the first child
  const title = firstChild.find("h1").text().trim();
  const description = firstChild.find("div.tw-text-sm").text().trim();

  const containerDivs = secondChild.find("div.tw-w-full.tw-relative.tw-basis-full");

  // Create an array to store the extracted data
  const list = [];

  containerDivs.each((index, element) => {
    const div = $(element);

    // Extract the adverb title
    const adverbTitle = div.find("h3").text().trim();

    // Extract words and time
    const wordsElement = div.find("p.tw-text-sm.tw-text-gray-58").first();
    const timeElement = div.find("p.tw-text-sm.tw-text-gray-58").last();

    const wordsText = wordsElement.text().trim();
    const timeText = timeElement.text().trim();

    // Extract numbers from text if available
    const wordsMatch = wordsText.match(/(\d+)/);
    const timeMatch = timeText.match(/(\d+)/);

    const words = wordsMatch ? wordsMatch[1] : "N/A";
    const time = timeMatch ? timeMatch[1] : "N/A";

    // Extract the ID from the href attribute
    const href = div.find("a[href]").attr("href");
    const id = href ? href.split("/")[4] : "N/A";

    list.push({
      id,
      adverbTitle,
      words,
      time,
    });
  });

  fs.writeFileSync(path.join(folderPath, `${id}.json`), JSON.stringify({ title, description, list }, null, 2));
}

async function main() {
  const categories = JSON.parse(fs.readFileSync("categories.json"));
  for (const category of categories) {
    await processData(category.id, category.urlId);
    console.log(`Done processing category ${category.id}`);
  }
}

main().catch(console.error);
