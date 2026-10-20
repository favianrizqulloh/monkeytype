Be extremely concise. Sacrifice grammar for concision.
Frontend is partially migrated from vanilla JS to SolidJS — new components use `.tsx`, legacy code remains vanilla.
Single test file: `pnpm vitest run path/to/test.ts`
When running oxc lint, always use `--format agent`.
Format with `npx oxfmt <files>` (not prettier).
For typechecking, use `pnpm oxlint --type-aware --type-check` instead of `tsc`.
Coding standards (styling, icons, refs, modals) for writing and reviewing code: `CODING_STANDARDS.md`.
Before any browser testing, read `docs/AGENT_BROWSER.md` (dev server, `window.__mt` debug handle, gotchas).
In plan mode, before writing up a plan, ask clarifying questions if needed. At the end of plan mode, give me a list of unresolved questions to answer, if any. Make them concise.
Always execute PM2 deployment commands from repository root, never from subdirectories.
Keep git hooks fail-soft (exit 0) so GUI clients like GitHub Desktop never get blocked by missing shell paths.
Vite alias overrides must use absolute paths and fallback gracefully to tracked example templates when target files are gitignored.