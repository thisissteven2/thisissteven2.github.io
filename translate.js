const fs = require("fs");
const { enToId } = require("./utils");

async function translateToId(cat) {
  console.log(`translating ${cat.id}`);

  const category = JSON.parse(fs.readFileSync(`./list/category/${cat.id}.json`));
  const translatedAdverbTitles = await enToId(category.list.map((item) => item.adverbTitle));

  return {
    ...category,
    list: category.list.map((item, i) => ({
      ...item,
      adverbTitle: {
        en: item.adverbTitle,
        id: translatedAdverbTitles[i],
      },
    })),
  };
}

async function addPhoto(cat) {
  console.log(`translating ${cat.id}`);

  const category = JSON.parse(fs.readFileSync(`./list/category/${cat.id}.json`));

  return {
    ...category,
    original: cat.original,
    thumbnail: cat.thumbnail,
  };
}

async function main() {
  const categories = JSON.parse(fs.readFileSync("./list/categories.json"));

  const translated = [];

  for (let i = 0; i < categories.length; i += 10) {
    const batch = categories.slice(i, i + 10);
    const result = await Promise.all(batch.map((category) => addPhoto(category)));
    translated.push(...result);
  }

  translated.forEach((category) => {
    fs.writeFileSync(`./list/category/${category.id}.json`, JSON.stringify(category, null, 2));
  });
}

main().catch(console.error);
