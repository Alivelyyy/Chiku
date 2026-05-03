const emoji = require("@assets/emojis/black.js");

function formatDuration(ms) {
  if (!ms || isNaN(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatProgressBar(current, total, length = 26) {
  if (!total || total === 0) {
    return "─".repeat(length);
  }
  const percent   = Math.min(current / total, 1);
  const cursorPos = Math.round(percent * (length - 1));
  const before    = "━".repeat(cursorPos);
  const after     = "─".repeat(Math.max(0, length - 1 - cursorPos));
  return before + "⬤" + after;
}

function formatFillBar(current, total, length = 24) {
  if (!total || total === 0) return emoji.barEmpty.repeat(length);
  const percent = Math.min(current / total, 1);
  const filled  = Math.round(percent * length);
  const empty   = length - filled;
  return emoji.barFill.repeat(filled) + emoji.barEmpty.repeat(empty);
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m ${sec}s`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

function formatNumber(n) {
  if (!n || isNaN(n)) return "0";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function extractYTThumbnail(uri) {
  if (!uri) return null;
  const match = uri.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function truncate(str, max = 50) {
  if (!str) return "Unknown";
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function cleanTitle(title) {
  return title
    .replace(/\(Official.*?\)/gi, "")
    .replace(/\[Official.*?\]/gi, "")
    .replace(/\(Audio.*?\)/gi,   "")
    .replace(/\[Audio.*?\]/gi,   "")
    .replace(/\(Lyrics.*?\)/gi,  "")
    .replace(/\[Lyrics.*?\]/gi,  "")
    .replace(/\(Music Video.*?\)/gi, "")
    .replace(/\[Music Video.*?\]/gi, "")
    .trim();
}

function formatLoop(mode) {
  switch (mode) {
    case "track": return `${emoji.loopOne} Track`;
    case "queue": return `${emoji.loop} Queue`;
    default:      return "Off";
  }
}

module.exports = {
  formatDuration,
  formatProgressBar,
  formatFillBar,
  formatUptime,
  formatNumber,
  extractYTThumbnail,
  truncate,
  chunkArray,
  cleanTitle,
  formatLoop,
};
