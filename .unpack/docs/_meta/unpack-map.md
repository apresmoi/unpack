# Unpack Map (default)

This defines how conversation topics map to documentation files.

When processing a conversation (`/up-bootstrap` or `/up-apply`), use this mapping to determine which spec file receives which content.

## Mapping

- Conversation: Vision, context, goals, non-goals, problem statement → `.unpack/docs/specs/00-overview.md`
- Conversation: Requirements (functional + non-functional), constraints → `.unpack/docs/specs/01-requirements.md`
- Conversation: Domain concepts, entities, invariants, business rules → `.unpack/docs/specs/02-domain-model.md`
- Conversation: Architecture, components, boundaries, data flows, integrations → `.unpack/docs/specs/03-architecture.md`
- Conversation: APIs, events, contracts, UI/backend interfaces → `.unpack/docs/specs/04-apis-and-interfaces.md`
- Conversation: UX flows, screens, journeys, edge cases → `.unpack/docs/specs/05-ux-and-flows.md`
- Conversation: Testing strategy, quality gates, evals → `.unpack/docs/specs/06-testing-and-quality.md`
- Conversation: Deployment, environments, observability, runbooks → `.unpack/docs/specs/07-operations.md`
- Conversation: Security, privacy, threat model, data handling → `.unpack/docs/specs/08-security-and-privacy.md`

## Phase extraction

- Conversation: build plan, phase plan, priorities → phase files under `.unpack/docs/phases/phase-N.md`
- Always create `phase-0.md` for bootstrap and mark it done after processing completes.

## Decision extraction

- All explicit decisions → `.unpack/docs/_meta/project-memory.md` with IDs (D-001, D-002, ...)
- Significant decisions → promote to ADRs in `.unpack/docs/decisions/`
