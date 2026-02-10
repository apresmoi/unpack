# Extract Conversation

> Paste everything below the `---` line into your ChatGPT/Claude conversation when you're done researching and ready to export. The AI will produce a structured extraction you can save as `conversation.md`.
>
> **When to use this vs. the bookmarklet:** The bookmarklet copies the full raw conversation, which gives `/up-bootstrap` maximum context. This prompt is better when the conversation was very long, had many pivots, or when you want a cleaner, more focused extraction.

---

I need you to extract and consolidate everything we discussed in this conversation into a single structured document. This will be processed by a downstream AI agent, so completeness and accuracy matter more than brevity.

## What to extract

### Decisions (final only)
- Extract only the **final version** of each decision — not the intermediate iterations we went through to get there.
- For each decision, include **why** we chose it (rationale, trade-offs considered, alternatives rejected).
- If I gave reasoning or constraints that shaped a decision, include my exact reasoning — don't paraphrase it away.

### Requirements and constraints
- All functional requirements we agreed on.
- Non-functional requirements (performance, scale, reliability, etc.).
- Hard constraints I stated (budget, platform, timeline, regulatory, personal preferences).
- Soft preferences I expressed (even if they seem minor — "I'd prefer X" matters).

### Architecture and technical choices
- Stack decisions (language, framework, database, hosting, etc.).
- System boundaries, components, and data flows.
- API design, data models, schemas we discussed.
- Integration points with external services.

### Domain knowledge
- Key entities, their relationships, and business rules.
- Domain terminology we defined or clarified.
- Edge cases we identified.

### Code and artifacts
- Include any code snippets, schemas, configs, data structures, or examples we produced or refined — in full, inside code blocks.
- If we iterated on an artifact multiple times, include only the **final version**.

### UX and flows (if discussed)
- Screens, views, user journeys.
- Happy paths and error states.

### Build plan (if discussed)
- What to build first, dependencies between pieces.
- MVP scope vs. later iterations.
- Riskiest unknowns to address early.

### Open questions
- Anything we flagged as unresolved or needing more research.
- Anything I said "I'll figure that out later" about.

### Explored and abandoned
- Ideas we explored but **explicitly dropped** — list these so the downstream agent knows to skip them.
- Include a brief note on why each was abandoned.

## What to preserve

- **My reasoning.** When I explained why I wanted something a certain way, include that context verbatim or near-verbatim. The downstream agent needs to understand intent, not just conclusions.
- **Nuance and caveats.** "We want real-time updates, but polling every 5s is fine for v1" — both parts matter.
- **Explicit trade-offs.** "We chose SQLite over Postgres because this is single-user and we want zero-config deployment" — the rationale is as important as the choice.
- **Constraints I stated.** "I don't want to deal with Docker" or "this needs to work offline" — these shape everything downstream.

## What to skip

- Meta-conversation (greetings, formatting instructions, "can you explain X", tangents unrelated to the project).
- Intermediate explorations that were superseded by later decisions.
- Your disclaimers and caveats about AI limitations.

## Output format

Use clear markdown with headers matching the sections above. Use bullet points for individual items. Include code blocks for any technical artifacts. The output should be self-contained — someone reading it without access to this conversation should understand the full project design.

Start with a one-paragraph project summary, then the structured sections.
