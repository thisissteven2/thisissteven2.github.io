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

    // Process each file
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      // Read the file content
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        // Parse the file content as JSON
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch (parseErr) {
          console.error("Error parsing JSON:", parseErr);
          return;
        }

        // Modify the .cards array by adding pinyin
        if (Array.isArray(jsonData.cards)) {
          jsonData.cards = jsonData.cards.map((card) => {
            card.image = card.image.replace("content.hanzi.id/langeek", "dictionary.hanzi.id");
            return card;
          });
        }

        // Write the modified content back to the file
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (writeErr) => {
          if (writeErr) {
            console.error("Error writing file:", writeErr);
          } else {
            console.log(`File processed: ${filePath}`);
          }
        });
      });
    });
  });
}

const folderPath = path.join(__dirname, "found");
processFilesInFolder(folderPath);
// console.log(JSON.stringify(getPinyin("你好！"), null, 2));
