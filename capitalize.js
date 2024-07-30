const fs = require("fs");
const path = require("path");

const regex = /(\p{L}|\p{N}) - ?(\p{L}|\p{N})/gu;

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

        jsonData.title.en = jsonData.title.en.charAt(0).toUpperCase() + jsonData.title.en.slice(1);
        jsonData.title.id = jsonData.title.id.charAt(0).toUpperCase() + jsonData.title.id.slice(1);
        jsonData.description.en = jsonData.description.en.charAt(0).toUpperCase() + jsonData.description.en.slice(1);
        jsonData.description.id = jsonData.description.id.charAt(0).toUpperCase() + jsonData.description.id.slice(1);

        jsonData.title.en = jsonData.title.en.replace(regex, "$1-$2");
        jsonData.title.id = jsonData.title.id.replace(regex, "$1-$2");
        jsonData.description.en = jsonData.description.en.replace(regex, "$1-$2");
        jsonData.description.id = jsonData.description.id.replace(regex, "$1-$2");

        // "list": [
        // {
        //     "id": "636",
        //     "adverbTitle": {
        //       "en": "Book Formats",
        //       "id": "Format buku"
        //     },
        //     "words": "55",
        //     "time": "28"
        //   },
        // capitalize first letter of adverbTitle in list

        jsonData.list = jsonData.list.map((item) => {
          item.adverbTitle.en = item.adverbTitle.en.charAt(0).toUpperCase() + item.adverbTitle.en.slice(1);
          item.adverbTitle.id = item.adverbTitle.id.charAt(0).toUpperCase() + item.adverbTitle.id.slice(1);
          item.adverbTitle.en = item.adverbTitle.en.replace(regex, "$1-$2");
          item.adverbTitle.id = item.adverbTitle.id.replace(regex, "$1-$2");
          return item;
        });

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

const folderPath = path.join(__dirname, "list", "category");
processFilesInFolder(folderPath);
// console.log(JSON.stringify(getPinyin("你好！"), null, 2));
