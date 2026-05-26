# AGENTS.md

Rules for Codex and other coding agents working on this repository:

- Work only inside this project directory.
- Do not touch `/mnt/c` or other Windows disk paths.
- Do not use `sudo` without explicit user permission.
- Keep business logic in `lib/`.
- Keep calculation formulas in `lib/calculate.ts` or related `lib/` modules.
- Update `PROJECT_NOTES.md` after major changes.
- Do not add real API keys or secrets.
- Use `.env.example` for environment variable names only.
- Real customs formulas are not implemented. Current formulas are demo-only.
- Do not edit `reference/figma` unless explicitly required.
