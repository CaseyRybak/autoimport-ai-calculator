# Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- node:test + tsx
- shadcn/ui-ready component structure
- Supabase lead insert, server-side admin read and Vehicle Catalog SQL
- OpenAI-ready environment setup

## Key Directories

- `app/` - маршруты Next.js.
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
форма заявки вызывает `createLead()`, helper вставляет запись в `public.leads` через
anon Supabase client при настроенных env-переменных и разрешениях. Если env/Supabase
недоступны, включается demo/mock fallback, чтобы локальная демонстрация оставалась
работоспособной.

Admin routes также проходят через `lib/leads.ts`. После `ADMIN_DEMO_PASSWORD` gate
серверный helper использует `SUPABASE_SERVICE_ROLE_KEY` для чтения `public.leads`.
Service-role ключ не должен попадать в client components и не должен иметь
`NEXT_PUBLIC_` prefix.

Vehicle Catalog проходит через `lib/vehicle-catalog.ts`. Калькулятор читает активные
бренды, модели и варианты из Supabase и строит зависимые dropdown:

```text
country -> brand -> model -> year -> engine type -> engine volume
```

UI и маршруты не должны импортировать Supabase напрямую; доступ к данным остается в
`lib/` helpers или server actions.

## Current Data Flow

- Lead form -> `createLead()` -> Supabase anon insert -> `public.leads`.
- Admin -> server-side service-role read -> `public.leads`.
- Calculator -> Vehicle Catalog read -> dependent dropdown -> selected
  `source_price_usd`.
- Fallback mode -> mock/demo leads or local demo catalog when env vars, permissions or
  Supabase are unavailable.

## Harness

- `AGENTS.md` описывает карту репозитория и правила для агентов.
- `docs/QUALITY.md` фиксирует quality gates и known gaps.
- `docs/REVIEW_CHECKLIST.md` описывает ручной smoke-review.
- `.github/workflows/ci.yml` запускает tests, typecheck и build на GitHub.

## Integrations

Supabase подключен для lead insert, admin lead read и Vehicle Catalog read при наличии
переменных окружения и нужных grants/policies. OpenAI подготовлен на уровне env/documentation,
но реальные OpenAI-запросы не подключены.

Переменные окружения описаны в `.env.example` и `docs/SUPABASE_SETUP.md`. Реальные
секреты нельзя коммитить в репозиторий.
