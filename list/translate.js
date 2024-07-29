const fs = require("fs");
const { enToId } = require("../utils");

async function translateToId(category) {
  const translatedId = await enToId(category.title);
  const photoId = category.photo.replace("https://cdn.langeek.co/photo/", "").split("/")[0];
  console.log(`translated ${category.title} to ${translatedId[0]}`);

  return {
    ...category,
    original: `https://dictionary.hanzi.id/images/${photoId}-original.jpeg`,
    thumbnail: `https://dictionary.hanzi.id/images/${photoId}-thumbnail.jpeg`,
    title: {
      en: category.title,
      id: translatedId[0],
    },
  };
}

async function main() {
  const categories = JSON.parse(fs.readFileSync("categories.json"));

  const translated = [];

  for (let i = 0; i < categories.length; i += 10) {
    const batch = categories.slice(i, i + 10);
    const result = await Promise.all(batch.map((category) => translateToId(category)));
    translated.push(...result);
  }

  fs.writeFileSync("categories-id.json", JSON.stringify(translated, null, 2));
}

main().catch(console.error);
