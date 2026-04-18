import express from "express";
import path from "path";
import fsSync from "fs";
import fs from "fs/promises";
import multer from "multer";
import { generatePatternId, generateVersionFilename } from "./utils";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

const DATA_DIR = path.join(__dirname, "../data");

export interface PatternSection {
  label: string;
  lines: string[];
}

export interface PatternSummary {
  patternId: string;
  projectName: string;
  startDate: string;
  latestVersion: string;
  yarnGauge: string;
  yarnColor: string;
  sections: PatternSection[];
}

function normaliseSectionsFromDisk(data: unknown): PatternSection[] {
  if (data === null || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.sections)) {
    return (obj.sections as unknown[])
      .filter(
        (s): s is PatternSection =>
          s !== null &&
          typeof s === "object" &&
          typeof (s as PatternSection).label === "string" &&
          Array.isArray((s as PatternSection).lines) &&
          (s as PatternSection).lines.every((l) => typeof l === "string")
      )
      .map((s) => ({ label: s.label, lines: [...s.lines] }));
  }
  if (
    Array.isArray(obj.patternLines) &&
    (obj.patternLines as unknown[]).every((l) => typeof l === "string")
  ) {
    return [{ label: "", lines: [...(obj.patternLines as string[])] }];
  }
  return [];
}

export async function listPatterns(): Promise<PatternSummary[]> {
  if (!fsSync.existsSync(DATA_DIR)) return [];

  const entries = (await fs.readdir(DATA_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory());

  const results: PatternSummary[] = [];
  for (const entry of entries) {
    const versionsDir = path.join(DATA_DIR, entry.name, "versions");
    try {
      const versionFiles = ((await fs.readdir(versionsDir)) as string[])
        .filter((f) => f.startsWith("v_") && f.endsWith(".json"))
        .sort();
      if (versionFiles.length === 0) continue;

      const latest = versionFiles[versionFiles.length - 1]!;
      const content = await fs.readFile(path.join(versionsDir, latest), "utf-8");
      const data = JSON.parse(content as string);
      results.push({
        patternId: entry.name,
        projectName: data.projectName,
        startDate: data.startDate,
        latestVersion: latest,
        yarnGauge: data.yarnGauge,
        yarnColor: data.yarnColor,
        sections: normaliseSectionsFromDisk(data),
      });
    } catch {
      // Skip directories without a valid versions/ subdirectory
    }
  }
  return results;
}

export async function loadPattern(
  patternId: string
): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  if (patternId.includes("..") || patternId.includes("/")) {
    return { ok: false, error: "Invalid pattern ID." };
  }

  const patternDir = path.join(DATA_DIR, patternId);
  if (!fsSync.existsSync(patternDir)) {
    return { ok: false, error: "Pattern not found." };
  }

  const versionsDir = path.join(patternDir, "versions");
  try {
    const versionFiles = ((await fs.readdir(versionsDir)) as string[])
      .filter((f) => f.startsWith("v_") && f.endsWith(".json"))
      .sort();
    if (versionFiles.length === 0) {
      return { ok: false, error: "Pattern not found." };
    }

    const latest = versionFiles[versionFiles.length - 1]!;
    const content = await fs.readFile(path.join(versionsDir, latest), "utf-8");
    return { ok: true, data: JSON.parse(content as string) };
  } catch {
    return { ok: false, error: "Pattern not found." };
  }
}

export async function pruneVersions(versionsDir: string, limit: number): Promise<void> {
  const files = ((await fs.readdir(versionsDir)) as string[])
    .filter((f) => f.startsWith("v_") && f.endsWith(".json"))
    .sort();

  const excess = files.length - limit;
  if (excess <= 0) return;

  const toDelete = files.slice(0, excess);
  for (const file of toDelete) {
    await fs.unlink(path.join(versionsDir, file));
  }
}

app.post("/api/savepattern", async (req, res) => {
  try {
    const { patternId: existingId, projectName, ...rest } = req.body;

    let patternId: string;
    let versionsDir: string;

    if (existingId) {
      if (existingId.includes("..") || existingId.includes("/")) {
        res.status(400).json({ error: "Invalid pattern ID." });
        return;
      }
      const patternDir = path.join(DATA_DIR, existingId);
      if (!fsSync.existsSync(patternDir)) {
        res.status(404).json({ error: "Pattern not found." });
        return;
      }
      patternId = existingId;
      versionsDir = path.join(patternDir, "versions");
    } else {
      patternId = generatePatternId(projectName);
      versionsDir = path.join(DATA_DIR, patternId, "versions");
      await fs.mkdir(versionsDir, { recursive: true });
    }

    const versionFile = generateVersionFilename();
    const filePath = path.join(versionsDir, versionFile);
    await fs.writeFile(filePath, JSON.stringify({ projectName, ...rest }, null, 2));

    await pruneVersions(versionsDir, 10);

    res.json({ success: true, patternId });
  } catch {
    res.status(500).json({ error: "Failed to save pattern." });
  }
});

app.get("/api/patterns", async (_req, res) => {
  try {
    res.json(await listPatterns());
  } catch {
    res.status(500).json({ error: "Failed to list patterns." });
  }
});

app.get("/api/patterns/:patternId", async (req, res) => {
  const result = await loadPattern(req.params.patternId);
  if (!result.ok) {
    const status = result.error === "Invalid pattern ID." ? 400 : 404;
    res.status(status).json({ error: result.error });
    return;
  }
  res.json(result.data);
});

// --- Reference images ---

const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function isValidPatternId(id: string): boolean {
  return id.length > 0 && !id.includes("..") && !id.includes("/");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, _file, cb) {
      const patternId = req.params?.patternId as string | undefined;
      if (!patternId || !isValidPatternId(patternId)) {
        return cb(new Error("Invalid pattern ID."), "");
      }
      const dirPath = path.join(DATA_DIR, patternId);
      fsSync.mkdirSync(dirPath, { recursive: true });
      cb(null, dirPath);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
        return cb(new Error("Unsupported image format."), "");
      }
      const safeName = file.originalname
        .replace(/[^a-z0-9.\-_ ]/gi, "")
        .replace(/\s+/g, "-");
      cb(null, safeName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post("/api/patterns/:patternId/images", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image uploaded." });
    return;
  }
  res.json({ success: true, imageName: req.file.filename });
});

app.get("/api/patterns/:patternId/images", async (req, res) => {
  const { patternId } = req.params;
  if (!isValidPatternId(patternId)) {
    res.status(400).json({ error: "Invalid pattern ID." });
    return;
  }
  const dirPath = path.join(DATA_DIR, patternId);
  if (!fsSync.existsSync(dirPath)) {
    res.json([]);
    return;
  }
  const allFiles = (await fs.readdir(dirPath)) as string[];
  const images = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ALLOWED_IMAGE_EXTS.includes(ext);
  });
  res.json(images);
});

app.get("/api/patterns/:patternId/images/:imageName", (req, res) => {
  const { patternId, imageName } = req.params;
  if (!isValidPatternId(patternId) || !isValidPatternId(imageName)) {
    res.status(400).json({ error: "Invalid name." });
    return;
  }
  const filePath = path.join(DATA_DIR, patternId, imageName);
  if (!fsSync.existsSync(filePath)) {
    res.status(404).json({ error: "Image not found." });
    return;
  }
  res.sendFile(filePath);
});

app.delete("/api/patterns/:patternId/images/:imageName", async (req, res) => {
  const { patternId, imageName } = req.params;
  if (!isValidPatternId(patternId) || !isValidPatternId(imageName)) {
    res.status(400).json({ error: "Invalid name." });
    return;
  }
  const filePath = path.join(DATA_DIR, patternId, imageName);
  if (!fsSync.existsSync(filePath)) {
    res.status(404).json({ error: "Image not found." });
    return;
  }
  await fs.unlink(filePath);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Hookbook running at http://localhost:${PORT}`);
});
