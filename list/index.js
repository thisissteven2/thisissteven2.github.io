const axios = require("axios");
const { load } = require("cheerio");
const fs = require("fs");

// const uri = "https://langeek.co/en/vocab/topic-related";
const uri = "https://langeek.co/en/vocab/book-collection/16/adverbs";

async function main() {
  //   const { data } = await axios.get(uri);

  //   const $ = load(data);

  //   const scriptText = $("#__NEXT_DATA__").text();

  //   console.log(scriptText);
  //   const parsed = JSON.parse(scriptText);
  //   fs.writeFileSync("data.json", JSON.stringify(parsed, null, 2));
  const categories = JSON.parse(fs.readFileSync("categories.json"));

  fs.writeFileSync(
    "bookCollections.json",
    JSON.stringify(
      categories.sort((a, b) => a.id - b.id),
      null,
      2
    )
  );
}

main().catch(console.error);
