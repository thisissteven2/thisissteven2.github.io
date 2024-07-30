const fs = require("fs");
const path = require("path");

const regex = /(\p{L}|\p{N}) - ?(\p{L}|\p{N})/gu;

// Function to read and process all files in a folder
function processFile(file) {
  // Read the file content

  const fileContent = fs.readFileSync(file, "utf8");
  let jsonData = JSON.parse(fileContent);

  const modifiedJsonData = jsonData.map((data) => {
    if (data.title.en) {
      data.title.en = data.title.en?.charAt(0).toUpperCase() + data.title.en?.slice(1);
      data.title.en = data.title.en.replace(regex, "$1-$2");
    }

    if (data.title.id) {
      data.title.id = data.title.id?.charAt(0).toUpperCase() + data.title.id?.slice(1);
      data.title.id = data.title.id.replace(regex, "$1-$2");
    }

    if (data.description.en) {
      data.description.en = data.description.en?.charAt(0).toUpperCase() + data.description.en?.slice(1);

      data.description.en = data.description.en.replace(regex, "$1-$2");
    }

    if (data.description.id) {
      data.description.id = data.description.id?.charAt(0).toUpperCase() + data.description.id?.slice(1);
      data.description.id = data.description.id.replace(regex, "$1-$2");
    }

    return data;
  });

  // Write the modified content back to the file
  fs.writeFileSync(file, JSON.stringify(modifiedJsonData, null, 2));
}

processFile("./list/categories.json");
