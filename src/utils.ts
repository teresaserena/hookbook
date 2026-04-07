import path from "path";
import fs from "fs";

const DATA_DIR = path.join(__dirname, "../data");

export function getUniqueFilename(projectName: string): string {
  const safeName = projectName.trim().replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-");
  let filename = `${safeName}.json`;
  let counter = 1;

  while (fs.existsSync(path.join(DATA_DIR, filename))) {
    filename = `${safeName}-${counter}.json`;
    counter++;
  }

  return filename;
}
