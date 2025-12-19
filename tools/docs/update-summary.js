#!/usr/bin/env node
/**
 * Updates docs/SUMMARY.md About section to reflect docs/about/*.md.
 * --check : exits 1 if changes are needed (no write)
 * --fix   : writes updates to SUMMARY.md
 */
const fs = require("fs");
const path = require("path");

const SUMMARY_PATH = path.join(__dirname, "..", "..", "docs", "SUMMARY.md");
const ABOUT_DIR = path.join(__dirname, "..", "..", "docs", "about");

const args = process.argv.slice(2);
const mode = args.includes("--fix") ? "fix" : "check";

function getTitle(filepath) {
  const content = fs.readFileSync(filepath, "utf8");
  const match = content.match(/^#\s+(.*)/m);
  return match ? match[1].trim() : path.basename(filepath, ".md");
}

function buildAboutList() {
  const entries = fs
    .readdirSync(ABOUT_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".md"))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  return entries.map((filename) => {
    const title = getTitle(path.join(ABOUT_DIR, filename));
    return `- [${title}](about/${filename})`;
  });
}

function replaceAboutSection(summaryContent, aboutLines) {
  const aboutHeaderRegex = /^# About\s*$/m;
  if (!aboutHeaderRegex.test(summaryContent)) {
    throw new Error("SUMMARY.md does not contain a '# About' section.");
  }

  const sectionRegex = /# About\s*\n([\s\S]*?)(?=^# |\Z)/m;
  const replacement = `# About\n${aboutLines.join("\n")}\n\n`;
  const nextHeadingMatch = summaryContent.match(sectionRegex);

  if (!nextHeadingMatch) {
    throw new Error("Failed to locate About section in SUMMARY.md.");
  }

  return summaryContent.replace(sectionRegex, replacement);
}

function main() {
  const aboutLines = buildAboutList();
  const summary = fs.readFileSync(SUMMARY_PATH, "utf8");
  const updated = replaceAboutSection(summary, aboutLines);

  const changed = summary !== updated;
  if (mode === "check") {
    if (changed) {
      console.error("SUMMARY.md is out of date for docs/about/.");
      process.exit(1);
    }
    console.log("SUMMARY.md is up to date.");
    return;
  }

  if (changed) {
    fs.writeFileSync(SUMMARY_PATH, updated, "utf8");
    console.log("SUMMARY.md updated to reflect docs/about/.");
  } else {
    console.log("No changes needed.");
  }
}

main();
