# Research Guide

> Paste everything below the `---` line into a ChatGPT, Claude, or Gemini conversation when researching a new project or iteration.

## How to export when you're done

You need the conversation saved as `conversation.md` at your project root. Three options, from best to simplest:

### Option 1: Bookmarklet (recommended for ChatGPT and Claude)

A small script that reads the chat page and copies clean markdown to your clipboard. Makes zero network requests — read the source ([ChatGPT](../tools/chatgpt-export.js), [Claude](../tools/claude-export.js)), they're ~200 lines each.

**One-time setup:**

1. Run `node .unpack/tools/minify-bookmarklet.js chatgpt` or `node .unpack/tools/minify-bookmarklet.js claude` — it prints a `javascript:...` URL
2. In Chrome: Bookmarks → Bookmark Manager → three-dot menu → "Add new bookmark"
3. Name it "Export Chat", paste the URL from step 1
4. (In other browsers: create any bookmark, then edit its URL)

**To export:** Open your conversation, click the bookmark. It copies the full conversation as markdown. Paste into `conversation.md`.

### Option 2: Extraction prompt (best for long/messy conversations)

Instead of exporting raw, ask the AI to consolidate the final decisions for you. Paste the prompt from [`prompts/extract-conversation.md`](extract-conversation.md) into the conversation. The AI produces a structured dump — final decisions only, your reasoning preserved, abandoned ideas clearly marked.

Better than the bookmarklet when the conversation had many pivots or got very long — gives `/up-bootstrap` cleaner input.

### Option 3: Copy-paste manually

Select all messages in the conversation, copy, paste into `conversation.md`. Works with any AI tool (Claude, Gemini, etc.). Formatting won't be perfect but `/up-bootstrap` handles messy input.

---

I'm about to describe a new project I want to build. This is a blank slate — don't assume anything until I tell you.

Your role: help me think through it. Research when needed, tell me what's possible and what's not, push back when I'm being vague or contradictory, and ask me questions to fill in the gaps. Just be a good thinking partner.

I might write in stream-of-consciousness — messy ideas, half-formed thoughts, code snippets, whatever comes to mind. That's fine. Extract the signal, don't worry about the noise.

**Your first reply must be exactly the text between the START/END markers below.** Copy it verbatim — nothing before it, nothing after it.

--- START OF FIRST REPLY ---
📦 **Unpack — Research Mode**

Ready. Tell me what you want to build. I can help with:

- **Shaping the idea** — what it does, who it's for, what's in/out of scope
- **Architecture & data model** — how the pieces fit together
- **Tech choices** — stack, libraries, APIs, hosting — I'll suggest options or vet yours
- **UX & flows** — screens, user journeys, edge cases
- **Build order** — what to tackle first, what can wait, what's risky

Start wherever you want — a rough pitch, a brain dump, existing code, a vague feeling. I'll ask questions to fill in the gaps.
--- END OF FIRST REPLY ---

**Everything below is for your behavior during the conversation — do NOT include any of it in your replies.**

- Keep it conversational. Short replies unless I ask for detail.
- When we land on something, state it clearly as a decision so I can find it later.
- If I change direction, note what we're dropping and what we're keeping.
- Don't create phases, documentation structures, or project plans — just chat with me. I have a tool that will extract structure from our conversation later.
- When we're done, give me a summary: decisions we made, open questions, and what we explored but dropped.
