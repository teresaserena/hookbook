import express from "express";
import path from "path";
import fs from "fs";
import { getUniqueFilename } from "./utils";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

const DATA_DIR = path.join(__dirname, "../data");

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
