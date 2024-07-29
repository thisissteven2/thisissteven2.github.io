const axios = require("axios");
const { load } = require("cheerio");
const fs = require("fs");
const path = require("path");
const { enToId, enToZh, zhCNTozhTW } = require("../translate");

const getUri = (subcategory) => `https://langeek.co/en-ZH/vocab/subcategory/${subcategory}/learn/review`;

const downloadImage = async (url, filepath) => {
  const response = await axios({
    url,
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const getImagePath = (id) => `https://content.hanzi.id/langeek/images/${id}.jpeg`;

const getProps = async (scriptText) => {
  const parsedScriptText = JSON.parse(scriptText);
  const props = parsedScriptText.props.pageProps.initialState.static.subcategory;

  const title = props.title;
  const description = props.description;

  const [titleId, descriptionId] = await enToId([title, description]);

  const cards = await Promise.all(
    props.cards.map(async (card) => {
      const id = card.id;
      const enShort = card.mainTranslation.title;
      const enLong = card.mainTranslation.translation;
      const enPartOfSpeech = card.mainTranslation.partOfSpeech.partOfSpeechType;

      const [idShort, idLong, idPartOfSpeech] = await enToId([enShort, enLong, enPartOfSpeech]);

      const chineseEntry = card.mainTranslation.localizedProperties?.translation ?? (await enToZh(enShort));

      const simplified = typeof chineseEntry === "string" ? chineseEntry : chineseEntry.text;

      const traditionalEntry = await zhCNTozhTW(simplified);
      const traditional = traditionalEntry.text;

      const image = card.mainTranslation.wordPhoto?.photo ?? null;
      const imagePath = image ? path.join(__dirname, "images", `${id}.jpeg`) : null;

      if (image) {
        await downloadImage(image, imagePath);
      }

      return {
        id: id,
        translation: {
          en: {
            short: enShort,
            long: enLong,
            partOfSpeech: enPartOfSpeech,
          },
          id: {
            short: idShort,
            long: idLong,
            partOfSpeech: idPartOfSpeech,
          },
        },
        image: getImagePath(id),
        simplified,
        traditional,
      };
    })
  );

  return {
    id: props.id,
    title: {
      en: title,
      id: titleId,
    },
    description: {
      en: description,
      id: descriptionId,
    },
    cards,
  };
};

// Function to process a single subcategory
const processSubcategory = async (subcategory) => {
  const { data } = await axios.get(getUri(subcategory));
  const $ = load(data);
  const scriptText = $("#__NEXT_DATA__").text();
  try {
    const props = await getProps(scriptText);

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
