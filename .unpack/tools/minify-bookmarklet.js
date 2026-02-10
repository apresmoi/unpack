#!/usr/bin/env node

/**
 * Minifies .unpack/tools/chatgpt-export.js into a bookmarklet URL.
 *
 * Usage:
 *   node .unpack/tools/minify-bookmarklet.js
 *
 * Output:
 *   Prints a javascript: URL you can paste as a bookmark URL.
 *   No dependencies required — uses only Node built-ins.
 */

const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "chatgpt-export.js"),
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

console.log("Bookmarklet URL (%d bytes):\n", bookmarklet.length);
console.log(bookmarklet);
console.log(
  "\nCopy the URL above and paste it as the URL of a new browser bookmark."
);
