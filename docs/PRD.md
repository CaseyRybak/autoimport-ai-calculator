# AutoImport AI Calculator PRD

## Цель

Создать портфолио-MVP веб-сервиса для бизнеса по импорту авто: публичный калькулятор
стоимости под ключ, форма заявки и демо-админка для обработки лидов.

## Пользователи

- Клиент: хочет быстро понять примерный бюджет импорта автомобиля.
- Менеджер: просматривает заявки, видит расчет, меняет статус и готовит ответ клиенту.
- Работодатель/ревьюер: оценивает архитектуру, UI, чистоту логики и готовность к интеграциям.

## MVP-функции

- Публичный калькулятор с демо-формулами.
- Vehicle Catalog dropdown: выбор страны, бренда, модели, года, двигателя и объема из
  Supabase-каталога с зависимыми списками.
- Расчет breakdown и статуса бюджета.
- Форма заявки с сохранением в Supabase при настроенных env-переменных и правах.
- Honest fallback: если Supabase/env недоступны, форма показывает demo/mock результат
  без утверждения о production-персистентности.
- Админка: список заявок, карточка заявки и настройки.
- `/admin` читает реальные заявки server-side через `SUPABASE_SERVICE_ROLE_KEY` после
  demo-password gate, с mock fallback для локального демо-режима.
- Supabase-backed структура без реальных ключей в репозитории.
- OpenAI API-ready структура без реальных ключей.

## Не входит в MVP

- Реальные таможенные формулы.
- Production-авторизация админки.
- CSV import и admin catalog management для Vehicle Catalog.
- Реальные OpenAI-запросы.
- Production CRM workflows.
- Persist admin status changes и manager comments.

## Текущий MVP-статус

- Lead persistence уже входит в текущий MVP: `createLead()` делает insert в
  `public.leads`, если заданы `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` и Supabase разрешает anon insert.
- Admin real lead read уже входит в текущий MVP: admin routes читают `public.leads`
  через server-side service-role helper после `ADMIN_DEMO_PASSWORD`.
- Vehicle Catalog dropdown уже входит в текущий MVP: калькулятор читает активные строки
  каталога и строит зависимые dropdown.
- Human-readable lead numbers уже входят в текущий MVP: UUID остается technical id и URL
  key, `lead_number` отображается как `AIC-000001`.
- CSV import MVP уже входит в текущий MVP: `/admin/catalog/import` валидирует CSV,
  показывает preview и пишет в Supabase только после confirm.
- Manual admin catalog management остается next phase.

## Acceptance Criteria для следующих фаз

CSV import считается готовым, когда:

- CSV загружается через admin UI.
- Импорт валидирует brand/model/variant/year/engine/source price rows до записи.
- Admin видит preview с ошибками и изменениями.
- Confirm записывает валидные строки в Supabase Vehicle Catalog через server-side
  service_role flow.
- Import не делает CSV/Excel source of truth; Supabase остается source of truth для сайта.

Текущий MVP CSV import покрывает эти критерии для bulk import без ручного catalog editor.

Admin catalog management считается готовым, когда:

- Через admin UI можно добавлять и редактировать brand/model/variant.
- Через admin UI можно обновлять `source_price_usd`, `source_name`, `source_url`,
  `last_checked_at` и `is_active`.
- Изменения пишутся в Supabase server-side и отражаются в calculator dropdown.
- Demo seed prices не маркируются как реальные рыночные цены.

Status/comment persistence считается готовым, когда:

- Изменение статуса заявки сохраняется в Supabase и видно после reload.
- Комментарий менеджера сохраняется в Supabase и связан с lead UUID.
- Admin UI показывает persisted status/comment state без demo-only обещаний.
