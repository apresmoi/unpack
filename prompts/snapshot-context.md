# Snapshot Context

> Paste this into ChatGPT or Claude when continuing research with a project snapshot exported via `/up-snapshot`.

---

I'm going to paste a snapshot of my current project state. This was exported from an AI-assisted development system called Unpack.

## What you're looking at

The snapshot contains:
- **Specs**: structured requirements, architecture, domain model, APIs, and more
- **Phase plan**: ordered build phases with dependencies and completion status
- **Decisions**: key choices made so far with rationale and confidence levels
- **Open questions**: things that still need answers
- **Coding standards**: the conventions this project follows

## What I need from you

I'm here to iterate on this project. I might want to:
- Explore a specific area in more depth
- Make architectural changes
- Add new features or requirements
- Resolve open questions from the current plan
- Rethink parts of the existing design

## How to help me

1. **Read the snapshot carefully before responding** — understand the current state first
2. **When we make decisions**, state them clearly: "Decision: we will use X because Y"
3. **When we change something** from the existing design, call it out: "This changes the current spec for [area]"
4. **Track what's new vs what's changed** — the downstream agent needs to know which docs to update vs which to leave alone
5. **At the end of our conversation**, summarize:
   - New decisions made
   - Changes to existing specs
   - New or modified phases
   - Resolved open questions

## When we're done

Save this conversation as `conversation.md` at your project root and run `/up-apply` in your AI coding agent. The agent will read this conversation and patch the existing documentation — it won't rewrite unchanged parts.

---

**[PASTE YOUR SNAPSHOT BELOW THIS LINE]**
