# Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- node:test + tsx
- shadcn/ui-ready component structure
- Supabase lead insert, server-side admin read and Vehicle Catalog SQL
- n8n lead intake, reminder and owner-report automation
- Optional direct Telegram lead notification helper as fallback when n8n is unavailable
- Future AI extension points without runtime OpenAI wiring

## Key Directories

- `app/` - маршруты Next.js.
- `app/admin/leads/[id]/snapshot/route.ts` - protected compact CRM snapshot for admin
  detail polling.
- `components/calculator/` - публичный калькулятор.
- `components/result/` - отображение результата и breakdown.
- `components/lead-form/` - форма заявки.
- `components/admin/` - демо-админка.
- `components/ui/` - shadcn/ui-ready базовые компоненты.
- `lib/` - бизнес-логика, validation, data boundaries и tests.
- `supabase/` - SQL schema.
- `docs/` - проектная документация.

## Business Logic

Расчет находится в `lib/calculate.ts`. UI не должен содержать формулы расчета.
Функция `calculateImportCost(input)` принимает валидируемый вход и возвращает breakdown.

## Data Boundary

Заявки проходят через `lib/leads.ts`. Это текущая Supabase-backed граница данных:
форма заявки вызывает `createLead()`, helper вставляет запись в `public.leads`
server-side через service_role, когда он настроен, чтобы безопасно получить `id` и
`lead_number` для админских ссылок и уведомлений. Если service_role недоступен, остается
anon insert fallback без anon `SELECT`; если env/Supabase недоступны, включается
demo/mock fallback, чтобы локальная демонстрация оставалась работоспособной.

Admin routes также проходят через `lib/leads.ts`. После `ADMIN_DEMO_PASSWORD` gate
серверный helper использует `SUPABASE_SERVICE_ROLE_KEY` для чтения `public.leads`.
Service-role ключ не должен попадать в client components и не должен иметь
`NEXT_PUBLIC_` prefix.

Vehicle Catalog проходит через `lib/vehicle-catalog.ts`. Калькулятор читает активные
бренды, модели и варианты из Supabase и строит зависимые dropdown:

```text
country -> brand -> model -> year -> engine type -> engine volume
```

UI и маршруты не должны импортировать Supabase напрямую. Доступ к данным остается в
`lib/` helpers или server actions.

## Vehicle Catalog Admin Write Path

Admin catalog management проходит через серверный код и service-role helper:

```text
/admin/catalog
  -> app/admin/catalog/actions.ts
  -> lib/vehicle-catalog-admin.ts
  -> createSupabaseAdminClient()
  -> public.vehicle_brands / public.vehicle_models / public.vehicle_variants
```

`/admin/catalog/import` использует тот же `lib/vehicle-catalog-admin.ts` для bulk upsert
после CSV validation/preview. `/admin/catalog/export` читает отфильтрованные строки
каталога на сервере и возвращает CSV для текущих фильтров country/brand/model/activity/search.

Текущий admin catalog MVP редактирует только рабочие поля варианта:

- `source_price_usd`
- `source_name`
- `source_url`
- `last_checked_at`
- `is_active`

Structural fields для brand/model/year/engine не редактируются в row editor. Такие
изменения должны идти через CSV import или будущий dedicated structural editor, потому
что эти поля участвуют в relationships и unique constraints.

## Current Data Flow

- Lead form -> `createLead()` -> server-side Supabase insert -> `public.leads`.
- Successful Supabase lead creation -> `sendLeadCreatedN8nWebhook()` -> n8n New Lead
  Intake workflow, when `N8N_NEW_LEAD_WEBHOOK_URL` is configured.
- If n8n is not configured or the webhook call fails, the app falls back to direct
  Telegram notification through `sendLeadCreatedNotification()`.
- Admin -> server-side service-role read -> `public.leads`.
- Calculator -> Vehicle Catalog read -> dependent dropdown -> selected
  `source_price_usd`.
- Admin catalog row update -> server action -> service-role update of
  `public.vehicle_variants`.
- Admin catalog CSV import -> validation/preview -> service-role upsert of brands, models
  and variants.
- Fallback mode -> mock/demo leads or local demo catalog when env vars, permissions or
  Supabase are unavailable.

## CRM Persistence

CRM-minimum сохраняет статусы заявок и комментарии менеджера через server-side actions и
service-role helpers:

- Status updates пишут `public.leads.status` через server action после проверки
  `ADMIN_DEMO_PASSWORD` access и создания service-role client.
- Manager comments пишутся в `public.lead_comments` с `lead_id`, `author_name`, `body`
  и `is_internal = true`.
- Lead detail читает persisted comments на сервере через `lib/leads.ts` или связанную
  `lib/` data boundary, но не напрямую из client component.
- Open lead detail pages poll `/admin/leads/[id]/snapshot` every 5 seconds after
  admin access. The endpoint returns only compact CRM state (`status`, `updatedAt`,
  comments) through server-side helpers so Telegram/button changes can appear without a
  full page reload.
- Validation должна отклонять unknown lead ids, unsupported statuses и empty comments.

## Harness

- `AGENTS.md` описывает карту репозитория и правила для агентов.
- `docs/QUALITY.md` фиксирует quality gates и known gaps.
- `docs/REVIEW_CHECKLIST.md` описывает ручной smoke-review.
- `.github/workflows/ci.yml` запускает tests, typecheck и build на GitHub.

## Integrations

Supabase подключен для lead creation, admin lead read, Vehicle Catalog read/write и
CRM-minimum persistence при наличии переменных окружения и нужных grants/policies.
n8n automation подключена для новых заявок, Google Sheets append, Telegram routing,
reminders, Telegram status callbacks, RED ALERT и owner status report. Telegram напрямую
из приложения используется как fallback, чтобы не дублировать сообщения при рабочем n8n.
AI-assisted flows остаются roadmap-пунктом; runtime OpenAI env vars и реальные
OpenAI-запросы сейчас не подключены.

Переменные окружения описаны в `.env.example` и `docs/SUPABASE_SETUP.md`. Реальные
секреты нельзя коммитить в репозиторий. `.env.local` содержит реальные локальные
секреты и не должен редактироваться или перезаписываться агентом без отдельного явного
разрешения пользователя.

Production deploys should go through GitHub push/Actions. Direct local production deploys
with `vercel deploy --prod` are intentionally avoided so CI remains the release gate.
