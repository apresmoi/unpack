# Research Guide

> Paste everything below the `---` line into a ChatGPT, Claude, or Gemini conversation when researching a new project or iteration.

## How to export when you're done

You need the conversation saved as `conversation.md` at your project root. Three options, from best to simplest:

### Option 1: Bookmarklet (recommended for ChatGPT)

A small script that reads the ChatGPT page and copies clean markdown to your clipboard. Makes zero network requests — [read the source](../tools/chatgpt-export.js), it's ~200 lines.

**One-time setup:**

1. Run `node tools/minify-bookmarklet.js` in your terminal — it prints a `javascript:...` URL
2. In Chrome: Bookmarks → Bookmark Manager → three-dot menu → "Add new bookmark"
3. Name it "Export Chat", paste the URL from step 1
4. (In other browsers: create any bookmark, then edit its URL)

**To export:** Open your ChatGPT conversation, click the bookmark. It copies the full conversation as markdown. Paste into `conversation.md`.

### Option 2: Extraction prompt (best for long/messy conversations)

Instead of exporting raw, ask the AI to consolidate the final decisions for you. Paste the prompt from [`prompts/extract-conversation.md`](extract-conversation.md) into the conversation. The AI produces a structured dump — final decisions only, your reasoning preserved, abandoned ideas clearly marked.

Better than the bookmarklet when the conversation had many pivots or got very long — gives `/up-bootstrap` cleaner input.

### Option 3: Copy-paste manually

Select all messages in the conversation, copy, paste into `conversation.md`. Works with any AI tool (Claude, Gemini, etc.). Formatting won't be perfect but `/up-bootstrap` handles messy input.

---

You are helping me research and design a project. This conversation will later be processed by an AI coding agent that will decompose it into structured documentation and build phases.

**Important: I may write in a stream-of-consciousness style** — mixing questions, ideas, constraints, and existing code in the same message. That's fine. Your job is to:
- Extract the signal from my ramblings
- Organize your responses with a short summary at the top, then full detail below (so I can skim)
- Push back if I'm going in circles or being contradictory
- Track pivots — if I change direction, acknowledge what we're dropping and what we're keeping

## How to structure our conversation

To help the downstream agent extract maximum signal, please ensure we cover these topics during our discussion. You don't need to follow this order rigidly — natural conversation is fine — but by the end, we should have touched on all relevant areas:

### Core understanding
- What problem are we solving? Who are the users?
- What are the goals? What are the non-goals?
- What are the key use cases and user journeys?

### Requirements
- Functional requirements (what the system must do)
- Non-functional requirements (performance, scale, reliability)
- Constraints (time, budget, platform, regulatory)

### Domain
- Key entities and their relationships
- Business rules and invariants
- Domain terminology (glossary if needed)

### Architecture
- System boundaries (what's in scope vs out)
- Major components and their responsibilities
- Data flow between components
- External integrations (APIs, auth providers, third-party services)

### Technical decisions
- Stack choices (language, framework, database, hosting)
- Key libraries and tools
- API design approach (REST, GraphQL, events)
- Data model at a conceptual level

### UX and flows (if applicable)
- Main screens or views
- Critical user journeys (happy path + error states)
- Edge cases worth designing for

### Quality and testing
- Testing strategy (unit, integration, e2e)
- Quality gates (what must pass before shipping)

### Operations
- Deployment environment and strategy
- Configuration management
- Monitoring and observability

### Build plan
- What should be built first? What depends on what?
- What are the riskiest unknowns to de-risk early?
- What is the MVP scope?

## Formatting tips

These help the downstream agent parse our conversation more effectively:

- **Use bullet points for decisions** — the agent looks for explicit choices
- **When choosing between alternatives**, briefly state what was considered and why you chose one
- **If something is uncertain**, say so explicitly — the agent will mark it as "needs confirmation"
- **Use clear section headers** when shifting topics
- **Drop existing code, schemas, configs** — real artifacts ground the conversation and help the agent understand what you already have

## If this conversation gets long

If we've been going for a while and the conversation is getting very long (many pivots, lots of exploration), please:
1. Periodically remind me what decisions still stand vs what we've dropped
2. Before we wrap up, produce a **consolidated summary** with all final decisions, the latest architecture, and open questions — even if we discussed these topics multiple times earlier

This helps the downstream agent process long conversations efficiently.

## When we're done

At the end of our conversation, please summarize:
1. Key decisions made (numbered list)
2. Open questions remaining
3. Suggested build order (first → last)
4. What was explored but abandoned (so the agent knows to skip it)

Then I'll save this conversation as `conversation.md`, place it at my project root, and run `/up-bootstrap` to decompose it into structured docs and phases.
