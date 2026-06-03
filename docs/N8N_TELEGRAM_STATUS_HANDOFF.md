# Telegram Status Buttons Handoff

Date: June 3, 2026

## Goal

Implement Telegram group buttons for employees so a manager can change a lead status
directly from the Telegram group:

- `В работу` -> `in_progress`
- `Ждем клиента` -> `waiting_client`
- `Закрыта` -> `closed`
- `Отказ` -> `rejected`

The status must persist in Supabase/admin CRM and add an internal manager comment.

## Current Local Implementation

Implemented locally in the repository:

- `POST /api/n8n/leads` in `app/api/n8n/leads/route.ts`
  - Requires `x-n8n-shared-secret`.
  - Accepts JSON body:
    `{ "leadId": "<uuid>", "status": "in_progress", "actor": "@manager optional" }`.
  - Uses server-side helpers from `lib/leads.ts`.
  - Updates `public.leads.status`.
  - Writes an internal comment like `Статус заявки изменен из Telegram: ...`.

- Admin lead detail polling in `app/admin/leads/[id]/snapshot/route.ts` and
  `components/admin/lead-crm-controls.tsx`
  - Uses the admin password-gate cookie, not the n8n shared secret.
  - Polls compact status/comment state so Telegram status changes can appear in the open
    admin detail page without a reload after deployment.

- Telegram helper updates in `lib/telegram.ts`
  - Builds inline keyboard markup for persisted leads.
  - Keeps callback data format as `lead_status:<status>:<uuid>`.

- Tests in `lib/telegram.test.ts`
  - Validate button layout.
  - Validate callback data remains within Telegram's 64-byte limit.

- n8n templates:
  - `docs/n8n/new-lead-intake.workflow.json`
    - Existing workflow template updated so Telegram messages include inline buttons.
  - `docs/n8n/telegram-status-callback.workflow.json`
    - Current sanitized callback workflow template.
    - It receives Telegram `callback_query`, parses callback data and calls
      `POST /api/n8n/leads`.
    - After a successful update, it removes the inline keyboard from the original
      Telegram message and posts a group confirmation message with the lead number and
      new status label.

- Docs updated:
  - `docs/N8N_WORKFLOW_PLAN.md`
  - `docs/SESSION_BRIEF.md`
  - `docs/SUPABASE_SETUP.md`
  - `docs/QUALITY.md`
  - `docs/REVIEW_CHECKLIST.md`

## Validation Already Completed

Passed locally:

- JSON parse for the n8n workflow templates.
- `npm test`
- `npm run typecheck`
- `npm run build`
- n8n MCP `validate_workflow` for `docs/n8n/telegram-status-callback.workflow.json`
  returned `valid: true`.

n8n validation warnings remained only around webhook/error handling. They did not block
schema validation.

## Live n8n Work Remaining

Completed live:

- `AutoImport - New Lead Intake`, id `5qXRyji4Yv3bbFMo`, sends new lead and reminder
  Telegram messages with inline status buttons.
- `AutoImport - Telegram Status Callback`, id `I4djkKQ5BeTPkFpp`, is active.
- Telegram bot webhook points to `/webhook/autoimport/telegram-status-callback` with
  `callback_query` updates.
- Callback workflow updates `/api/n8n/leads`, removes clicked-message buttons and posts
  a status-change confirmation in the group.

Remaining manual smoke test:

- Create a fresh test lead, click one Telegram status button and confirm the original
  message loses its buttons, the group receives the confirmation message, and admin CRM
  shows the new status plus internal comment.
- Keep the admin lead detail page open during a Telegram button click and confirm the
  status/comment history refreshes automatically within about 5 seconds.

## Access Notes

The previous Codex session did not have live n8n management tools available and shell
network access could not resolve `caseyrybak.app.n8n.cloud`.

After restarting Codex, verify live-management tools are visible before trying live
changes. Expected examples:

- `n8n_list_workflows`
- `n8n_get_workflow`
- `n8n_create_workflow`
- `n8n_update_workflow` or `n8n_update_partial_workflow`
- `n8n_activate_workflow`

Do not commit, print or write real n8n tokens/API keys into repository files.
