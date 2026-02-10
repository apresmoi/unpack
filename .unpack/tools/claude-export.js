/**
 * Claude → Markdown Exporter
 *
 * Converts a Claude conversation into clean markdown and copies it to your
 * clipboard. Designed for use with Unpack's /up-bootstrap workflow.
 *
 * What this does:
 *   - Reads the Claude.ai page DOM (conversation turns)
 *   - Converts HTML to markdown (headings, code blocks, lists, tables, links)
 *   - Captures thinking summaries and artifact references
 *   - Copies the result to your clipboard
 *
 * What this does NOT do:
 *   - No network requests. No data sent anywhere. No cookies read.
 *   - No external scripts loaded. Everything runs locally in your browser tab.
 *
 * How to use:
 *   1. Open a Claude conversation in your browser
 *   2. Create a bookmark and paste the minified version (bottom of this file)
 *      as the URL — or run the minified version in the browser console
 *   3. Click the bookmark (or press Enter in the console)
 *   4. Save the clipboard contents as conversation.md in your project root
 *
 * Alternatively, run: node .unpack/tools/minify-bookmarklet.js to generate a fresh
 * bookmarklet from this source.
 */

(function () {
  var NL = `
`;

  // ── HTML → Markdown conversion ──────────────────────────────────────────

  /**
   * Recursively converts an HTML element to markdown.
   * Handles: headings, paragraphs, code (inline + blocks), bold, italic,
   * strikethrough, links, blockquotes, lists, tables, horizontal rules,
   * and Claude-specific elements (artifacts, citation tags).
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
        ["BUTTON", "NAV", "FOOTER", "SVG", "IMG", "PATH"].indexOf(tag) >= 0
      ) {
        continue;
      }

      // Skip floating copy-button overlays and language label headers
      if (
        tag === "DIV" &&
        (node.classList.contains("sticky") ||
          (node.classList.contains("text-text-500") &&
            node.closest("pre, .overflow-x-auto, [class*='group/copy']")))
      ) {
        continue;
      }

      // Artifact references (inline artifact blocks)
      if (node.classList.contains("artifact-block-cell")) {
        var artTitle = node.querySelector("[class*='leading-tight']");
        var artType = node.querySelector("[class*='text-text-400']");
        var title = artTitle ? artTitle.textContent.trim() : "Artifact";
        var type = artType ? artType.textContent.trim() : "";
        output +=
          NL +
          NL +
          "> **📎 " +
          title +
          "**" +
          (type ? " (" + type + ")" : "") +
          NL +
          NL;
        continue;
      }

      // Code blocks (pre > code)
      if (tag === "PRE") {
        var codeEl = node.querySelector("code");
        var langMatch = (codeEl ? codeEl.className : "").match(
          /language-(\\w+)/
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
      // Inline code (not inside a pre block)
      // FIX: was broken string — now correctly wraps in backticks
      else if (tag === "CODE") {
        if (!node.closest("pre")) {
          output += "`" + node.textContent + "`";
        }
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
        output += href
          ? "[" + linkText.trim() + "](" + href + ")"
          : linkText;
      }
      // Strikethrough
      else if (tag === "DEL" || tag === "S") {
        output += "~~" + htmlToMarkdown(node) + "~~";
      }
      // Span — handle inline citation/tag links
      else if (tag === "SPAN") {
        var spanLink = node.querySelector("a");
        if (spanLink) {
          var sText = spanLink.textContent.trim();
          var sHref = spanLink.getAttribute("href") || "";
          output += sHref ? "[" + sText + "](" + sHref + ")" : sText;
        } else {
          output += htmlToMarkdown(node);
        }
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

  // ── Extract conversation title ──────────────────────────────────────────

  var titleEl = document.querySelector('[data-testid="chat-title-button"]');
  var title = titleEl ? titleEl.textContent.trim() : "Untitled Conversation";

  // ── Extract conversation turns ──────────────────────────────────────────

  var convArea = document.querySelector(
    ".flex-1.flex.flex-col.px-4.max-w-3xl"
  );

  if (!convArea) {
    alert("No conversation found on this page.");
    return;
  }

  var parts = [];
  parts.push("# " + title);

  var children = Array.from(convArea.children);

  children.forEach(function (block) {
    var userMsg = block.querySelector('[data-testid="user-message"]');
    var assistantMsg = block.querySelector(".font-claude-response");

    if (userMsg) {
      // ── User turn ──

      // FIX: Capture file/paste attachments (shown above the message text)
      var attachments = block.querySelectorAll('[data-testid="file-thumbnail"]');
      var attachmentText = "";
      if (attachments.length) {
        attachmentText = Array.from(attachments)
          .map(function (att) {
            var name = att.textContent.trim().split("\\n")[0] || "Attachment";
            return "> 📎 **" + name.substring(0, 80) + "** (attachment)";
          })
          .join(NL) + NL + NL;
      }

      // FIX: Capture image attachments
      // Find images inside the attachment area (sibling container above the message text)
      var turnContainer = block.querySelector(".mb-1.mt-6");
      var imageText = "";
      if (turnContainer) {
        var attachmentArea = turnContainer.querySelector(".flex.flex-wrap.justify-end");
        if (attachmentArea) {
          var images = attachmentArea.querySelectorAll("img");
          if (images.length) {
            imageText = Array.from(images)
              .map(function (img) {
                var alt = img.getAttribute("alt") || "image";
                return "> 🖼️ **" + alt + "** (image attachment)";
              })
              .join(NL) + NL + NL;
          }
        }
      }

      // FIX: Use htmlToMarkdown for the full user message to capture
      // OL, UL, and other structured content — not just p.whitespace-pre-wrap
      var userParagraphs = userMsg.querySelectorAll("p.whitespace-pre-wrap");
      var body;

      // Check if the message has mixed content (lists + paragraphs, etc.)
      var hasNonParagraphContent = userMsg.querySelector("ol, ul, pre, blockquote, table");
      if (hasNonParagraphContent) {
        // Use htmlToMarkdown to properly convert all content types
        body = htmlToMarkdown(userMsg)
          .replace(/\\n{3,}/g, NL + NL)
          .trim();
      } else if (userParagraphs.length) {
        body = Array.from(userParagraphs)
          .map(function (p) {
            return p.textContent;
          })
          .join(NL + NL);
      } else {
        body = userMsg.textContent.trim();
      }

      parts.push("## You" + NL + NL + attachmentText + imageText + body);
    } else if (assistantMsg) {
      // ── Assistant turn ──
      var label = "## Claude";

      // FIX: Handle multiple "rounds" (thinking → search → thinking → response)
      // Each round is a direct child div of font-claude-response, containing a grid
      // with row-start-1 (thinking/tools) and row-start-2 (response text).
      var rounds = Array.from(assistantMsg.children);
      var thinkingSummaries = [];
      var responseTexts = [];

      rounds.forEach(function (round) {
        var grid = round.querySelector(".grid");
        if (!grid) return;

        // Extract thinking summary from row-start-1
        var rowStart1 = grid.querySelector(':scope > [class*="row-start-1"]');
        if (rowStart1) {
          // The thinking summary button is the first button in row-start-1
          var thinkingBtn = rowStart1.querySelector("button");
          if (thinkingBtn) {
            var btnText = thinkingBtn.textContent.trim();
            if (btnText) {
              thinkingSummaries.push(btnText);
            }
          }
        }

        // Extract main response from row-start-2
        // row-start-2 may itself be a grid with a nested row-start-1 containing the actual content
        var rowStart2 = grid.querySelector(':scope > [class*="row-start-2"]');
        if (rowStart2) {
          var md = rowStart2.querySelector(".standard-markdown");
          if (md) {
            var converted = htmlToMarkdown(md)
              .replace(/\\n{3,}/g, NL + NL)
              .trim();
            if (converted) {
              responseTexts.push(converted);
            }
          }
        }
      });

      // Build thinking summary block
      var thinkingSummary = "";
      if (thinkingSummaries.length) {
        thinkingSummary = thinkingSummaries
          .map(function (t) { return "> Thinking: " + t; })
          .join(NL) + NL + NL;
      }

      // Combine all response texts from all rounds
      var body2 = responseTexts.join(NL + NL);

      // Fallback: if no structured content found, use text content
      if (!body2) {
        body2 = assistantMsg.textContent.trim();
      }

      parts.push(label + NL + NL + thinkingSummary + body2);
    }
  });

  // ── Copy to clipboard ───────────────────────────────────────────────────

  var result = parts.join(NL + NL + "---" + NL + NL);

  navigator.clipboard
    .writeText(result)
    .then(function () {
      alert(
        "Copied " +
          (parts.length - 1) +
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
      alert("Copied " + (parts.length - 1) + " messages (fallback)");
    });
})();