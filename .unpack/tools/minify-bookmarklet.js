#!/usr/bin/env node

/**
 * Minifies an export script into a bookmarklet URL.
 *
 * Usage:
 *   node .unpack/tools/minify-bookmarklet.js chatgpt
 *   node .unpack/tools/minify-bookmarklet.js claude
 *
 * Output:
 *   Prints a javascript: URL you can paste as a bookmark URL.
 *   No dependencies required — uses only Node built-ins.
 */

const fs = require("fs");
const path = require("path");

const scripts = {
  chatgpt: "chatgpt-export.js",
  claude: "claude-export.js",
};

const arg = process.argv[2];

if (!arg || !scripts[arg]) {
  console.log("Usage: node .unpack/tools/minify-bookmarklet.js <chatgpt|claude>");
  console.log("\nAvailable scripts:");
  Object.keys(scripts).forEach((name) => console.log(`  ${name}`));
  process.exit(1);
}

const source = fs.readFileSync(
  path.join(__dirname, scripts[arg]),
  "utf-8"
);

// Strip comments (single-line and multi-line)
let code = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

// Collapse whitespace: replace newlines and multiple spaces with single space
code = code.replace(/\s+/g, " ").trim();

// Remove spaces around operators and punctuation where safe
code = code.replace(/\s*([{}()=;,:<>+\-*/|&!?])\s*/g, "$1");

// Restore necessary spaces (keywords that need a trailing space)
code = code.replace(/\b(var|function|return|typeof|new|if|else|for|in)\b/g, " $1 ");

// Clean up any double spaces introduced
code = code.replace(/\s+/g, " ").trim();

const bookmarklet = "javascript:" + encodeURIComponent(code);

console.log("%s bookmarklet URL (%d bytes):\n", arg, bookmarklet.length);
console.log(bookmarklet);
console.log(
  "\nCopy the URL above and paste it as the URL of a new browser bookmark."
);
