import express from "express";
import path from "path";
import fs from "fs";
import { getUniqueFilename } from "./utils";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

const DATA_DIR = path.join(__dirname, "../data");

export function listPatternFiles(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return (fs.readdirSync(DATA_DIR) as unknown as string[]).filter((f) =>
    f.endsWith(".json")
  );
}

export function loadPatternFile(
  filename: string
): { ok: true; data: unknown } | { ok: false; error: string } {
  if (filename.includes("..") || filename.includes("/")) {
    return { ok: false, error: "Invalid filename." };
  }

  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return { ok: false, error: "File not found." };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return { ok: true, data: JSON.parse(content) };
}

app.post("/api/savepattern", async (req, res) => {
  const { projectName, sourceFile, ...rest } = req.body;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let filename: string;
  if (
    typeof sourceFile === "string" &&
    sourceFile.length > 0 &&
    !sourceFile.includes("..") &&
    !sourceFile.includes("/")
  ) {
    filename = sourceFile;
  } else {
    filename = getUniqueFilename(projectName);
  }

  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify({ projectName, ...rest }, null, 2));

  res.json({ success: true, file: filename });
});

app.get("/api/patterns", (_req, res) => {
  res.json(listPatternFiles());
});

app.get("/api/patterns/:filename", (req, res) => {
  const result = loadPatternFile(req.params.filename);
  if (!result.ok) {
    const status = result.error === "File not found." ? 404 : 400;
    res.status(status).json({ error: result.error });
    return;
  }
  res.json(result.data);
});

app.listen(PORT, () => {
  console.log(`Hookbook running at http://localhost:${PORT}`);
});
