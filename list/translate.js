const fs = require("fs");
const { enToId } = require("../utils");

async function translateToId(category) {
  const translatedId = await enToId(category.title);
  const photoId = category.photo.replace("https://cdn.langeek.co/photo/", "").split("/")[0];
  console.log(`translated ${category.title} to ${translatedId[0]}`);

  return {
    ...category,
    original: `https://dictionary.hanzi.id/images/${photoId}-original.jpeg`,
    thumbnail: `https://dictionary.hanzi.id/images/${photoId}-thumbnail.jpeg`,
    title: {
      en: category.title,
      id: translatedId[0],
    },
  };
}

async function removeUnused(category) {
  console.log(`removed unused in ${category.title}`);

  return {
    ...category,
    urlId: undefined,
    photo: undefined,
    photoThumbnail: undefined,
  };
}

async function addMetadata(cat) {
  // add description, total lessons, total words, total hours
  console.log(`added metadata in ${cat.id}`);

  const category = JSON.parse(fs.readFileSync(`./category/${cat.id}.json`));

  const description = category.description;
  const totalLessons = category.list.length;
  const totalWords = category.list.reduce((acc, lesson) => acc + parseInt(lesson.words), 0);
  const totalMinutes = category.list.reduce((acc, lesson) => acc + parseInt(lesson.time), 0);

  const totalHoursEn = `${totalMinutes < 60 ? "" : `${Math.floor(totalMinutes / 60)}h`} ${totalMinutes % 60}m`;
  const totalHoursId = `${totalMinutes < 60 ? "" : `${Math.floor(totalMinutes / 60)}j`} ${totalMinutes % 60}m`;

  return {
    ...cat,
    description,
    totalLessons,
    totalWords,
    totalHours: {
      en: totalHoursEn.trim(),
      id: totalHoursId.trim(),
    },
  };
}

async function main() {
  const categories = JSON.parse(fs.readFileSync("categories.json"));

  const translated = [];

  for (let i = 0; i < categories.length; i += 10) {
    const batch = categories.slice(i, i + 10);
    const result = await Promise.all(batch.map((category) => addMetadata(category)));
    translated.push(...result);
  }

  fs.writeFileSync("categories-id.json", JSON.stringify(translated, null, 2));
}

main().catch(console.error);
