const fs = require("fs");
const path = require("path");
const { zhCNTozhTWBatch } = require("./utils");

async function getPinyin(words) {
  const translated = await zhCNTozhTWBatch(words);
  return translated.pronunciation.split("\n");
}

// Function to read and process all files in a folder
async function processFilesInFolder(folderPath) {
  const files = fs.readdirSync(folderPath);

  // Split files into batches of 10
  const batches = [];
  for (let i = 0; i < files.length; i += 20) {
    batches.push(files.slice(i, i + 20));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (file) => {
      const filePath = path.join(folderPath, file);
      const data = fs.readFileSync(filePath, "utf8");

      let jsonData = JSON.parse(data);

      const pinyins = await getPinyin(jsonData.cards.map((card) => card.simplified));

      jsonData.cards = jsonData.cards.map((card, index) => {
        return {
          ...card,
          pinyin: pinyins[index],
        };
      });

      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

      console.log(`Processed file: ${file}`);
    });

    await Promise.all(batchPromises);
  }
}

const folderPath = path.join(__dirname, "found");
processFilesInFolder(folderPath);
