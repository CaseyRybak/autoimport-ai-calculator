# n8n Workflow Plan

This handoff captures the planned n8n automation for AutoImport AI Suite. It intentionally
does not contain secrets, API keys or real credential values.

## Current Setup State

- n8n MCP discovery/validation tools respond in Codex.
- Direct n8n instance API tools such as `n8n_create_workflow` require `N8N_API_URL` and
  `N8N_API_KEY` to be available in the Codex process environment.
- On June 2, 2026, `N8N_API_URL` and `N8N_API_KEY` were visible in the Codex shell, but
  `N8N_API_URL` pointed to the n8n MCP server endpoint, not the public REST API origin.
  Public REST endpoints still returned 404/editor responses, so workflows were created
  through the authenticated n8n MCP server instead.
- Created in n8n on June 2, 2026:
  - `AutoImport - New Lead Intake`, workflow id `5qXRyji4Yv3bbFMo`.
  - `AutoImport - Owner Status Report`, workflow id `rLze04ap1PeGahCf`.
- Created through n8n Google Sheets OAuth on June 2, 2026:
  - Spreadsheet: `AutoImport Leads`
  - Sheet: `Leads`
  - Spreadsheet id: `130cZrwdQwiW2-56mwHxZamxAqTkb2A_Yr4jGpyx1vjY`
  - URL: `https://docs.google.com/spreadsheets/d/130cZrwdQwiW2-56mwHxZamxAqTkb2A_Yr4jGpyx1vjY/edit`
- `AutoImport - New Lead Intake` has been updated to use that spreadsheet id and sheet
  name. The existing n8n credential `Google Sheets OAuth2 API` was assigned via MCP.
- Telegram Bot API URL, Telegram chat ids, AutoImport app URL and the shared app/n8n
  secret were written into the two n8n workflow HTTP Request node parameters from local
  `.env.local` on June 2, 2026. The working nodes no longer depend on n8n `$env.*`
  variables for these values.
- n8n Cloud test mode denied Code node access to `$env`, so Code nodes were also updated
  to use literal defaults:
  - reminder interval: `10` minutes
  - max reminders: `3`, with RED ALERT sent immediately after the third reminder
  - report timezone: `Europe/Moscow`
- n8n pin-data tests passed on June 2, 2026:
  - `AutoImport - New Lead Intake`, execution id `8`, status `success`
  - `AutoImport - Owner Status Report`, execution id `7`, status `success`
- On June 3, 2026, the active `AutoImport - Owner Status Report` workflow was patched
  through the authenticated n8n MCP endpoint: the `Format Owner Report` Code node was
  synchronized with `docs/n8n/owner-status-report.workflow.json`, so the Telegram message
  explicitly shows `Период: последние 24 часа`. Live pin-data test execution `31`
  finished with status `success`, and the workflow remained active.
- Local `.env.local` was updated with:
  - `N8N_NEW_LEAD_WEBHOOK_URL`
  - `N8N_SHARED_SECRET`
- `.env.local` contains real local secrets and must never be overwritten, regenerated,
  pulled from Vercel or edited by Codex without explicit user permission. If Vercel env
  values need inspection, write to a separate temporary file first.
- The one-time helper workflow `AutoImport - Create Leads Sheet`, id
  `arCdkkC7u1Yu49mq`, was archived after creating the spreadsheet.
- New Lead Intake and Owner Status Report were published on June 2, 2026 and are active.
- Telegram Status Callback workflow was created on June 3, 2026 and is active.
- The live production flow was verified from the Vercel site on June 2, 2026 with a
  test lead. n8n execution `9` reached the reminder wait state, and these nodes reported
  `ok`: webhook receive, payload normalization, Google Sheets append and Telegram
  notification.
- New Lead Intake production webhook after publishing:
  `https://caseyrybak.app.n8n.cloud/webhook/autoimport/new-lead`.
- New Lead Intake test webhook:
  `https://caseyrybak.app.n8n.cloud/webhook-test/autoimport/new-lead`.
- Sanitized workflow export templates now live in:
  - `docs/n8n/new-lead-intake.workflow.json`
  - `docs/n8n/owner-status-report.workflow.json`
  - `docs/n8n/telegram-status-callback.workflow.json`
- The app now has optional n8n integration env names:
  - `N8N_NEW_LEAD_WEBHOOK_URL`
  - `N8N_SHARED_SECRET`
- Telegram routing was split on June 2, 2026:
  - New lead notifications and reminders go to the employee group
    (`TELEGRAM_LEADS_CHAT_ID`).
  - RED ALERT and owner status reports go to the owner chat
    (`TELEGRAM_OWNER_CHAT_ID`).
- The app exposes a protected server route for n8n status checks and report counts:
  `/api/n8n/leads`, authorized by `x-n8n-shared-secret`.
- The app also exposes a protected admin snapshot route
  `/admin/leads/[id]/snapshot` for open lead-detail polling. This route is admin-cookie
  protected and is not used by n8n.
- Recommended temporary setup before starting Codex:

```bash
cd "/home/enzomonro/projects/AutoImport AI Suite"

export N8N_API_URL="http://localhost:5678"
export N8N_API_KEY="your_n8n_api_key"

codex
```

Use the real n8n URL instead of `http://localhost:5678` when n8n is not local. Do not
commit API keys or write them into repository config files.

After restarting Codex, verify direct n8n access by checking whether tools such as
`n8n_health_check`, `n8n_list_workflows` and `n8n_create_workflow` are available.
If only the official n8n MCP server URL is available, use the MCP JSON-RPC tools:
`get_sdk_reference`, `get_suggested_nodes`, `search_nodes`, `get_node_types`,
`validate_workflow` and `create_workflow_from_code`.

## Workflow 1: New Lead Intake

Purpose: react to every new vehicle lead and notify the owner/team.

Current n8n workflow:

- Name: `AutoImport - New Lead Intake`
- ID: `5qXRyji4Yv3bbFMo`
- URL: `https://caseyrybak.app.n8n.cloud/workflow/5qXRyji4Yv3bbFMo`
- Status: active

Preferred trigger:

- Site calls an n8n `Webhook` immediately after successful `createLead()`.
- This avoids polling, duplicate detection problems and delayed lead delivery.
- Implemented in the app as an optional webhook call after successful Supabase lead
  creation when `N8N_NEW_LEAD_WEBHOOK_URL` is configured.

Main path:

1. Receive new lead payload from the site.
2. Validate required fields:
   - `lead_id`
   - `lead_number`
   - customer name/contact
   - vehicle summary
   - budget/total/status
   - admin lead URL if available
3. Append the lead to owner Google Sheets.
4. Send new-lead notification to the employee Telegram group.
5. Include employee action buttons:
   - `В работу` -> `in_progress`
   - `Ждем клиента` -> `waiting_client`
   - `Закрыта` -> `closed`
   - `Отказ` -> `rejected`
6. Start reminder tracking for this specific lead.

Each incoming lead must run independently. If several leads arrive close together, each
lead gets its own execution path and reminder loop keyed by `lead_id`.

## Reminder Loop

Default behavior:

- Wait `reminder_interval_minutes`, default `10`.
- Check current status for the same `lead_id`.
- If status is still `new`, send a reminder to the employee Telegram group.
- Repeat until status changes away from `new`.

Statuses that stop normal reminders:

- `in_progress`
- `waiting_client`
- `closed`
- `rejected`

Recommended editable settings:

- `reminder_interval_minutes`, default `10`.
- `max_reminders`, currently `3`. The workflow sends the third reminder and then
  immediately routes to RED ALERT without another wait cycle.
- `owner_red_alert_chat_id`.
- `telegram_group_chat_id`.

## RED ALERT

When `max_reminders` is reached and the lead status is still `new`:

1. Send a RED ALERT message to the owner bot/private owner chat.
2. Include:
   - lead display number, for example `AIC-000123`
   - customer name and phone
   - vehicle summary
   - elapsed time since lead creation
   - admin lead URL
3. Stop the reminder loop after RED ALERT to avoid unbounded spam.

The RED ALERT is owner-facing. Normal reminders remain group-facing.

## Workflow 2: Owner Status Report

Purpose: send owner status summaries.

Current n8n workflow:

- Name: `AutoImport - Owner Status Report`
- ID: `rLze04ap1PeGahCf`
- URL: `https://caseyrybak.app.n8n.cloud/workflow/rLze04ap1PeGahCf`
- Status: active
- Schedule: daily at `20:20` Moscow time target. The active Schedule Trigger currently
  stores `daysInterval: 1`, `triggerAtHour: 20` and `triggerAtMinute: 20`.
- The active n8n `Format Owner Report` Code node is synchronized with the sanitized
  export in `docs/n8n/owner-status-report.workflow.json`. The Telegram message explicitly
  shows `Период: последние 24 часа`, and `/api/n8n/leads` returns the matching rolling
  24-hour count window with `periodStartedAt` and `periodEndedAt`.

Keep this separate from New Lead Intake. It is a scheduled/status workflow, not an event
workflow.

Report should include counts by current lead status for the rolling 24-hour period ending
at report generation time:

- `new`
- `in_progress`
- `waiting_client`
- `closed`
- `rejected`

The user-facing Russian labels are:

- Новые
- Принятые в работу
- Ожидают клиента
- Завершенные
- Отказанные

Recommended settings:

- `report_enabled`
- `report_mode`: `interval` or `time`
- `report_interval_minutes`
- `report_time`, currently `20:20`
- `timezone`, default `Europe/Moscow`
- `owner_report_chat_id`

Naming recommendation:

- Use "Owner Status Report" as the generic workflow name.
- In `time` mode it behaves like a daily report.
- In `interval` mode it behaves like a periodic report.

## Config Storage Options

Recommended order:

1. n8n Data Table if available and convenient.
2. Dedicated Google Sheets settings tab.
3. Static workflow values only for first prototype.

The owner requested editable choice between:

- every X minutes
- fixed HH:MM

Both values should be editable without rebuilding the workflow.

## Data Access For Status Checks

The reminder loop and reports need current lead status.

Preferred options:

1. Internal server endpoint protected by a shared secret, returning lead status/report
   counts.
2. Supabase node or HTTP request using a server-side service role credential stored in
   n8n credentials.

Current implementation uses option 1:

- `GET /api/n8n/leads?leadId=<uuid>` returns current lead status/detail for reminders.
- `GET /api/n8n/leads` returns rolling 24-hour status counts for owner reports plus
  `periodHours`, `periodStartedAt` and `periodEndedAt`.
- `POST /api/n8n/leads` updates a lead status from automation callbacks. JSON body:
  `{ "leadId": "<uuid>", "status": "in_progress", "actor": "@manager optional" }`.
  The endpoint writes `public.leads.status`, adds an internal manager comment and returns
  the updated status label.
- Both require `x-n8n-shared-secret` matching `N8N_SHARED_SECRET`.

## Telegram Status Callback Workflow

Purpose: let employees change CRM status directly from Telegram group buttons.

Current template/live workflow:

- Name: `AutoImport - Telegram Status Callback`
- Template: `docs/n8n/telegram-status-callback.workflow.json`
- Live workflow id: `I4djkKQ5BeTPkFpp`
- Status: active in n8n.
- On a successful button click, the workflow updates the app lead status, answers the
  Telegram callback, removes the original inline keyboard and posts a group message
  like `Статус заявки AIC-000020 изменен на В работе`.

Fresh import setup:

1. Import the callback workflow.
2. Configure the workflow with the same Telegram bot token and shared app secret as the
   existing lead workflows.
3. Point Telegram bot webhook updates to the workflow production webhook path:
   `/webhook/autoimport/telegram-status-callback`.
4. Send new lead/reminder group messages with `reply_markup.inline_keyboard` as shown in
   `docs/n8n/new-lead-intake.workflow.json`.

The callback data format is `lead_status:<status>:<uuid>`. It fits Telegram's 64-byte
callback limit for UUID lead ids, including the longest current status
`waiting_client`.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. If used in n8n, store it only
as an n8n credential/secret.

## Credentials Needed In n8n

- Telegram Bot API token, used by the automation workflows through `TELEGRAM_BOT_TOKEN`.
- Telegram group chat id for normal lead notifications/reminders, exposed in the app as
  `TELEGRAM_LEADS_CHAT_ID` and in n8n as direct node parameters in the current workflow.
- Telegram owner/private chat id for RED ALERT and owner reports, exposed in n8n as
  `TELEGRAM_OWNER_CHAT_ID` and in n8n as direct node parameters in the current workflow.
- Google Sheets OAuth credential.
- Shared app endpoint secret exposed in n8n as `AUTOIMPORT_N8N_SHARED_SECRET` or
  `N8N_SHARED_SECRET`.

The workflow export templates still expect these variables if imported into a fresh n8n
instance:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_LEADS_CHAT_ID`
- `TELEGRAM_OWNER_CHAT_ID`
- `AUTOIMPORT_APP_BASE_URL`, optional app URL override; defaults to the current Vercel URL
- `N8N_SHARED_SECRET` or `AUTOIMPORT_N8N_SHARED_SECRET`

The current live n8n workflows have had those values replaced directly in node
parameters. Export templates intentionally avoid real credential values. Code node
defaults are literal because n8n Cloud test mode did not allow `$env` access inside Code
nodes: reminder interval `10`, max reminders `3`, report timezone `Europe/Moscow`.

Current production state:

1. The app is deployed to `https://autoimport-ai-calculator.vercel.app`.
2. Vercel production env includes `N8N_NEW_LEAD_WEBHOOK_URL` and `N8N_SHARED_SECRET`.
3. New Lead Intake has been tested through the production site and writes to Google
   Sheets plus Telegram successfully.
4. Telegram Status Callback is active and has passed n8n pin-data validation. A live
   protected `POST /api/n8n/leads` update was verified after production had the POST
   route deployed.

## After Restart Checklist

1. Confirm `N8N_API_URL` and `N8N_API_KEY` are exported in the terminal before starting
   Codex.
2. Verify direct n8n MCP instance tools are available.
3. Run n8n health check if the tool is exposed.
4. Discover exact node schemas with `get_node(detail="standard")` before creating nodes.
5. Validate workflow JSON before creating it in n8n.
6. Create workflows inactive first.
7. Configure credentials in n8n UI or through MCP/API only when credential tooling is
   available.
8. Test webhooks and scheduler manually.
9. Activate workflows only after successful test executions.
