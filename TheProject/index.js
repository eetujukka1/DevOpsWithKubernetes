const express = require("express");
const path = require('path')
const fs = require('fs')
const axios = require('axios')

const port = process.env.PORT || 3000;
const app = express();

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'image.jpg')
const MAX_IMAGE_AGE_MS = 10 * 60 * 1000

const getFileStats = async () => new Promise(res => {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats) return res(null)
    return res(stats)
  })
})

const fileAlreadyExists = async () => {
  const stats = await getFileStats()
  return Boolean(stats)
}

const fileIsOlderThanMaxAge = async () => {
  const stats = await getFileStats()
  if (!stats) return true

  const imageAgeMs = Date.now() - stats.mtimeMs
  return imageAgeMs > MAX_IMAGE_AGE_MS
}

const findAFile = async () => {
  if (await fileAlreadyExists() && !(await fileIsOlderThanMaxAge())) return

  await new Promise(res => fs.mkdir(directory, (err) => res()))
  if (await fileAlreadyExists()) {
    await removeFile()
  }

  const response = await axios.get('https://picsum.photos/400', { responseType: 'stream' })
  await new Promise((res, rej) => {
    const writer = fs.createWriteStream(filePath)

    response.data.pipe(writer)
    writer.on('finish', res)
    writer.on('error', rej)
    response.data.on('error', rej)
  })
}

const removeFile = async () => new Promise(res => fs.unlink(filePath, (err) => res()))


app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/image.jpg", async (_req, res) => {
  await findAFile();
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
