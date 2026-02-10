# Contributing to Unpack

Thanks for your interest in improving Unpack. This guide covers the main ways to contribute.

## Adding or improving standards

Standards live in `.unpack/standards/` organized by category. Each file follows a consistent format:

- **Status line**: `skeleton` → `seeded` → `confirmed`
- **Metadata**: Applies to, Seeded from
- **Sections**: Categorized patterns with concrete examples
- **Anti-patterns**: What to avoid

To add a new standard:

1. Create a `.md` file under the appropriate category folder in `.unpack/standards/`
2. Follow the format of existing standards (check any file in `.unpack/standards/typescript/` for reference)
3. Add an entry to `.unpack/standards/_index.md`
4. Submit a PR with before/after examples showing the patterns in action

To improve an existing standard:

1. Open the file and make your changes
2. If adding patterns, include concrete code examples (good vs bad)
3. Update the status if appropriate (`skeleton` → `seeded` → `confirmed`)

## Adding or improving skills

Skills live in `.unpack/skills/<name>/SKILL.md` as markdown procedure files with YAML frontmatter (`name` and `description`). Each skill is an instruction set for AI agents.

To add a skill:

1. Create a `.unpack/skills/<name>/SKILL.md` file with YAML frontmatter and the `up-` prefix naming convention
2. Follow the structure of existing skills: clear input handling, numbered procedure steps, output description
3. Reference `AGENTS.md` for core procedures where possible (don't duplicate)
4. Update `CLAUDE.md` to list the new skill
5. Test with Claude Code and/or Codex — skills are deployed to agent-specific paths during `/up-init`

To improve a skill:

1. Read the existing skill and understand the current flow
2. Make targeted changes — skills should be concise and actionable
3. Update any cross-references in other skills if you change names or behavior

## Improving prompts

Prompts live in `.unpack/prompts/`. These are designed to be pasted into ChatGPT or similar tools by end users.

To improve a prompt:

1. Test the prompt with real conversations
2. Ensure it produces output that `/up-bootstrap` and `/up-apply` can consume effectively
3. Keep prompts self-contained — the user shouldn't need to read other docs to use them
4. Avoid jargon — prompts should be understandable by anyone, not just Unpack experts

## Improving the docs template

The `.unpack/docs/` folder is a template that gets copied into new projects during `/up-init`. Changes here affect every new project initialized with Unpack.

Be conservative with template changes — they have wide impact. If you're adding a new spec slot or changing the phase format, explain why in your PR.

## Submitting changes

1. Fork the repository
2. Create a branch with a descriptive name
3. Make your changes
4. Submit a pull request with:
   - What you changed and why
   - How you tested it (if applicable)
   - Any breaking changes to existing projects using Unpack

## Code of conduct

Be kind. Be constructive. Focus on the great work.
