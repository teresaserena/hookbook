import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

const DATA_DIR = path.join(__dirname, "../data");

function getUniqueFilename(projectName: string): string {
  const safeName = projectName.trim().replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-");
  let filename = `${safeName}.json`;
  let counter = 1;

  while (fs.existsSync(path.join(DATA_DIR, filename))) {
    filename = `${safeName}-${counter}.json`;
    counter++;
  }

  return filename;
}

app.post("/api/savepattern", async (req, res) => {
  const { projectName, ...rest } = req.body;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filename = getUniqueFilename(projectName);

  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify({ projectName, ...rest }, null, 2));

  res.json({ success: true, file: filename });
});

app.listen(PORT, () => {
  console.log(`Hookbook running at http://localhost:${PORT}`);
});
