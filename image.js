const fs = require("fs");
const axios = require("axios");
const { downloadImage } = require("./utils");

async function scrapeAndDownloadImage(query, id) {
  const { data: axiosData } = await axios.get(
    `https://unsplash.com/napi/search/photos?page=1&per_page=1&query=${query}`
  );

  const url = axiosData.results[0].urls.small;

  console.log(`Downloaded image for query: ${query}`);
  await downloadImage(url, `./images/${id}.jpeg`);
}

async function main() {
  const files = fs.readdirSync("./found");

  for (const file of files) {
    const filePath = `./found/${file}`;
    const data = fs.readFileSync(filePath, "utf8");
    let jsonData = JSON.parse(data);

    const queries = jsonData.cards
      .map((card) => {
        if (!card.image) {
          return {
            query: card.translation.en.short,
            id: card.id,
          };
        }
        return null;
      })
      .filter(Boolean);

    await Promise.all(queries.map(({ query, id }) => scrapeAndDownloadImage(query, id)));
  }
}

main().catch(console.error);
