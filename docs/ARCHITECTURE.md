# Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- node:test + tsx
- shadcn/ui-ready component structure
- Supabase-ready SQL schema
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

Заявки проходят через `lib/leads.ts`. Сейчас файл возвращает demo data, но это
будущая точка замены на Supabase-backed реализацию. UI и маршруты не должны импортировать
Supabase напрямую.

## Harness

- `AGENTS.md` описывает карту репозитория и правила для агентов.
- `docs/QUALITY.md` фиксирует quality gates и known gaps.
- `docs/REVIEW_CHECKLIST.md` описывает ручной smoke-review.
- `.github/workflows/ci.yml` запускает tests, typecheck и build на GitHub.

## Integrations

Supabase и OpenAI пока не подключены. Переменные окружения описаны в `.env.example`.
Реальные секреты нельзя коммитить в репозиторий.
