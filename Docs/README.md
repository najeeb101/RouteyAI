# Documentation

Start here. The project's main idea, in one line: **every bus does a morning run and an afternoon run, every school day, and a route never changes by itself.**

## Where to look

| Document | Read it to learn |
|---|---|
| [Claude.md](Claude.md) | **The technical reference**: the two-runs rules, tech stack, design system, project structure, database schema and access rules, Edge Functions, conventions and testing. Where documents disagree, this one wins |
| [Architecture.md](Architecture.md) | Why the project runs on Vercel, Supabase and Mapbox, and how the pieces fit |
| [features.md](features.md) | Every feature, grouped by who uses it |
| [busflow.md](busflow.md) | How students, stops, buses and drivers connect, and how a new student is placed |
| [task.md](task.md) | The live checklist: status by phase and the open work in priority order |
| [CHANGELOG.md](CHANGELOG.md) | The engineering log: dated notes on what was built, decided and learned |
| [store-listing.md](store-listing.md) | App Store and Google Play listing text, review notes and privacy answers |

## Plans

Written before bigger pieces of work and kept as the record of the decisions.

| Plan | Subject | State |
|---|---|---|
| [plans/legal-and-accessibility.md](plans/legal-and-accessibility.md) | Legal pages, consent, claims, accessibility; open decisions for the owner | Done; owner items open |

## Elsewhere in the repository

| File | Contents |
|---|---|
| [../README.md](../README.md) | The project overview, setup and commands |
| [../CLAUDE.md](../CLAUDE.md), [../AGENTS.md](../AGENTS.md) | Short guidance for AI coding assistants (they point back to Claude.md) |
| [../mobile/README.md](../mobile/README.md) | Building and running the phone app |

## Keeping the docs current

- Change behaviour, schema or rules: update [Claude.md](Claude.md) in the same pull request.
- Finish or open a piece of work: update [task.md](task.md); add a dated entry to [CHANGELOG.md](CHANGELOG.md) when there is something worth remembering.
- A finished plan stays as a record; do not delete the reasoning, only mark its state.
