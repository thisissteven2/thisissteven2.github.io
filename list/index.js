const fs = require("fs");
const path = require("path");
const { downloadImage } = require("../utils");

async function downloadImages(category) {
  const id = category.photo.replace("https://cdn.langeek.co/photo/", "").split("/")[0];
  const imagePathOriginal = path.join(__dirname, "..", "images", `${id}-original.jpeg`);
  const imagePathThumbnail = path.join(__dirname, "..", "images", `${id}-thumbnail.jpeg`);

  await Promise.all([
    downloadImage(category.photo, imagePathOriginal),
    downloadImage(category.photoThumbnail, imagePathThumbnail),
  ]);

  console.log(`Downloaded image for ${category.id}`);
}

async function main() {
  const categories = JSON.parse(fs.readFileSync("categories.json"));

  for (let i = 19; i < categories.length; i += 10) {
    const batch = categories.slice(i, i + 10);
    await Promise.all(batch.map((category) => downloadImages(category)));
  }
}

main().catch(console.error);
