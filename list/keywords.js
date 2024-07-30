const fs = require("fs");
const path = require("path");

// Function to read and process all files in a folder
function processFilesInFolder(folderPath) {
  // Read all files in the folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    const allKeywords = [];

    // Process each file
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      const fileContent = fs.readFileSync(filePath, "utf8");
      const category = JSON.parse(fileContent);

      const keywords = category.list.map((item) => {
        return {
          id: item.id,
          title: {
            en: item.adverbTitle.en,
            id: item.adverbTitle.id,
          },
          description: {
            en: category.title.en,
            id: category.title.id,
          },
        };
      });

      allKeywords.push(...keywords);
    });

    allKeywords.sort((a, b) => a.id - b.id);

    fs.writeFileSync("keywords.json", JSON.stringify(allKeywords, null, 2));
  });
}

const folderPath = path.join(__dirname, "category");
processFilesInFolder(folderPath);
// console.log(JSON.stringify(getPinyin("你好！"), null, 2));
