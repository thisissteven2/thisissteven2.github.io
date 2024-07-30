const axios = require("axios");
const fs = require("fs");
const tr = require("googletrans").default;

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

async function zhToEn(text) {
  const result = await tr(text, {
    from: "zh-CN",
    to: "en",
  });

  return {
    text: result.text,
    pronunciation: result.raw[0][1][result.raw[0][1].length - 1],
  };
}

async function zhToId(text) {
  const result = await tr(text, {
    from: "zh-CN",
    to: "id",
  });

  return {
    text: result.text,
    pronunciation: result.raw[0][1][result.raw[0][1].length - 1],
  };
}

// batch translate
async function enToId(text) {
  const result = await tr(text, {
    from: "en",
    to: "id",
  });

  return result.text.split("\n");
}

// batch translate
async function idToEn(text) {
  const result = await tr(text, {
    from: "id",
    to: "en",
  });

  return result.text.split("\n");
}

async function enToZh(text) {
  const result = await tr(text, {
    from: "en",
    to: "zh-CN",
  });

  return {
    text: result.text,
    pronunciation: result.pronunciation,
  };
}

async function enToZhTw(text) {
  const result = await tr(text, {
    from: "en",
    to: "zh-TW",
  });

  return {
    text: result.text,
    pronunciation: result.pronunciation,
  };
}

async function zhCNTozhTW(text) {
  const result = await tr(text, {
    from: "zh-CN",
    to: "zh-TW",
  });

  return {
    text: result.text,
    pronunciation: result.pronunciation,
  };
}

async function zhCNTozhTWBatch(text) {
  const result = await tr(text, {
    from: "zh-CN",
    to: "zh-TW",
  });

  return result;
}

module.exports = {
  downloadImage,
  zhToEn,
  zhToId,
  enToId,
  idToEn,
  enToZh,
  enToZhTw,
  zhCNTozhTW,
  zhCNTozhTWBatch,
};
