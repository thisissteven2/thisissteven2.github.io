const fs = require("fs");
const path = require("path");

const regex = /(\p{L}|\p{N}) - ?(\p{L}|\p{N})/gu;

// Function to read and process all files in a folder
function processFilesInFolder(folderPath) {
  // Read all files in the folder

  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    console.log(filePath);

    // Read the file content
    const data = fs.readFileSync(filePath, "utf8");
    let jsonData = JSON.parse(data);

    jsonData.title.en = jsonData.title.en?.charAt(0).toUpperCase() + jsonData.title.en?.slice(1);
    jsonData.title.id = jsonData.title.id?.charAt(0).toUpperCase() + jsonData.title.id?.slice(1);
    jsonData.description.en = jsonData.description.en?.charAt(0).toUpperCase() + jsonData.description.en?.slice(1);
    jsonData.description.id = jsonData.description.id?.charAt(0).toUpperCase() + jsonData.description.id?.slice(1);

    if (jsonData.title.en) {
      jsonData.title.en = jsonData.title.en.replace(regex, "$1-$2");
    }

    if (jsonData.title.id) {
      jsonData.title.id = jsonData.title.id.replace(regex, "$1-$2");
    }

    if (jsonData.description.en) {
      jsonData.description.en = jsonData.description.en.replace(regex, "$1-$2");
    }

    if (jsonData.description.id) {
      jsonData.description.id = jsonData.description.id.replace(regex, "$1-$2");
    }

    jsonData.cards = jsonData.cards.map((item) => {
      item.translation.id.short = item.translation.id.short.replace(regex, "$1-$2");
      item.translation.id.long = item.translation.id.long.replace(regex, "$1-$2");
      return item;
    });

    const outFilePath = path.join(__dirname, "found", file);

    fs.writeFileSync(outFilePath, JSON.stringify(jsonData, null, 2), "utf8");
  });
}

const folderPath = path.join(__dirname, "found");
processFilesInFolder(folderPath);
