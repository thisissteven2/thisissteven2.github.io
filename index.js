const axios = require("axios");
const { load } = require("cheerio");
const fs = require("fs");
const path = require("path");

const getUri = (subcategory) => `https://langeek.co/en-ZH/vocab/subcategory/${subcategory}/learn/review`;

const fixImageUrl = async (scriptText) => {
  const parsedScriptText = JSON.parse(scriptText);
  const props = parsedScriptText.props.pageProps.initialState.static.subcategory;

  const subcategory = JSON.parse(fs.readFileSync(`./found/${props.id}.json`, "utf-8"));

  const cards = await Promise.all(
    props.cards.map(async (card, index) => {
      const image = card.mainTranslation.wordPhoto?.photo ?? null;

      if (!image) {
        return {
          ...subcategory.cards[index],
          image: null,
        };
      }

      return subcategory.cards[index];
    })
  );

  return {
    ...subcategory,
    cards,
  };
};

// Function to process a single subcategory
const processSubcategory = async (subcategory) => {
  const { data } = await axios.get(getUri(subcategory));
  const $ = load(data);
  const scriptText = $("#__NEXT_DATA__").text();
  try {
    const props = await fixImageUrl(scriptText);

    console.log(`Processed subcategory with title ${props.title.en}`);

    // Ensure the directory exists
    const dir = path.join(__dirname, "found");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(path.join(dir, `${subcategory}.json`), JSON.stringify(props, null, 2));
  } catch {
    console.log(subcategory);
  }
};

async function main() {
  const subcategories = Array.from({ length: 5000 }, (_, i) => i + 2041);

  for (let i = 0; i < subcategories.length; i += 10) {
    const batch = subcategories.slice(i, i + 10);
    await Promise.all(batch.map((subcategory) => processSubcategory(subcategory)));
  }
}

main().catch(console.error);
