const fs = require("fs");
const path = require("path");

const IGNORE_DIRS = ["node_modules", ".git", ".cache", ".local", "logs"];
const COUNT_EXTS = [".js", ".json", ".yml", ".yaml", ".md"];

function walkDir(dir) {
  let results = { fileCount: 0, directoryCount: 0, totalLines: 0 };

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.directoryCount++;
      const sub = walkDir(fullPath);
      results.fileCount += sub.fileCount;
      results.directoryCount += sub.directoryCount;
      results.totalLines += sub.totalLines;
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (COUNT_EXTS.includes(ext)) {
        results.fileCount++;
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          results.totalLines += content.split("\n").length;
        } catch {}
      }
    }
  }

  return results;
}

const stats = walkDir(process.cwd());

module.exports = stats;
