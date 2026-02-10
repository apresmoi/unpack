/**
 * ChatGPT → Markdown Exporter
 *
 * Converts a ChatGPT conversation into clean markdown and copies it to your
 * clipboard. Designed for use with Unpack's /up-bootstrap workflow.
 *
 * What this does:
 *   - Reads the ChatGPT page DOM (conversation turns)
 *   - Converts HTML to markdown (headings, code blocks, lists, tables, links)
 *   - Copies the result to your clipboard
 *
 * What this does NOT do:
 *   - No network requests. No data sent anywhere. No cookies read.
 *   - No external scripts loaded. Everything runs locally in your browser tab.
 *
 * How to use:
 *   1. Open a ChatGPT conversation in your browser
 *   2. Create a bookmark and paste the minified version (bottom of this file)
 *      as the URL — or run the minified version in the browser console
 *   3. Click the bookmark (or press Enter in the console)
 *   4. Save the clipboard contents as conversation.md in your project root
 *
 * Alternatively, run: `node .unpack/tools/minify-bookmarklet.js` to generate a fresh
 * bookmarklet from this source.
 */

(function () {
  var NL = "\n";

  // ── HTML → Markdown conversion ──────────────────────────────────────────

  /**
   * Recursively converts an HTML element to markdown.
   * Handles: headings, paragraphs, code (inline + blocks), bold, italic,
   * strikethrough, links, blockquotes, lists, tables, and horizontal rules.
   */
  function htmlToMarkdown(element) {
    if (!element) return "";

    var output = "";

    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];

      // Text node — use as-is
      if (node.nodeType === 3) {
        output += node.textContent;
        continue;
      }

      // Skip non-element nodes
      if (node.nodeType !== 1) continue;

      var tag = node.tagName;

      // Skip UI chrome that isn't conversation content
      if (
        node.classList.contains("sr-only") ||
        ["BUTTON", "NAV", "FOOTER", "SVG", "IMG"].indexOf(tag) >= 0
      ) {
        continue;
      }

      // Code blocks (pre > code)
      if (tag === "PRE") {
        var codeEl = node.querySelector("code");
        var langMatch = (codeEl ? codeEl.className : "").match(
          /language-(\w+)/
        );
        var lang = langMatch ? langMatch[1] : "";
        output +=
          NL +
          NL +
          "```" +
          lang +
          NL +
          (codeEl || node).textContent +
          NL +
          "```" +
          NL +
          NL;
      }
      // Inline code
      else if (tag === "CODE") {
        output += "`" + node.textContent + "`";
      }
      // Headings (h1–h6)
      else if (/^H[1-6]$/.test(tag)) {
        output +=
          NL +
          NL +
          "#".repeat(+tag[1]) +
          " " +
          node.textContent.trim() +
          NL +
          NL;
      }
      // Paragraphs
      else if (tag === "P") {
        output += NL + NL + htmlToMarkdown(node).trim() + NL + NL;
      }
      // Blockquotes
      else if (tag === "BLOCKQUOTE") {
        output +=
          NL +
          NL +
          htmlToMarkdown(node)
            .trim()
            .split(NL)
            .map(function (line) {
              return "> " + line;
            })
            .join(NL) +
          NL +
          NL;
      }
      // Lists
      else if (tag === "UL" || tag === "OL") {
        output += NL + convertList(node, 0) + NL;
      }
      // Tables
      else if (tag === "TABLE") {
        output += NL + NL + convertTable(node) + NL + NL;
      }
      // Horizontal rules
      else if (tag === "HR") {
        output += NL + NL + "---" + NL + NL;
      }
      // Line breaks
      else if (tag === "BR") {
        output += NL;
      }
      // Bold
      else if (tag === "STRONG" || tag === "B") {
        output += "**" + htmlToMarkdown(node) + "**";
      }
      // Italic
      else if (tag === "EM" || tag === "I") {
        output += "*" + htmlToMarkdown(node) + "*";
      }
      // Links
      else if (tag === "A") {
        var linkText = htmlToMarkdown(node);
        var href = node.getAttribute("href") || "";
        // Skip ChatGPT citation links (e.g., "+12 more")
        if (/\+\d/.test(linkText) && linkText.length > 40) continue;
        output += href
          ? "[" + linkText.trim() + "](" + href + ")"
          : linkText;
      }
      // Strikethrough
      else if (tag === "DEL" || tag === "S") {
        output += "~~" + htmlToMarkdown(node) + "~~";
      }
      // Everything else — recurse into children
      else {
        output += htmlToMarkdown(node);
      }
    }

    return output;
  }

  // ── List conversion ─────────────────────────────────────────────────────

  /**
   * Converts a <ul> or <ol> element to markdown, handling nested lists.
   * @param {Element} listEl  - The UL or OL element
   * @param {number}  depth   - Current nesting depth (for indentation)
   */
  function convertList(listEl, depth) {
    var output = "";
    var ordered = listEl.tagName === "OL";

    listEl.querySelectorAll(":scope > li").forEach(function (li, index) {
      var prefix = "  ".repeat(depth) + (ordered ? index + 1 + ". " : "- ");
      var text = "";

      li.childNodes.forEach(function (child) {
        if (child.nodeType === 3) {
          text += child.textContent;
        } else if (
          child.nodeType === 1 &&
          child.tagName !== "UL" &&
          child.tagName !== "OL"
        ) {
          text += htmlToMarkdown(child);
        }
      });

      output += prefix + text.trim() + NL;

      // Recurse into nested lists
      li.querySelectorAll(":scope > ul, :scope > ol").forEach(function (
        nested
      ) {
        output += convertList(nested, depth + 1);
      });
    });

    return output;
  }

  // ── Table conversion ────────────────────────────────────────────────────

  /**
   * Converts a <table> element to a markdown table.
   * Assumes the first row contains headers.
   */
  function convertTable(table) {
    var rows = table.querySelectorAll("tr");
    if (!rows.length) return "";

    var markdown = "";

    rows.forEach(function (row, index) {
      var cells = row.querySelectorAll("th, td");
      markdown +=
        "| " +
        Array.from(cells)
          .map(function (cell) {
            return htmlToMarkdown(cell).trim();
          })
          .join(" | ") +
        " |" +
        NL;

      // Add separator after header row
      if (index === 0) {
        markdown +=
          "| " +
          Array.from(cells)
            .map(function () {
              return "---";
            })
            .join(" | ") +
          " |" +
          NL;
      }
    });

    return markdown;
  }

  // ── Extract conversation turns ──────────────────────────────────────────

  var turns = document.querySelectorAll(
    '[data-testid^="conversation-turn"]'
  );

  if (!turns.length) {
    alert("No conversation found on this page.");
    return;
  }

  var parts = [];

  turns.forEach(function (turn) {
    var roleEl = turn.querySelector("[data-message-author-role]");
    var role = roleEl
      ? roleEl.getAttribute("data-message-author-role")
      : null;
    if (!role) return;

    var label, body;

    if (role === "user") {
      label = "## You";
      var userContent = turn.querySelector(".whitespace-pre-wrap");
      body = userContent
        ? userContent.textContent.trim()
        : turn.innerText.replace(/^You said:\s*/i, "").trim();
    } else {
      label = "## ChatGPT";
      var markdownContent = turn.querySelector(".markdown");
      body = markdownContent
        ? htmlToMarkdown(markdownContent)
            .replace(/\n{3,}/g, NL + NL)
            .trim()
        : turn.innerText.replace(/^ChatGPT said:\s*/i, "").trim();
    }

    parts.push(label + NL + NL + body);
  });

  // ── Copy to clipboard ───────────────────────────────────────────────────

  var result = parts.join(NL + NL + "---" + NL + NL);

  navigator.clipboard
    .writeText(result)
    .then(function () {
      alert(
        "Copied " +
          parts.length +
          " messages (" +
          Math.round(result.length / 1024) +
          " KB)"
      );
    })
    .catch(function () {
      // Fallback for browsers that block clipboard API
      var textarea = document.createElement("textarea");
      textarea.value = result;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      alert("Copied " + parts.length + " messages (fallback)");
    });
})();
