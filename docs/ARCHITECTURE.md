# Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- shadcn/ui-ready component structure
- Supabase-ready SQL schema
- OpenAI-ready environment setup

## Key Directories

- `app/` - маршруты Next.js.
- `components/calculator/` - публичный калькулятор.
- `components/result/` - отображение результата и breakdown.
- `components/lead-form/` - форма заявки.
- `components/admin/` - демо-админка и mock data.
- `components/ui/` - shadcn/ui-ready базовые компоненты.
- `lib/` - чистая бизнес-логика и utilities.
- `supabase/` - SQL schema.
- `docs/` - проектная документация.

## Business Logic

Расчет находится в `lib/calculate.ts`. UI не должен содержать формулы расчета.
Функция `calculateImportCost(input)` принимает валидируемый вход и возвращает breakdown.

## Integrations

Supabase и OpenAI пока не подключены. Переменные окружения описаны в `.env.example`.
Реальные секреты нельзя коммитить в репозиторий.
